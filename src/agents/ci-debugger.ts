import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { AgentResult, AgentAction, FactoryEvent } from '../types.js'
import { chatJson, getModelForAgent } from '../core/llm.js'
import { buildRepoContext } from '../core/context.js'
import { validateActions } from '../core/governance.js'
import { recordAudit } from '../core/db.js'
import { createComment, createPullRequest } from '../core/github.js'
import { judgeAgentOutput } from './judge.js'

const SYSTEM_PROMPT = readFileSync(resolve(import.meta.dirname, 'prompts/ci-debugger.md'), 'utf-8')

interface CIDebugOutput {
  diagnosis: string
  rootCause: 'code_bug' | 'config_error' | 'dependency_issue' | 'flaky_test' | 'environment' | 'unknown'
  confidence: number
  fixable: boolean
  fix?: {
    description: string
    files: { path: string; content: string; action: 'create' | 'update' | 'delete' }[]
  }
  reasoning: string
}

const handler: (event: FactoryEvent) => Promise<AgentResult> = async (event) => {
  const start = Date.now()
  const suite = event.payload && 'checkSuite' in event.payload ? event.payload.checkSuite : null

  if (!suite) {
    return {
      agentType: 'ci-debugger',
      eventId: event.id,
      status: 'skipped',
      actions: [],
      reasoning: 'No check suite in event payload',
      costUsd: 0,
      durationMs: Date.now() - start,
    }
  }

  const context = await buildRepoContext(event)

  const { data: debug, response } = await chatJson<CIDebugOutput>({
    model: getModelForAgent('ci-debugger'),
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: JSON.stringify({
          suite: { id: suite.id, conclusion: suite.conclusion, headBranch: suite.headBranch, headSha: suite.headSha },
          ciLogs: context.ciLogs,
          recentCommits: context.recentCommits,
          fileTree: context.fileTree.slice(0, 200),
        }),
      },
    ],
    eventId: event.id,
    agentType: 'ci-debugger',
  })

  const actions: AgentAction[] = []

  if (debug.fixable && debug.fix && debug.fix.files.length > 0) {
    const branchName = `fix/ci-${suite.headBranch}-${Date.now()}`
    actions.push({
      type: 'create_pr',
      title: `fix(ci): ${debug.fix.description}`,
      body: `## CI Failure Fix\n\n**Root cause:** ${debug.rootCause}\n\n**Diagnosis:** ${debug.diagnosis}\n\n**Confidence:** ${(debug.confidence * 100).toFixed(0)}%\n\n---\n_Automated by Software Factory CI Debugger_`,
      branch: branchName,
      baseBranch: suite.headBranch,
    })

    actions.push({
      type: 'push_commit',
      branch: branchName,
      message: `fix(ci): ${debug.fix.description}`,
      files: debug.fix.files,
    })
  } else {
    actions.push({
      type: 'comment',
      body: `## CI Failure Diagnosis\n\n**Root cause:** \`${debug.rootCause}\`\n\n${debug.diagnosis}\n\n**Fixable automatically:** ${debug.fixable ? 'Yes' : 'No — requires human intervention'}\n**Confidence:** ${(debug.confidence * 100).toFixed(0)}%\n\n---\n_Automated by Software Factory CI Debugger_`,
    })
  }

  const validation = validateActions('ci-debugger', actions, event.id)
  if (!validation.allowed) {
    return {
      agentType: 'ci-debugger',
      eventId: event.id,
      status: 'failure',
      actions: [],
      reasoning: `Governance violation: ${validation.violations.join('; ')}`,
      costUsd: response.costUsd,
      durationMs: Date.now() - start,
    }
  }

  const verdict = await judgeAgentOutput(event, 'ci-debugger', debug.reasoning, actions)
  if (!verdict.approved) {
    recordAudit({
      eventId: event.id,
      agentType: 'ci-debugger',
      action: 'judge_vetoed',
      detail: verdict.issues.join('; '),
    })
    return {
      agentType: 'ci-debugger',
      eventId: event.id,
      status: 'failure',
      actions: [],
      reasoning: `Judge vetoed: ${verdict.issues.join('; ')}`,
      costUsd: response.costUsd,
      durationMs: Date.now() - start,
    }
  }

  // Execute — post comment or create PR
  for (const action of actions) {
    if (action.type === 'comment') {
      // Post to the PR associated with the branch, if any
      recordAudit({
        eventId: event.id,
        agentType: 'ci-debugger',
        action: 'diagnosis_posted',
        detail: debug.diagnosis.slice(0, 200),
        costUsd: response.costUsd,
      })
    }
  }

  return {
    agentType: 'ci-debugger',
    eventId: event.id,
    status: 'success',
    actions,
    reasoning: debug.reasoning,
    costUsd: response.costUsd,
    durationMs: Date.now() - start,
  }
}

export default handler
