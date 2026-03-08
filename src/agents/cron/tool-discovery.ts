import type { AgentResult, FactoryEvent, CronPayload } from '../../types.js'
import { chatJson, getModelForAgent } from '../../core/llm.js'
import { checkBudget, startPipelineRun, completePipelineRun } from '../../core/budget-guard.js'
import { queueProductDiscovery, upsertValidation } from '../../core/supabase.js'
import { recordAudit } from '../../core/db.js'

const DAILY_BUDGET = 1.5

interface DiscoveryOutput {
  tools: {
    name: string
    slug: string
    description: string
    category: string
    source: string
    sourceUrl: string
    confidence: number
  }[]
}

const handler: (event: FactoryEvent) => Promise<AgentResult> = async (event) => {
  const start = Date.now()
  const payload = event.payload as CronPayload

  const budget = checkBudget('tool-discovery', DAILY_BUDGET)
  if (!budget.allowed) {
    return {
      agentType: 'tool-discovery',
      eventId: event.id,
      status: 'skipped',
      actions: [],
      reasoning: `Daily budget exhausted: $${budget.spent.toFixed(2)} / $${budget.limit.toFixed(2)}`,
      costUsd: 0,
      durationMs: Date.now() - start,
    }
  }

  const runId = startPipelineRun('tool-discovery', payload.action)
  let totalCost = 0

  try {
    const { data: discovered, response } = await chatJson<DiscoveryOutput>({
      model: getModelForAgent('tool-discovery'),
      messages: [
        {
          role: 'system',
          content: `You are a developer tool discovery agent. Find new, noteworthy developer tools that have gained traction recently. Focus on:
- GitHub trending repositories in developer tools categories
- Recently launched products on ProductHunt in developer tools
- Tools mentioned in popular tech newsletters and HN front page
- New CLI tools, API services, and developer infrastructure

Output tools you're confident are real, active projects. No vaporware.`,
        },
        {
          role: 'user',
          content: `Find up to 10 new developer tools that are trending or recently launched. Last scan was: ${payload.lastRunAt || 'never'}. Focus on tools that would be relevant for a developer tool ranking system.

Respond with JSON: { "tools": [{ "name": "...", "slug": "...", "description": "...", "category": "...", "source": "github_trending|producthunt|hackernews|newsletter", "sourceUrl": "...", "confidence": 0.0-1.0 }] }`,
        },
      ],
      eventId: event.id,
      agentType: 'tool-discovery',
    })

    totalCost += response.costUsd

    let itemsWritten = 0
    for (const tool of discovered.tools) {
      if (tool.confidence < 0.3) continue

      await queueProductDiscovery(tool.name, tool.source, JSON.stringify(tool))
      await upsertValidation(tool.slug, {
        discovered_at: new Date().toISOString(),
        discovery_source: tool.source,
        confidence: 0,
        signals_verified: false,
        drift_checked: false,
        integration_tested: false,
        profile_complete: false,
        review_count: 0,
      })
      itemsWritten++
    }

    completePipelineRun(runId, 'success', discovered.tools.length, itemsWritten, totalCost)

    recordAudit({
      eventId: event.id,
      agentType: 'tool-discovery',
      action: 'discovery_complete',
      detail: `Found ${discovered.tools.length} tools, queued ${itemsWritten}`,
      costUsd: totalCost,
    })

    return {
      agentType: 'tool-discovery',
      eventId: event.id,
      status: 'success',
      actions: [],
      reasoning: `Discovered ${discovered.tools.length} tools, queued ${itemsWritten} for validation`,
      costUsd: totalCost,
      durationMs: Date.now() - start,
    }
  } catch (error) {
    completePipelineRun(runId, 'failure', 0, 0, totalCost, error instanceof Error ? error.message : String(error))
    throw error
  }
}

export default handler
