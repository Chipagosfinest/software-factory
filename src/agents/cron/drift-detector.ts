import type { AgentResult, FactoryEvent, CronPayload } from '../../types.js'
import { chatJson, getModelForAgent } from '../../core/llm.js'
import { checkBudget, startPipelineRun, completePipelineRun } from '../../core/budget-guard.js'
import { recordDriftEvent, getProductsNeedingReview } from '../../core/supabase.js'
import { updateConfidence } from '../../core/flywheel.js'
import { recordAudit } from '../../core/db.js'

const DAILY_BUDGET = 0.5

interface DriftCheckOutput {
  results: {
    slug: string
    status: 'active' | 'deprecated' | 'archived' | 'acquired' | 'pricing_changed'
    detail: string
    successor?: string
  }[]
}

const handler: (event: FactoryEvent) => Promise<AgentResult> = async (event) => {
  const start = Date.now()
  const payload = event.payload as CronPayload

  const budget = checkBudget('drift-detector', DAILY_BUDGET)
  if (!budget.allowed) {
    return {
      agentType: 'drift-detector',
      eventId: event.id,
      status: 'skipped',
      actions: [],
      reasoning: `Daily budget exhausted: $${budget.spent.toFixed(2)} / $${budget.limit.toFixed(2)}`,
      costUsd: 0,
      durationMs: Date.now() - start,
    }
  }

  const runId = startPipelineRun('drift-detector', payload.action)
  let totalCost = 0

  try {
    const products = await getProductsNeedingReview(20)
    const slugs = products.map(p => p.slug)

    if (slugs.length === 0) {
      completePipelineRun(runId, 'success', 0, 0, 0)
      return {
        agentType: 'drift-detector',
        eventId: event.id,
        status: 'success',
        actions: [],
        reasoning: 'No products needing drift check',
        costUsd: 0,
        durationMs: Date.now() - start,
      }
    }

    const { data: driftResults, response } = await chatJson<DriftCheckOutput>({
      model: getModelForAgent('drift-detector'),
      messages: [
        {
          role: 'system',
          content: `You are a developer tool drift detector. Check if tools have been deprecated, archived, acquired, or had pricing changes. Only flag real changes you're confident about.`,
        },
        {
          role: 'user',
          content: `Check the current status of these developer tools: ${slugs.join(', ')}

For each tool, report its current status. Only flag issues you're confident about based on your training data.

Respond with JSON: { "results": [{ "slug": "...", "status": "active|deprecated|archived|acquired|pricing_changed", "detail": "...", "successor": "optional-successor-slug" }] }`,
        },
      ],
      eventId: event.id,
      agentType: 'drift-detector',
    })

    totalCost += response.costUsd
    let itemsWritten = 0

    for (const result of driftResults.results) {
      if (result.status !== 'active') {
        await recordDriftEvent(result.slug, result.status, result.detail, result.successor)
        itemsWritten++
      }
      await updateConfidence(result.slug, 'drift_checked', 0.2)
    }

    completePipelineRun(runId, 'success', driftResults.results.length, itemsWritten, totalCost)

    recordAudit({
      eventId: event.id,
      agentType: 'drift-detector',
      action: 'drift_check_complete',
      detail: `Checked ${driftResults.results.length} products, flagged ${itemsWritten} drift events`,
      costUsd: totalCost,
    })

    return {
      agentType: 'drift-detector',
      eventId: event.id,
      status: 'success',
      actions: [],
      reasoning: `Checked ${driftResults.results.length} products, flagged ${itemsWritten} drift events`,
      costUsd: totalCost,
      durationMs: Date.now() - start,
    }
  } catch (error) {
    completePipelineRun(runId, 'failure', 0, 0, totalCost, error instanceof Error ? error.message : String(error))
    throw error
  }
}

export default handler
