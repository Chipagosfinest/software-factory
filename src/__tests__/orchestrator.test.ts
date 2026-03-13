import { describe, it, expect, beforeEach } from 'vitest'
import { TaskStateMachine } from '../orchestrator/state.js'
import type { OrchestratorTask } from '../types.js'

function makeTask(overrides: Partial<OrchestratorTask> = {}): OrchestratorTask {
  return {
    id: 'task-1',
    title: 'Test task',
    description: 'A test task',
    status: 'unclaimed',
    agentType: 'ci-debugger',
    repo: { owner: 'test', repo: 'test-repo', defaultBranch: 'main', installationId: 0 },
    retryCount: 0,
    maxRetries: 2,
    createdAt: new Date().toISOString(),
    costUsd: 0,
    labels: [],
    source: 'manual',
    ...overrides,
  }
}

describe('TaskStateMachine', () => {
  let sm: TaskStateMachine

  beforeEach(() => {
    sm = new TaskStateMachine()
  })

  describe('transitions', () => {
    it('unclaimed → claimed', () => {
      const task = makeTask({ status: 'unclaimed' })
      const result = sm.transition(task, 'claimed')
      expect(result.status).toBe('claimed')
      expect(result.claimedAt).toBeDefined()
    })

    it('claimed → running', () => {
      const task = makeTask({ status: 'claimed' })
      const result = sm.transition(task, 'running')
      expect(result.status).toBe('running')
      expect(result.startedAt).toBeDefined()
    })

    it('running → completed', () => {
      const task = makeTask({ status: 'running' })
      const result = sm.transition(task, 'completed')
      expect(result.status).toBe('completed')
      expect(result.completedAt).toBeDefined()
    })

    it('running → retry_queued increments retryCount', () => {
      const task = makeTask({ status: 'running', retryCount: 0 })
      const result = sm.transition(task, 'retry_queued')
      expect(result.status).toBe('retry_queued')
      expect(result.retryCount).toBe(1)
      expect(result.backoffUntil).toBeDefined()
    })

    it('retry_queued → claimed (reclaim for retry)', () => {
      const task = makeTask({ status: 'retry_queued', retryCount: 1 })
      const result = sm.transition(task, 'claimed')
      expect(result.status).toBe('claimed')
    })

    it('retry_queued → failed (exhausted)', () => {
      const task = makeTask({ status: 'retry_queued', retryCount: 2 })
      const result = sm.transition(task, 'failed')
      expect(result.status).toBe('failed')
      expect(result.completedAt).toBeDefined()
    })

    it('rejects invalid transitions', () => {
      const task = makeTask({ status: 'unclaimed' })
      expect(() => sm.transition(task, 'running')).toThrow('Invalid transition')
    })

    it('rejects transitions from terminal states', () => {
      const task = makeTask({ status: 'completed' })
      expect(() => sm.transition(task, 'claimed')).toThrow('Invalid transition')
    })

    it('claimed → released', () => {
      const task = makeTask({ status: 'claimed' })
      const result = sm.transition(task, 'released')
      expect(result.status).toBe('released')
    })
  })

  describe('canTransition', () => {
    it('returns true for valid transitions', () => {
      expect(sm.canTransition('unclaimed', 'claimed')).toBe(true)
      expect(sm.canTransition('claimed', 'running')).toBe(true)
      expect(sm.canTransition('running', 'completed')).toBe(true)
      expect(sm.canTransition('running', 'failed')).toBe(true)
      expect(sm.canTransition('running', 'retry_queued')).toBe(true)
    })

    it('returns false for invalid transitions', () => {
      expect(sm.canTransition('unclaimed', 'running')).toBe(false)
      expect(sm.canTransition('completed', 'running')).toBe(false)
      expect(sm.canTransition('released', 'claimed')).toBe(false)
    })
  })

  describe('stall detection', () => {
    it('detects stalled tasks', () => {
      const task = makeTask({
        status: 'running',
        startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
      })
      expect(sm.isStalled(task, 10)).toBe(true)
    })

    it('does not flag recent tasks as stalled', () => {
      const task = makeTask({
        status: 'running',
        startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
      })
      expect(sm.isStalled(task, 10)).toBe(false)
    })

    it('ignores non-running tasks', () => {
      const task = makeTask({ status: 'claimed' })
      expect(sm.isStalled(task, 10)).toBe(false)
    })
  })

  describe('retry readiness', () => {
    it('ready when backoff expired and retries remaining', () => {
      const task = makeTask({
        status: 'retry_queued',
        retryCount: 1,
        maxRetries: 2,
        backoffUntil: new Date(Date.now() - 1000).toISOString(), // in the past
      })
      expect(sm.isReadyForRetry(task)).toBe(true)
    })

    it('not ready when backoff still active', () => {
      const task = makeTask({
        status: 'retry_queued',
        retryCount: 1,
        maxRetries: 2,
        backoffUntil: new Date(Date.now() + 60_000).toISOString(), // 1 min in future
      })
      expect(sm.isReadyForRetry(task)).toBe(false)
    })

    it('not ready when retries exhausted', () => {
      const task = makeTask({
        status: 'retry_queued',
        retryCount: 2,
        maxRetries: 2,
        backoffUntil: new Date(Date.now() - 1000).toISOString(),
      })
      expect(sm.isReadyForRetry(task)).toBe(false)
    })
  })

  describe('exhaustion check', () => {
    it('exhausted when retryCount >= maxRetries', () => {
      expect(sm.isExhausted(makeTask({ retryCount: 2, maxRetries: 2 }))).toBe(true)
      expect(sm.isExhausted(makeTask({ retryCount: 3, maxRetries: 2 }))).toBe(true)
    })

    it('not exhausted when retries remain', () => {
      expect(sm.isExhausted(makeTask({ retryCount: 1, maxRetries: 2 }))).toBe(false)
    })
  })
})
