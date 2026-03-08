import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { AgentResult, AgentAction, FactoryEvent } from '../types.js'
import { chatJson, getModelForAgent } from '../core/llm.js'
import { buildRepoContext } from '../core/context.js'
import { recordAudit } from '../core/db.js'
import { judgeAgentOutput } from './judge.js'

const SYSTEM_PROMPT = readFileSync(resolve(import.meta.dirname, 'prompts/incident.md'), 'utf-8')

interface IncidentOutput {
  rca: {
    summary: string
    timeline: string
    rootCause: string
    impact: string
    resolution: string
  }
  action: 'fix' | 'rollback' | 'escalate'
  confidence: number
  fix?: {
    description: string
    files: { path: string; content: string; action: 'create' | 'update' | 'delete' }[]
  }
  reasoning: string
}

const handler: (event: FactoryEvent) => Promise<AgentResult> = async (event) => {
  const start = Date.now()
  const context = await buildRepoContext(event)

  const { data: incident, response } = await chatJson<IncidentOutput>({
    model: getModelForAgent('incident'),
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: JSON.stringify({
          alert: event.payload,
          recentCommits: context.recentCommits,
          fileTree: context.fileTree.slice(0, 200),
        }),
      },
    ],
    eventId: event.id,
    agentType: 'incident',
  })

  const actions: AgentAction[] = []

  // Always post RCA comment
  actions.push({
    type: 'comment',
    body: `## Incident RCA\n\n**Summary:** ${incident.rca.summary}\n\n**Timeline:** ${incident.rca.timeline}\n\n**Root Cause:** ${incident.rca.rootCause}\n\n**Impact:** ${incident.rca.impact}\n\n**Resolution:** ${incident.rca.resolution}\n\n**Action:** ${incident.action}\n**Confidence:** ${(incident.confidence * 100).toFixed(0)}%\n\n---\n_Automated by Software Factory Incident Agent_`,
  })

  if (incident.action === 'fix' && incident.fix && incident.fix.files.length > 0) {
    const branchName = `hotfix/incident-${event.id.slice(0, 8)}`
    actions.push({
      type: 'create_pr',
      title: `hotfix: ${incident.rca.summary}`,
      body: `## Hotfix for Production Incident\n\n${incident.fix.description}\n\n**Root cause:** ${incident.rca.rootCause}`,
      branch: branchName,
      baseBranch: event.repo.defaultBranch,
    })
    actions.push({
      type: 'push_commit',
      branch: branchName,
      message: `hotfix: ${incident.fix.description}`,
      files: incident.fix.files,
    })
  }

  const verdict = await judgeAgentOutput(event, 'incident', incident.reasoning, actions)
  if (!verdict.approved) {
    recordAudit({
      eventId: event.id,
      agentType: 'incident',
      action: 'judge_vetoed',
      detail: verdict.issues.join('; '),
    })
    return {
      agentType: 'incident',
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
    agentType: 'incident',
    action: incident.action,
    detail: incident.rca.summary,
    costUsd: response.costUsd,
  })

  return {
    agentType: 'incident',
    eventId: event.id,
    status: 'success',
    actions,
    reasoning: incident.reasoning,
    costUsd: response.costUsd,
    durationMs: Date.now() - start,
  }
}

export default handler
