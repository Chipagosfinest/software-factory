# Codebase Status — March 8, 2026

## Overall: 75-80% Complete (~4,950 LoC)

---

## Production-Ready (Ship Now)

| Component | File | Status |
|-----------|------|--------|
| HTTP Server | `src/index.ts` | ✅ Hono server, health checks, webhook/cron/manual endpoints, audit/cost/metrics APIs |
| Event Router | `src/router.ts` | ✅ GitHub webhook mapping, draft filters, action guards |
| Types | `src/types.ts` | ✅ Complete TypeScript definitions |
| PR Reviewer | `src/agents/pr-reviewer.ts` | ✅ Review comments + approval with judge veto and retry |
| CI Debugger | `src/agents/ci-debugger.ts` | ✅ Failure diagnosis + fix PR, shift-left pattern |
| Security Patcher | `src/agents/security.ts` | ✅ CVE assessment + patch PR |
| Incident Responder | `src/agents/incident.ts` | ✅ RCA + hotfix generation |
| Merge Resolver | `src/agents/merge.ts` | ✅ Conflict resolution |
| LLM Judge | `src/agents/judge.ts` | ✅ Output validation gate |
| Agent Runner | `src/agents/runner.ts` | ✅ Orchestrator with executor gate, timeout, cost tracking |
| GitHub Client | `src/core/github.ts` | ✅ Octokit + circuit breaker |
| LLM Client | `src/core/llm.ts` | ✅ OpenRouter with cost tracking |
| Governance | `src/core/governance.ts` | ✅ Permissions, audit, blast radius |
| Circuit Breaker | `src/core/circuit-breaker.ts` | ✅ API resilience |
| Database | `src/core/db.ts` | ✅ SQLite audit/cost logging |
| Executor Gate | `src/core/executor-gate.ts` | ✅ Kill switch |
| Context Builder | `src/core/context.ts` | ✅ Repo context (diffs, commits, CI logs) |
| Webhook Verifier | `src/core/webhook.ts` | ✅ HMAC signature verification |
| Queue | `src/queue/queue.ts` | ✅ BullMQ job definitions |
| Worker | `src/queue/worker.ts` | ✅ BullMQ processor with error handling |
| Prompts | `src/agents/prompts/*.md` | ✅ All 6 agent prompts complete |

## Partially Implemented (Needs Work)

| Component | File | Status | Gaps |
|-----------|------|--------|------|
| Tool Discovery | `src/agents/cron/tool-discovery.ts` | ⚠️ 60% | LLM-only — no GitHub/ProductHunt/HN API integration |
| Signal Harvester | `src/agents/cron/signal-harvester.ts` | ⚠️ 80% | No slug validation, GitHub rate limit handling |
| Drift Detector | `src/agents/cron/drift-detector.ts` | ⚠️ 70% | LLM hallucination risk — no actual deprecation API calls |
| Backfill | `src/agents/cron/backfill.ts` | ⚠️ 75% | Writes to `products.category` — should be `stack_category` |
| Integration Tester | `src/agents/cron/integration-tester.ts` | ❌ 0% | Skeleton only — waiting for Docker sandbox |
| Budget Guard | `src/core/budget-guard.ts` | ⚠️ 60% | No monthly aggregation, no approaching-limit alerts |
| Flywheel | `src/core/flywheel.ts` | ⚠️ 40% | No signal aggregation, no graduation logic |
| Scheduler | `src/core/scheduler.ts` | ⚠️ 80% | No rotation scheduling, no catchup mode |
| Supabase Client | `src/core/supabase.ts` | ⚠️ 90% | Works but references potentially wrong column names |

## Critical Issues

### P0 — Fix Before Shipping Cron Agents

1. **Backfill agent schema mismatch** — writes to `products.category` instead of `stack_category`. Will corrupt ProductRank data.
2. **Tool discovery has no real data sources** — LLM hallucinates trending tools. Needs GitHub API, ProductHunt, HN, RSS feeds.
3. **Drift detector has no verification** — LLM claims tools are deprecated without checking GitHub archive status or npm deprecation flags.

### P1 — Fix Soon

4. **No monthly cost aggregation** — budget-guard checks per-run but can't enforce monthly limits ($150/month cron budget).
5. **Signal harvester doesn't validate slugs** — assumes product slug matches GitHub repo path. Silent failures for 30-50% of products.
6. **Flywheel loop incomplete** — confidence deltas are hardcoded (+0.2, +0.3). No Bayesian updating or graduation criteria.

### P2 — Improve Later

7. **Scheduler has no rotation** — all cron agents run on fixed schedules. No round-robin across products.
8. **No observability** — logs are console.log only. No metrics dashboards or alerting.
9. **Integration tester disabled** — needs Docker sandbox implementation.

---

## Architecture Strengths

- Clean event-driven architecture (webhook → router → agent → GitHub API)
- Every agent action produces a PR — humans review before merge
- Cost governance with $2/run caps, 5-minute timeouts, audit trails
- Circuit breaker pattern for API resilience
- LLM judge validates agent output before posting (Spotify pattern)
- Executor gate kill switch without redeploying
- TypeScript strict mode throughout

## Recommended Next Steps

1. **Deploy core agents to a staging repo** — PR review + CI debug are immediately valuable
2. **Fix backfill schema mismatch** before running cron agents
3. **Add real data sources** to tool discovery (GitHub trending API, RSS)
4. **Add verification calls** to drift detector (GitHub archive status, npm deprecation)
5. **Build Feature Builder agent** — biggest competitive gap (see competitive-analysis.md)
