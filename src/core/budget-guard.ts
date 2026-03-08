import { getDb } from './db.js'

interface BudgetCheck {
  allowed: boolean
  spent: number
  limit: number
  remaining: number
}

export function checkBudget(agentType: string, budgetUsd: number): BudgetCheck {
  const row = getDb()
    .prepare(
      `SELECT COALESCE(SUM(cost_usd), 0) as spent
       FROM pipeline_run_log
       WHERE agent_type = ? AND DATE(started_at) = DATE('now') AND status != 'failed'`,
    )
    .get(agentType) as { spent: number }

  const spent = row.spent
  const remaining = budgetUsd - spent

  return {
    allowed: remaining > 0,
    spent,
    limit: budgetUsd,
    remaining: Math.max(0, remaining),
  }
}

export function startPipelineRun(agentType: string, source: string): number {
  const result = getDb()
    .prepare('INSERT INTO pipeline_run_log (agent_type, source) VALUES (?, ?)')
    .run(agentType, source)
  return Number(result.lastInsertRowid)
}

export function completePipelineRun(
  runId: number,
  status: 'success' | 'failure',
  itemsProcessed: number,
  itemsWritten: number,
  costUsd: number,
  errorMessage?: string,
): void {
  getDb()
    .prepare(
      `UPDATE pipeline_run_log
       SET completed_at = datetime('now'), status = ?, items_processed = ?, items_written = ?, cost_usd = ?, error_message = ?
       WHERE id = ?`,
    )
    .run(status, itemsProcessed, itemsWritten, costUsd, errorMessage ?? null, runId)
}
