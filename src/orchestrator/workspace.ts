import { execFileSync } from 'child_process'
import { existsSync, mkdirSync, rmSync, readdirSync } from 'fs'
import { resolve, join } from 'path'
import type { WorkspaceInfo, RepoRef } from '../types.js'

const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || resolve(process.cwd(), '.workspaces')
const MAX_CONCURRENT_WORKSPACES = parseInt(process.env.MAX_CONCURRENT_WORKSPACES || '5')

/** Ensure the workspace root directory exists */
function ensureRoot(): void {
  if (!existsSync(WORKSPACE_ROOT)) {
    mkdirSync(WORKSPACE_ROOT, { recursive: true })
  }
}

/** Validate repo is on the allowlist (prevents arbitrary repo clone attacks) */
function isRepoAllowed(repo: RepoRef): boolean {
  const allowlist = process.env.ALLOWED_REPOS
  if (!allowlist) return true  // No allowlist = allow all (dev mode)

  const allowed = new Set(allowlist.split(',').map(r => r.trim().toLowerCase()))
  return allowed.has(`${repo.owner}/${repo.repo}`.toLowerCase())
}

/** Clone or find the main repo locally. Strips credentials after clone. */
function getRepoPath(repo: RepoRef): string {
  const repoDir = join(WORKSPACE_ROOT, '_repos', `${repo.owner}--${repo.repo}`)

  if (existsSync(join(repoDir, '.git'))) {
    execFileSync('git', ['fetch', 'origin'], { cwd: repoDir, stdio: 'pipe', timeout: 30_000 })
    return repoDir
  }

  mkdirSync(join(WORKSPACE_ROOT, '_repos'), { recursive: true })

  // Clone with token in URL, then strip it from the stored remote
  const token = process.env.GITHUB_TOKEN || ''
  const cloneUrl = token
    ? `https://x-access-token:${token}@github.com/${repo.owner}/${repo.repo}.git`
    : `https://github.com/${repo.owner}/${repo.repo}.git`

  execFileSync('git', ['clone', cloneUrl, repoDir], { stdio: 'pipe', timeout: 120_000 })

  // Strip credentials from stored remote URL (security: prevents token leakage)
  const cleanUrl = `https://github.com/${repo.owner}/${repo.repo}.git`
  execFileSync('git', ['remote', 'set-url', 'origin', cleanUrl], { cwd: repoDir, stdio: 'pipe' })

  return repoDir
}

/** Deterministically reconstruct repoPath from repo ref (for restart recovery) */
export function getRepoPathForRef(repo: RepoRef): string {
  return join(WORKSPACE_ROOT, '_repos', `${repo.owner}--${repo.repo}`)
}

/** Create an isolated git worktree for a task */
export function createWorkspace(taskId: string, repo: RepoRef, baseBranch?: string): WorkspaceInfo {
  ensureRoot()

  // Security: validate repo is allowed
  if (!isRepoAllowed(repo)) {
    throw new Error(`Repository ${repo.owner}/${repo.repo} not in ALLOWED_REPOS allowlist`)
  }

  // Backpressure: limit concurrent workspaces
  const currentCount = countActiveWorkspaces()
  if (currentCount >= MAX_CONCURRENT_WORKSPACES) {
    throw new Error(`Max concurrent workspaces (${MAX_CONCURRENT_WORKSPACES}) reached. Current: ${currentCount}`)
  }

  const repoPath = getRepoPath(repo)
  const base = baseBranch || repo.defaultBranch || 'main'

  // Sanitize task ID for branch name
  const safeName = taskId.replace(/[^a-zA-Z0-9-]/g, '-').substring(0, 50)
  const branch = `factory/${safeName}`
  const worktreePath = join(WORKSPACE_ROOT, safeName)

  // Clean up if workspace already exists (stale from previous attempt)
  if (existsSync(worktreePath)) {
    removeWorkspace(worktreePath, repoPath)
  }

  // Delete branch if it exists from a previous attempt (fixes retry collision)
  try {
    execFileSync('git', ['branch', '-D', branch], { cwd: repoPath, stdio: 'pipe' })
  } catch {
    // Branch doesn't exist — expected on first attempt
  }

  // Create worktree from the base branch
  execFileSync('git', ['worktree', 'add', '-b', branch, worktreePath, `origin/${base}`], {
    cwd: repoPath,
    stdio: 'pipe',
    timeout: 30_000,
  })

  return {
    worktreePath,
    branch,
    baseBranch: base,
    repoPath,
    createdAt: new Date().toISOString(),
  }
}

/** Remove a workspace and its worktree */
export function removeWorkspace(worktreePath: string, repoPath: string): void {
  if (!repoPath || !existsSync(repoPath)) {
    // repoPath unknown or missing — just delete the directory
    if (existsSync(worktreePath)) {
      rmSync(worktreePath, { recursive: true, force: true })
      console.warn(`[workspace] Force-deleted ${worktreePath} (no repoPath)`)
    }
    return
  }

  try {
    execFileSync('git', ['worktree', 'remove', worktreePath, '--force'], {
      cwd: repoPath,
      stdio: 'pipe',
      timeout: 15_000,
    })
  } catch (err) {
    console.warn(`[workspace] git worktree remove failed for ${worktreePath}: ${err instanceof Error ? err.message : err}`)
    if (existsSync(worktreePath)) {
      rmSync(worktreePath, { recursive: true, force: true })
    }
    try {
      execFileSync('git', ['worktree', 'prune'], { cwd: repoPath, stdio: 'pipe' })
    } catch {
      // ignore prune errors
    }
  }
}

/** Push the workspace branch to remote */
export function pushWorkspace(workspace: WorkspaceInfo): void {
  execFileSync('git', ['push', '-u', 'origin', workspace.branch], {
    cwd: workspace.worktreePath,
    stdio: 'pipe',
    timeout: 60_000,
  })
}

/** List all active worktrees for a repo */
export function listWorkspaces(repoPath: string): string[] {
  const output = execFileSync('git', ['worktree', 'list', '--porcelain'], {
    cwd: repoPath,
    encoding: 'utf-8',
    timeout: 10_000,
  })

  return output
    .split('\n')
    .filter(line => line.startsWith('worktree '))
    .map(line => line.replace('worktree ', ''))
    .filter(path => path.includes(WORKSPACE_ROOT))
}

/** Check if a workspace has uncommitted changes */
export function hasChanges(worktreePath: string): boolean {
  const status = execFileSync('git', ['status', '--porcelain'], {
    cwd: worktreePath,
    encoding: 'utf-8',
    timeout: 10_000,
  })
  return status.trim().length > 0
}

/** Commit all changes in a workspace */
export function commitChanges(worktreePath: string, message: string): string {
  execFileSync('git', ['add', '-A'], { cwd: worktreePath, stdio: 'pipe', timeout: 10_000 })
  execFileSync('git', ['commit', '-m', message], {
    cwd: worktreePath,
    stdio: 'pipe',
    timeout: 10_000,
  })

  return execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: worktreePath,
    encoding: 'utf-8',
    timeout: 5_000,
  }).trim()
}

/** Count current workspace directories (excluding _repos) */
function countActiveWorkspaces(): number {
  ensureRoot()
  if (!existsSync(WORKSPACE_ROOT)) return 0
  try {
    return readdirSync(WORKSPACE_ROOT).filter(e => e !== '_repos').length
  } catch {
    return 0
  }
}

/** Cleanup all stale workspaces (no running tasks) */
export function cleanupStaleWorkspaces(activeTaskIds: Set<string>): number {
  ensureRoot()
  let cleaned = 0
  if (!existsSync(WORKSPACE_ROOT)) return 0

  let entries: string[]
  try {
    entries = readdirSync(WORKSPACE_ROOT).filter(Boolean)
  } catch {
    return 0
  }

  for (const entry of entries) {
    if (entry === '_repos') continue
    // Match against sanitized task IDs (same transform as createWorkspace)
    if (!activeTaskIds.has(entry)) {
      const path = join(WORKSPACE_ROOT, entry)
      try {
        rmSync(path, { recursive: true, force: true })
        cleaned++
        console.log(`[workspace] Cleaned stale workspace: ${entry}`)
      } catch (err) {
        console.warn(`[workspace] Failed to clean ${entry}: ${err instanceof Error ? err.message : err}`)
      }
    }
  }

  return cleaned
}
