# Codebase Status — July 16, 2026

## Verdict

The repository is a strong research corpus plus a functioning TypeScript reference prototype. It is **not production-ready** and should not be described as 75–80% complete.

The honest current state:

- 5,240 lines of TypeScript across 51 source/test files
- 43 Markdown documents in `docs/` after this refresh
- strict TypeScript build passes
- 45 unit tests pass across four test files
- no CI workflow, deploy manifest, container image, or staging deployment is checked into the repository
- only the PR-reviewer path performs its intended GitHub write end to end

## Working and Tested

| Area | Evidence | Status |
|---|---|---|
| Event routing | Webhook fixtures and router tests cover PR, failed check suite, Dependabot, and cron dispatch | Working at unit level |
| PR reviewer | Builds context, validates actions, uses an LLM judge with one retry, and calls GitHub `createReview` | Effectful path exists |
| SQLite state | Audit, cost, run, cron, and orchestrator records; database initialization tested | Working locally |
| Budget controls | Per-agent daily checks plus a global daily cap | Implemented |
| Executor gate | File-backed kill switch with unit coverage | Implemented |
| Circuit breaker | Closed/open transitions and metrics have unit coverage | Implemented |
| Orchestrator state machine | Task transitions, retry exhaustion, and convergence behavior covered by tests | Implemented at unit level |
| Workflow configuration | `WORKFLOW.md` parsing and instruction extraction covered by tests | Implemented |
| Workspace isolation | Git worktrees, allowlist option, concurrency cap, cleanup helpers | Implemented but not proven end to end |

## Effectful Gaps

### Core agents

| Agent | What it really does today | Missing for end-to-end operation |
|---|---|---|
| PR reviewer | Posts a GitHub review | Live integration test, invalid-line recovery, production auth/config proof |
| CI debugger | Produces proposed `create_pr` and `push_commit` actions | Does not execute file writes, commit, push, or PR creation |
| Security patcher | Produces an assessment and proposed PR action | Does not write a dependency change or create the PR |
| Incident responder | Produces RCA and proposed hotfix actions | Does not execute the hotfix or create the PR |
| Merge resolver | Produces proposed conflict resolutions | Does not edit, commit, push, or update a PR |

Workspace helpers for change detection, commit, and push exist but are not connected to these agent action paths.

### Orchestrator

The Symphony-style layer can:

- poll Linear
- infer agent and repo from issue metadata
- persist task state
- create isolated worktrees
- enqueue work
- detect stalls and repeated failures
- clean stale workspaces

It is not yet a proven factory loop:

- orchestrated agents do not consistently consume the created workspace as their execution environment
- proposed mutations are not applied to the worktree
- commit/push/PR finalization is not connected
- Linear state updates and review packets are incomplete
- there is no live integration test against Linear, GitHub, Redis, and a disposable repo

### Cron/data agents

| Component | Current blocker |
|---|---|
| Tool discovery | Still asks the LLM to invent current GitHub/Product Hunt/HN results; no live source retrieval |
| Drift detector | Still relies on model training data; no GitHub/npm/site verification |
| Backfill | Still writes `products.category`; the documented `stack_category` mismatch remains unresolved |
| Signal harvester | Calls GitHub/npm directly but assumes a product slug is a repo/package identifier |
| Flywheel | Confidence uses fixed additive deltas; no calibrated evidence model |
| Integration tester | Explicitly disabled because Docker sandboxes are unavailable |

These agents should not run against production data.

## Security and Operations Gaps

- `GITHUB_WEBHOOK_SECRET` is optional; when absent, signature verification is skipped.
- `ALLOWED_REPOS` is optional and defaults to allowing any repository in development mode.
- startup validation requires only OpenRouter even though effectful GitHub and queue paths need more configuration.
- governance validates proposed actions but there is no single external enforcement layer for all tool calls.
- logs are console-only; there is no structured tracing, alerting, or production dashboard.
- no task-scoped credentials or durable proof bundle exists.
- no review admission/backpressure metrics exist.
- no 7/30-day revert, incident, or follow-up attribution exists.

## Test and Verification Gaps

- 45 unit tests pass, but no live GitHub App test exists.
- no Redis/BullMQ integration test exists.
- no Linear reconciliation integration test exists.
- no disposable-repository mutation test exists.
- no end-to-end PR creation/review/repair flow exists.
- no agent quality/eval suite measures false positives, missed findings, skill invocation, or trajectory quality.
- no deployment health check exists because there is no deployment configuration.

## Current Product Shape

The most defensible near-term product is:

> A governed PR-review and task-orchestration control plane that admits work by risk, runs it in an isolated workspace, and requires proof before review.

The current code proves parts of that shape, but the repository’s strongest asset today remains the research corpus.

## P0: Required Before Any Production Claim

1. Connect one mutation agent end to end: workspace → edit → deterministic checks → commit → push → draft PR.
2. Make webhook verification, repo allowlisting, GitHub credentials, and Redis mandatory in production mode.
3. Add a disposable-repository integration test for the full flow.
4. Keep the cron/data agents disabled until live-source verification and schema correctness are fixed.
5. Add structured proof bundles and required checks.
6. Add review admission/backpressure metrics.
7. Add CI and a real deploy/staging configuration with health verification.

## P1: Factory Loop

1. Bind orchestrator tasks to their worktree throughout execution.
2. Finalize Linear state transitions and review packets.
3. Add deterministic build/test commands from repo-specific workflow configuration.
4. Add task-scoped credentials and per-tool enforcement.
5. Track reverts, incidents, follow-up fixes, human takeover, and review time.
6. Add automatic demotion and human-approved autonomy promotion by repo/task/risk cell.

## P2: Research-to-Product

1. Add skill-invocation regression tests modeled on Pinterest.
2. Add replayable PR-review evals modeled on DoorDash DashBench.
3. Add source-grounded test plans and annotated proof artifacts modeled on Cognition.
4. Separate durable session state from disposable harness/sandbox execution modeled on Shopify Aquifer.
5. Feed production telemetry into verification harnesses modeled on Datadog.

## Verification Snapshot

Verified locally on July 16, 2026:

```text
npm run build        pass
npm test -- --run    45/45 tests pass
docs/index.json      valid JSON; document count matches entries
local Markdown links pass
git diff --check     pass
```

This status is based on source and test inspection. No live external integration or deployment was exercised.
