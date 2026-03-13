import { readFileSync, existsSync, statSync } from 'fs'
import { join } from 'path'
import type { WorkflowConfig } from '../types.js'

const DEFAULT_CONFIG: WorkflowConfig = {
  agents: {
    'pr-reviewer': { enabled: true },
    'ci-debugger': { enabled: true },
    'security': { enabled: true },
    'incident': { enabled: true },
    'merge-resolver': { enabled: true },
  },
  defaults: {
    maxRetries: 2,
    timeoutMinutes: 10,
  },
  labels: {
    autoAssign: ['factory:auto', 'factory:review', 'factory:fix'],
    ignore: ['factory:skip', 'skip-review'],
  },
}

let _cachedConfig: WorkflowConfig | null = null
let _cachedMtime: number = 0

/**
 * Parse WORKFLOW.md from a repo directory.
 *
 * WORKFLOW.md uses YAML front matter for structured config:
 * ```yaml
 * ---
 * agents:
 *   pr-reviewer:
 *     enabled: true
 *     model: anthropic/claude-sonnet-4
 *   ci-debugger:
 *     enabled: true
 *     maxRetries: 3
 * defaults:
 *   maxRetries: 2
 *   timeoutMinutes: 10
 * labels:
 *   autoAssign: ["factory:auto"]
 *   ignore: ["factory:skip"]
 * ---
 * # Workflow Instructions
 * Additional context for agents...
 * ```
 */
export function parseWorkflowConfig(repoPath: string): WorkflowConfig {
  const workflowPath = join(repoPath, 'WORKFLOW.md')

  if (!existsSync(workflowPath)) {
    return { ...DEFAULT_CONFIG }
  }

  // Hot-reload: only re-parse if file changed
  const mtime = statSync(workflowPath).mtimeMs
  if (_cachedConfig && mtime === _cachedMtime) {
    return _cachedConfig
  }

  const content = readFileSync(workflowPath, 'utf-8')
  const config = parseYamlFrontMatter(content)

  _cachedConfig = config
  _cachedMtime = mtime

  return config
}

/** Extract YAML-ish front matter from markdown (simple parser, no yaml dep) */
function parseYamlFrontMatter(content: string): WorkflowConfig {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return { ...DEFAULT_CONFIG }

  const yaml = match[1]
  const config: WorkflowConfig = { ...DEFAULT_CONFIG }

  try {
    // Simple line-by-line YAML parser for our limited schema
    let currentSection = ''
    let currentAgent = ''

    for (const line of yaml.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      // Top-level sections
      if (!line.startsWith(' ') && !line.startsWith('\t')) {
        const [key] = trimmed.split(':')
        currentSection = key
        currentAgent = ''
        continue
      }

      // Agent names under agents:
      if (currentSection === 'agents' && line.match(/^ {2}\S/)) {
        currentAgent = trimmed.replace(':', '')
        if (!config.agents[currentAgent]) {
          config.agents[currentAgent] = { enabled: false }
        }
        continue
      }

      // Agent properties
      if (currentSection === 'agents' && currentAgent && line.match(/^ {4}\S/)) {
        const [key, ...rest] = trimmed.split(':')
        const value = rest.join(':').trim()
        const agentConfig = config.agents[currentAgent]
        if (key === 'enabled') agentConfig.enabled = value === 'true'
        else if (key === 'model') agentConfig.model = value
        else if (key === 'timeoutMinutes') agentConfig.timeoutMinutes = parseInt(value)
        else if (key === 'maxRetries') agentConfig.maxRetries = parseInt(value)
        else if (key === 'prompt') agentConfig.prompt = value
        continue
      }

      // Defaults section
      if (currentSection === 'defaults') {
        const [key, ...rest] = trimmed.split(':')
        const value = rest.join(':').trim()
        if (key === 'maxRetries') config.defaults.maxRetries = parseInt(value)
        else if (key === 'timeoutMinutes') config.defaults.timeoutMinutes = parseInt(value)
        else if (key === 'model') config.defaults.model = value
        continue
      }

      // Labels section
      if (currentSection === 'labels') {
        const [key, ...rest] = trimmed.split(':')
        const value = rest.join(':').trim()
        const parsed = value.match(/\["([^"]+)"(?:,\s*"([^"]+)")*\]/)
        if (parsed) {
          const items = value.replace(/[\[\]"]/g, '').split(',').map(s => s.trim()).filter(Boolean)
          if (key === 'autoAssign') config.labels.autoAssign = items
          else if (key === 'ignore') config.labels.ignore = items
        }
        continue
      }
    }
  } catch {
    console.warn('[workflow] Failed to parse WORKFLOW.md, using defaults')
    return { ...DEFAULT_CONFIG }
  }

  return config
}

/** Get the free-text instructions from WORKFLOW.md (everything after front matter) */
export function getWorkflowInstructions(repoPath: string): string {
  const workflowPath = join(repoPath, 'WORKFLOW.md')
  if (!existsSync(workflowPath)) return ''

  const content = readFileSync(workflowPath, 'utf-8')
  const withoutFrontMatter = content.replace(/^---\n[\s\S]*?\n---\n?/, '')
  return withoutFrontMatter.trim()
}

/** Invalidate the cached config (for testing) */
export function invalidateCache(): void {
  _cachedConfig = null
  _cachedMtime = 0
}
