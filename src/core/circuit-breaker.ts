export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export interface CircuitBreakerConfig {
  failureThreshold: number
  resetTimeoutMs: number
  halfOpenMaxCalls: number
  halfOpenSuccessThreshold: number
}

export interface CircuitBreakerMetrics {
  state: CircuitState
  totalCalls: number
  successCount: number
  failureCount: number
  consecutiveFailures: number
  rejectedCount: number
  lastStateChange: string
  lastSuccess: string | null
  lastFailure: string | null
}

export interface CircuitBreakerResult<T> {
  success: boolean
  data?: T
  error?: Error
  rejected: boolean
  state: CircuitState
}

export class CircuitBreaker {
  private readonly name: string
  private readonly config: CircuitBreakerConfig

  private state: CircuitState = 'CLOSED'
  private consecutiveFailures = 0
  private nextAttemptTime = 0
  private halfOpenAttempts = 0
  private halfOpenSuccesses = 0

  private metrics = {
    totalCalls: 0,
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    rejectedCount: 0,
    lastStateChange: new Date().toISOString(),
    lastSuccess: null as string | null,
    lastFailure: null as string | null,
  }

  constructor(name: string, config?: Partial<CircuitBreakerConfig>) {
    this.name = name
    this.config = {
      failureThreshold: 3,
      resetTimeoutMs: 60_000,
      halfOpenMaxCalls: 2,
      halfOpenSuccessThreshold: 2,
      ...config,
    }
  }

  getState(): CircuitState { return this.state }
  getMetrics(): CircuitBreakerMetrics { return { state: this.state, ...this.metrics } }

  async execute<T>(fn: () => Promise<T>): Promise<CircuitBreakerResult<T>> {
    this.metrics.totalCalls++

    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        this.metrics.rejectedCount++
        return {
          success: false,
          rejected: true,
          state: this.state,
          error: new Error(`Circuit breaker OPEN for ${this.name}. Next attempt at ${new Date(this.nextAttemptTime).toISOString()}`),
        }
      }
      this.transitionTo('HALF_OPEN')
    }

    if (this.state === 'HALF_OPEN') {
      if (this.halfOpenAttempts >= this.config.halfOpenMaxCalls) {
        this.metrics.rejectedCount++
        return { success: false, rejected: true, state: this.state, error: new Error(`Half-open test limit reached for ${this.name}`) }
      }
      this.halfOpenAttempts++
    }

    try {
      const data = await fn()
      this.onSuccess()
      return { success: true, data, rejected: false, state: this.state }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      this.onFailure(err)
      return { success: false, rejected: false, state: this.state, error: err }
    }
  }

  private onSuccess(): void {
    this.metrics.successCount++
    this.metrics.lastSuccess = new Date().toISOString()
    if (this.state === 'HALF_OPEN') {
      this.halfOpenSuccesses++
      if (this.halfOpenSuccesses >= this.config.halfOpenSuccessThreshold) {
        this.transitionTo('CLOSED')
      }
    } else if (this.state === 'CLOSED' && this.consecutiveFailures > 0) {
      this.consecutiveFailures = 0
      this.metrics.consecutiveFailures = 0
    }
  }

  private onFailure(error: Error): void {
    this.metrics.failureCount++
    this.metrics.lastFailure = new Date().toISOString()
    this.consecutiveFailures++
    this.metrics.consecutiveFailures = this.consecutiveFailures

    console.warn(`[circuit-breaker:${this.name}] Call failed (${this.consecutiveFailures}/${this.config.failureThreshold}): ${error.message}`)

    if (this.state === 'CLOSED' && this.consecutiveFailures >= this.config.failureThreshold) {
      this.transitionTo('OPEN')
    } else if (this.state === 'HALF_OPEN') {
      this.transitionTo('OPEN')
    }
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state
    this.state = newState
    this.metrics.lastStateChange = new Date().toISOString()
    if (newState === 'OPEN') {
      this.nextAttemptTime = Date.now() + this.config.resetTimeoutMs
      this.halfOpenAttempts = 0
      this.halfOpenSuccesses = 0
    }
    if (newState === 'CLOSED') {
      this.consecutiveFailures = 0
      this.metrics.consecutiveFailures = 0
      this.halfOpenAttempts = 0
      this.halfOpenSuccesses = 0
    }
    if (oldState === 'HALF_OPEN') {
      this.halfOpenAttempts = 0
      this.halfOpenSuccesses = 0
    }
    console.log(`[circuit-breaker:${this.name}] ${oldState} -> ${newState}`)
  }

  forceOpen(): void { if (this.state !== 'OPEN') this.transitionTo('OPEN') }
  forceClose(): void { if (this.state !== 'CLOSED') this.transitionTo('CLOSED') }

  reset(): void {
    this.state = 'CLOSED'
    this.consecutiveFailures = 0
    this.nextAttemptTime = 0
    this.halfOpenAttempts = 0
    this.halfOpenSuccesses = 0
    this.metrics = {
      totalCalls: 0, successCount: 0, failureCount: 0, consecutiveFailures: 0,
      rejectedCount: 0, lastStateChange: new Date().toISOString(), lastSuccess: null, lastFailure: null,
    }
  }
}

export class CircuitBreakerRegistry {
  private static readonly breakers = new Map<string, CircuitBreaker>()

  static get(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, config))
    }
    return this.breakers.get(name)!
  }

  static list(): string[] { return Array.from(this.breakers.keys()) }

  static getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {}
    for (const [name, breaker] of this.breakers) metrics[name] = breaker.getMetrics()
    return metrics
  }

  static reset(name: string): boolean {
    const breaker = this.breakers.get(name)
    if (breaker) { breaker.reset(); return true }
    return false
  }

  static resetAll(): void {
    for (const breaker of this.breakers.values()) breaker.reset()
  }
}

export async function withCircuitBreaker<T>(
  apiName: string,
  fn: () => Promise<T>,
  config?: Partial<CircuitBreakerConfig>
): Promise<CircuitBreakerResult<T>> {
  return CircuitBreakerRegistry.get(apiName, config).execute(fn)
}

export const FactoryCircuitBreakers = {
  get openrouter() {
    return CircuitBreakerRegistry.get('openrouter', { failureThreshold: 3, resetTimeoutMs: 60_000 })
  },
  get github() {
    return CircuitBreakerRegistry.get('github', { failureThreshold: 5, resetTimeoutMs: 120_000 })
  },
  get linear() {
    return CircuitBreakerRegistry.get('linear', { failureThreshold: 3, resetTimeoutMs: 60_000 })
  },
}
