# Risk Forecast — First 30 Days of Operation

This document forecasts problems you'll encounter running autonomous agents for the first time, with severity ratings and specific mitigations. Updated continuously as the system evolves.

---

## Cost Risks

### P0 — Fixed: `chat()` Now Tracks Costs
**What:** The `chat()` function in `llm.ts` was not calling `recordCost()`, meaning any LLM call not going through `chatJson()` was invisible to budget tracking.
**Status:** Fixed. All LLM calls now record costs.

### P0 — Fixed: Global Daily Spend Cap Added
**What:** Webhook agents had per-run caps ($2 each) but no daily aggregate. 100 webhook events × $2 = $200/day theoretical maximum.
**Fix:** Added `checkGlobalDailyBudget()` in `budget-guard.ts`. Default cap: $20/day (configurable via `GLOBAL_DAILY_BUDGET_USD`). Enforced in `runner.ts` BEFORE agent execution.

### P0 — Per-Run Cost Limit is Post-Hoc
**What:** `validateCost()` in `runner.ts` checks cost AFTER the agent finishes. A single agent run processing a massive PR could exceed $2 before anyone notices.
**Mitigation:** Current context budget (100KB cap in `context.ts`) limits input tokens. The biggest realistic single-run cost is ~$0.13 (PR review with judge retry). Monitor — if runs start exceeding $0.50, add mid-run cost checking.
**Severity:** Medium — unlikely to cause real damage given 100KB cap.

### P1 — Retry Multiplication
**What:** Each orchestrator task retries up to 2 times. Each retry is a full agent run. A task could cost 3× expected.
**Mitigation:** Convergence detection in reconciler prevents retrying on identical errors. Max 2 retries caps worst case at ~$0.39/task.

### Daily Cost Projections

| Scale | Daily LLM | Monthly LLM |
|-------|-----------|-------------|
| 5 tasks/day | ~$0.56 | ~$17 |
| 20 tasks/day | ~$1.36 | ~$41 |
| 100 tasks/day | ~$5.80 | ~$174 |
| Cron agents | ~$0.30 | ~$9 |

**Break-even:** 1 task/day. A single PR review costs ~$0.06 and saves ~15 minutes.

---

## Operational Risks

### Day 1 Problems

#### P1 — Redis Not Running
**What:** BullMQ queue, worker, cron scheduler, and orchestrator all depend on Redis. If Redis isn't running on first deploy, you get silent failures.
**Symptoms:** Server starts, webhooks return "dispatched", but no agents run.
**Fix:** Health endpoint should check Redis connection. Current startup catches errors but doesn't surface them clearly.

#### P1 — Missing Environment Variables
**What:** No startup validation. Missing `OPENROUTER_API_KEY` = every agent fails. Missing `GITHUB_APP_ID` = all GitHub calls fail.
**Fix:** Add startup checks that validate required env vars before the server listens.

#### P2 — SQLite Path Permissions
**What:** `DB_PATH=./software-factory.db` needs write access. In containerized deployments, the filesystem may be read-only.
**Fix:** Use a volume mount or set `DB_PATH` to a writable location.

### Week 1 Problems

#### P1 — GitHub Rate Limiting
**What:** `buildRepoContext()` makes 4-6 API calls per task. At burst rates, GitHub returns 403. The circuit breaker catches this but doesn't back off based on `x-ratelimit-remaining` headers.
**Fix:** Add rate-limit-aware backoff to the GitHub client. Check remaining quota before making calls.

#### P2 — Duplicate Events
**What:** GitHub sends webhook retries if your server is slow to respond (>10s). Same event could be processed twice. `enqueueEvent()` uses event ID for idempotency, but if the queue job ID format differs, duplicates slip through.
**Fix:** BullMQ job ID deduplication should be verified end-to-end.

#### P2 — Stale Worktree Accumulation
**What:** If the orchestrator crashes mid-reconciliation, worktrees for completed tasks may not be cleaned up.
**Fix:** `cleanupStaleWorkspaces()` runs on every tick and handles this. Also `.workspaces/` is in `.gitignore`.

### Month 1 Problems

#### P2 — SQLite Table Growth
**What:** No retention policy. `cost_tracking`, `audit_log`, and `agent_runs` tables grow indefinitely.
**Projection:** ~300 rows/day at moderate load. 9K rows/month. ~50MB after a year. Not urgent but should add cleanup.
**Fix:** Add a monthly cron to prune records older than 90 days.

#### P3 — Linear API Polling Efficiency
**What:** Polling Linear every 30s even when idle wastes API calls (2,880/day). Under Linear's 1,500/hour limit but wasteful.
**Fix:** Implement webhook-based Linear integration (Linear Webhooks API) instead of polling. Or increase poll interval to 2 minutes when idle.

---

## Security Risks

### P0 — Command Injection in Git Operations
**What:** `workspace.ts` passes `taskId` into shell commands via `execSync`. If a Linear issue title or ID contains shell metacharacters, they could be executed.
**Current mitigation:** `taskId` is a UUID (safe). Branch names are sanitized with `replace(/[^a-zA-Z0-9-]/g, '-')`. Commit messages use escaped double quotes.
**Remaining risk:** Commit messages still use string interpolation in a shell command. A carefully crafted agent output could inject.
**Fix:** Use array-form `execFileSync` instead of `execSync` for all git commands, or pass commit messages via `--file` flag.

### P1 — GitHub Token in Clone URL
**What:** `workspace.ts` embeds `GITHUB_TOKEN` in the clone URL: `https://x-access-token:${token}@github.com/...`. This token appears in `.git/config` of every worktree.
**Risk:** If any agent reads `.git/config`, it sees the token. If worktrees aren't cleaned up, tokens persist on disk.
**Fix:** Use `git credential-helper` or set the token via environment variable (`GIT_ASKPASS`) instead of URL embedding.

### P1 — No Workspace Sandboxing
**What:** Agents running in worktrees have full filesystem access. Nothing prevents an agent from reading `~/.ssh/`, `.env`, or other worktrees.
**Mitigation:** Current agents use the LLM-as-Judge pattern, not arbitrary code execution. The judge reviews all outputs before posting to GitHub.
**Long-term fix:** Docker sandboxes per agent run (Phase 5 in original plan, currently disabled).

### P2 — Linear API Key Has Broad Access
**What:** The Linear API key grants access to all teams and issues, not just the factory-labeled ones.
**Fix:** Use Linear OAuth with scoped permissions when moving to production. The API key is fine for development.

---

## Anti-Death-Spiral Protections (Autoresearch Pattern)

| Guard | What It Prevents | Where |
|-------|-----------------|-------|
| Max 2 retries | Infinite retry loops | `state.ts` maxRetries check |
| Exponential backoff | Hammering APIs | `state.ts` computeBackoff() |
| Convergence detection | Same error repeating (no progress) | `reconciler.ts` failTask() |
| Stall detection | Agent hangs forever | `reconciler.ts` reconcile() step 4 |
| Per-run cost cap | Single expensive run | `governance.ts` validateCost() |
| Global daily cap | Aggregate runaway | `budget-guard.ts` checkGlobalDailyBudget() |
| Kill switch | Emergency stop all | `executor-gate.ts` |
| Context budget | Massive prompt costs | `context.ts` MAX_CONTEXT_BYTES = 100KB |

---

## Monitoring Checklist

Set up alerts for these before going live:

- [ ] Daily spend exceeds 50% of `GLOBAL_DAILY_BUDGET_USD`
- [ ] Any agent run exceeds $1.00 (half the per-run cap)
- [ ] Redis connection lost
- [ ] Orchestrator tick count stopped incrementing
- [ ] >5 tasks in `failed` status in a single day
- [ ] SQLite database exceeds 100MB
- [ ] GitHub rate limit remaining < 100
- [ ] Worktree count exceeds 10 (should be 0-3 normally)
