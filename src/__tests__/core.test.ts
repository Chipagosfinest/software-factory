import { describe, it, expect, beforeEach } from 'vitest'
import { verifyWebhookSignature } from '../core/webhook.js'
import { isExecutionAllowed } from '../core/executor-gate.js'
import { CircuitBreaker, CircuitBreakerRegistry, withCircuitBreaker } from '../core/circuit-breaker.js'

describe('webhook signature verification', () => {
  const secret = 'test-secret-123'

  it('accepts valid signature', () => {
    const payload = '{"test": true}'
    const crypto = require('crypto')
    const sig = 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex')

    expect(verifyWebhookSignature(payload, sig, secret)).toBe(true)
  })

  it('rejects invalid signature', () => {
    expect(verifyWebhookSignature('payload', 'sha256=invalid', secret)).toBe(false)
  })

  it('rejects empty signature', () => {
    expect(verifyWebhookSignature('payload', '', secret)).toBe(false)
  })

  it('rejects empty secret', () => {
    expect(verifyWebhookSignature('payload', 'sha256=something', '')).toBe(false)
  })
})

describe('executor gate', () => {
  it('allows execution when gate file is missing', () => {
    // Default behavior with no gate file
    const result = isExecutionAllowed('pr-reviewer')
    expect(result.allowed).toBe(true)
  })
})

describe('circuit breaker', () => {
  beforeEach(() => {
    CircuitBreakerRegistry.resetAll()
  })

  it('starts in CLOSED state', () => {
    const cb = new CircuitBreaker('test')
    expect(cb.getState()).toBe('CLOSED')
  })

  it('opens after failure threshold', async () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 2, resetTimeoutMs: 1000 })

    await cb.execute(() => Promise.reject(new Error('fail 1')))
    expect(cb.getState()).toBe('CLOSED')

    await cb.execute(() => Promise.reject(new Error('fail 2')))
    expect(cb.getState()).toBe('OPEN')
  })

  it('rejects calls when open', async () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 1, resetTimeoutMs: 60000 })

    await cb.execute(() => Promise.reject(new Error('fail')))
    expect(cb.getState()).toBe('OPEN')

    const result = await cb.execute(() => Promise.resolve('should not run'))
    expect(result.rejected).toBe(true)
    expect(result.success).toBe(false)
  })

  it('returns data on success', async () => {
    const cb = new CircuitBreaker('test')
    const result = await cb.execute(() => Promise.resolve(42))

    expect(result.success).toBe(true)
    expect(result.data).toBe(42)
    expect(result.rejected).toBe(false)
  })

  it('tracks metrics', async () => {
    const cb = new CircuitBreaker('test')
    await cb.execute(() => Promise.resolve('ok'))
    await cb.execute(() => Promise.reject(new Error('fail')))

    const metrics = cb.getMetrics()
    expect(metrics.totalCalls).toBe(2)
    expect(metrics.successCount).toBe(1)
    expect(metrics.failureCount).toBe(1)
  })

  it('registry returns same breaker for same name', () => {
    const a = CircuitBreakerRegistry.get('api-x')
    const b = CircuitBreakerRegistry.get('api-x')
    expect(a).toBe(b)
  })

  it('withCircuitBreaker convenience function works', async () => {
    const result = await withCircuitBreaker('test-api', () => Promise.resolve('data'))
    expect(result.success).toBe(true)
    expect(result.data).toBe('data')
  })
})

describe('db', () => {
  it('initializes without errors', async () => {
    // Set temp DB path for tests
    process.env.DB_PATH = ':memory:'
    const { getDb, recordAudit, getAuditLog, getCostSummary } = await import('../core/db.js')

    const db = getDb()
    expect(db).toBeTruthy()

    // Test recording and reading
    recordAudit({
      eventId: 'test-123',
      agentType: 'pr-reviewer',
      action: 'test',
      detail: 'test entry',
    })

    const log = getAuditLog(10)
    expect(log).toHaveLength(1)

    const costs = getCostSummary()
    expect(costs.totalCost).toBe(0)
    expect(costs.runCount).toBe(0)
  })
})
