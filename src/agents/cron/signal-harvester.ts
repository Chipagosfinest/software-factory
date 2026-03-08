import type { AgentResult, FactoryEvent, CronPayload } from '../../types.js'
import { checkBudget, startPipelineRun, completePipelineRun } from '../../core/budget-guard.js'
import { getProductsNeedingReview, upsertSignal } from '../../core/supabase.js'
import { updateConfidence } from '../../core/flywheel.js'
import { recordAudit } from '../../core/db.js'

const DAILY_BUDGET = 0 // Free APIs only — GitHub API, npm registry

interface GitHubRepoInfo {
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  pushed_at: string
  subscribers_count: number
}

const handler: (event: FactoryEvent) => Promise<AgentResult> = async (event) => {
  const start = Date.now()
  const payload = event.payload as CronPayload

  const runId = startPipelineRun('signal-harvester', payload.action)
  let itemsProcessed = 0
  let itemsWritten = 0

  try {
    const products = await getProductsNeedingReview(30)

    for (const product of products) {
      itemsProcessed++

      // Fetch GitHub stats (free API, no budget needed)
      try {
        const ghResponse = await fetch(`https://api.github.com/repos/${product.slug}`, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
          },
        })

        if (ghResponse.ok) {
          const repo = (await ghResponse.json()) as GitHubRepoInfo
          await upsertSignal(product.slug, 'github_stars', repo.stargazers_count, 'github')
          await upsertSignal(product.slug, 'github_forks', repo.forks_count, 'github')
          await upsertSignal(product.slug, 'github_issues', repo.open_issues_count, 'github')
          await upsertSignal(product.slug, 'github_last_push', new Date(repo.pushed_at).getTime(), 'github')
          await updateConfidence(product.slug, 'signals_verified', 0.3)
          itemsWritten++
        }
      } catch {
        // Skip this product if GitHub fetch fails
      }

      // Fetch npm downloads (free API)
      try {
        const npmResponse = await fetch(`https://api.npmjs.org/downloads/point/last-week/${product.slug}`)
        if (npmResponse.ok) {
          const npm = (await npmResponse.json()) as { downloads: number }
          await upsertSignal(product.slug, 'npm_weekly_downloads', npm.downloads, 'npm')
          itemsWritten++
        }
      } catch {
        // Not an npm package or fetch failed
      }
    }

    completePipelineRun(runId, 'success', itemsProcessed, itemsWritten, 0)

    recordAudit({
      eventId: event.id,
      agentType: 'signal-harvester',
      action: 'harvest_complete',
      detail: `Processed ${itemsProcessed} products, updated ${itemsWritten} signals`,
    })

    return {
      agentType: 'signal-harvester',
      eventId: event.id,
      status: 'success',
      actions: [],
      reasoning: `Harvested signals for ${itemsProcessed} products, updated ${itemsWritten}`,
      costUsd: 0,
      durationMs: Date.now() - start,
    }
  } catch (error) {
    completePipelineRun(runId, 'failure', itemsProcessed, itemsWritten, 0, error instanceof Error ? error.message : String(error))
    throw error
  }
}

export default handler
