import { randomUUID } from 'crypto'
import type { AgentResult, AgentType, FactoryEvent } from '../types.js'
import { isExecutionAllowed } from '../core/executor-gate.js'
import { getPermissions, validateCost } from '../core/governance.js'
import { recordAgentRun, recordAudit } from '../core/db.js'

type AgentHandler = (event: FactoryEvent) => Promise<AgentResult>

const agents: Partial<Record<AgentType, () => Promise<{ default: AgentHandler }>>> = {
  'pr-reviewer': () => import('./pr-reviewer.js'),
  'ci-debugger': () => import('./ci-debugger.js'),
  'security': () => import('./security.js'),
  'incident': () => import('./incident.js'),
  'merge-resolver': () => import('./merge.js'),
  'tool-discovery': () => import('./cron/tool-discovery.js'),
  'signal-harvester': () => import('./cron/signal-harvester.js'),
  'drift-detector': () => import('./cron/drift-detector.js'),
  'backfill': () => import('./cron/backfill.js'),
  'integration-tester': () => import('./cron/integration-tester.js'),
}

export async function runAgent(event: FactoryEvent): Promise<AgentResult> {
  const start = Date.now()
  const runId = randomUUID()

  console.log(`[agent:${event.type}] Starting run ${runId} for event ${event.id}`)

  // Check executor gate
  const gate = isExecutionAllowed(event.type)
  if (!gate.allowed) {
    const result: AgentResult = {
      agentType: event.type,
      eventId: event.id,
      status: 'skipped',
      actions: [],
      reasoning: gate.reason || 'Blocked by executor gate',
      costUsd: 0,
      durationMs: Date.now() - start,
    }
    recordAgentRun({ id: runId, eventId: event.id, agentType: event.type, status: result.status, reasoning: result.reasoning, costUsd: result.costUsd, durationMs: result.durationMs, actions: [] })
    return result
  }

  const perms = getPermissions(event.type)

  try {
    const loader = agents[event.type]
    if (!loader) {
      throw new Error(`Unknown agent type: ${event.type}`)
    }

    const { default: handler } = await loader()

    // Race against timeout
    const result = await Promise.race([
      handler(event),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Agent timed out after ${perms.timeoutMs}ms`)), perms.timeoutMs)
      ),
    ])

    // Validate cost
    if (!validateCost(event.type, result.costUsd, event.id)) {
      console.warn(`[agent:${event.type}] Cost $${result.costUsd.toFixed(4)} exceeded limit $${perms.costLimitUsd}`)
    }

    const duration = Date.now() - start
    console.log(`[agent:${event.type}] Completed in ${duration}ms, cost: $${result.costUsd.toFixed(4)}, status: ${result.status}, actions: ${result.actions.length}`)

    recordAgentRun({
      id: runId,
      eventId: event.id,
      agentType: event.type,
      status: result.status,
      reasoning: result.reasoning,
      costUsd: result.costUsd,
      durationMs: duration,
      actions: result.actions,
    })

    return result
  } catch (error) {
    const duration = Date.now() - start
    console.error(`[agent:${event.type}] Failed after ${duration}ms:`, error)

    const result: AgentResult = {
      agentType: event.type,
      eventId: event.id,
      status: 'failure',
      actions: [],
      reasoning: `Agent failed: ${error instanceof Error ? error.message : String(error)}`,
      costUsd: 0,
      durationMs: duration,
    }

    recordAgentRun({
      id: runId,
      eventId: event.id,
      agentType: event.type,
      status: result.status,
      reasoning: result.reasoning,
      costUsd: result.costUsd,
      durationMs: result.durationMs,
      actions: [],
    })

    recordAudit({
      eventId: event.id,
      agentType: event.type,
      action: 'agent_error',
      detail: error instanceof Error ? error.message : String(error),
    })

    return result
  }
}
