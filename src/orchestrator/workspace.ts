import { execSync, execFileSync } from 'child_process'
import { existsSync, mkdirSync, rmSync } from 'fs'
import { resolve, join } from 'path'
import type { WorkspaceInfo, RepoRef } from '../types.js'

const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || resolve(process.cwd(), '.workspaces')

/** Ensure the workspace root directory exists */
function ensureRoot(): void {
  if (!existsSync(WORKSPACE_ROOT)) {
    mkdirSync(WORKSPACE_ROOT, { recursive: true })
  }
}

/** Clone or find the main repo locally */
function getRepoPath(repo: RepoRef): string {
  const repoDir = join(WORKSPACE_ROOT, '_repos', `${repo.owner}--${repo.repo}`)

  if (existsSync(join(repoDir, '.git'))) {
    // Fetch latest
    execSync('git fetch origin', { cwd: repoDir, stdio: 'pipe', timeout: 30_000 })
    return repoDir
  }

  // Clone fresh
  mkdirSync(join(WORKSPACE_ROOT, '_repos'), { recursive: true })
  const cloneUrl = `https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/${repo.owner}/${repo.repo}.git`
  execSync(`git clone ${cloneUrl} "${repoDir}"`, { stdio: 'pipe', timeout: 120_000 })

  return repoDir
}

/** Create an isolated git worktree for a task */
export function createWorkspace(taskId: string, repo: RepoRef, baseBranch?: string): WorkspaceInfo {
  ensureRoot()
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

  // Create worktree from the base branch (use execFileSync to prevent injection)
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
  try {
    execSync(`git worktree remove "${worktreePath}" --force`, {
      cwd: repoPath,
      stdio: 'pipe',
      timeout: 15_000,
    })
  } catch {
    // Force remove if worktree command fails
    if (existsSync(worktreePath)) {
      rmSync(worktreePath, { recursive: true, force: true })
    }
    // Prune stale worktree references
    try {
      execSync('git worktree prune', { cwd: repoPath, stdio: 'pipe' })
    } catch {
      // ignore
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
  const output = execSync('git worktree list --porcelain', {
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
  const status = execSync('git status --porcelain', {
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

/** Cleanup all stale workspaces (no running tasks) */
export function cleanupStaleWorkspaces(activeTaskIds: Set<string>): number {
  ensureRoot()
  let cleaned = 0

  if (!existsSync(WORKSPACE_ROOT)) return 0

  const entries = execSync(`ls -1 "${WORKSPACE_ROOT}"`, {
    encoding: 'utf-8',
    timeout: 5_000,
  }).trim().split('\n').filter(Boolean)

  for (const entry of entries) {
    if (entry === '_repos') continue  // skip repo cache
    if (!activeTaskIds.has(entry)) {
      const path = join(WORKSPACE_ROOT, entry)
      try {
        rmSync(path, { recursive: true, force: true })
        cleaned++
      } catch {
        // ignore cleanup errors
      }
    }
  }

  return cleaned
}
