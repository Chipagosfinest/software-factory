import { fetchFactoryIssues } from './linear.js'
import { reconcile, completeTask, failTask } from './reconciler.js'
import { getOrchestratorMetrics } from '../core/db.js'

interface OrchestratorOptions {
  pollIntervalMs: number     // How often to poll Linear (default: 30s)
  teamId: string             // Linear team ID to poll
  labelName: string          // Label to filter issues (default: "factory:auto")
  enabled: boolean           // Kill switch
}

const DEFAULT_OPTIONS: OrchestratorOptions = {
  pollIntervalMs: parseInt(process.env.ORCHESTRATOR_POLL_MS || '30000'),
  teamId: process.env.LINEAR_TEAM_ID || '',
  labelName: process.env.LINEAR_LABEL || 'factory:auto',
  enabled: process.env.ORCHESTRATOR_ENABLED === 'true',
}

let _running = false
let _tickCount = 0
let _consecutiveFailures = 0
const MAX_CONSECUTIVE_FAILURES = 5

/**
 * Start the orchestrator polling loop.
 *
 * Uses serial setTimeout (not setInterval) to prevent tick overlap.
 * Each tick completes before the next one starts.
 */
export async function startOrchestrator(opts?: Partial<OrchestratorOptions>): Promise<void> {
  const options = { ...DEFAULT_OPTIONS, ...opts }

  if (!options.enabled) {
    console.log('[orchestrator] Disabled (set ORCHESTRATOR_ENABLED=true to enable)')
    return
  }

  if (!options.teamId) {
    console.warn('[orchestrator] No LINEAR_TEAM_ID configured, running without Linear polling')
  }

  if (_running) {
    console.warn('[orchestrator] Already running')
    return
  }

  _running = true
  _consecutiveFailures = 0
  console.log(`[orchestrator] Starting with ${options.pollIntervalMs}ms poll interval`)

  // Serial loop — each tick completes before scheduling the next
  const loop = async () => {
    while (_running) {
      try {
        await tick(options)
        _consecutiveFailures = 0
      } catch (error) {
        _consecutiveFailures++
        console.error(`[orchestrator] Tick failed (${_consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}):`, error)

        if (_consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          console.error(`[orchestrator] ${MAX_CONSECUTIVE_FAILURES} consecutive failures — auto-stopping`)
          _running = false
          break
        }
      }

      // Wait before next tick (only if still running)
      if (_running) {
        await new Promise(resolve => setTimeout(resolve, options.pollIntervalMs))
      }
    }
  }

  // Run loop in background (don't await — let startOrchestrator return)
  loop().catch(err => console.error('[orchestrator] Loop crashed:', err))
}

async function tick(options: OrchestratorOptions): Promise<void> {
  _tickCount++
  const start = Date.now()

  // 1. Poll Linear for new issues (if configured)
  let issues: Awaited<ReturnType<typeof fetchFactoryIssues>> = []
  if (options.teamId && process.env.LINEAR_API_KEY) {
    try {
      issues = await fetchFactoryIssues(options.teamId, options.labelName)
    } catch (error) {
      console.warn(`[orchestrator] Linear poll failed: ${error instanceof Error ? error.message : error}`)
    }
  }

  // 2. Run reconciliation
  const result = await reconcile(issues)

  // 3. Log summary (only if something happened)
  const total = result.claimed + result.started + result.retried + result.released + result.failed + result.cleaned
  if (total > 0 || _tickCount % 20 === 0) {  // Log every 20 ticks even if idle
    const elapsed = Date.now() - start
    console.log(
      `[orchestrator] Tick #${_tickCount} (${elapsed}ms): ` +
      `claimed=${result.claimed} started=${result.started} retried=${result.retried} ` +
      `released=${result.released} failed=${result.failed} cleaned=${result.cleaned}`
    )
  }
}

/** Stop the orchestrator loop */
export function stopOrchestrator(): void {
  _running = false
  console.log('[orchestrator] Stopped')
}

/** Check if orchestrator is running */
export function isOrchestratorRunning(): boolean {
  return _running
}

/** Get orchestrator status */
export function getOrchestratorStatus() {
  const metrics = getOrchestratorMetrics()
  return {
    running: _running,
    tickCount: _tickCount,
    ...metrics,
  }
}

// Re-export for agent runner integration
export { completeTask, failTask }
