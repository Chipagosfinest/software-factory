# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Software Factory is an agent-native platform that autonomously handles software delivery tasks: PR review, CI debugging, security patching, incident response, and merge conflict resolution. It receives GitHub webhooks and Linear issues, dispatches them to specialized agents, and outputs PRs/comments. Humans review before merge.

The `docs/` directory is a **research corpus** (34 documents on autonomous coding agents from Stripe, Spotify, Ramp, LangChain, etc.), not project documentation. Don't confuse research docs with implementation docs.

## Commands

```bash
npm run dev          # Start dev server with hot reload (tsx watch, port 3847)
npm run build        # TypeScript compilation (tsc → dist/)
npm run start        # Run compiled output (node dist/index.js)
npm test             # Run all tests (vitest)
npx vitest run src/__tests__/core.test.ts          # Run single test file
npx vitest run -t "circuit breaker"                # Run tests matching name
npm run tunnel       # Expose local server via localtunnel (for GitHub webhooks)
```

**Prerequisites**: Redis running locally for BullMQ queue (`REDIS_URL=redis://localhost:6379`). Server starts without Redis but cron scheduler will fail.

**Pre-commit guard**: Install with `cp scripts/pre-commit-guard.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit`

## Architecture

### Two Execution Paths

The system has two independent ways work enters the pipeline:

**Path 1: Webhook-driven** (reactive)
```
GitHub Webhook → POST /webhook/github → EventRouter → BullMQ Queue → Worker → Agent Runner → GitHub API
```
Triggers: PR opened/updated, CI failure, Dependabot alert. The `EventRouter` (`src/router.ts`) maps GitHub events to agent types, skipping bot PRs, draft PRs, and `skip-review` labels.

**Path 2: Orchestrator-driven** (proactive, Symphony-style)
```
Linear Issue (label: factory:auto) → Orchestrator Poll → Reconciler → Workspace (git worktree) → BullMQ Queue → Agent Runner → GitHub API
```
Disabled by default (`ORCHESTRATOR_ENABLED=false`). Polls Linear every 30s, creates isolated git worktrees per task, manages a state machine: `unclaimed → claimed → running → completed/retry_queued/failed`. Auto-stops after 5 consecutive failures. Convergence detection prevents retrying identical errors.

Both paths converge at the BullMQ queue and share the same Agent Runner.

### Safety Layers (checked in order)

Every agent run passes through these gates before any LLM call:

1. **Global Daily Budget** (`src/core/budget-guard.ts`) — Hard cap across all agents (default $20/day). Warns at 80%.
2. **Executor Gate** (`src/core/executor-gate.ts`) — Kill switch via `executor_gate.json`. Can disable all agents or specific ones. File is read on every check (no restart needed).
3. **Per-Agent Governance** (`src/core/governance.ts`) — Per-agent-type permissions: allowed/blocked file patterns, max files/lines changed, cost limit ($2 default), PR creation rights. PR reviewer can approve but not create PRs. Security agent can only touch lockfiles.
4. **Circuit Breaker** (`src/core/circuit-breaker.ts`) — Per-API (OpenRouter, GitHub, Linear). Opens after 3 consecutive failures, half-open test after 60s. All LLM calls go through `withCircuitBreaker()`.
5. **Timeout** — Agent runs race against `perms.timeoutMs` (default 300s).

### Agent Types

Two categories with different permission profiles:

**Webhook agents** (can modify repos):
- `pr-reviewer` — Review comments + approve/request changes. Cannot create PRs.
- `ci-debugger` — Diagnose failures + create fix PRs. Max 10 files, 200 lines.
- `security` — Patch vulnerabilities. Restricted to lockfiles only.
- `incident` — RCA + fix PRs. Max 10 files, 200 lines.
- `merge-resolver` — Resolve conflicts. Max 20 files, 500 lines.

**Cron agents** (read-only, data pipeline):
- `tool-discovery`, `signal-harvester`, `drift-detector`, `backfill`, `integration-tester`
- These agents have `blockedFilePatterns: ['**/*']` — they cannot modify any files.
- Lower cost limits ($0.50–$1.50). Use cheaper models (Gemini Flash) by default.

### Key Internals

- **LLM Client** (`src/core/llm.ts`) — All LLM calls route through OpenRouter. `chat()` for raw calls, `chatJson<T>()` for structured output. Cost is estimated per-call and recorded to SQLite. Model selection is per-agent-type with env var overrides.
- **Database** (`src/core/db.ts`) — SQLite with WAL mode. Schema auto-migrates on first `getDb()` call. Tables: `agent_runs`, `audit_log`, `cost_tracking`, `cron_job_state`, `pipeline_run_log`, `orchestrator_tasks`.
- **Agent Prompts** — Markdown files in `src/agents/prompts/*.md`, loaded by each agent handler.
- **Workspace Isolation** (`src/orchestrator/workspace.ts`) — Git worktrees for orchestrator tasks. Repo allowlist enforced. Max concurrent workspaces (default 5). Credentials stripped from stored remotes after clone.
- **Workflow Config** — Target repos can place a `WORKFLOW.md` with YAML front matter to configure which agents run, model overrides, timeouts, and retry counts. Parsed with hot-reload (mtime check).
- **Task State Machine** (`src/orchestrator/state.ts`) — Enforces valid transitions. Exponential backoff on retry (30s → 2m → 8m → 30m → 2h cap with jitter).

### HTTP Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/webhook/github` | POST | GitHub webhook receiver (signature-verified) |
| `/trigger/:agent` | POST | Manual agent trigger |
| `/cron/:agent/trigger` | POST | Manual cron trigger |
| `/audit` | GET | Audit log (query: `?limit=50`) |
| `/runs` | GET | Agent run history |
| `/costs` | GET | Cost summary |
| `/graph/metrics` | GET | Flywheel metrics (requires Supabase) |
| `/orchestrator/status` | GET | Orchestrator state + metrics |
| `/orchestrator/start` | POST | Start orchestrator loop |
| `/orchestrator/stop` | POST | Stop orchestrator loop |

## Anti-Pattern Rules

Enforced by pre-commit hook (`scripts/pre-commit-guard.sh`):

1. **No `execSync()` with template literals** — command injection. Use `execFileSync('cmd', ['arg1', 'arg2'])` with array args.
2. **No empty `catch {}` blocks** — silent failures compound. Always log or rethrow. Comment why if intentionally empty.
3. **No hardcoded secrets** — hook scans for `sk-`, `lin_api_`, `ghp_`, `xoxb-`, `AIza` patterns.
4. **No CORS wildcards** — `Access-Control-Allow-Origin: *` blocked.
5. **No files over 400 lines** — warning only, not blocking.

Additional rules (not hook-enforced):
- **All LLM calls through `src/core/llm.ts`** — no direct OpenAI/OpenRouter imports elsewhere.
- **Budget checks are hard gates** — when `checkGlobalDailyBudget()` returns `allowed: false`, stop. Don't skip or log-and-continue.
- **No automated responses to cost alerts** — creates infinite cost loops.
- **Auth tokens in headers, not URL params** — URLs leak to logs.
- **`chatJson()` does NOT double-record costs** — `chat()` already records. Fixed after a 2x inflation bug (2026-03-14).

## Testing

Tests in `src/__tests__/` using Vitest. Test files: `core.test.ts` (webhook verification, executor gate, circuit breaker), `router.test.ts` (event routing), `orchestrator.test.ts` (state machine, reconciler), `workflow.test.ts` (WORKFLOW.md parsing). Fixtures in `src/__tests__/fixtures/`.

Tests don't require Redis or external services — they test pure logic (state machines, routing, config parsing, circuit breaker behavior).
