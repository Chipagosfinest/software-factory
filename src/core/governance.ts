import type { AgentType, AgentPermissions, AgentAction, FileChange } from '../types.js'
import { recordAudit } from './db.js'

const DEFAULT_PERMISSIONS: Record<AgentType, AgentPermissions> = {
  'pr-reviewer': {
    allowedFilePatterns: ['**/*'],
    blockedFilePatterns: [],
    maxFilesChanged: 0,
    maxLinesChanged: 0,
    canCreatePR: false,
    canApprove: true,
    canMerge: false,
    costLimitUsd: 2.0,
    timeoutMs: 300_000,
  },
  'ci-debugger': {
    allowedFilePatterns: ['**/*'],
    blockedFilePatterns: ['.github/**', '.env*'],
    maxFilesChanged: 10,
    maxLinesChanged: 200,
    canCreatePR: true,
    canApprove: false,
    canMerge: false,
    costLimitUsd: 2.0,
    timeoutMs: 300_000,
  },
  'security': {
    allowedFilePatterns: ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'Gemfile.lock', 'requirements.txt', 'go.sum'],
    blockedFilePatterns: ['.github/**', '.env*'],
    maxFilesChanged: 5,
    maxLinesChanged: 100,
    canCreatePR: true,
    canApprove: false,
    canMerge: false,
    costLimitUsd: 2.0,
    timeoutMs: 300_000,
  },
  'incident': {
    allowedFilePatterns: ['**/*'],
    blockedFilePatterns: ['.github/**', '.env*'],
    maxFilesChanged: 10,
    maxLinesChanged: 200,
    canCreatePR: true,
    canApprove: false,
    canMerge: false,
    costLimitUsd: 2.0,
    timeoutMs: 300_000,
  },
  'merge-resolver': {
    allowedFilePatterns: ['**/*'],
    blockedFilePatterns: ['.github/**', '.env*'],
    maxFilesChanged: 20,
    maxLinesChanged: 500,
    canCreatePR: false,
    canApprove: false,
    canMerge: false,
    costLimitUsd: 2.0,
    timeoutMs: 300_000,
  },
  'tool-discovery': {
    allowedFilePatterns: [],
    blockedFilePatterns: ['**/*'],
    maxFilesChanged: 0,
    maxLinesChanged: 0,
    canCreatePR: false,
    canApprove: false,
    canMerge: false,
    costLimitUsd: 1.5,
    timeoutMs: 300_000,
  },
  'signal-harvester': {
    allowedFilePatterns: [],
    blockedFilePatterns: ['**/*'],
    maxFilesChanged: 0,
    maxLinesChanged: 0,
    canCreatePR: false,
    canApprove: false,
    canMerge: false,
    costLimitUsd: 0.5,
    timeoutMs: 300_000,
  },
  'drift-detector': {
    allowedFilePatterns: [],
    blockedFilePatterns: ['**/*'],
    maxFilesChanged: 0,
    maxLinesChanged: 0,
    canCreatePR: false,
    canApprove: false,
    canMerge: false,
    costLimitUsd: 0.5,
    timeoutMs: 300_000,
  },
  'backfill': {
    allowedFilePatterns: [],
    blockedFilePatterns: ['**/*'],
    maxFilesChanged: 0,
    maxLinesChanged: 0,
    canCreatePR: false,
    canApprove: false,
    canMerge: false,
    costLimitUsd: 3.0,
    timeoutMs: 300_000,
  },
  'integration-tester': {
    allowedFilePatterns: [],
    blockedFilePatterns: ['**/*'],
    maxFilesChanged: 0,
    maxLinesChanged: 0,
    canCreatePR: false,
    canApprove: false,
    canMerge: false,
    costLimitUsd: 1.0,
    timeoutMs: 300_000,
  },
}

export function getPermissions(agentType: AgentType): AgentPermissions {
  return DEFAULT_PERMISSIONS[agentType] || DEFAULT_PERMISSIONS['pr-reviewer']
}

export interface ValidationResult {
  allowed: boolean
  violations: string[]
}

export function validateActions(
  agentType: AgentType,
  actions: AgentAction[],
  eventId: string,
): ValidationResult {
  const perms = getPermissions(agentType)
  const violations: string[] = []

  for (const action of actions) {
    if (action.type === 'review_submit' && action.event === 'APPROVE' && !perms.canApprove) {
      violations.push(`${agentType} is not allowed to approve PRs`)
    }

    if (action.type === 'create_pr' && !perms.canCreatePR) {
      violations.push(`${agentType} is not allowed to create PRs`)
    }

    if (action.type === 'push_commit') {
      const fileCount = action.files.length
      if (fileCount > perms.maxFilesChanged) {
        violations.push(`${agentType} changing ${fileCount} files exceeds limit of ${perms.maxFilesChanged}`)
      }

      const totalLines = action.files.reduce((sum, f) => sum + f.content.split('\n').length, 0)
      if (totalLines > perms.maxLinesChanged) {
        violations.push(`${agentType} changing ${totalLines} lines exceeds limit of ${perms.maxLinesChanged}`)
      }

      for (const file of action.files) {
        if (isBlockedPath(file.path, perms.blockedFilePatterns)) {
          violations.push(`${agentType} cannot modify blocked path: ${file.path}`)
        }
      }
    }
  }

  if (violations.length > 0) {
    recordAudit({
      eventId,
      agentType,
      action: 'governance_violation',
      detail: violations.join('; '),
    })
  }

  return { allowed: violations.length === 0, violations }
}

export function validateCost(agentType: AgentType, costUsd: number, eventId: string): boolean {
  const perms = getPermissions(agentType)
  if (costUsd > perms.costLimitUsd) {
    recordAudit({
      eventId,
      agentType,
      action: 'cost_exceeded',
      detail: `Cost $${costUsd.toFixed(4)} exceeds limit $${perms.costLimitUsd.toFixed(2)}`,
      costUsd,
    })
    return false
  }
  return true
}

function isBlockedPath(filePath: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    if (pattern === '**/*') return true
    if (pattern.endsWith('/**')) {
      const prefix = pattern.slice(0, -3)
      if (filePath.startsWith(prefix)) return true
    }
    if (pattern.startsWith('.') && filePath.startsWith(pattern.replace('*', ''))) return true
    if (filePath === pattern) return true
  }
  return false
}
