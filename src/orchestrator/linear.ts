import type { LinearIssue } from '../types.js'
import { withCircuitBreaker } from '../core/circuit-breaker.js'

const LINEAR_API = 'https://api.linear.app/graphql'

function getApiKey(): string {
  const key = process.env.LINEAR_API_KEY
  if (!key) throw new Error('LINEAR_API_KEY not set')
  return key
}

async function graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const result = await withCircuitBreaker('linear', async () => {
    const res = await fetch(LINEAR_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getApiKey(),
      },
      body: JSON.stringify({ query, variables }),
    })

    if (!res.ok) {
      throw new Error(`Linear API error: ${res.status} ${res.statusText}`)
    }

    const json = await res.json() as { data?: T; errors?: { message: string }[] }

    if (json.errors?.length) {
      throw new Error(`Linear GraphQL error: ${json.errors[0].message}`)
    }

    return json.data as T
  })

  if (!result.success || !result.data) {
    throw result.error || new Error('Linear API call failed (circuit breaker)')
  }

  return result.data
}

/** Fetch issues with a specific label that are in a workable state */
export async function fetchFactoryIssues(teamId: string, labelName = 'factory:auto'): Promise<LinearIssue[]> {
  const data = await graphql<{
    issues: {
      nodes: Array<{
        id: string
        identifier: string
        title: string
        description: string
        state: { name: string; type: string }
        labels: { nodes: { name: string }[] }
        assignee: { name: string } | null
        project: { name: string } | null
        url: string
        createdAt: string
        updatedAt: string
      }>
    }
  }>(`
    query FactoryIssues($teamId: String!, $labelName: String!) {
      issues(
        filter: {
          team: { id: { eq: $teamId } }
          labels: { name: { eq: $labelName } }
          state: { type: { in: ["backlog", "unstarted", "started"] } }
        }
        first: 50
        orderBy: updatedAt
      ) {
        nodes {
          id
          identifier
          title
          description
          state { name type }
          labels { nodes { name } }
          assignee { name }
          project { name }
          url
          createdAt
          updatedAt
        }
      }
    }
  `, { teamId, labelName })

  return data.issues.nodes.map(issue => ({
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description ?? '',
    state: issue.state,
    labels: issue.labels.nodes.map(l => ({ name: l.name })),
    assignee: issue.assignee ? { name: issue.assignee.name } : undefined,
    project: issue.project ? { name: issue.project.name } : undefined,
    url: issue.url,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
  }))
}

/** Update issue state in Linear (e.g., mark as "In Progress", "Done") */
export async function updateIssueState(issueId: string, stateId: string): Promise<void> {
  await graphql(`
    mutation UpdateIssueState($id: String!, $stateId: String!) {
      issueUpdate(id: $id, input: { stateId: $stateId }) {
        success
      }
    }
  `, { id: issueId, stateId })
}

/** Add a comment to a Linear issue */
export async function addIssueComment(issueId: string, body: string): Promise<void> {
  await graphql(`
    mutation AddComment($id: String!, $body: String!) {
      commentCreate(input: { issueId: $id, body: $body }) {
        success
      }
    }
  `, { id: issueId, body })
}

/** Assign the issue to factory bot (or unassign) */
export async function assignIssue(issueId: string, assigneeId: string | null): Promise<void> {
  await graphql(`
    mutation AssignIssue($id: String!, $assigneeId: String) {
      issueUpdate(id: $id, input: { assigneeId: $assigneeId }) {
        success
      }
    }
  `, { id: issueId, assigneeId })
}

/** Fetch workflow states for a team (to map state names to IDs) */
export async function getTeamStates(teamId: string): Promise<{ id: string; name: string; type: string }[]> {
  const data = await graphql<{
    team: {
      states: {
        nodes: { id: string; name: string; type: string }[]
      }
    }
  }>(`
    query TeamStates($teamId: String!) {
      team(id: $teamId) {
        states { nodes { id name type } }
      }
    }
  `, { teamId })

  return data.team.states.nodes
}
