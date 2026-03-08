# Software Factory — Agent Instructions

## What This Is

Software Factory is an agent-native platform that autonomously handles software delivery tasks: PR review, CI debugging, security patching, incident response, and merge conflict resolution. It runs as a webhook server that receives GitHub events and dispatches them to specialized agents.

## Architecture

### Event Flow
```
Webhook/Cron/Alert -> Event Router -> Agent -> Sandbox -> GitHub API -> PR/Comment
```

Every agent action produces a PR or comment. Nothing is pushed directly to main. Humans review before merge.

### Key Components

- **Event Router** (`src/router.ts`) — Normalizes webhooks into typed events, dispatches to agents
- **Agents** (`src/agents/`) — Specialized agents for each task type
- **Sandbox** (`src/core/sandbox.ts`) — Isolated execution environments per agent run
- **GitHub Client** (`src/core/github.ts`) — Authenticated GitHub API operations
- **Context Builder** (`src/core/context.ts`) — Builds repo context for agent reasoning
- **Governance** (`src/core/governance.ts`) — Audit logging, permissions, blast radius controls

### Agent Pattern

Every agent follows the same lifecycle:
1. Receive typed event with full context
2. Build repo context (file tree, recent changes, relevant code)
3. Reason about the problem (LLM call with constraints)
4. Execute solution in sandbox (code changes, test runs)
5. Output via GitHub API (PR, review comment, check annotation)
6. Log everything to audit trail

### Agent Types

| Agent | Webhook Trigger | Output |
|-------|----------------|--------|
| PR Reviewer | `pull_request.opened`, `pull_request.synchronize` | Review comments, approval/changes requested |
| CI Debugger | `check_suite.completed` (conclusion: failure) | Diagnosis comment + fix PR on a new branch |
| Security Patcher | `dependabot_alert.created`, CVE cron | Patch PR with explanation |
| Incident Responder | PagerDuty webhook, custom alert | RCA comment + fix PR |
| Merge Resolver | `pull_request` with conflict label | Resolution commit pushed to PR branch |

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Server**: Hono (lightweight, fast)
- **LLM**: OpenRouter (model-agnostic — Claude, GPT, Gemini, DeepSeek)
- **GitHub**: Octokit + GitHub App authentication
- **Sandbox**: Docker containers per agent run
- **Queue**: BullMQ + Redis for event processing
- **Storage**: SQLite for audit logs and agent state

## Development Guidelines

- Keep agents stateless — all context comes from the event + repo
- Every agent must have a governance check before executing
- All LLM calls go through a central client with cost tracking
- Never push directly to main — always create PRs
- Test agents against real repos in a sandbox org
- Log every LLM call, every GitHub API call, every file change

## File Conventions

- Source code in `src/`
- Agent implementations in `src/agents/`
- Core infrastructure in `src/core/`
- Type definitions in `src/types.ts`
- Tests alongside source files as `*.test.ts`
- Config in root (`tsconfig.json`, `.env`, etc.)

## Safety Rules

1. **No force pushes** — ever, under any circumstances
2. **No direct main commits** — everything through PRs
3. **Blast radius limits** — agents can only touch files relevant to their task
4. **Cost caps** — hard limit on LLM spend per agent run ($2 default)
5. **Timeout** — agent runs killed after 5 minutes
6. **Audit everything** — every action logged with timestamp, agent ID, event ID
