// ─── Event Types ───────────────────────────────────────────

export type AgentType =
  | 'pr-reviewer' | 'ci-debugger' | 'security' | 'incident' | 'merge-resolver'
  | 'tool-discovery' | 'integration-tester' | 'drift-detector' | 'signal-harvester' | 'backfill'

export interface FactoryEvent {
  id: string
  type: AgentType
  timestamp: string
  source: 'github' | 'pagerduty' | 'cron' | 'manual'
  payload: WebhookPayload | CronPayload
  repo: RepoRef
}

export interface RepoRef {
  owner: string
  repo: string
  defaultBranch: string
  installationId: number
}

export interface WebhookPayload {
  action: string
  pullRequest?: PullRequestRef
  checkSuite?: CheckSuiteRef
  alert?: AlertRef
  raw: Record<string, unknown>
}

export interface PullRequestRef {
  number: number
  title: string
  body: string
  head: { ref: string; sha: string }
  base: { ref: string; sha: string }
  author: string
  draft: boolean
  labels: string[]
}

export interface CheckSuiteRef {
  id: number
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'timed_out'
  headSha: string
  headBranch: string
  checkRuns: CheckRunRef[]
}

export interface CheckRunRef {
  id: number
  name: string
  conclusion: string | null
  output: { title: string; summary: string; text: string | null }
}

export interface AlertRef {
  id: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  package: string
  vulnerableRange: string
  patchedVersion: string | null
  cve: string | null
  description: string
}

// ─── Agent Output ──────────────────────────────────────────

export interface AgentResult {
  agentType: AgentType
  eventId: string
  status: 'success' | 'failure' | 'skipped'
  actions: AgentAction[]
  reasoning: string
  costUsd: number
  durationMs: number
}

export type AgentAction =
  | { type: 'review_comment'; path: string; line: number; body: string; severity: 'critical' | 'warning' | 'suggestion' }
  | { type: 'review_submit'; event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'; body: string }
  | { type: 'create_pr'; title: string; body: string; branch: string; baseBranch: string }
  | { type: 'comment'; body: string }
  | { type: 'push_commit'; branch: string; message: string; files: FileChange[] }

export interface FileChange {
  path: string
  content: string
  action: 'create' | 'update' | 'delete'
}

// ─── Repo Context ──────────────────────────────────────────

export interface RepoContext {
  fileTree: string[]
  recentCommits: { sha: string; message: string; author: string }[]
  diff?: string
  relevantFiles: { path: string; content: string }[]
  ciLogs?: string
  packageJson?: Record<string, unknown>
}

// ─── Governance ────────────────────────────────────────────

export interface AgentPermissions {
  allowedFilePatterns: string[]
  blockedFilePatterns: string[]
  maxFilesChanged: number
  maxLinesChanged: number
  canCreatePR: boolean
  canApprove: boolean
  canMerge: boolean // always false — humans merge
  costLimitUsd: number
  timeoutMs: number
}

export interface AuditEntry {
  id: string
  eventId: string
  agentType: AgentType
  action: string
  detail: string
  timestamp: string
  costUsd: number
}

// ─── LLM ───────────────────────────────────────────────────

export interface LLMRequest {
  model: string
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
  maxTokens?: number
  temperature?: number
}

export interface LLMResponse {
  content: string
  model: string
  usage: { promptTokens: number; completionTokens: number }
  costUsd: number
}

// ─── Cron ──────────────────────────────────────────────────

export interface CronPayload {
  action: 'scheduled' | 'manual'
  schedule: string
  lastRunAt: string | null
  params: Record<string, unknown>
}

// ─── Data Actions (Cron Agents) ────────────────────────────

export type DataAction =
  | { type: 'upsert_product'; slug: string; data: ProductUpsert }
  | { type: 'update_signal'; productSlug: string; signal: string; value: number; source: string }
  | { type: 'flag_deprecation'; slug: string; reason: string; successor?: string }
  | { type: 'queue_discovery'; name: string; source: string; context: string }

export interface ProductUpsert {
  name: string
  slug: string
  description?: string
  category?: string
  website?: string
  github_url?: string
  npm_package?: string
  pricing_model?: string
  tags?: string[]
}

// ─── Product Validation (Flywheel) ─────────────────────────

export interface ProductValidation {
  slug: string
  discoveredAt: string
  discoverySource: string
  confidence: number
  validations: {
    signalsVerified: boolean
    driftChecked: boolean
    integrationTested: boolean
    profileComplete: boolean
  }
  lastReviewedAt: string
  reviewCount: number
}

// ─── Judge ─────────────────────────────────────────────────

export interface JudgeVerdict {
  approved: boolean
  confidence: number
  issues: string[]
  reasoning: string
}

// ─── Orchestrator (Symphony-style) ──────────────────────────

export type TaskStatus = 'unclaimed' | 'claimed' | 'running' | 'retry_queued' | 'released' | 'completed' | 'failed'

export interface OrchestratorTask {
  id: string                    // Linear issue ID or internal UUID
  externalId?: string           // Linear issue identifier (e.g., "SF-42")
  title: string
  description: string
  status: TaskStatus
  agentType: AgentType
  repo: RepoRef
  workspace?: WorkspaceInfo
  retryCount: number
  maxRetries: number
  lastError?: string
  backoffUntil?: string         // ISO timestamp — don't retry before this
  createdAt: string
  claimedAt?: string
  startedAt?: string
  completedAt?: string
  resultPrUrl?: string          // URL of the PR created by the agent
  costUsd: number
  labels: string[]
  source: 'linear' | 'github' | 'manual'
}

export interface WorkspaceInfo {
  worktreePath: string          // Absolute path to the git worktree
  branch: string                // Branch name for this workspace
  baseBranch: string            // Branch to base work on (usually main)
  repoPath: string              // Path to the main repo
  createdAt: string
}

export interface WorkflowConfig {
  agents: Record<string, WorkflowAgentConfig>
  defaults: {
    maxRetries: number
    timeoutMinutes: number
    model?: string
  }
  labels: {
    autoAssign: string[]        // Linear labels that auto-assign to factory
    ignore: string[]            // Labels to skip
  }
}

export interface WorkflowAgentConfig {
  enabled: boolean
  model?: string
  timeoutMinutes?: number
  maxRetries?: number
  prompt?: string               // Override prompt path
  allowedPaths?: string[]       // Restrict file access
}

export interface LinearIssue {
  id: string
  identifier: string            // e.g., "SF-42"
  title: string
  description: string
  state: { name: string; type: string }
  labels: { name: string }[]
  assignee?: { name: string }
  project?: { name: string }
  url: string
  createdAt: string
  updatedAt: string
}

export interface OrchestratorMetrics {
  activeTasks: number
  completedToday: number
  failedToday: number
  retryQueueDepth: number
  avgCompletionMinutes: number
  totalCostToday: number
  tasksByStatus: Record<TaskStatus, number>
}
