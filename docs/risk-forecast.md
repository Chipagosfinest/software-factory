# Risk Forecast — First 30 Days of Operation

This document forecasts problems you'll encounter running autonomous agents for the first time. Based on audits from three specialized agents: **Security Engineer**, **Staff SRE**, and **Cost Analyst**.

---

## Fixed Issues (Applied in This PR)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | `chat()` didn't track costs — invisible LLM spend | P0 | Added `recordCost()` to `chat()` in `llm.ts` |
| 2 | No global daily spend cap — 100 events × $2 = $200/day | P0 | `checkGlobalDailyBudget()` in `budget-guard.ts`, $20 default |
| 3 | Command injection via `execSync` with user-controlled input | P0 | All git ops use `execFileSync` with array args |
| 4 | GitHub token persisted in `.git/config` after clone | P0 | `git remote set-url` strips credentials post-clone |
| 5 | Arbitrary repo clone via Linear issue injection | P0 | `ALLOWED_REPOS` allowlist in `workspace.ts` |
| 6 | `setInterval` tick overlap — concurrent reconciliation | P0 | Replaced with serial `while` loop + `setTimeout` |
| 7 | `repoPath` lost on process restart — empty string | P0 | Deterministic reconstruction via `getRepoPathForRef()` |
| 8 | Git branch collision on retry — `branch already exists` | P1 | `git branch -D` before creating worktree |
| 9 | Stall detection race — agent completes while marked stalled | P1 | `completeTask()` accepts `retry_queued` status |
| 10 | No graceful shutdown — orphaned state on deploy | P1 | `SIGTERM`/`SIGINT` handlers call `stopOrchestrator()` |
| 11 | SQLite BUSY under concurrent writers | P2 | `busy_timeout = 5000` pragma |
| 12 | Linear API key missing Bearer prefix | P2 | Fixed `Authorization: Bearer ${key}` |
| 13 | Workflow config cache global singleton | P2 | Keyed by `repoPath` in a `Map` |
| 14 | Unsafe JSON parse on DB rows | P2 | `safeParseJson()` with fallback |
| 15 | No workspace backpressure | P2 | `MAX_CONCURRENT_WORKSPACES` limit (default 5) |
| 16 | Consecutive tick failures silently ignored | P2 | Auto-stop after 5 consecutive failures |

---

## Remaining Risks (Monitor + Fix Later)

### Cost Risks

**Per-run cost limit is post-hoc (P2)**
`validateCost()` checks cost AFTER the agent finishes. A massive PR could exceed $2 before anyone notices. Mitigated by 100KB context budget — biggest realistic cost is ~$0.13.

**Retry multiplication (P2)**
Each task retries up to 2×. Convergence detection prevents identical-error retries. Worst case: ~$0.39/task.

### Daily Cost Projections

| Scale | Daily LLM | Monthly LLM |
|-------|-----------|-------------|
| 5 tasks/day | ~$0.56 | ~$17 |
| 20 tasks/day | ~$1.36 | ~$41 |
| 100 tasks/day | ~$5.80 | ~$174 |
| Cron agents | ~$0.30 | ~$9 |

**Break-even: 1 task/day.** A single PR review costs ~$0.06 and saves ~15 minutes.

### Operational Risks

**Redis dependency (P1 — Day 1)**
BullMQ queue, worker, cron, orchestrator all depend on Redis. If not running, server starts but no agents execute. Health endpoint should verify Redis connection.

**Missing env vars — FIXED (was P1)**
~~No startup validation.~~ Added `src/core/startup-checks.ts` — validates required env vars on startup, crashes with clear message if missing. (Fixed 2026-03-14)

**GitHub rate limiting (P1 — Week 1)**
`buildRepoContext()` makes 4-6 API calls per task. At burst rates, GitHub returns 403. Circuit breaker catches this but doesn't read `x-ratelimit-remaining` headers for proactive backoff.

**Agent timeout is cosmetic (P2 — Week 1)**
`Promise.race` in `runner.ts` rejects the handler promise, but the actual LLM calls keep running in the background, spending money and potentially creating PRs after the task is marked failed. Fix: pass `AbortSignal` to agent handlers.

**No workspace sandboxing (P2 — structural)**
Agents have full filesystem access in worktrees. LLM-as-Judge pattern provides some protection, but no true isolation. Docker sandboxes are the long-term fix (disabled, awaiting infra).

**SQLite table growth — FIXED (was P3)**
~~Add retention cron to prune >90 day records.~~ Added `src/core/retention.ts` — prunes records older than 90 days on every startup. (Fixed 2026-03-14)

**defaultBranch hardcoded to 'main' (P3 — Week 1)**
Repos using `master` or custom default branches will fail on worktree creation. Query GitHub API or make configurable.

**No alerting channel (P2 — Day 1)**
Everything logs to stdout. Wire up Telegram/Discord notifications for task failures, cost overages, and health degradation.

### Security Risks

**WORKFLOW.md from untrusted repos (P2)**
A cloned repo's WORKFLOW.md controls agent model, timeout, and retries. Combined with `ALLOWED_REPOS` (now fixed), this is mitigated. Additional clamp: validate numeric fields have sane maximums.

**No workspace escape prevention (P2 — structural)**
Agents can read `~/.ssh/`, `.env`, other worktrees. Mitigated by LLM-as-Judge (no arbitrary code execution). Docker sandboxes are the real fix.

**Linear API key broad scope (P3)**
API key accesses all teams/issues. Use Linear OAuth for production.

---

## Anti-Death-Spiral Protections

Learned from Karpathy's autoresearch convergence bug where agents retry on perfect scores indefinitely.

| Guard | What It Prevents | Where |
|-------|-----------------|-------|
| Max 2 retries | Infinite retry loops | `state.ts` maxRetries check |
| Exponential backoff | Hammering APIs on failure | `state.ts` computeBackoff() (30s → 2m → 8m → 30m → 2h) |
| Convergence detection | Same error repeating | `reconciler.ts` failTask() |
| Stall detection | Agent hangs forever | `reconciler.ts` reconcile() step 4 |
| Per-run cost cap | Single expensive run | `governance.ts` validateCost() |
| Global daily cap | Aggregate runaway spend | `budget-guard.ts` checkGlobalDailyBudget() ($20/day) |
| Workspace limit | Disk exhaustion | `workspace.ts` MAX_CONCURRENT_WORKSPACES (5) |
| Repo allowlist | Arbitrary repo clone attack | `workspace.ts` isRepoAllowed() |
| Serial tick loop | Concurrent reconciliation | `orchestrator.ts` while loop (not setInterval) |
| Auto-stop on failures | Persistent tick errors | `orchestrator.ts` MAX_CONSECUTIVE_FAILURES (5) |
| Kill switch | Emergency stop all | `executor-gate.ts` |
| Context budget | Massive prompt costs | `context.ts` MAX_CONTEXT_BYTES = 100KB |

---

## Monitoring Checklist

Set up alerts for these before going live:

- [ ] Daily spend exceeds 50% of `GLOBAL_DAILY_BUDGET_USD`
- [ ] Any agent run exceeds $1.00 (half the per-run cap)
- [ ] Redis connection lost
- [ ] Orchestrator tick count stopped incrementing (check `/orchestrator/status`)
- [ ] >5 tasks in `failed` status in a single day
- [ ] SQLite database exceeds 100MB
- [ ] GitHub rate limit remaining < 100
- [ ] Worktree count exceeds `MAX_CONCURRENT_WORKSPACES`
- [ ] Consecutive tick failures > 0 (early warning)

## Lessons from External Codebase Audit (2026-03-14)

Audited a high-velocity autonomous agent codebase (~65K lines, 30+ commits/day) and found systemic failures. Applied defensive measures here:

| Anti-Pattern Observed | Our Mitigation |
|----------------------|----------------|
| `execSync` with string interpolation (20+ injection vectors) | All git ops use `execFileSync` with arrays. Pre-commit hook blocks `execSync` + template literals. |
| 100+ empty `catch {}` blocks | Pre-commit hook warns. CLAUDE.md prohibits without explanation comment. |
| Budget limits generated but never enforced | `checkGlobalDailyBudget()` returns `allowed: false`, `runner.ts` STOPS execution. |
| Cost feedback loop (alert → spawn agent → more cost → more alerts) | No automated agent spawning in response to cost alerts. Requires human approval. |
| ~950 "tests" that mostly test language builtins | 45 real tests. CLAUDE.md explicitly prohibits padding test counts. |
| Utility functions copy-pasted 12× with inconsistent signatures | Utilities defined once in `src/core/`, exported. CLAUDE.md prohibits duplication. |
| 5,000+ line files | 400-line file size limit. Pre-commit hook warns. Largest file today: 371 lines. |
| Private keys stored as plaintext JSON | Secrets only in env vars. No config file storage. |
| CORS `*` on auth endpoints | Pre-commit hook blocks. CLAUDE.md prohibits. |
| Automated reviewer can't score 4,000-line PRs | Keep PRs small enough to review. Linear issues scope work. |

**Key insight**: Velocity without governance produces debt faster than value. Linear integration enforces the governance loop: issue → branch → PR → review → merge.

### Additional fixes applied (2026-03-14)

| # | Issue | Fix |
|---|-------|-----|
| 17 | `chatJson()` double-recording costs (2× inflation) | P0 | Removed duplicate `recordCost()` call in `chatJson()` |
| 18 | No startup validation for required env vars | P1 | Added `src/core/startup-checks.ts`, crashes on missing config |
| 19 | SQLite unbounded growth | P3 | Added `src/core/retention.ts`, prunes >90 day records on startup |
| 20 | No pre-commit quality gates | P1 | Added `scripts/pre-commit-guard.sh`, blocks injection patterns + secrets |

## First Deploy Checklist

- [ ] Redis running and accessible
- [ ] `OPENROUTER_API_KEY` set and verified with 1 test call
- [ ] `GITHUB_TOKEN` or GitHub App credentials configured
- [ ] `ORCHESTRATOR_ENABLED=false` initially (enable after verifying webhooks work)
- [ ] `ALLOWED_REPOS` set to your repos (don't leave empty in production)
- [ ] `GLOBAL_DAILY_BUDGET_USD=20.00` (or lower for testing)
- [ ] Test webhook: `curl -X POST localhost:3847/webhook/github` with fixture
- [ ] Verify `/health`, `/costs`, `/orchestrator/status` endpoints respond
- [ ] Monitor logs for first 30 minutes after enabling orchestrator
