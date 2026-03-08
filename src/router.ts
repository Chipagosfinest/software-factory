import { randomUUID } from 'crypto'
import type { AgentType, CronPayload, FactoryEvent, RepoRef, WebhookPayload } from './types.js'
import { enqueueEvent } from './queue/queue.js'

interface DispatchResult {
  dispatched: boolean
  agentType?: AgentType
  eventId?: string
  reason?: string
}

class EventRouter {
  async dispatch(githubEvent: string, payload: Record<string, unknown>, deliveryId: string): Promise<DispatchResult> {
    const mapping = this.mapEvent(githubEvent, payload)

    if (!mapping) {
      return { dispatched: false, reason: `No agent for ${githubEvent}/${(payload as any).action ?? 'unknown'}` }
    }

    const event: FactoryEvent = {
      id: deliveryId || randomUUID(),
      type: mapping.agentType,
      timestamp: new Date().toISOString(),
      source: 'github',
      payload: mapping.webhookPayload,
      repo: mapping.repo,
    }

    console.log(`[router] Dispatching ${event.type} agent for ${event.repo.owner}/${event.repo.repo} (event: ${event.id})`)

    await enqueueEvent(event)

    return { dispatched: true, agentType: event.type, eventId: event.id }
  }

  async dispatchCron(agentType: AgentType, schedule: string, lastRunAt: string | null, params: Record<string, unknown> = {}): Promise<DispatchResult> {
    const event: FactoryEvent = {
      id: randomUUID(),
      type: agentType,
      timestamp: new Date().toISOString(),
      source: 'cron',
      payload: {
        action: 'scheduled',
        schedule,
        lastRunAt,
        params,
      } as CronPayload,
      repo: { owner: '', repo: '', defaultBranch: '', installationId: 0 },
    }

    console.log(`[router] Dispatching cron agent ${agentType} (event: ${event.id})`)

    await enqueueEvent(event)

    return { dispatched: true, agentType, eventId: event.id }
  }

  private mapEvent(githubEvent: string, payload: Record<string, unknown>): { agentType: AgentType; webhookPayload: WebhookPayload; repo: RepoRef } | null {
    const action = (payload as any).action as string | undefined
    const repo = (payload as any).repository as any

    if (!repo) return null

    const repoRef: RepoRef = {
      owner: repo.owner?.login ?? repo.owner?.name,
      repo: repo.name,
      defaultBranch: repo.default_branch ?? 'main',
      installationId: (payload as any).installation?.id ?? 0,
    }

    // Skip bot PRs
    const prAuthor = (payload as any).pull_request?.user?.login
    if (prAuthor && (prAuthor.endsWith('[bot]') || prAuthor === 'dependabot')) return null

    // Skip if label says skip-review
    const labels: string[] = ((payload as any).pull_request?.labels ?? []).map((l: any) => l.name)
    if (labels.includes('skip-review')) return null

    // PR opened or updated -> PR Review Agent
    if (githubEvent === 'pull_request' && (action === 'opened' || action === 'synchronize')) {
      const pr = (payload as any).pull_request
      if (pr.draft) return null

      return {
        agentType: 'pr-reviewer',
        repo: repoRef,
        webhookPayload: {
          action: action!,
          pullRequest: {
            number: pr.number,
            title: pr.title,
            body: pr.body ?? '',
            head: { ref: pr.head.ref, sha: pr.head.sha },
            base: { ref: pr.base.ref, sha: pr.base.sha },
            author: pr.user.login,
            draft: pr.draft,
            labels: labels,
          },
          raw: payload,
        },
      }
    }

    // Check suite failed -> CI Debugger Agent
    if (githubEvent === 'check_suite' && action === 'completed') {
      const suite = (payload as any).check_suite
      if (suite.conclusion === 'success') return null

      return {
        agentType: 'ci-debugger',
        repo: repoRef,
        webhookPayload: {
          action: action!,
          checkSuite: {
            id: suite.id,
            conclusion: suite.conclusion,
            headSha: suite.head_sha,
            headBranch: suite.head_branch,
            checkRuns: [],
          },
          raw: payload,
        },
      }
    }

    // Dependabot alert -> Security Agent
    if (githubEvent === 'dependabot_alert' && action === 'created') {
      const alert = (payload as any).alert
      return {
        agentType: 'security',
        repo: repoRef,
        webhookPayload: {
          action: action!,
          alert: {
            id: alert.number,
            severity: alert.security_vulnerability?.severity ?? 'medium',
            package: alert.security_vulnerability?.package?.name ?? 'unknown',
            vulnerableRange: alert.security_vulnerability?.vulnerable_version_range ?? '',
            patchedVersion: alert.security_vulnerability?.first_patched_version?.identifier ?? null,
            cve: alert.security_advisory?.cve_id ?? null,
            description: alert.security_advisory?.summary ?? '',
          },
          raw: payload,
        },
      }
    }

    return null
  }
}

export const router = new EventRouter()
