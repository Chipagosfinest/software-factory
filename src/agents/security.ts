import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { AgentResult, AgentAction, FactoryEvent } from '../types.js'
import { chatJson, getModelForAgent } from '../core/llm.js'
import { recordAudit } from '../core/db.js'
import { judgeAgentOutput } from './judge.js'

const SYSTEM_PROMPT = readFileSync(resolve(import.meta.dirname, 'prompts/security.md'), 'utf-8')

interface SecurityOutput {
  assessment: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  action: 'patch' | 'skip' | 'escalate'
  confidence: number
  upgrade?: {
    package: string
    from: string
    to: string
    semverChange: 'patch' | 'minor' | 'major'
    breakingRisk: 'none' | 'low' | 'medium' | 'high'
  }
  prTitle?: string
  prBody?: string
  reasoning: string
}

const handler: (event: FactoryEvent) => Promise<AgentResult> = async (event) => {
  const start = Date.now()
  const alert = event.payload && 'alert' in event.payload ? event.payload.alert : null

  if (!alert) {
    return {
      agentType: 'security',
      eventId: event.id,
      status: 'skipped',
      actions: [],
      reasoning: 'No alert in event payload',
      costUsd: 0,
      durationMs: Date.now() - start,
    }
  }

  const { data: assessment, response } = await chatJson<SecurityOutput>({
    model: getModelForAgent('security'),
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: JSON.stringify({
          alert: {
            id: alert.id,
            severity: alert.severity,
            package: alert.package,
            vulnerableRange: alert.vulnerableRange,
            patchedVersion: alert.patchedVersion,
            cve: alert.cve,
            description: alert.description,
          },
        }),
      },
    ],
    eventId: event.id,
    agentType: 'security',
  })

  if (assessment.action === 'skip') {
    recordAudit({
      eventId: event.id,
      agentType: 'security',
      action: 'skipped',
      detail: assessment.reasoning,
    })
    return {
      agentType: 'security',
      eventId: event.id,
      status: 'skipped',
      actions: [],
      reasoning: assessment.reasoning,
      costUsd: response.costUsd,
      durationMs: Date.now() - start,
    }
  }

  const actions: AgentAction[] = []

  if (assessment.action === 'patch' && assessment.upgrade) {
    const branchName = `security/${alert.package}-${assessment.upgrade.to}`
    actions.push({
      type: 'create_pr',
      title: assessment.prTitle || `fix(security): upgrade ${alert.package}`,
      body: assessment.prBody || assessment.assessment,
      branch: branchName,
      baseBranch: event.repo.defaultBranch,
    })
  } else {
    actions.push({
      type: 'comment',
      body: `## Security Alert Assessment\n\n**Package:** ${alert.package}\n**CVE:** ${alert.cve || 'N/A'}\n**Severity:** ${assessment.severity}\n\n${assessment.assessment}\n\n**Action:** ${assessment.action === 'escalate' ? 'Requires human review' : assessment.action}\n\n---\n_Automated by Software Factory Security Agent_`,
    })
  }

  const verdict = await judgeAgentOutput(event, 'security', assessment.reasoning, actions)
  if (!verdict.approved) {
    recordAudit({
      eventId: event.id,
      agentType: 'security',
      action: 'judge_vetoed',
      detail: verdict.issues.join('; '),
    })
    return {
      agentType: 'security',
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
    agentType: 'security',
    action: assessment.action,
    detail: `${alert.package}: ${assessment.assessment.slice(0, 200)}`,
    costUsd: response.costUsd,
  })

  return {
    agentType: 'security',
    eventId: event.id,
    status: 'success',
    actions,
    reasoning: assessment.reasoning,
    costUsd: response.costUsd,
    durationMs: Date.now() - start,
  }
}

export default handler
