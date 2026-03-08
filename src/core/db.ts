import Database from 'better-sqlite3'
import { resolve } from 'path'

const DB_PATH = resolve(process.env.DB_PATH || './software-factory.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')
    migrate(_db)
  }
  return _db
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_runs (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      agent_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      reasoning TEXT,
      cost_usd REAL DEFAULT 0,
      duration_ms INTEGER DEFAULT 0,
      actions_json TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL,
      agent_type TEXT NOT NULL,
      action TEXT NOT NULL,
      detail TEXT,
      cost_usd REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cost_tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT,
      agent_type TEXT,
      model TEXT NOT NULL,
      prompt_tokens INTEGER NOT NULL,
      completion_tokens INTEGER NOT NULL,
      cost_usd REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cron_job_state (
      agent_type TEXT PRIMARY KEY,
      last_run_at TEXT,
      next_run_at TEXT,
      last_status TEXT,
      consecutive_failures INTEGER DEFAULT 0,
      rotation_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS pipeline_run_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_type TEXT NOT NULL,
      source TEXT,
      started_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      status TEXT DEFAULT 'running',
      items_processed INTEGER DEFAULT 0,
      items_written INTEGER DEFAULT 0,
      cost_usd REAL DEFAULT 0,
      error_message TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_agent_runs_event ON agent_runs(event_id);
    CREATE INDEX IF NOT EXISTS idx_agent_runs_type ON agent_runs(agent_type);
    CREATE INDEX IF NOT EXISTS idx_audit_log_event ON audit_log(event_id);
    CREATE INDEX IF NOT EXISTS idx_cost_tracking_event ON cost_tracking(event_id);
  `)
}

export function recordAgentRun(run: {
  id: string
  eventId: string
  agentType: string
  status: string
  reasoning: string
  costUsd: number
  durationMs: number
  actions: unknown[]
}): void {
  getDb().prepare(`
    INSERT INTO agent_runs (id, event_id, agent_type, status, reasoning, cost_usd, duration_ms, actions_json, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(run.id, run.eventId, run.agentType, run.status, run.reasoning, run.costUsd, run.durationMs, JSON.stringify(run.actions))
}

export function recordAudit(entry: {
  eventId: string
  agentType: string
  action: string
  detail: string
  costUsd?: number
}): void {
  getDb().prepare(`
    INSERT INTO audit_log (event_id, agent_type, action, detail, cost_usd)
    VALUES (?, ?, ?, ?, ?)
  `).run(entry.eventId, entry.agentType, entry.action, entry.detail, entry.costUsd ?? 0)
}

export function recordCost(entry: {
  eventId?: string
  agentType?: string
  model: string
  promptTokens: number
  completionTokens: number
  costUsd: number
}): void {
  getDb().prepare(`
    INSERT INTO cost_tracking (event_id, agent_type, model, prompt_tokens, completion_tokens, cost_usd)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(entry.eventId ?? null, entry.agentType ?? null, entry.model, entry.promptTokens, entry.completionTokens, entry.costUsd)
}

export function getAuditLog(limit = 50): unknown[] {
  return getDb().prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?').all(limit)
}

export function getAgentRuns(limit = 50): unknown[] {
  return getDb().prepare('SELECT * FROM agent_runs ORDER BY created_at DESC LIMIT ?').all(limit)
}

export function getCostSummary(): { totalCost: number; runCount: number } {
  const row = getDb().prepare('SELECT COALESCE(SUM(cost_usd), 0) as totalCost, COUNT(*) as runCount FROM cost_tracking').get() as any
  return { totalCost: row.totalCost, runCount: row.runCount }
}
