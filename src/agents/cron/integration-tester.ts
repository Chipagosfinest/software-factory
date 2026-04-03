import type { AgentResult, FactoryEvent } from '../../types.js'
import { startPipelineRun, completePipelineRun } from '../../core/budget-guard.js'
import { recordAudit } from '../../core/db.js'

// Integration tester is DISABLED until Docker sandboxes are enabled.
// When enabled, it will:
// 1. Pull products that claim compatibility with specific stacks
// 2. Spin up Docker containers with those stacks
// 3. Test actual installation and basic usage
// 4. Update integration_tested validation flag

const handler: (event: FactoryEvent) => Promise<AgentResult> = async (event) => {
  const start = Date.now()

  const runId = startPipelineRun('integration-tester', 'disabled')
  completePipelineRun(runId, 'success', 0, 0, 0, 'Integration testing disabled — Docker sandboxes not available')

  recordAudit({
    eventId: event.id,
    agentType: 'integration-tester',
    action: 'skipped',
    detail: 'Docker sandboxes not enabled. Set integration-tester to enabled in scheduler when Docker is ready.',
  })

  return {
    agentType: 'integration-tester',
    eventId: event.id,
    status: 'skipped',
    actions: [],
    reasoning: 'Integration testing disabled — Docker sandboxes not available',
    costUsd: 0,
    durationMs: Date.now() - start,
  }
}

export default handler
