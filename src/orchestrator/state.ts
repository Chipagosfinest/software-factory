import type { OrchestratorTask, TaskStatus } from '../types.js'

/** Valid state transitions for the task lifecycle */
const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  unclaimed:    ['claimed'],
  claimed:      ['running', 'released'],
  running:      ['completed', 'failed', 'retry_queued'],
  retry_queued: ['claimed', 'released', 'failed'],
  released:     [],  // terminal — returned to Linear
  completed:    [],  // terminal
  failed:       ['retry_queued'],  // can re-enter retry from failed (manual recovery)
}

export class TaskStateMachine {
  canTransition(from: TaskStatus, to: TaskStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false
  }

  transition(task: OrchestratorTask, to: TaskStatus): OrchestratorTask {
    if (!this.canTransition(task.status, to)) {
      throw new Error(`Invalid transition: ${task.status} → ${to} (task ${task.id})`)
    }

    const now = new Date().toISOString()
    const updated = { ...task, status: to }

    switch (to) {
      case 'claimed':
        updated.claimedAt = now
        break
      case 'running':
        updated.startedAt = now
        break
      case 'completed':
        updated.completedAt = now
        break
      case 'retry_queued':
        updated.retryCount += 1
        updated.backoffUntil = computeBackoff(updated.retryCount)
        break
      case 'released':
        updated.completedAt = now
        break
      case 'failed':
        updated.completedAt = now
        break
    }

    return updated
  }

  /** Check if a running task has exceeded its stall timeout */
  isStalled(task: OrchestratorTask, timeoutMinutes: number): boolean {
    if (task.status !== 'running' || !task.startedAt) return false
    const elapsed = Date.now() - new Date(task.startedAt).getTime()
    return elapsed > timeoutMinutes * 60 * 1000
  }

  /** Check if a retry-queued task is ready to be reclaimed */
  isReadyForRetry(task: OrchestratorTask): boolean {
    if (task.status !== 'retry_queued') return false
    if (task.retryCount >= task.maxRetries) return false
    if (task.backoffUntil && new Date(task.backoffUntil) > new Date()) return false
    return true
  }

  /** Check if a task has exhausted all retries */
  isExhausted(task: OrchestratorTask): boolean {
    return task.retryCount >= task.maxRetries
  }
}

/** Exponential backoff: 30s, 2m, 8m, 30m, 2h */
function computeBackoff(retryCount: number): string {
  const baseMs = 30_000  // 30 seconds
  const delayMs = baseMs * Math.pow(4, retryCount - 1)
  const maxDelayMs = 2 * 60 * 60 * 1000  // 2 hours cap
  const jitter = Math.random() * 5000  // 0-5s jitter
  const finalDelay = Math.min(delayMs + jitter, maxDelayMs)
  return new Date(Date.now() + finalDelay).toISOString()
}

export const taskStateMachine = new TaskStateMachine()
