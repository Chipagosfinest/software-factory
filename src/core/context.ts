import type { FactoryEvent, RepoContext, WebhookPayload } from '../types.js'
import { getPullRequestDiff, getFileTree, getRecentCommits, getFileContent, getPullRequestFiles, getCheckRunLogs } from './github.js'

const MAX_CONTEXT_BYTES = 100 * 1024

function isWebhookPayload(payload: unknown): payload is WebhookPayload {
  return typeof payload === 'object' && payload !== null && 'action' in payload && 'raw' in payload
}

export async function buildRepoContext(event: FactoryEvent): Promise<RepoContext> {
  const { repo, payload } = event
  const context: RepoContext = {
    fileTree: [],
    recentCommits: [],
    relevantFiles: [],
  }

  const [fileTree, commits] = await Promise.all([
    getFileTree(repo).catch(() => [] as string[]),
    getRecentCommits(repo).catch(() => []),
  ])

  context.fileTree = fileTree
  context.recentCommits = commits

  if (!isWebhookPayload(payload)) return context

  if (payload.pullRequest) {
    const pr = payload.pullRequest
    const [diff, files] = await Promise.all([
      getPullRequestDiff(repo, pr.number).catch(() => ''),
      getPullRequestFiles(repo, pr.number).catch(() => []),
    ])
    context.diff = diff

    let budgetUsed = Buffer.byteLength(diff)
    const relevantPaths = files.map(f => f.filename).filter(f => !isBinaryPath(f))

    for (const path of relevantPaths) {
      if (budgetUsed >= MAX_CONTEXT_BYTES) break
      try {
        const content = await getFileContent(repo, path, pr.head.sha)
        const size = Buffer.byteLength(content)
        if (budgetUsed + size <= MAX_CONTEXT_BYTES) {
          context.relevantFiles.push({ path, content })
          budgetUsed += size
        }
      } catch {
        // File might be deleted in the PR
      }
    }
  }

  if (payload.checkSuite) {
    const logs: string[] = []
    for (const run of payload.checkSuite.checkRuns) {
      if (run.conclusion !== 'success') {
        try {
          const log = await getCheckRunLogs(repo, run.id)
          logs.push(`--- ${run.name} ---\n${log}`)
        } catch {
          logs.push(`--- ${run.name} ---\nFailed to fetch logs`)
        }
      }
    }
    context.ciLogs = logs.join('\n\n')
  }

  try {
    const pkgContent = await getFileContent(repo, 'package.json', payload.pullRequest?.head.sha)
    context.packageJson = JSON.parse(pkgContent)
  } catch {
    // Not a Node project or no package.json
  }

  return context
}

function isBinaryPath(path: string): boolean {
  const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.mp3', '.mp4', '.zip', '.tar', '.gz', '.pdf', '.lock']
  return binaryExtensions.some(ext => path.endsWith(ext))
}
