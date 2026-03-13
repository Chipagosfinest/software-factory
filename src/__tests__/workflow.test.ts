import { describe, it, expect, afterEach } from 'vitest'
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs'
import { join } from 'path'
import { parseWorkflowConfig, getWorkflowInstructions, invalidateCache } from '../orchestrator/workflow.js'

const TEST_DIR = join(process.cwd(), '.test-workflow')

function setupTestDir(): void {
  if (!existsSync(TEST_DIR)) {
    mkdirSync(TEST_DIR, { recursive: true })
  }
}

afterEach(() => {
  invalidateCache()
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true })
  }
})

describe('WORKFLOW.md parser', () => {
  it('returns defaults when no WORKFLOW.md exists', () => {
    const config = parseWorkflowConfig('/nonexistent/path')
    expect(config.defaults.maxRetries).toBe(2)
    expect(config.defaults.timeoutMinutes).toBe(10)
    expect(config.agents['pr-reviewer'].enabled).toBe(true)
  })

  it('parses YAML front matter', () => {
    setupTestDir()
    writeFileSync(join(TEST_DIR, 'WORKFLOW.md'), `---
agents:
  pr-reviewer:
    enabled: true
    model: anthropic/claude-sonnet-4
    timeoutMinutes: 15
  ci-debugger:
    enabled: false
defaults:
  maxRetries: 3
  timeoutMinutes: 20
labels:
  autoAssign: ["factory:auto", "factory:fix"]
  ignore: ["skip"]
---
# Custom Instructions

Review all PRs thoroughly.
`)

    const config = parseWorkflowConfig(TEST_DIR)
    expect(config.agents['pr-reviewer'].enabled).toBe(true)
    expect(config.agents['pr-reviewer'].model).toBe('anthropic/claude-sonnet-4')
    expect(config.agents['pr-reviewer'].timeoutMinutes).toBe(15)
    expect(config.agents['ci-debugger'].enabled).toBe(false)
    expect(config.defaults.maxRetries).toBe(3)
    expect(config.defaults.timeoutMinutes).toBe(20)
    expect(config.labels.autoAssign).toEqual(['factory:auto', 'factory:fix'])
    expect(config.labels.ignore).toEqual(['skip'])
  })

  it('extracts free-text instructions', () => {
    setupTestDir()
    writeFileSync(join(TEST_DIR, 'WORKFLOW.md'), `---
defaults:
  maxRetries: 2
---
# Custom Instructions

Always run tests before submitting.
Check for console.log statements.
`)

    const instructions = getWorkflowInstructions(TEST_DIR)
    expect(instructions).toContain('Always run tests')
    expect(instructions).toContain('console.log')
  })

  it('returns empty instructions when no WORKFLOW.md', () => {
    const instructions = getWorkflowInstructions('/nonexistent')
    expect(instructions).toBe('')
  })
})
