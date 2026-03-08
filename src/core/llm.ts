import OpenAI from 'openai'
import { recordCost } from './db.js'
import { withCircuitBreaker } from './circuit-breaker.js'
import type { LLMRequest, LLMResponse } from '../types.js'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
})

const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'anthropic/claude-sonnet-4'

// Cost per million tokens (approximate, updated periodically)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'anthropic/claude-sonnet-4': { input: 3.0, output: 15.0 },
  'anthropic/claude-haiku-4-5-20251001': { input: 0.8, output: 4.0 },
  'google/gemini-2.5-flash': { input: 0.15, output: 0.6 },
  'deepseek/deepseek-chat-v3': { input: 0.27, output: 1.1 },
}

function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
  const costs = MODEL_COSTS[model] || { input: 3.0, output: 15.0 }
  return (promptTokens * costs.input + completionTokens * costs.output) / 1_000_000
}

export async function chat(request: LLMRequest): Promise<LLMResponse> {
  const model = request.model || DEFAULT_MODEL

  const result = await withCircuitBreaker('openrouter', async () => {
    const response = await client.chat.completions.create({
      model,
      messages: request.messages,
      max_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature ?? 0.2,
    })

    const usage = response.usage
    const promptTokens = usage?.prompt_tokens ?? 0
    const completionTokens = usage?.completion_tokens ?? 0
    const costUsd = estimateCost(model, promptTokens, completionTokens)

    return {
      content: response.choices[0]?.message?.content ?? '',
      model: response.model ?? model,
      usage: { promptTokens, completionTokens },
      costUsd,
    }
  })

  if (!result.success || !result.data) {
    throw result.error || new Error('LLM call failed')
  }

  return result.data
}

// Structured JSON output helper with Zod-free parsing
export async function chatJson<T>(request: LLMRequest & { eventId?: string; agentType?: string }): Promise<{ data: T; response: LLMResponse }> {
  const messagesWithJsonInstruction = [...request.messages]
  const lastMsg = messagesWithJsonInstruction[messagesWithJsonInstruction.length - 1]
  if (lastMsg && !lastMsg.content.includes('JSON')) {
    messagesWithJsonInstruction[messagesWithJsonInstruction.length - 1] = {
      ...lastMsg,
      content: lastMsg.content + '\n\nRespond with valid JSON only. No markdown code fences.',
    }
  }

  const response = await chat({ ...request, messages: messagesWithJsonInstruction })

  // Track cost
  recordCost({
    eventId: request.eventId,
    agentType: request.agentType,
    model: response.model,
    promptTokens: response.usage.promptTokens,
    completionTokens: response.usage.completionTokens,
    costUsd: response.costUsd,
  })

  // Parse JSON, stripping markdown fences if present
  let jsonStr = response.content.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  const data = JSON.parse(jsonStr) as T
  return { data, response }
}

// Model selection per agent type
const AGENT_MODELS: Record<string, string> = {
  'pr-reviewer': process.env.PR_REVIEW_MODEL || DEFAULT_MODEL,
  'ci-debugger': process.env.CI_DEBUG_MODEL || DEFAULT_MODEL,
  'security': process.env.SECURITY_MODEL || DEFAULT_MODEL,
  'incident': process.env.INCIDENT_MODEL || DEFAULT_MODEL,
  'merge-resolver': DEFAULT_MODEL,
  'tool-discovery': 'google/gemini-2.5-flash',
  'signal-harvester': 'google/gemini-2.5-flash',
  'drift-detector': 'google/gemini-2.5-flash',
  'backfill': DEFAULT_MODEL,
  'integration-tester': DEFAULT_MODEL,
}

export function getModelForAgent(agentType: string): string {
  return AGENT_MODELS[agentType] || DEFAULT_MODEL
}
