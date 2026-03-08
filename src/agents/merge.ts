import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { AgentResult, AgentAction, FactoryEvent } from '../types.js'
import { chatJson, getModelForAgent } from '../core/llm.js'
import { buildRepoContext } from '../core/context.js'
import { validateActions } from '../core/governance.js'
import { recordAudit } from '../core/db.js'
import { judgeAgentOutput } from './judge.js'

const SYSTEM_PROMPT = readFileSync(resolve(import.meta.dirname, 'prompts/merge.md'), 'utf-8')

interface MergeOutput {
  summary: string
  confidence: number
  resolutions: {
    path: string
    strategy: 'keep_both' | 'keep_pr' | 'keep_base' | 'manual_merge'
    content: string
    explanation: string
  }[]
  unresolvedFiles: string[]
  reasoning: string
}

const handler: (event: FactoryEvent) => Promise<AgentResult> = async (event) => {
  const start = Date.now()
  const context = await buildRepoContext(event)

  const { data: merge, response } = await chatJson<MergeOutput>({
    model: getModelForAgent('merge-resolver'),
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: JSON.stringify({
          diff: context.diff,
          files: context.relevantFiles.map(f => ({ path: f.path, content: f.content.slice(0, 5000) })),
          recentCommits: context.recentCommits,
        }),
      },
    ],
    eventId: event.id,
    agentType: 'merge-resolver',
  })

  const actions: AgentAction[] = []

  if (merge.resolutions.length > 0) {
    const pr = event.payload && 'pullRequest' in event.payload ? event.payload.pullRequest : null
    const branchName = pr?.head.ref || `merge-fix-${event.id.slice(0, 8)}`

    actions.push({
      type: 'push_commit',
      branch: branchName,
      message: `fix: resolve merge conflicts\n\n${merge.summary}`,
      files: merge.resolutions.map(r => ({
        path: r.path,
        content: r.content,
        action: 'update' as const,
      })),
    })
  }

  if (merge.unresolvedFiles.length > 0) {
    actions.push({
      type: 'comment',
      body: `## Merge Conflict Resolution\n\n${merge.summary}\n\n**Resolved:** ${merge.resolutions.length} files\n**Needs human review:** ${merge.unresolvedFiles.join(', ')}\n\n---\n_Automated by Software Factory Merge Agent_`,
    })
  }

  const validation = validateActions('merge-resolver', actions, event.id)
  if (!validation.allowed) {
    return {
      agentType: 'merge-resolver',
      eventId: event.id,
      status: 'failure',
      actions: [],
      reasoning: `Governance violation: ${validation.violations.join('; ')}`,
      costUsd: response.costUsd,
      durationMs: Date.now() - start,
    }
  }

  const verdict = await judgeAgentOutput(event, 'merge-resolver', merge.reasoning, actions)
  if (!verdict.approved) {
    recordAudit({
      eventId: event.id,
      agentType: 'merge-resolver',
      action: 'judge_vetoed',
      detail: verdict.issues.join('; '),
    })
    return {
      agentType: 'merge-resolver',
      eventId: event.id,
      status: 'failure',
      actions: [],
      reasoning: `Judge vetoed: ${verdict.issues.join('; ')}`,
      costUsd: response.costUsd,
      durationMs: Date.now() - start,
    }
  }

  recordAudit({
    eventId: event.id,
    agentType: 'merge-resolver',
    action: 'conflicts_resolved',
    detail: `${merge.resolutions.length} resolved, ${merge.unresolvedFiles.length} unresolved`,
    costUsd: response.costUsd,
  })

  return {
    agentType: 'merge-resolver',
    eventId: event.id,
    status: 'success',
    actions,
    reasoning: merge.reasoning,
    costUsd: response.costUsd,
    durationMs: Date.now() - start,
  }
}

export default handler
