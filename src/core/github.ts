import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'
import { readFileSync } from 'fs'
import { withCircuitBreaker } from './circuit-breaker.js'
import type { RepoRef } from '../types.js'

async function getInstallationOctokit(installationId: number): Promise<Octokit> {
  const appId = process.env.GITHUB_APP_ID
  const privateKeyPath = process.env.GITHUB_PRIVATE_KEY_PATH
  if (!appId || !privateKeyPath) {
    throw new Error('GITHUB_APP_ID and GITHUB_PRIVATE_KEY_PATH required')
  }
  const privateKey = readFileSync(privateKeyPath, 'utf-8')
  return new Octokit({
    authStrategy: createAppAuth,
    auth: { appId: parseInt(appId), privateKey, installationId },
  })
}

async function ghApi<T>(installationId: number, fn: (octokit: Octokit) => Promise<T>): Promise<T> {
  const result = await withCircuitBreaker('github', async () => {
    const octokit = await getInstallationOctokit(installationId)
    return fn(octokit)
  })
  if (!result.success || result.data === undefined) {
    throw result.error || new Error('GitHub API call failed')
  }
  return result.data
}

// --- Read Operations ---

export async function getPullRequestDiff(repo: RepoRef, prNumber: number): Promise<string> {
  return ghApi(repo.installationId, async (octokit) => {
    const { data } = await octokit.pulls.get({
      owner: repo.owner,
      repo: repo.repo,
      pull_number: prNumber,
      mediaType: { format: 'diff' },
    })
    return data as unknown as string
  })
}

export async function getFileContent(repo: RepoRef, path: string, ref?: string): Promise<string> {
  return ghApi(repo.installationId, async (octokit) => {
    const { data } = await octokit.repos.getContent({
      owner: repo.owner,
      repo: repo.repo,
      path,
      ref,
    })
    if ('content' in data && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8')
    }
    throw new Error(`${path} is not a file`)
  })
}

export async function getFileTree(repo: RepoRef, ref?: string): Promise<string[]> {
  return ghApi(repo.installationId, async (octokit) => {
    const { data } = await octokit.git.getTree({
      owner: repo.owner,
      repo: repo.repo,
      tree_sha: ref || repo.defaultBranch,
      recursive: 'true',
    })
    return data.tree.filter(t => t.type === 'blob').map(t => t.path!)
  })
}

export async function getRecentCommits(repo: RepoRef, sha?: string, count = 10): Promise<{ sha: string; message: string; author: string }[]> {
  return ghApi(repo.installationId, async (octokit) => {
    const { data } = await octokit.repos.listCommits({
      owner: repo.owner,
      repo: repo.repo,
      sha: sha || repo.defaultBranch,
      per_page: count,
    })
    return data.map(c => ({
      sha: c.sha.slice(0, 7),
      message: c.commit.message.split('\n')[0],
      author: c.author?.login || c.commit.author?.name || 'unknown',
    }))
  })
}

export async function getCheckRunLogs(repo: RepoRef, checkRunId: number): Promise<string> {
  return ghApi(repo.installationId, async (octokit) => {
    const { data } = await octokit.checks.get({
      owner: repo.owner,
      repo: repo.repo,
      check_run_id: checkRunId,
    })
    return data.output?.text || data.output?.summary || 'No logs available'
  })
}

export async function getPullRequestFiles(repo: RepoRef, prNumber: number): Promise<{ filename: string; status: string; patch?: string }[]> {
  return ghApi(repo.installationId, async (octokit) => {
    const { data } = await octokit.pulls.listFiles({
      owner: repo.owner,
      repo: repo.repo,
      pull_number: prNumber,
      per_page: 100,
    })
    return data.map(f => ({ filename: f.filename, status: f.status, patch: f.patch }))
  })
}

// --- Write Operations ---

export async function createReview(
  repo: RepoRef,
  prNumber: number,
  body: string,
  event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT',
  comments?: { path: string; line: number; body: string }[],
): Promise<void> {
  await ghApi(repo.installationId, async (octokit) => {
    await octokit.pulls.createReview({
      owner: repo.owner,
      repo: repo.repo,
      pull_number: prNumber,
      body,
      event,
      comments: comments?.map(c => ({ path: c.path, line: c.line, body: c.body })),
    })
  })
}

export async function createComment(repo: RepoRef, issueNumber: number, body: string): Promise<void> {
  await ghApi(repo.installationId, async (octokit) => {
    await octokit.issues.createComment({
      owner: repo.owner,
      repo: repo.repo,
      issue_number: issueNumber,
      body,
    })
  })
}

export async function createPullRequest(repo: RepoRef, title: string, body: string, head: string, base?: string): Promise<number> {
  return ghApi(repo.installationId, async (octokit) => {
    const { data } = await octokit.pulls.create({
      owner: repo.owner,
      repo: repo.repo,
      title,
      body,
      head,
      base: base || repo.defaultBranch,
    })
    return data.number
  })
}

export async function createOrUpdateFile(
  repo: RepoRef,
  path: string,
  content: string,
  message: string,
  branch: string,
  sha?: string,
): Promise<void> {
  await ghApi(repo.installationId, async (octokit) => {
    await octokit.repos.createOrUpdateFileContents({
      owner: repo.owner,
      repo: repo.repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
      sha,
    })
  })
}
