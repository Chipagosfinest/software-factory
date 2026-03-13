import { getDb } from './db.js'

const GLOBAL_DAILY_LIMIT_USD = parseFloat(process.env.GLOBAL_DAILY_BUDGET_USD || '20.00')

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

/**
 * Global daily spend cap across ALL agent types.
 * Prevents runaway costs even when per-agent limits are individually within bounds.
 * (e.g., 100 webhook events * $2/each = $200 with no global cap)
 */
export function checkGlobalDailyBudget(): BudgetCheck {
  const row = getDb()
    .prepare(
      `SELECT COALESCE(SUM(cost_usd), 0) as spent
       FROM cost_tracking
       WHERE DATE(created_at) = DATE('now')`,
    )
    .get() as { spent: number }

  const spent = row.spent
  const remaining = GLOBAL_DAILY_LIMIT_USD - spent

  if (remaining <= GLOBAL_DAILY_LIMIT_USD * 0.2) {
    console.warn(`[budget] Global daily spend at ${((spent / GLOBAL_DAILY_LIMIT_USD) * 100).toFixed(0)}%: $${spent.toFixed(2)} / $${GLOBAL_DAILY_LIMIT_USD}`)
  }

  return {
    allowed: remaining > 0,
    spent,
    limit: GLOBAL_DAILY_LIMIT_USD,
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
