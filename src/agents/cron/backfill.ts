import type { AgentResult, FactoryEvent, CronPayload } from '../../types.js'
import { chatJson, getModelForAgent } from '../../core/llm.js'
import { checkBudget, startPipelineRun, completePipelineRun } from '../../core/budget-guard.js'
import { getSupabase, upsertValidation } from '../../core/supabase.js'
import { updateConfidence } from '../../core/flywheel.js'
import { recordAudit } from '../../core/db.js'

const DAILY_BUDGET = 3.0

interface BackfillOutput {
  enrichments: {
    slug: string
    description: string
    category: string
    website: string
    pricing_model: string
    tags: string[]
    alternatives: string[]
  }[]
}

const handler: (event: FactoryEvent) => Promise<AgentResult> = async (event) => {
  const start = Date.now()
  const payload = event.payload as CronPayload

  const budget = checkBudget('backfill', DAILY_BUDGET)
  if (!budget.allowed) {
    return {
      agentType: 'backfill',
      eventId: event.id,
      status: 'skipped',
      actions: [],
      reasoning: `Daily budget exhausted: $${budget.spent.toFixed(2)} / $${budget.limit.toFixed(2)}`,
      costUsd: 0,
      durationMs: Date.now() - start,
    }
  }

  const runId = startPipelineRun('backfill', payload.action)
  let totalCost = 0

  try {
    // Find products with incomplete profiles
    const { data: incomplete } = await getSupabase()
      .from('product_validations')
      .select('slug')
      .eq('profile_complete', false)
      .order('discovered_at', { ascending: true })
      .limit(15)

    const slugs = (incomplete ?? []).map((p: { slug: string }) => p.slug)

    if (slugs.length === 0) {
      completePipelineRun(runId, 'success', 0, 0, 0)
      return {
        agentType: 'backfill',
        eventId: event.id,
        status: 'success',
        actions: [],
        reasoning: 'No products needing backfill',
        costUsd: 0,
        durationMs: Date.now() - start,
      }
    }

    const { data: enriched, response } = await chatJson<BackfillOutput>({
      model: getModelForAgent('backfill'),
      messages: [
        {
          role: 'system',
          content: `You are a developer tool data enrichment agent. For each tool slug, provide comprehensive profile data. Be accurate — only include information you're confident about.`,
        },
        {
          role: 'user',
          content: `Enrich these developer tool profiles with missing data: ${slugs.join(', ')}

For each tool, provide: description, category, website, pricing_model (free|freemium|paid|open-source), tags, and alternatives (other tools in same category).

Respond with JSON: { "enrichments": [{ "slug": "...", "description": "...", "category": "...", "website": "...", "pricing_model": "...", "tags": [...], "alternatives": [...] }] }`,
        },
      ],
      eventId: event.id,
      agentType: 'backfill',
    })

    totalCost += response.costUsd
    let itemsWritten = 0

    for (const enrichment of enriched.enrichments) {
      // Write enrichment data to products table
      const { error } = await getSupabase()
        .from('products')
        .upsert(
          {
            slug: enrichment.slug,
            description: enrichment.description,
            category: enrichment.category,
            website: enrichment.website,
            pricing_model: enrichment.pricing_model,
            tags: enrichment.tags,
          },
          { onConflict: 'slug' },
        )

      if (!error) {
        await upsertValidation(enrichment.slug, { profile_complete: true })
        await updateConfidence(enrichment.slug, 'profile_complete', 0.2)
        itemsWritten++
      }
    }

    completePipelineRun(runId, 'success', enriched.enrichments.length, itemsWritten, totalCost)

    recordAudit({
      eventId: event.id,
      agentType: 'backfill',
      action: 'backfill_complete',
      detail: `Enriched ${itemsWritten} / ${enriched.enrichments.length} products`,
      costUsd: totalCost,
    })

    return {
      agentType: 'backfill',
      eventId: event.id,
      status: 'success',
      actions: [],
      reasoning: `Enriched ${itemsWritten} product profiles`,
      costUsd: totalCost,
      durationMs: Date.now() - start,
    }
  } catch (error) {
    completePipelineRun(runId, 'failure', 0, 0, totalCost, error instanceof Error ? error.message : String(error))
    throw error
  }
}

export default handler
