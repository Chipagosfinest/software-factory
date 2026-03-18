/**
 * Data retention — prune old records to prevent unbounded SQLite growth.
 *
 * At moderate load (~300 rows/day), tables grow ~50MB/year.
 * This runs on startup and daily to keep the DB lean.
 */

import { getDb } from './db.js'

const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS || '90')

export function pruneOldRecords(): { deleted: number } {
  const cutoff = `datetime('now', '-${RETENTION_DAYS} days')`
  let total = 0

  const tables = [
    { name: 'cost_tracking', dateCol: 'created_at' },
    { name: 'audit_log', dateCol: 'created_at' },
    { name: 'agent_runs', dateCol: 'created_at' },
    { name: 'pipeline_run_log', dateCol: 'started_at' },
  ]

  for (const { name, dateCol } of tables) {
    const result = getDb()
      .prepare(`DELETE FROM ${name} WHERE ${dateCol} < ${cutoff}`)
      .run()
    if (result.changes > 0) {
      console.log(`[retention] Pruned ${result.changes} rows from ${name} (older than ${RETENTION_DAYS} days)`)
      total += result.changes
    }
  }

  // Don't prune orchestrator_tasks — keep completed/failed for history
  // but prune very old ones (6 months)
  const taskResult = getDb()
    .prepare(`DELETE FROM orchestrator_tasks WHERE status IN ('completed', 'failed') AND completed_at < datetime('now', '-180 days')`)
    .run()
  if (taskResult.changes > 0) {
    console.log(`[retention] Pruned ${taskResult.changes} old orchestrator tasks`)
    total += taskResult.changes
  }

  if (total > 0) {
    // Reclaim disk space
    getDb().pragma('optimize')
  }

  return { deleted: total }
}
