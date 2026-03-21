# Software Factory Roadmap

*Updated: March 21, 2026*

---

## Vision: Factory → Claws → Network

At its core, this is **container management running different automation tasks per system**. Each new system we onboard reuses the same infrastructure — isolated containers, cron schedules, verification loops, governance — just with different agents and different data. Every system we add compounds the value.

---

## Phase 1: ProductRank Uptime + Graph Growth (NOW)

Stand up the factory to ensure ProductRank reliability. CI debugging catches regressions, PR review maintains code quality, security patching keeps dependencies clean. Cron agents grow the knowledge graph daily.

**Containers:** 5 core agents (webhook-triggered) + 5 cron agents (scheduled)
**Key metric:** ProductRank uptime + graph confidence scores trending toward 1.0

### Status
- Core agents: ✅ Production-ready (PR review, CI debug, security, incident, merge)
- Cron agents: ⚠️ 60-80% complete (see codebase-status.md for gaps)
- P0 blockers: Backfill schema mismatch, tool discovery needs real data sources

---

## Phase 1.5: Quality Verification Layer (NEW — informed by Karpathy thesis research)

The industry is converging on a critical finding: **agents produce working but low-quality code**, and instruction-based constraints (CLAUDE.md, AGENTS.md) don't enforce quality. The mitigation is programmatic verification.

**New components to build:**

| Component | Purpose | Source |
|-----------|---------|--------|
| **Code Quality Verifier** | AST complexity checks, duplication detection, style linting | Karpathy Q&A, "Lint Against the Machine", CodeRabbit data |
| **Regression Guard** | Track zero-regression rate across consecutive PRs | Alibaba SWE-CI benchmark (75% of agents break working code) |
| **LLM-as-Judge for Quality** | Soft signal: readability, architecture coherence, duplication | Pydantic evals, W&B guide, Karpathy "low-hanging fruit" comment |
| **Hook-based Enforcement** | PreToolUse/PostToolUse hooks that `exit 2` on violations | Claude Code #33097, #33603 — consensus: hooks > instructions |

**Architecture:**
```
Agent generates code
      │
  Deterministic checks (free, fast)
  ├── AST complexity (cyclomatic, nesting)
  ├── Duplication detection (copy-paste blocks)
  ├── Style linting (beyond formatting)
  └── Type checking
      │
  Test execution (hard gate — does it work?)
      │
  LLM-as-Judge (soft signal — is it good?)
  ├── Readability assessment
  ├── Architecture coherence
  └── Goodhart-aware scoring
      │
  Score → feed back or flag for human review
```

**Key metric:** Code quality score trending up + zero-regression rate > 50% (Claude Opus baseline from SWE-CI)

**Research:** See `docs/karpathy-software-factory-thesis.md` for full evidence base.

---

## Phase 2: General-Purpose Factory

Extract patterns that work for ProductRank and make them reusable. Same container orchestration, same governance, same verification loops — different repos, different agents.

**Containers:** Same core agents, parameterized per-repo
**Key metric:** Time to onboard a new repo (target: <1 hour)

### Orchestration UI Decision Point

Two paths:
1. **Build our own dashboard** — full control, tight integration with verification loops
2. **Integrate with Paperclip** — 24K-star OSS orchestration layer, org charts, goal alignment, BYOA. We'd be the "factory floor" agents that Paperclip orchestrates.

**Paperclip pros:** Beautiful React UI, multi-company isolation, cost governance, marketplace (ClipMart), massive community traction
**Paperclip cons:** No verification loops, no LLM judge, no CI integration, no knowledge graph — all things we have

**Likely answer:** Software Factory agents + Paperclip orchestration = best of both. We provide the execution quality guarantees they lack.

---

## Phase 3: Visa Claws Reliability

Apply the factory to Visa's agentic commerce platform. Same agents that review PRs review transaction flows, same CI debugger diagnoses payment pipeline failures, same security patcher responds to PCI compliance alerts.

**Containers:** Core agents + commerce-specific agents (transaction reviewer, compliance checker)
**Key metric:** Mean time to detect + fix commerce pipeline issues

---

## Phase 4: Marketplace Crawlers

Deploy crawler agents that ensure we're always offering the best configurations, freshest prices, and working APIs. Same container infrastructure — just different cron schedules and different data targets.

**Containers:** Pricing crawlers, API health checkers, config validators, deal scrapers
**Key metric:** Data freshness (% of products with pricing updated in last 7 days)

---

## Architecture Reuse (Compounding)

```
Phase 1:   ProductRank    → Build container orchestration + governance + verification
Phase 1.5: Quality Layer  → Add code quality verification (industry catching up to this need)
Phase 2:   General        → Reuse for any repo (same infra, different agents)
Phase 3:   Visa Claws     → Reuse for commerce (same infra, different domain)
Phase 4:   Marketplace    → Reuse for data freshness (same infra, different targets)
```

Each phase adds ~2-5 new agent types but reuses 100% of:
- Container management (sandbox creation, warm pools, teardown)
- Queue infrastructure (BullMQ dispatch, retry logic, dead letter)
- Governance (permissions, cost caps, audit trails, blast radius)
- Verification loops (deterministic checks, LLM judge, bounded retries)
- Entry points (webhooks, cron, Slack, CLI)
- Quality enforcement (AST checks, regression guard, hook-based constraints)

| Component | ProductRank | Quality Layer | General | Visa Claws | Marketplace |
|-----------|-------------|---------------|---------|------------|-------------|
| Event Router | GitHub webhooks | — | GitHub webhooks | Transaction events | Cron schedules |
| Agents | PR review, CI debug, graph crons | Quality verifier, regression guard | PR review, CI debug, security | Transaction review, compliance | Price crawlers, API health |
| Verification | LLM judge, CI retry | + AST checks, duplication, LLM quality judge | Same | + PCI compliance rules | + Rate limits, budget caps |
| Queue | Webhook + cron | Same | Same | Transaction processing | Crawl scheduling |
| Audit Log | Agent actions | + Quality scores | Agent actions | Compliance trail | Data lineage |
| Data Target | Knowledge graph (Supabase) | Code quality metrics | Target repo | Payment flows | Product catalog |

---

## Research Sources

| Source | Key Pattern | Applied Where |
|--------|------------|---------------|
| OpenAI Harness Engineering | AGENTS.md as map, layered architecture, golden principles, background GC agents, agent-legible observability, execution plans | Knowledge base structure, linter enforcement, codebase self-maintenance |
| Spotify Honk | K8s containers, LLM judge, verification loops | Sandbox, CI debugger |
| Ramp Inspect | Modal warm pools, multiplayer sessions | Sandbox warm pools |
| Stripe Minions | 400+ MCP tools, devboxes, conditional rules | Tool strategy, per-dir rules |
| LangChain Deep Agents | Middleware pipelines, sub-agents, context summarization, skills | Middleware refactor phase |
| OpenAI Symphony | Orchestrator state machine, reconciliation loop | Orchestrator |
| Karpathy Autoresearch | NEVER STOP loop, single-metric acceptance, fixed time budget, crash recovery, simplicity criterion | Agent loop design, convergence detection, safety guardrails |
| Tobi Lutke QMD | Hybrid search (BM25 + vector + reranking), MCP server, collections + context, query expansion | Agent knowledge retrieval, docs/ search |
| Paperclip AI | Per-agent monthly budgets, task checkout locks, heartbeat protocol, React dashboard, run transcript persistence | Budget guard upgrade (Now), transcript storage (Now), fleet orchestration + dashboard (Phase 3) |

---

## Competitive Landscape Context

The market is splitting into two layers:
1. **Agent execution** (Software Factory, Factory.ai, Devin, Copilot) — actually runs agents that write code
2. **Agent orchestration** (Paperclip, LangSmith Fleet, Walseth AI) — manages fleets of agents

We sit firmly in execution with unique verification. See `docs/competitive-analysis.md` for full breakdown.

The Karpathy thesis research (`docs/karpathy-software-factory-thesis.md`) confirms our timing:
- "Agents don't listen to AGENTS.md" → our hooks + governance layer is the answer
- "Code quality is a shrug" → our verification loops fill the gap
- "Token throughput is the new bottleneck" → our bounded retries (max 2) prevent waste
- "Engineers are factory managers now" → our PR-as-review-gate keeps humans on the loop
