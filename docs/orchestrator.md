# Symphony-Style Orchestrator

## Overview

The orchestrator transforms Software Factory from a **reactive webhook processor** into a **proactive work executor**. Inspired by [OpenAI's Symphony](https://github.com/openai/symphony/blob/main/SPEC.md) and [Karpathy's autoresearch](https://github.com/karpathy/autoresearch), it adds:

- **Linear integration** — poll issues tagged `factory:auto` → dispatch agents
- **State machine** — proper task lifecycle with retry, backoff, and stall detection
- **Git worktree isolation** — each task gets its own filesystem
- **Reconciliation loop** — self-healing on every poll tick
- **WORKFLOW.md** — per-repo agent configuration

## Architecture

```
Linear Issues (pull)  +  GitHub Webhooks (push)  +  Manual API (push)
              ↓                    ↓                       ↓
         ┌─────────────────────────────────────────────┐
         │              Orchestrator                     │
         │  ┌──────────────────────────────────────┐    │
         │  │  Reconciliation Loop (every 30s)     │    │
         │  │  1. Poll Linear for new issues       │    │
         │  │  2. Claim unclaimed → create worktree│    │
         │  │  3. Start claimed → enqueue agent    │    │
         │  │  4. Detect stalled → retry queue     │    │
         │  │  5. Retry cooled → reclaim           │    │
         │  │  6. Exhausted → fail + cleanup       │    │
         │  └──────────────────────────────────────┘    │
         └─────────────────────────────────────────────┘
                           ↓
              ┌──────────────────────┐
              │   Git Worktrees      │
              │  .workspaces/        │
              │    task-abc/ (branch) │
              │    task-def/ (branch) │
              └──────────────────────┘
                           ↓
              Agent Runner (existing BullMQ queue)
                           ↓
              GitHub API → PR created
```

## Task State Machine

```
    unclaimed ──→ claimed ──→ running ──→ completed
                    │            │
                    │            ├──→ failed
                    │            │
                    ↓            ↓
                 released   retry_queued ──→ claimed (reclaim)
                                │
                                ↓
                              failed (exhausted)
```

| State | Meaning | Next States |
|-------|---------|-------------|
| `unclaimed` | New task, no workspace yet | `claimed` |
| `claimed` | Workspace created, ready to run | `running`, `released` |
| `running` | Agent is executing | `completed`, `failed`, `retry_queued` |
| `retry_queued` | Waiting for backoff before retry | `claimed`, `released`, `failed` |
| `completed` | Task done, PR created | (terminal) |
| `failed` | All retries exhausted or non-converging | `retry_queued` (manual recovery only) |
| `released` | Returned to Linear, not our problem | (terminal) |

## Safety Guardrails

### Anti-Death-Spiral Protections

Learned from [Autoresearch's convergence bug](https://github.com/karpathy/autoresearch):

| Guard | What It Prevents | Implementation |
|-------|-----------------|----------------|
| **Max 2 retries** (Stripe pattern) | Infinite retry loops | `maxRetries: 2` default, configurable per WORKFLOW.md |
| **Exponential backoff** | Hammering APIs on transient failures | 30s → 2m → 8m → 30m → 2h cap |
| **Convergence detection** | Same error repeating (no progress) | If `lastError === currentError` on retry, mark failed immediately |
| **Stall detection** | Agent hangs forever | Reconciler checks `startedAt + timeout`, moves to retry_queued |
| **Per-agent cost caps** | Unbounded spend | `governance.ts` enforces $2/run, `budget-guard.ts` for daily limits |
| **Workspace cleanup** | Disk exhaustion from orphaned worktrees | Reconciler cleans up on every tick |
| **Kill switch** | Emergency stop | `executor_gate.json` blocks all execution |

### Cost Model

| Layer | Limit | Enforcement |
|-------|-------|-------------|
| Per LLM call | Tracked in `cost_tracking` table | `llm.ts` estimates and records |
| Per agent run | $2.00 default | `governance.ts` validates |
| Per day (cron) | $5.00 total | `budget-guard.ts` hard stop |
| Per orchestrated task | Inherited from agent type | Governance applies per-run |

## WORKFLOW.md

Each repo can define a `WORKFLOW.md` at its root to configure agent behavior:

```yaml
---
agents:
  pr-reviewer:
    enabled: true
    model: anthropic/claude-sonnet-4
    timeoutMinutes: 15
  ci-debugger:
    enabled: true
    maxRetries: 3
  security:
    enabled: false
defaults:
  maxRetries: 2
  timeoutMinutes: 10
labels:
  autoAssign: ["factory:auto", "factory:fix"]
  ignore: ["factory:skip"]
---
# Additional Instructions

- Always run `npm test` before submitting PRs
- Follow our ESLint configuration strictly
- Don't modify files in `src/legacy/`
```

The front matter configures agent behavior. The markdown body provides additional context injected into agent prompts. Config is **hot-reloaded** — changes take effect on the next reconciliation tick.

## Linear Integration

### Setup

1. Create a Linear API key at `linear.app/settings/api`
2. Set `LINEAR_API_KEY`, `LINEAR_TEAM_ID` in `.env`
3. Create a label `factory:auto` in your Linear team
4. Set `ORCHESTRATOR_ENABLED=true`

### How Issues Become Tasks

1. Add the `factory:auto` label to a Linear issue
2. Orchestrator polls Linear every 30s, finds the issue
3. Agent type inferred from labels (`factory:review` → pr-reviewer, `bug` → ci-debugger, etc.)
4. Repo inferred from `repo: owner/name` in description or `repo:owner/name` label
5. Task created, workspace provisioned, agent dispatched

### Label Mapping

| Linear Label | Agent Type |
|-------------|------------|
| `factory:review` | pr-reviewer |
| `factory:fix`, `bug` | ci-debugger |
| `factory:security`, `security` | security |
| `factory:incident`, `incident` | incident |
| `factory:merge`, `merge-conflict` | merge-resolver |
| `factory:auto` (default) | ci-debugger |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/orchestrator/status` | Running state, tick count, metrics |
| GET | `/orchestrator/tasks` | Task metrics by status |
| POST | `/orchestrator/start` | Start the orchestrator loop |
| POST | `/orchestrator/stop` | Stop the orchestrator loop |

## Git Worktree Isolation

Each task gets its own git worktree under `.workspaces/`:

```
.workspaces/
  _repos/                    # Shared repo clones (git objects shared)
    owner--repo-name/        # Main repo clone
  task-abc-123/              # Worktree for task abc-123
  task-def-456/              # Worktree for task def-456
```

**Why worktrees over clones:**
- Shared `.git` directory — near-instant creation
- Disk efficient — only working tree files duplicated
- Branch isolation — two agents can work concurrently
- Safety invariant — worktree tied to task ID, cleaned up on completion

## Future: Deep Agents-Inspired Enhancements

### Sub-Agent Delegation

The orchestrator currently dispatches one agent per task. Deep Agents' `task` tool pattern suggests a **hierarchical** model where the dispatched agent can spawn sub-agents:

```
Orchestrator → CI Debugger Agent
                  ├── Sub-agent: Parse CI logs (cheap model)
                  ├── Sub-agent: Search codebase for related failures (parallel)
                  └── Main agent: Reason about fix using sub-agent results
```

Benefits:
- Sub-agents have isolated context windows (don't pollute parent)
- Can use cheaper models for simple subtasks (log parsing, code search)
- Multiple sub-agents run in parallel
- Parent agent stays focused on high-level reasoning

### Middleware Pipeline

Currently each agent is configured independently in `src/agents/`. Deep Agents' middleware pattern would refactor this into composable layers:

```
Base Middleware (all agents):
  └── GovernanceMiddleware (cost caps, blast radius, audit)
  └── CostTrackingMiddleware (per-call LLM spend)
  └── AuditMiddleware (log every action)
  └── SummarizationMiddleware (context window management)

Per-Agent Middleware:
  └── PR Reviewer: + GitHubReviewMiddleware
  └── CI Debugger: + CILogParserMiddleware + VerificationLoopMiddleware
  └── Security:    + CVEFeedMiddleware
```

### Context Summarization

Long-running agent sessions (complex CI failures, multi-file PRs) can exhaust context windows. Deep Agents auto-summarizes when token usage exceeds a threshold:
- Trigger at 85% of context window
- Keep 10% of recent messages verbatim
- Offload full history to storage
- Replace with summary in active context

This would be implemented as middleware that wraps every agent run.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ORCHESTRATOR_ENABLED` | `false` | Enable the reconciliation loop |
| `LINEAR_API_KEY` | — | Linear API key |
| `LINEAR_TEAM_ID` | — | Linear team to poll |
| `LINEAR_LABEL` | `factory:auto` | Label to filter issues |
| `ORCHESTRATOR_POLL_MS` | `30000` | Poll interval (ms) |
| `WORKSPACE_ROOT` | `./.workspaces` | Where to create worktrees |
| `DEFAULT_REPO_OWNER` | — | Fallback repo owner |
| `DEFAULT_REPO_NAME` | — | Fallback repo name |
