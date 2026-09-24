#!/usr/bin/env node

// Read-only upstream issue triage. Repositories are ones Alec already uses or contributes to.
import { writeFile } from 'node:fs/promises'

const repositories = ['openai/codex', 'steipete/CodexBar', 'modelcontextprotocol/ext-apps']
const terms = /\b(crash|regression|memory leak|race condition|data loss|hang|deadlock|broken|fails?|error)\b/i
const evidence = /\b(repro(?:duce|duction|ducible)?|steps to|stack trace|crash report|logs?|test case|expected behavior|actual behavior)\b/i
const dated = new Date().toISOString().slice(0, 10)
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN

async function fetchIssues(repository) {
  const response = await fetch(`https://api.github.com/repos/${repository}/issues?state=open&sort=updated&direction=desc&per_page=100`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'software-factory-contribution-scout',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!response.ok) throw new Error(`${repository}: GitHub HTTP ${response.status}`)
  return (await response.json()).filter((item) => !item.pull_request)
}

function rank(issue) {
  const text = `${issue.title}\n${issue.body || ''}`
  if (!terms.test(text) || !evidence.test(text)) return null
  const ageDays = (Date.now() - Date.parse(issue.created_at)) / 86_400_000
  const updatedDays = (Date.now() - Date.parse(issue.updated_at)) / 86_400_000
  let score = 0
  if (terms.test(issue.title)) score += 3
  if (/\b(repro(?:duce|duction|ducible)?|steps to)\b/i.test(text)) score += 2
  if (/\b(stack trace|crash report|test case)\b/i.test(text)) score += 2
  if (ageDays <= 30) score += 1
  if (updatedDays <= 7) score += 1
  if (issue.assignee || issue.assignees?.length) score -= 2
  return { issue, score }
}

async function main() {
  const results = await Promise.allSettled(repositories.map(async (repository) => ({
    repository,
    issues: await fetchIssues(repository),
  })))
  const failures = results.filter((result) => result.status === 'rejected').map((result) => String(result.reason))
  const ranked = results
    .filter((result) => result.status === 'fulfilled')
    .flatMap((result) => result.value.issues.map(rank).filter(Boolean).map((candidate) => ({ ...candidate, repository: result.value.repository })))
    .filter((candidate) => candidate.score >= 4)
  const candidates = repositories.flatMap((repository) => ranked
    .filter((candidate) => candidate.repository === repository)
    .sort((a, b) => b.score - a.score || Date.parse(b.issue.updated_at) - Date.parse(a.issue.updated_at))
    .slice(0, 4))

  const lines = [
    `# Contribution scout — ${dated}`,
    '',
    'Read-only candidates from the 100 most recently updated open issues in each watched repository. A match is a lead, not a validated bug or an invitation to file a PR.',
    '',
    `Repositories: ${repositories.join(', ')}.`,
    '',
    '| Repo | Score | Issue | Updated | Why inspect |',
    '| --- | ---: | --- | --- | --- |',
    ...candidates.map(({ issue, score, repository }) => {
      const title = issue.title.replaceAll('|', '\\|').replaceAll('\n', ' ')
      const reason = [terms.test(issue.title) ? 'failure in title' : 'failure in body', evidence.test(issue.body || '') ? 'reported evidence' : 'evidence in title'].join('; ')
      return `| ${repository} | ${score} | [${title}](${issue.html_url}) | ${issue.updated_at.slice(0, 10)} | ${reason} |`
    }),
    ...(candidates.length ? [] : ['| — | — | No candidates met the threshold | — | — |']),
    '',
    'Before contributing: reproduce locally; inspect linked issues and PRs; check maintainer guidance and AI disclosure; choose one fix with a regression check. Do not publish suspected security bugs here.',
    ...(failures.length ? ['', `Fetch failures: ${failures.join('; ')}`] : []),
    '',
  ]
  const report = lines.join('\n')
  if (process.argv[2]) await writeFile(process.argv[2], report)
  else process.stdout.write(report)
  if (process.env.GITHUB_STEP_SUMMARY) await writeFile(process.env.GITHUB_STEP_SUMMARY, report)
  if (failures.length) process.exitCode = 1
}

await main()
