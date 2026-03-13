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

    CREATE TABLE IF NOT EXISTS orchestrator_tasks (
      id TEXT PRIMARY KEY,
      external_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'unclaimed',
      agent_type TEXT NOT NULL,
      repo_owner TEXT NOT NULL,
      repo_name TEXT NOT NULL,
      repo_default_branch TEXT DEFAULT 'main',
      repo_installation_id INTEGER DEFAULT 0,
      workspace_path TEXT,
      workspace_branch TEXT,
      retry_count INTEGER DEFAULT 0,
      max_retries INTEGER DEFAULT 2,
      last_error TEXT,
      backoff_until TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      claimed_at TEXT,
      started_at TEXT,
      completed_at TEXT,
      result_pr_url TEXT,
      cost_usd REAL DEFAULT 0,
      labels_json TEXT DEFAULT '[]',
      source TEXT NOT NULL DEFAULT 'manual'
    );

    CREATE INDEX IF NOT EXISTS idx_agent_runs_event ON agent_runs(event_id);
    CREATE INDEX IF NOT EXISTS idx_agent_runs_type ON agent_runs(agent_type);
    CREATE INDEX IF NOT EXISTS idx_audit_log_event ON audit_log(event_id);
    CREATE INDEX IF NOT EXISTS idx_cost_tracking_event ON cost_tracking(event_id);
    CREATE INDEX IF NOT EXISTS idx_orch_tasks_status ON orchestrator_tasks(status);
    CREATE INDEX IF NOT EXISTS idx_orch_tasks_external ON orchestrator_tasks(external_id);
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

// ─── Orchestrator Task Operations ───────────────────────────

export function upsertTask(task: {
  id: string
  externalId?: string
  title: string
  description: string
  status: string
  agentType: string
  repoOwner: string
  repoName: string
  repoDefaultBranch?: string
  repoInstallationId?: number
  workspacePath?: string
  workspaceBranch?: string
  retryCount?: number
  maxRetries?: number
  lastError?: string
  backoffUntil?: string
  claimedAt?: string
  startedAt?: string
  completedAt?: string
  resultPrUrl?: string
  costUsd?: number
  labels?: string[]
  source?: string
}): void {
  getDb().prepare(`
    INSERT INTO orchestrator_tasks (
      id, external_id, title, description, status, agent_type,
      repo_owner, repo_name, repo_default_branch, repo_installation_id,
      workspace_path, workspace_branch, retry_count, max_retries,
      last_error, backoff_until, claimed_at, started_at, completed_at,
      result_pr_url, cost_usd, labels_json, source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      status = excluded.status,
      workspace_path = excluded.workspace_path,
      workspace_branch = excluded.workspace_branch,
      retry_count = excluded.retry_count,
      last_error = excluded.last_error,
      backoff_until = excluded.backoff_until,
      claimed_at = excluded.claimed_at,
      started_at = excluded.started_at,
      completed_at = excluded.completed_at,
      result_pr_url = excluded.result_pr_url,
      cost_usd = excluded.cost_usd
  `).run(
    task.id, task.externalId ?? null, task.title, task.description,
    task.status, task.agentType, task.repoOwner, task.repoName,
    task.repoDefaultBranch ?? 'main', task.repoInstallationId ?? 0,
    task.workspacePath ?? null, task.workspaceBranch ?? null,
    task.retryCount ?? 0, task.maxRetries ?? 2,
    task.lastError ?? null, task.backoffUntil ?? null,
    task.claimedAt ?? null, task.startedAt ?? null, task.completedAt ?? null,
    task.resultPrUrl ?? null, task.costUsd ?? 0,
    JSON.stringify(task.labels ?? []), task.source ?? 'manual',
  )
}

export function getTasksByStatus(status: string): unknown[] {
  return getDb().prepare('SELECT * FROM orchestrator_tasks WHERE status = ? ORDER BY created_at ASC').all(status)
}

export function getActiveTaskIds(): string[] {
  const rows = getDb().prepare(
    "SELECT id FROM orchestrator_tasks WHERE status IN ('claimed', 'running', 'retry_queued')"
  ).all() as { id: string }[]
  return rows.map(r => r.id)
}

export function getTaskById(id: string): unknown | undefined {
  return getDb().prepare('SELECT * FROM orchestrator_tasks WHERE id = ?').get(id)
}

export function getTaskByExternalId(externalId: string): unknown | undefined {
  return getDb().prepare('SELECT * FROM orchestrator_tasks WHERE external_id = ?').get(externalId)
}

export function getOrchestratorMetrics(): {
  activeTasks: number
  completedToday: number
  failedToday: number
  retryQueueDepth: number
  totalCostToday: number
  tasksByStatus: Record<string, number>
} {
  const today = new Date().toISOString().split('T')[0]

  const statusCounts = getDb().prepare(
    'SELECT status, COUNT(*) as count FROM orchestrator_tasks GROUP BY status'
  ).all() as { status: string; count: number }[]

  const tasksByStatus: Record<string, number> = {}
  for (const row of statusCounts) {
    tasksByStatus[row.status] = row.count
  }

  const completedRow = getDb().prepare(
    "SELECT COUNT(*) as count FROM orchestrator_tasks WHERE status = 'completed' AND completed_at >= ?"
  ).get(today) as { count: number }

  const failedRow = getDb().prepare(
    "SELECT COUNT(*) as count FROM orchestrator_tasks WHERE status = 'failed' AND completed_at >= ?"
  ).get(today) as { count: number }

  const costRow = getDb().prepare(
    "SELECT COALESCE(SUM(cost_usd), 0) as total FROM orchestrator_tasks WHERE completed_at >= ?"
  ).get(today) as { total: number }

  return {
    activeTasks: (tasksByStatus['claimed'] ?? 0) + (tasksByStatus['running'] ?? 0),
    completedToday: completedRow.count,
    failedToday: failedRow.count,
    retryQueueDepth: tasksByStatus['retry_queued'] ?? 0,
    totalCostToday: costRow.total,
    tasksByStatus,
  }
}
