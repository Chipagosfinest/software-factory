import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { AgentResult, AgentAction, FactoryEvent } from '../types.js'
import { chatJson, getModelForAgent } from '../core/llm.js'
import { buildRepoContext } from '../core/context.js'
import { validateActions } from '../core/governance.js'
import { recordAudit } from '../core/db.js'
import { createReview } from '../core/github.js'
import { judgeAgentOutput } from './judge.js'

const SYSTEM_PROMPT = readFileSync(resolve(import.meta.dirname, 'prompts/pr-reviewer.md'), 'utf-8')

interface ReviewOutput {
  summary: string
  decision: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'
  confidence: number
  comments: { path: string; line: number; body: string; severity: 'critical' | 'warning' | 'suggestion' }[]
  reasoning: string
}

const handler: (event: FactoryEvent) => Promise<AgentResult> = async (event) => {
  const start = Date.now()
  const pr = event.payload && 'pullRequest' in event.payload ? event.payload.pullRequest : null

  if (!pr) {
    return {
      agentType: 'pr-reviewer',
      eventId: event.id,
      status: 'skipped',
      actions: [],
      reasoning: 'No pull request in event payload',
      costUsd: 0,
      durationMs: Date.now() - start,
    }
  }

  // [deterministic] Build context
  const context = await buildRepoContext(event)

  recordAudit({
    eventId: event.id,
    agentType: 'pr-reviewer',
    action: 'context_built',
    detail: `${context.relevantFiles.length} files, ${context.diff?.length ?? 0} bytes diff`,
  })

  // [agentic] LLM reasons about the PR
  const { data: review, response } = await chatJson<ReviewOutput>({
    model: getModelForAgent('pr-reviewer'),
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: JSON.stringify({
          pr: { number: pr.number, title: pr.title, body: pr.body, author: pr.author },
          diff: context.diff,
          files: context.relevantFiles.map(f => ({ path: f.path, content: f.content.slice(0, 5000) })),
          recentCommits: context.recentCommits,
        }),
      },
    ],
    eventId: event.id,
    agentType: 'pr-reviewer',
  })

  // [deterministic] Build actions from review output
  const actions: AgentAction[] = []

  for (const comment of review.comments) {
    actions.push({
      type: 'review_comment',
      path: comment.path,
      line: comment.line,
      body: comment.body,
      severity: comment.severity,
    })
  }

  actions.push({
    type: 'review_submit',
    event: review.decision,
    body: review.summary,
  })

  // [deterministic] Validate against governance
  const validation = validateActions('pr-reviewer', actions, event.id)
  if (!validation.allowed) {
    return {
      agentType: 'pr-reviewer',
      eventId: event.id,
      status: 'failure',
      actions: [],
      reasoning: `Governance violation: ${validation.violations.join('; ')}`,
      costUsd: response.costUsd,
      durationMs: Date.now() - start,
    }
  }

  // [agentic] LLM-as-Judge validates output
  const verdict = await judgeAgentOutput(event, 'pr-reviewer', review.reasoning, actions)

  if (!verdict.approved) {
    recordAudit({
      eventId: event.id,
      agentType: 'pr-reviewer',
      action: 'judge_vetoed',
      detail: verdict.issues.join('; '),
    })

    // Retry once with judge feedback
    const { data: retry, response: retryResponse } = await chatJson<ReviewOutput>({
      model: getModelForAgent('pr-reviewer'),
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            pr: { number: pr.number, title: pr.title, body: pr.body, author: pr.author },
            diff: context.diff,
            files: context.relevantFiles.map(f => ({ path: f.path, content: f.content.slice(0, 5000) })),
            recentCommits: context.recentCommits,
          }),
        },
        { role: 'assistant', content: JSON.stringify(review) },
        {
          role: 'user',
          content: `Your review was rejected by quality control. Issues: ${verdict.issues.join('; ')}. Please fix these issues and produce a corrected review.`,
        },
      ],
      eventId: event.id,
      agentType: 'pr-reviewer',
    })

    // Rebuild actions from retry
    actions.length = 0
    for (const comment of retry.comments) {
      actions.push({
        type: 'review_comment',
        path: comment.path,
        line: comment.line,
        body: comment.body,
        severity: comment.severity,
      })
    }
    actions.push({
      type: 'review_submit',
      event: retry.decision,
      body: retry.summary,
    })

    // Second judge pass — if still vetoed, log and bail
    const retryVerdict = await judgeAgentOutput(event, 'pr-reviewer', retry.reasoning, actions)
    if (!retryVerdict.approved) {
      recordAudit({
        eventId: event.id,
        agentType: 'pr-reviewer',
        action: 'judge_vetoed_final',
        detail: retryVerdict.issues.join('; '),
      })
      return {
        agentType: 'pr-reviewer',
        eventId: event.id,
        status: 'failure',
        actions: [],
        reasoning: `Judge vetoed twice: ${retryVerdict.issues.join('; ')}`,
        costUsd: response.costUsd + retryResponse.costUsd,
        durationMs: Date.now() - start,
      }
    }
  }

  // [deterministic] Execute via GitHub API
  const reviewComments = actions
    .filter((a): a is Extract<AgentAction, { type: 'review_comment' }> => a.type === 'review_comment')
    .map(c => ({ path: c.path, line: c.line, body: `**[${c.severity}]** ${c.body}` }))

  const submitAction = actions.find((a): a is Extract<AgentAction, { type: 'review_submit' }> => a.type === 'review_submit')

  if (submitAction) {
    await createReview(
      event.repo,
      pr.number,
      submitAction.body,
      submitAction.event,
      reviewComments.length > 0 ? reviewComments : undefined,
    )
  }

  recordAudit({
    eventId: event.id,
    agentType: 'pr-reviewer',
    action: 'review_posted',
    detail: `${review.decision} with ${review.comments.length} comments`,
    costUsd: response.costUsd,
  })

  return {
    agentType: 'pr-reviewer',
    eventId: event.id,
    status: 'success',
    actions,
    reasoning: review.reasoning,
    costUsd: response.costUsd,
    durationMs: Date.now() - start,
  }
}

export default handler
