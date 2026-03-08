import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const GATE_FILE = resolve(process.env.EXECUTOR_GATE_PATH || './executor_gate.json')

interface GateConfig {
  enabled: boolean
  disabledAgents: string[]
  reason?: string
}

function readGate(): GateConfig {
  if (!existsSync(GATE_FILE)) {
    return { enabled: true, disabledAgents: [] }
  }
  try {
    return JSON.parse(readFileSync(GATE_FILE, 'utf-8'))
  } catch {
    console.error(`[executor-gate] Failed to parse ${GATE_FILE}, defaulting to enabled`)
    return { enabled: true, disabledAgents: [] }
  }
}

export function isExecutionAllowed(agentType?: string): { allowed: boolean; reason?: string } {
  const gate = readGate()

  if (!gate.enabled) {
    return { allowed: false, reason: gate.reason || 'Kill switch activated — all agents disabled' }
  }

  if (agentType && gate.disabledAgents.includes(agentType)) {
    return { allowed: false, reason: `Agent "${agentType}" is disabled via executor gate` }
  }

  return { allowed: true }
}
