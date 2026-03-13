import { randomUUID } from 'crypto'
import type { AgentType, LinearIssue, OrchestratorTask, RepoRef } from '../types.js'
import { taskStateMachine } from './state.js'
import { createWorkspace, removeWorkspace, cleanupStaleWorkspaces } from './workspace.js'
import { parseWorkflowConfig } from './workflow.js'
import { upsertTask, getTasksByStatus, getTaskByExternalId, getTaskById, getActiveTaskIds, recordAudit } from '../core/db.js'
import { enqueueEvent } from '../queue/queue.js'

interface ReconcileResult {
  claimed: number
  started: number
  retried: number
  released: number
  failed: number
  cleaned: number
}

/**
 * Reconciliation loop — the core of Symphony-style orchestration.
 *
 * On every tick:
 * 1. Ingest new issues from Linear (or other sources) → create unclaimed tasks
 * 2. Claim unclaimed tasks → create workspaces
 * 3. Start claimed tasks → dispatch to agent queue
 * 4. Detect stalled running tasks → move to retry_queued
 * 5. Retry tasks that have cooled down → reclaim
 * 6. Release exhausted tasks → mark failed, notify Linear
 * 7. Clean up orphaned workspaces
 */
export async function reconcile(newIssues: LinearIssue[] = []): Promise<ReconcileResult> {
  const result: ReconcileResult = { claimed: 0, started: 0, retried: 0, released: 0, failed: 0, cleaned: 0 }

  // 1. Ingest new issues
  for (const issue of newIssues) {
    const existing = getTaskByExternalId(issue.identifier)
    if (existing) continue  // Already tracked

    const agentType = inferAgentType(issue)
    if (!agentType) continue  // Can't determine what agent to use

    const repo = inferRepo(issue)
    if (!repo) continue  // Can't determine which repo

    const task: OrchestratorTask = {
      id: randomUUID(),
      externalId: issue.identifier,
      title: issue.title,
      description: issue.description,
      status: 'unclaimed',
      agentType,
      repo,
      retryCount: 0,
      maxRetries: 2,
      createdAt: new Date().toISOString(),
      costUsd: 0,
      labels: issue.labels.map(l => l.name),
      source: 'linear',
    }

    persistTask(task)
    console.log(`[reconciler] Ingested ${issue.identifier}: "${issue.title}" → ${agentType}`)
  }

  // 2. Claim unclaimed tasks (create workspaces)
  const unclaimed = loadTasks('unclaimed')
  for (const task of unclaimed) {
    try {
      const workspace = createWorkspace(task.id, task.repo)
      const claimed = taskStateMachine.transition(task, 'claimed')
      claimed.workspace = workspace
      persistTask(claimed)
      result.claimed++
      console.log(`[reconciler] Claimed ${task.externalId || task.id} → workspace at ${workspace.worktreePath}`)
    } catch (error) {
      console.error(`[reconciler] Failed to claim ${task.id}:`, error)
      // Don't transition — leave unclaimed for next tick
    }
  }

  // 3. Start claimed tasks (dispatch to agent queue)
  const claimed = loadTasks('claimed')
  for (const task of claimed) {
    try {
      const running = taskStateMachine.transition(task, 'running')
      persistTask(running)

      // Get workflow config if workspace exists
      const config = task.workspace ? parseWorkflowConfig(task.workspace.worktreePath) : undefined
      const timeout = config?.agents[task.agentType]?.timeoutMinutes ?? config?.defaults.timeoutMinutes ?? 10

      await enqueueEvent({
        id: task.id,
        type: task.agentType,
        timestamp: new Date().toISOString(),
        source: 'manual',  // orchestrator-dispatched
        payload: {
          action: 'orchestrated',
          raw: {
            taskId: task.id,
            externalId: task.externalId,
            title: task.title,
            description: task.description,
            workspacePath: task.workspace?.worktreePath,
            workspaceBranch: task.workspace?.branch,
            timeoutMinutes: timeout,
          },
        },
        repo: task.repo,
      })

      result.started++
      console.log(`[reconciler] Started ${task.externalId || task.id} → ${task.agentType} agent`)
    } catch (error) {
      console.error(`[reconciler] Failed to start ${task.id}:`, error)
    }
  }

  // 4. Detect stalled running tasks
  const running = loadTasks('running')
  for (const task of running) {
    const config = task.workspace ? parseWorkflowConfig(task.workspace.worktreePath) : undefined
    const timeout = config?.agents[task.agentType]?.timeoutMinutes ?? config?.defaults.timeoutMinutes ?? 10

    if (taskStateMachine.isStalled(task, timeout)) {
      console.warn(`[reconciler] Task ${task.externalId || task.id} stalled after ${timeout}min`)

      const retryQueued = taskStateMachine.transition(task, 'retry_queued')
      retryQueued.lastError = `Stalled after ${timeout} minutes`
      persistTask(retryQueued)

      recordAudit({
        eventId: task.id,
        agentType: task.agentType,
        action: 'task_stalled',
        detail: `Task stalled after ${timeout}min, retry ${retryQueued.retryCount}/${retryQueued.maxRetries}`,
      })
    }
  }

  // 5. Retry tasks that have cooled down
  const retryQueued = loadTasks('retry_queued')
  for (const task of retryQueued) {
    if (taskStateMachine.isExhausted(task)) {
      // Release back — all retries used
      if (task.workspace) {
        removeWorkspace(task.workspace.worktreePath, task.workspace.repoPath)
      }
      const failed = taskStateMachine.transition(task, 'failed')
      failed.lastError = `Exhausted ${task.maxRetries} retries`
      persistTask(failed)
      result.failed++

      recordAudit({
        eventId: task.id,
        agentType: task.agentType,
        action: 'task_exhausted',
        detail: `All ${task.maxRetries} retries exhausted. Last error: ${task.lastError || 'unknown'}`,
      })

      console.warn(`[reconciler] Task ${task.externalId || task.id} exhausted all retries → failed`)
      continue
    }

    if (taskStateMachine.isReadyForRetry(task)) {
      const reclaimed = taskStateMachine.transition(task, 'claimed')
      persistTask(reclaimed)
      result.retried++
      console.log(`[reconciler] Retrying ${task.externalId || task.id} (attempt ${task.retryCount + 1}/${task.maxRetries})`)
    }
  }

  // 6. Cleanup stale workspaces
  const activeIds = new Set(getActiveTaskIds())
  result.cleaned = cleanupStaleWorkspaces(activeIds)

  return result
}

/** Complete a task successfully (called by agent runner on success) */
export function completeTask(taskId: string, prUrl?: string): void {
  const task = loadTaskById(taskId)
  if (!task) {
    console.warn(`[reconciler] Cannot complete unknown task ${taskId}`)
    return
  }

  if (task.status !== 'running') {
    console.warn(`[reconciler] Cannot complete task ${taskId} in status ${task.status}`)
    return
  }

  const completed = taskStateMachine.transition(task, 'completed')
  completed.resultPrUrl = prUrl
  persistTask(completed)

  // Cleanup workspace
  if (task.workspace) {
    removeWorkspace(task.workspace.worktreePath, task.workspace.repoPath)
  }

  console.log(`[reconciler] Task ${task.externalId || task.id} completed${prUrl ? ` → ${prUrl}` : ''}`)
}

/** Fail a task (called by agent runner on error) */
export function failTask(taskId: string, error: string): void {
  const task = loadTaskById(taskId)
  if (!task) return

  if (task.status !== 'running') return

  // Convergence check: if the same error repeats, don't retry — it won't help
  // This prevents the Autoresearch death spiral where agents retry on perfect scores
  if (task.lastError && task.lastError === error && task.retryCount > 0) {
    console.warn(`[reconciler] Task ${task.externalId || task.id} hit same error twice, marking failed (no convergence)`)
    const failed = taskStateMachine.transition(task, 'failed')
    failed.lastError = `Non-converging: "${error}" (same error on retry ${task.retryCount})`
    persistTask(failed)

    recordAudit({
      eventId: task.id,
      agentType: task.agentType,
      action: 'task_no_convergence',
      detail: `Same error on consecutive retries: ${error}`,
    })
    return
  }

  const retryQueued = taskStateMachine.transition(task, 'retry_queued')
  retryQueued.lastError = error
  persistTask(retryQueued)

  console.log(`[reconciler] Task ${task.externalId || task.id} failed, queued for retry: ${error}`)
}

// ─── Helpers ────────────────────────────────────

function inferAgentType(issue: LinearIssue): AgentType | null {
  const labels = issue.labels.map(l => l.name.toLowerCase())
  const titleLower = issue.title.toLowerCase()
  const descLower = issue.description.toLowerCase()

  if (labels.includes('factory:review') || labels.includes('review')) return 'pr-reviewer'
  if (labels.includes('factory:fix') || labels.includes('bug')) return 'ci-debugger'
  if (labels.includes('factory:security') || labels.includes('security')) return 'security'
  if (labels.includes('factory:incident') || labels.includes('incident')) return 'incident'
  if (labels.includes('factory:merge') || labels.includes('merge-conflict')) return 'merge-resolver'

  // Infer from title/description
  if (titleLower.includes('security') || titleLower.includes('cve') || titleLower.includes('vulnerability')) return 'security'
  if (titleLower.includes('ci') || titleLower.includes('build') || titleLower.includes('test fail')) return 'ci-debugger'
  if (titleLower.includes('conflict') || titleLower.includes('merge')) return 'merge-resolver'
  if (titleLower.includes('incident') || titleLower.includes('outage') || titleLower.includes('pager')) return 'incident'

  // Default: use ci-debugger as a general-purpose fixer
  if (labels.includes('factory:auto')) return 'ci-debugger'

  return null
}

function inferRepo(issue: LinearIssue): RepoRef | null {
  // Try to extract repo from issue description (common pattern: "repo: owner/name")
  const repoMatch = issue.description.match(/repo:\s*([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/)
  if (repoMatch) {
    return { owner: repoMatch[1], repo: repoMatch[2], defaultBranch: 'main', installationId: 0 }
  }

  // Try label-based repo mapping
  for (const label of issue.labels) {
    const labelRepoMatch = label.name.match(/^repo:(.+)\/(.+)$/)
    if (labelRepoMatch) {
      return { owner: labelRepoMatch[1], repo: labelRepoMatch[2], defaultBranch: 'main', installationId: 0 }
    }
  }

  // Fall back to env default
  const defaultOwner = process.env.DEFAULT_REPO_OWNER
  const defaultRepo = process.env.DEFAULT_REPO_NAME
  if (defaultOwner && defaultRepo) {
    return { owner: defaultOwner, repo: defaultRepo, defaultBranch: 'main', installationId: 0 }
  }

  return null
}

function persistTask(task: OrchestratorTask): void {
  upsertTask({
    id: task.id,
    externalId: task.externalId,
    title: task.title,
    description: task.description,
    status: task.status,
    agentType: task.agentType,
    repoOwner: task.repo.owner,
    repoName: task.repo.repo,
    repoDefaultBranch: task.repo.defaultBranch,
    repoInstallationId: task.repo.installationId,
    workspacePath: task.workspace?.worktreePath,
    workspaceBranch: task.workspace?.branch,
    retryCount: task.retryCount,
    maxRetries: task.maxRetries,
    lastError: task.lastError,
    backoffUntil: task.backoffUntil,
    claimedAt: task.claimedAt,
    startedAt: task.startedAt,
    completedAt: task.completedAt,
    resultPrUrl: task.resultPrUrl,
    costUsd: task.costUsd,
    labels: task.labels,
    source: task.source,
  })
}

function loadTasks(status: string): OrchestratorTask[] {
  const rows = getTasksByStatus(status) as any[]
  return rows.map(rowToTask)
}

function loadTaskById(id: string): OrchestratorTask | null {
  const row = getTaskById(id) as any
  return row ? rowToTask(row) : null
}

function rowToTask(row: any): OrchestratorTask {
  return {
    id: row.id,
    externalId: row.external_id ?? undefined,
    title: row.title,
    description: row.description ?? '',
    status: row.status,
    agentType: row.agent_type as AgentType,
    repo: {
      owner: row.repo_owner,
      repo: row.repo_name,
      defaultBranch: row.repo_default_branch ?? 'main',
      installationId: row.repo_installation_id ?? 0,
    },
    workspace: row.workspace_path ? {
      worktreePath: row.workspace_path,
      branch: row.workspace_branch ?? '',
      baseBranch: row.repo_default_branch ?? 'main',
      repoPath: '',
      createdAt: row.claimed_at ?? '',
    } : undefined,
    retryCount: row.retry_count ?? 0,
    maxRetries: row.max_retries ?? 2,
    lastError: row.last_error ?? undefined,
    backoffUntil: row.backoff_until ?? undefined,
    createdAt: row.created_at,
    claimedAt: row.claimed_at ?? undefined,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    resultPrUrl: row.result_pr_url ?? undefined,
    costUsd: row.cost_usd ?? 0,
    labels: JSON.parse(row.labels_json ?? '[]'),
    source: row.source ?? 'manual',
  }
}
