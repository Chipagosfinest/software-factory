import { readFileSync } from 'fs'
import { resolve } from 'path'
import { chatJson } from '../core/llm.js'
import type { FactoryEvent, AgentAction, JudgeVerdict } from '../types.js'

const JUDGE_PROMPT = readFileSync(resolve(import.meta.dirname, 'prompts/judge.md'), 'utf-8')

export async function judgeAgentOutput(
  event: FactoryEvent,
  agentType: string,
  reasoning: string,
  actions: AgentAction[],
): Promise<JudgeVerdict> {
  const { data } = await chatJson<JudgeVerdict>({
    model: 'anthropic/claude-haiku-4-5-20251001',
    messages: [
      { role: 'system', content: JUDGE_PROMPT },
      {
        role: 'user',
        content: JSON.stringify({
          event: {
            id: event.id,
            type: event.type,
            source: event.source,
            payload: event.payload,
          },
          agentType,
          reasoning,
          actions,
        }),
      },
    ],
    maxTokens: 1024,
    temperature: 0.1,
    eventId: event.id,
    agentType: 'judge',
  })

  if (!data.approved) {
    console.warn(`[judge] Vetoed ${agentType} output: ${data.issues.join(', ')}`)
  }

  return data
}
