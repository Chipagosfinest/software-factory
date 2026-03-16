# Potent Combos & Agent Topology Patterns

*Last updated: March 16, 2026*

High-synergy system combinations and topology patterns for Software Factory. Maps how eight research sources compose into architectures greater than the sum of their parts.

---

## 1. Agent Topology Types

Five topology types observed across production agent systems. ASCII diagrams inspired by Manu Cornet's org chart comic — because how you wire agents matters more than how smart they are.

---

### One-Shot Tree (Stripe Minions)

```
                    ┌─────────┐
                    │ Dispatch │
                    └────┬────┘
               ┌─────────┼─────────┐
               ▼         ▼         ▼
          ┌────────┐ ┌────────┐ ┌────────┐
          │Agent A │ │Agent B │ │Agent C │
          │(fix)   │ │(fix)   │ │(fix)   │
          └───┬────┘ └───┬────┘ └───┬────┘
              ▼          ▼          ▼
           [PR #1]    [PR #2]    [PR #3]
```

**Data flow:** Dispatch fans out issues to independent agents. Each agent receives full context (pre-hydrated MCP tools), produces one PR, and dies.

**Control flow:** Fire-and-forget. No iteration, no feedback between siblings. Dispatcher is the only coordinator.

**Failure mode:** An agent fails silently — max 2 CI retries then discard. Siblings are unaffected. Partial success is the norm (Stripe reports ~70% first-pass success on CI repair).

**Best use case:** High-volume, independent tasks where partial success is acceptable. Stripe processes 1,300 PRs/week this way. Each task must be completable in a single attempt with no inter-agent dependencies.

**Software Factory fit:** Current CI Debugger and Security Patcher agents already operate this way. One event, one agent, one PR.

---

### Pipeline (Spotify Honk)

```
  ┌───────┐    ┌────────┐    ┌───────┐    ┌────────┐    ┌───────┐
  │ Parse │───▶│ Reason │───▶│  Fix  │───▶│ Verify │───▶│ Judge │
  │  logs │    │  about  │    │  code │    │ (tests)│    │(LLM)  │
  └───────┘    └────────┘    └───────┘    └────────┘    └───────┘
                                               │              │
                                               │   ✗ veto     │
                                               ◀──────────────┘
                                          (max 2 retries)
```

**Data flow:** Linear. Each stage transforms output and passes it forward. Parse extracts structured errors from raw logs. Reason identifies root cause. Fix generates code. Verify runs tests. Judge validates the diff against original intent.

**Control flow:** Sequential with one feedback loop: Judge can veto back to Fix (max 2 iterations). Convergence detection stops the loop if the same error repeats.

**Failure mode:** Pipeline stalls if any stage produces garbage. The Judge is the safety valve — Spotify reports ~25% veto rate, catching scope creep and phantom fixes.

**Best use case:** Tasks requiring multi-step reasoning with quality gates. CI failure diagnosis, PR review with iterative improvement, incident root cause analysis.

**Software Factory fit:** Our CI Debugger already follows this pattern: parse failure logs, local verification, agent reasoning, sandbox fix, LLM judge validation.

---

### Org Chart (Paperclip)

```
                 ┌──────────────┐
                 │     CEO      │
                 │ (Orchestrator)│
                 │  Budget: $50 │
                 └──────┬───────┘
              ┌─────────┼─────────────┐
              ▼         ▼             ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Eng Lead │ │ QA Lead  │ │ Ops Lead │
        │ $20 budg │ │ $15 budg │ │ $15 budg │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
          ┌──┴──┐      ┌──┴──┐      ┌──┴──┐
          ▼     ▼      ▼     ▼      ▼     ▼
        [dev] [dev]  [qa]  [qa]  [sre] [sre]
                           │
                      ┌────┴────┐
                      │ APPROVE │ ◀── Approval gate
                      │ / DENY  │     (human or policy)
                      └─────────┘
```

**Data flow:** Hierarchical delegation. Parent assigns tasks to children, children report results upward. Budget flows down — each level gets a sub-allocation.

**Control flow:** Top-down delegation with bottom-up reporting. Approval gates at configurable levels (e.g., any PR touching auth requires human approval). Heartbeat protocol monitors agent health — missing heartbeats trigger task requeue.

**Failure mode:** Coordination overhead. Messages must traverse the hierarchy. A dead manager blocks its entire subtree until the heartbeat timeout triggers failover.

**Best use case:** Large-scale operations requiring governance, cost control, and audit trails. Multi-team organizations where different agents have different permission levels and budget limits.

**Software Factory fit:** Phase 3 target. Our orchestrator dispatches agents flat today; Paperclip's org chart model adds the governance layer needed for multi-repo, multi-team deployment.

---

### Mesh (Ramp Inspect)

```
        ┌────────┐       ┌────────┐
        │Agent A │◀─────▶│Agent B │
        │(review)│       │(fix)   │
        └───┬────┘       └───┬────┘
            │    ╲       ╱   │
            │     ╲     ╱    │
            │   shared state │
            │     ╱     ╲    │
            │    ╱       ╲   │
        ┌───┴────┐       ┌───┴────┐
        │Agent C │◀─────▶│Agent D │
        │(test)  │       │(deploy)│
        └────────┘       └────────┘
              ▲
              │ multiplayer session
              │ (human joins live)
              ▼
         ┌─────────┐
         │  Human  │
         └─────────┘
```

**Data flow:** Peer-to-peer. Agents share state through a common workspace (Modal snapshot). Any agent can read another agent's work-in-progress. Humans can join live sessions and co-edit.

**Control flow:** No central coordinator. Agents discover work via shared state (filesystem changes, test results). Warm pools mean agents spin up in <2 seconds from snapshots.

**Failure mode:** State conflicts. Two agents editing the same file create merge conflicts. Requires careful workspace partitioning or optimistic concurrency.

**Best use case:** Collaborative tasks where multiple perspectives improve quality simultaneously. Code review + implementation happening in parallel. Human-in-the-loop sessions where context must be shared in real-time.

**Software Factory fit:** Future pattern for complex incident response — SRE agent, log analysis agent, and fix agent working on the same live issue concurrently. Requires shared workspace infrastructure we don't have yet (Phase 3).

---

### Ratchet (Karpathy Autoresearch)

```
       ┌──────────────────────────────────────────┐
       │            NEVER STOP LOOP                │
       │                                           │
       │  ┌──────┐    ┌──────┐    ┌───────┐       │
       │  │ Read │───▶│Modify│───▶│Commit │       │
       │  │state │    │ code │    │(git)  │       │
       │  └──────┘    └──────┘    └───┬───┘       │
       │                              ▼           │
       │                        ┌──────────┐      │
       │                        │   Run    │      │
       │                        │experiment│      │
       │                        └────┬─────┘      │
       │                             ▼            │
       │                      ┌────────────┐      │
       │               ┌──yes─┤ Improved?  ├─no─┐ │
       │               ▼      └────────────┘    ▼ │
       │          ┌─────────┐            ┌────────┐│
       │          │  KEEP   │            │ RESET  ││
       │          │(advance │            │(git    ││
       │          │ branch) │            │ reset) ││
       │          └────┬────┘            └───┬────┘│
       │               └────────┬────────────┘    │
       │                        ▼                  │
       │                   LOOP BACK               │
       └──────────────────────────────────────────┘
            │
            │  ~12 experiments/hour
            │  ~100 experiments overnight
            │  git history = full audit trail
```

**Data flow:** Circular. Agent reads state, modifies code, commits, runs experiment, evaluates a single metric, keeps or discards. Git is the checkpoint mechanism — every attempt is a commit, failures are `git reset`.

**Control flow:** Self-directed with no external coordinator. The agent decides what to try next. One binary metric (improved / not improved) eliminates ambiguity. Fixed time budget per experiment prevents runaway cost.

**Failure mode:** Getting stuck. If the agent exhausts obvious ideas, it enters a "think harder" phase — trying radical changes, combining near-misses, reading documentation. Risk of infinite loop if metric never improves and no termination condition exists.

**Best use case:** Optimization problems with a clear, measurable objective. Performance tuning, prompt optimization, configuration search, ML training. Any problem where "did the number go up?" is the entire evaluation.

**Software Factory fit:** Applicable to prompt engineering for our agents (optimize verification accuracy), configuration tuning (find optimal retry/timeout settings), and autonomous codebase improvement (does test coverage increase? does build time decrease?).

---

## 2. Potent Combos

Six high-synergy combinations. Each creates emergent capability that neither system has alone.

---

### Combo 1: Deep Agents + Paperclip — Smart Agents in a Managed Fleet

**What combines:** Deep Agents' internal composition (middleware, sub-agents, context summarization) with Paperclip's external orchestration (budgets, task locks, heartbeats, dashboard).

**What emerges:** A fleet of *individually sophisticated* agents, each with middleware pipelines and sub-agent delegation, coordinated by an *organizationally aware* platform with budget enforcement and observability. Neither system alone achieves this — Deep Agents builds one smart agent, Paperclip manages many dumb ones.

```
┌──────────────────────── Paperclip Layer ────────────────────────┐
│  Budget: $50/day    Tasks: checkout locks    Health: heartbeats  │
│                                                                  │
│  ┌──────────────────────────── Deep Agent ─────────────────────┐ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │ │
│  │  │Governance│─▶│   Cost   │─▶│  Audit   │─▶│Summarize  │  │ │
│  │  │Middleware│  │ Tracking │  │Middleware│  │Middleware │  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────┬─────┘  │ │
│  │                                                    ▼        │ │
│  │                                             ┌───────────┐   │ │
│  │                                             │ Sub-Agent │   │ │
│  │                                             │ (parse)   │   │ │
│  │                                             └───────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Deep Agent ─┐  ┌─ Deep Agent ─┐  ┌─ Deep Agent ─┐          │
│  │  PR Review   │  │  CI Debug    │  │  Security    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  Dashboard ──▶ [Live transcripts] [Budget burn] [Agent health]   │
└──────────────────────────────────────────────────────────────────┘
```

**Software Factory example:** The CI Debugger uses middleware for governance + cost tracking + summarization, and spawns a cheap sub-agent for log parsing. Meanwhile, Paperclip's orchestration layer enforces the $5/day budget across all five agents, monitors heartbeats, and streams transcripts to the React dashboard. An engineer wakes up and reviews overnight work in one UI.

**Phase:** This is the Phase 2 → Phase 3 bridge. Deep Agents middleware refactor (Phase 2), then Paperclip fleet orchestration on top (Phase 3).

---

### Combo 2: Spotify Verification + Karpathy Ratchet — Verify-Then-Advance Autonomous Loop

**What combines:** Spotify Honk's verification pipeline (LLM judge, sandbox tests, convergence detection) with Autoresearch's NEVER STOP loop (git checkpoints, single-metric acceptance, crash recovery).

**What emerges:** An autonomous loop that *runs forever and only advances when verification proves improvement*. Spotify alone stops after bounded retries. Karpathy alone uses simplistic pass/fail metrics. Combined: the LLM judge provides nuanced verification, and the ratchet mechanism provides unbounded iteration.

```
       ┌────────────────── VERIFIED RATCHET ──────────────────┐
       │                                                       │
       │  ┌──────┐    ┌──────────────────────────────────┐    │
       │  │ Read │───▶│      Spotify Pipeline            │    │
       │  │state │    │  Parse → Reason → Fix → Verify   │    │
       │  └──────┘    │                      ↓           │    │
       │              │                 ┌─────────┐      │    │
       │              │                 │LLM Judge│      │    │
       │              │                 └────┬────┘      │    │
       │              └──────────────────────┼───────────┘    │
       │                                     ▼                │
       │                              ┌────────────┐          │
       │                       ┌──yes─┤  Passed?   ├─no──┐   │
       │                       ▼      └────────────┘     ▼   │
       │                  ┌─────────┐              ┌────────┐ │
       │                  │git keep │              │git     │ │
       │                  │(advance)│              │reset   │ │
       │                  └────┬────┘              └───┬────┘ │
       │                       └──────────┬────────────┘      │
       │                                  ▼                    │
       │                        convergence check              │
       │                    (same error 3x = escalate)         │
       │                                  ▼                    │
       │                             LOOP BACK                 │
       └───────────────────────────────────────────────────────┘
```

**Software Factory example:** Overnight prompt optimization for the PR Reviewer agent. The loop runs experiments changing system prompts, evaluates each against a benchmark suite using the LLM judge, keeps improvements (git commit), discards regressions (git reset). By morning: 50+ experiments attempted, measurably better prompts, full audit trail in git history.

**Key safety:** Convergence detection (Stripe pattern) prevents the loop from retrying identical failures. If the judge rejects the same fix pattern 3 times, escalate to human review instead of burning tokens.

---

### Combo 3: QMD Knowledge + OpenAI Harness — Structured Environment with Intelligent Retrieval

**What combines:** QMD's hybrid search (BM25 + vector + LLM reranking) with OpenAI's harness engineering patterns (AGENTS.md as map, layered docs, progressive disclosure, linter-as-teacher).

**What emerges:** Agents that can *find the right context at the right time* within a *well-structured knowledge base*. OpenAI's docs/ structure creates organized knowledge, but agents must still locate the right doc. QMD's retrieval ensures agents surface relevant context even when they don't know exactly where to look.

```
┌────────── OpenAI Harness Layer ──────────┐
│                                           │
│  AGENTS.md (~100 lines, table of contents)│
│       │                                   │
│       ▼                                   │
│  docs/                                    │
│  ├── design-docs/   ◀──┐                 │
│  ├── exec-plans/    ◀──┤                 │
│  ├── product-specs/ ◀──┤                 │
│  ├── references/    ◀──┤   ┌───────────┐ │
│  ├── DESIGN.md      ◀──┼───│    QMD    │ │
│  ├── SECURITY.md    ◀──┤   │  Search   │ │
│  └── QUALITY.md     ◀──┘   │           │ │
│                             │ BM25      │ │
│  Linters enforce layers:    │ + Vector  │ │
│  Types→Config→Service→UI    │ + Rerank  │ │
│                             └───────────┘ │
│                                           │
│  Agent asks: "How do we handle auth?"     │
│  QMD returns: SECURITY.md + auth design   │
│  doc + relevant code references           │
└───────────────────────────────────────────┘
```

**Software Factory example:** An incident response agent receives a PagerDuty alert about a payment processing failure. Instead of dumping the entire codebase context, QMD retrieves the relevant design doc (`docs/design-docs/payment-flow.md`), the security constraints (`SECURITY.md`), and recent related PRs — all within a structured environment where layered architecture constraints prevent the agent from accidentally breaking other modules.

**Phase:** Phase 2 — the harness structure already partially exists (we have `docs/` and agent prompts). Adding QMD search transforms it from "agent must know where to look" to "agent asks a question and gets the right context."

---

### Combo 4: Stripe Tools + Ramp Speed — 400 MCP Tools with Warm Pool Execution

**What combines:** Stripe's 400+ MCP tool ecosystem (per-dir rules, devbox isolation, deterministic pre-fetch) with Ramp's warm pool execution (pre-built snapshots, <2s startup, multiplayer sessions).

**What emerges:** A *broad-capability agent* (400 tools) that *starts instantly* (warm pools) without the cold-start penalty. Stripe's tools are powerful but each agent boots fresh. Ramp's pools are fast but with limited tools. Combined: agents start in seconds with the full tool suite pre-loaded.

```
┌──────── Warm Pool (Ramp) ────────────────────────────────────┐
│                                                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │Snapshot 1│  │Snapshot 2│  │Snapshot 3│  │Snapshot 4│        │
│  │(ready)   │  │(ready)   │  │(ready)   │  │(ready)   │        │
│  └────┬─────┘  └─────────┘  └─────────┘  └─────────┘        │
│       │                                                       │
│       ▼  <2s startup                                          │
│  ┌────────────── Stripe Tool Ecosystem ──────────────────┐   │
│  │                                                        │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │   │
│  │  │GitHub│ │Slack │ │ Jira │ │Sentry│ │ DB   │  ...   │   │
│  │  │MCP   │ │MCP   │ │MCP   │ │MCP   │ │MCP   │ (400+) │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘       │   │
│  │                                                        │   │
│  │  Per-dir rules: .minions.toml configures which tools   │   │
│  │  Deterministic pre-fetch: tools hydrated before LLM    │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Pool refreshed every 30 min with latest tools + deps         │
└───────────────────────────────────────────────────────────────┘
```

**Software Factory example:** An incident fires at 3 AM. The agent starts in <2s from a warm snapshot (not 30s cold boot), already has PagerDuty MCP, GitHub MCP, Datadog MCP, and Slack MCP pre-loaded. It reads the alert, queries metrics, identifies the failing deploy, rolls back, posts to Slack, and opens a fix PR — all without tool initialization latency. The per-dir rules ensure the agent only sees tools relevant to the affected service.

**Key caveat:** Microsoft Research found 85% performance degradation with large tool spaces. The per-dir rules from Stripe are essential — don't give an agent 400 tools at once. Scope to ~20 per task via `.minions.toml` equivalent.

---

### Combo 5: GitHub Copilot Agent + Software Factory — GitHub-Native Triggers Feeding Background Agents

**What combines:** GitHub Copilot's native issue-to-PR agent (GitHub-native triggers, CI repair, security scanning, custom `.github/agents/`) with Software Factory's specialized background agents (incident response, merge resolution, knowledge graph, governance).

**What emerges:** A *two-tier agent system* where GitHub handles simple, well-scoped tasks natively (issue → PR, CI repair) and Software Factory handles complex tasks requiring domain knowledge, multi-step reasoning, or cross-system integration. GitHub is the trigger layer and simple-task handler; Software Factory is the deep-reasoning layer.

```
┌────────────── GitHub Layer ──────────────────────────────────┐
│                                                               │
│  Issue opened ──▶ Copilot Agent ──▶ PR (simple fix)          │
│                       │                                       │
│  CI failed ─────▶ Repair Agent ──▶ Fix commit                │
│                       │                                       │
│  Dependabot ────▶ Security scan ──▶ Alert                    │
│                       │                                       │
│  Complex / failed ────┼──────────────────────────────────────│
│                       ▼                                       │
└───────────────────────┼───────────────────────────────────────┘
                        │ webhook
                        ▼
┌────────────── Software Factory Layer ────────────────────────┐
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Incident │  │  Merge   │  │ Deep CI  │  │ Security │    │
│  │ Response │  │ Resolver │  │ Debugger │  │ Patcher  │    │
│  │(PagerDuty│  │(conflict │  │(multi-   │  │(CVE auto │    │
│  │ + RCA)   │  │ resolve) │  │ step fix)│  │ patch)   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                       │                                       │
│              Knowledge Graph (ProductRank)                     │
│              Governance Layer ($2/run caps)                    │
└───────────────────────────────────────────────────────────────┘
```

**Software Factory example:** A developer opens a GitHub issue tagged `factory:auto`. Copilot Agent takes first crack — if it produces a passing PR, done. If the CI fails twice or the issue involves incident response / merge conflict / security CVE, GitHub fires a webhook to Software Factory, which dispatches the appropriate specialized agent with full knowledge graph context and governance controls. The developer sees one unified PR flow regardless of which layer handled it.

**Strategic value:** GitHub Copilot Agent is free for Pro subscribers and handles the easy 70%. Software Factory handles the hard 30% that requires domain intelligence, multi-system integration, and production-grade governance. This is a complement strategy, not a compete strategy.

---

### Combo 6: Linear + Paperclip + Software Factory — Full Autonomous SDLC

**What combines:** Linear (project management, issue tracking, sprint planning) with Paperclip (fleet orchestration, budgets, dashboards) and Software Factory (agent implementation, governance, verification).

**What emerges:** A *fully autonomous software delivery lifecycle*: ticket creation → agent assignment → implementation → verification → PR → review → merge. Humans create tickets and review PRs; everything in between is automated.

```
┌─── Linear ───┐     ┌──── Paperclip ────┐     ┌── Software Factory ──┐
│               │     │                    │     │                      │
│  Issue        │     │  Task Checkout     │     │  Agent Execution     │
│  created      │────▶│  (atomic lock)     │────▶│                      │
│  [factory:    │     │                    │     │  ┌──────────────┐    │
│   auto]       │     │  Budget Check      │     │  │  Sandbox     │    │
│               │     │  ($20 remaining?)  │     │  │  (isolated)  │    │
│               │     │                    │     │  └──────┬───────┘    │
│               │     │  Agent Assignment  │     │         │            │
│               │     │  (label → type)    │     │         ▼            │
│               │     │                    │     │  ┌──────────────┐    │
│               │     │  Heartbeat Monitor │◀────│  │  Verify +    │    │
│               │     │  (agent alive?)    │     │  │  LLM Judge   │    │
│               │     │                    │     │  └──────┬───────┘    │
│               │     │  Transcript Store  │◀────│         │            │
│               │     │                    │     │         ▼            │
│  Issue        │◀────│  Status Update     │◀────│  PR Created         │
│  auto-closed  │     │                    │     │  (GitHub API)        │
│  + PR link    │     │  Dashboard         │     │                      │
│               │     │  [live view]       │     │                      │
└───────────────┘     └────────────────────┘     └──────────────────────┘

Timeline:
  t=0s     Issue tagged factory:auto in Linear
  t=2s     Orchestrator polls, Paperclip checks out task
  t=5s     Agent starts in sandbox (warm pool)
  t=30s    Local lint + fix attempt
  t=90s    Verification loop + LLM judge
  t=120s   PR opened, Linear issue updated
  t=???    Human reviews and merges
```

**Software Factory example:** A product manager files "Add rate limiting to /api/search endpoint" in Linear with the `factory:auto` label. Within 2 seconds, the orchestrator claims it. Paperclip verifies budget ($20 remaining this month for the feature-builder agent). Software Factory's agent reads the codebase context, implements rate limiting with tests, verifies locally, passes the LLM judge, and opens a PR — all in under 3 minutes. The Linear issue auto-updates with a link to the PR. The PM reviews and merges.

**This is the endgame.** It requires all three phases of Software Factory complete, plus Paperclip integration, plus a Feature Builder agent (our P0 competitive gap). Target: Phase 3.

---

## 3. The Software Factory Mega-Topology

How all eight research sources compose into the full architecture.

```
╔══════════════════════════════════════════════════════════════════════════╗
║                        SOFTWARE FACTORY                                 ║
║                                                                          ║
║  TRIGGERS                                                                ║
║  ────────                                                                ║
║  GitHub Webhooks ─┐                                                      ║
║  Linear Issues ───┤    ┌─────────────────────────────────────────────┐   ║
║  PagerDuty ───────┼───▶│           EVENT ROUTER                      │   ║
║  Cron ────────────┤    │    (Stripe pre-fetch + Spotify context)     │   ║
║  Copilot fallback─┘    └────────────────────┬────────────────────────┘   ║
║                                              │                            ║
║  ORCHESTRATION (Paperclip)                   │                            ║
║  ─────────────────────────                   │                            ║
║  ┌───────────────────────────────────────────┼──────────────────────┐    ║
║  │  ┌────────────┐ ┌──────────┐ ┌──────────┐│┌──────────┐         │    ║
║  │  │Budget Guard│ │Task Lock │ │Heartbeat ││ │Dashboard │         │    ║
║  │  │(monthly +  │ │(checkout)│ │(health)  ││ │(React +  │         │    ║
║  │  │ per-run)   │ │          │ │          ││ │WebSocket)│         │    ║
║  │  └────────────┘ └──────────┘ └──────────┘│└──────────┘         │    ║
║  └───────────────────────────────────────────┼─────────────────────┘    ║
║                                              │                            ║
║  AGENT LAYER (Deep Agents middleware)        ▼                            ║
║  ────────────────────────────────   ┌─────────────────┐                  ║
║                                     │   Reconciler    │                  ║
║  Shared Middleware Stack:           │  (Symphony +    │                  ║
║  ┌──────────────────────┐           │   Autoresearch) │                  ║
║  │ GovernanceMiddleware │           └────────┬────────┘                  ║
║  │ CostTrackingMW       │                    │                            ║
║  │ AuditMiddleware      │         ┌──────────┼──────────┬────────┐      ║
║  │ SummarizationMW      │         ▼          ▼          ▼        ▼      ║
║  └──────────────────────┘    ┌────────┐ ┌────────┐ ┌────────┐ ┌────┐   ║
║                              │   PR   │ │   CI   │ │Security│ │More│   ║
║  Per-Agent Middleware:       │ Review │ │ Debug  │ │ Patch  │ │... │   ║
║  ┌──────────────────────┐    │        │ │        │ │        │ │    │   ║
║  │ + GitHubReviewMW     │    │Pipeline│ │Pipeline│ │One-Shot│ │    │   ║
║  │ + CILogParserMW      │    │topology│ │topology│ │Tree    │ │    │   ║
║  │ + CVEFeedMW          │    │        │ │        │ │        │ │    │   ║
║  └──────────────────────┘    └───┬────┘ └───┬────┘ └───┬────┘ └──┬─┘   ║
║                                  │          │          │         │      ║
║  EXECUTION (Spotify + Ramp + Stripe)        │          │         │      ║
║  ───────────────────────────────────────────┼──────────┼─────────┘      ║
║  ┌───────────────────────────────────────────┼──────────┼───────────┐    ║
║  │  ┌───────────┐ ┌───────────┐ ┌───────────┘──────────┘          │    ║
║  │  │Warm Pools │ │ Sandbox   │ │     Verification Loop            │    ║
║  │  │(Ramp:     │ │(Spotify:  │ │  ┌──────┐  ┌──────┐  ┌──────┐  │    ║
║  │  │ snapshots │ │ K8s/Docker│ │  │Local │─▶│Agent │─▶│ LLM  │  │    ║
║  │  │ <2s start)│ │ per run)  │ │  │verify│  │fix   │  │Judge │  │    ║
║  │  └───────────┘ └───────────┘ │  └──────┘  └──────┘  └──┬───┘  │    ║
║  │                              │              ▲           │      │    ║
║  │  ┌───────────┐               │              └───────────┘      │    ║
║  │  │MCP Tools  │               │           max 2 retries         │    ║
║  │  │(Stripe:   │               │                                  │    ║
║  │  │ per-dir   │               │  Convergence detection           │    ║
║  │  │ scoped)   │               │  (same error = immediate fail)   │    ║
║  │  └───────────┘               └──────────────────────────────────┘    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                                                          ║
║  KNOWLEDGE (QMD + OpenAI Harness)                                        ║
║  ────────────────────────────────                                        ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  AGENTS.md (map) ──▶ docs/ (structured knowledge base)          │    ║
║  │                         ▲                                        │    ║
║  │                    QMD Search (BM25 + vector + rerank)           │    ║
║  │                                                                  │    ║
║  │  ProductRank Knowledge Graph (domain intelligence)               │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                                                          ║
║  OUTPUT                                                                  ║
║  ──────                                                                  ║
║  Every agent action ──▶ Pull Request ──▶ Human Review ──▶ Merge         ║
║                    ──▶ Audit Log (SQLite)                                ║
║                    ──▶ Run Transcript (persistent)                       ║
║                    ──▶ Linear Issue Update                               ║
╚══════════════════════════════════════════════════════════════════════════╝

Legend:
  Spotify Honk ───── Sandbox isolation, verification loops, LLM judge
  Stripe Minions ─── MCP tools, per-dir rules, bounded retries
  Ramp Inspect ───── Warm pools, snapshots, multiplayer sessions
  Karpathy Auto ──── NEVER STOP loop, git checkpoints, convergence
  OpenAI Harness ─── AGENTS.md, layered docs, linter-as-teacher
  Deep Agents ────── Middleware pipelines, sub-agents, summarization
  QMD ────────────── Hybrid search, knowledge retrieval
  Paperclip ──────── Budgets, task locks, heartbeats, dashboard
```

---

## 4. Anti-Patterns

Topologies and practices that empirically degrade agent performance.

---

### Anti-Pattern 1: More Agents != Better (Google / MIT)

**Finding:** Google DeepMind and MIT researchers found that adding agents to a multi-agent system where any single agent already achieves >45% accuracy on the task *hurts* overall performance. The coordination overhead and conflicting outputs degrade the result.

**Why it happens:** Agents generate plausible but contradictory solutions. A "majority vote" or "debate" mechanism doesn't resolve deep disagreements — it averages toward mediocrity. The communication overhead grows quadratically with agent count.

**Rule for Software Factory:** Don't spawn multiple agents for a task one agent can handle. Use sub-agents (Deep Agents pattern) for *context isolation*, not for *quality improvement through redundancy*. One agent with middleware > three agents debating.

**Source:** [More Agents Is All You Need (Google/MIT, 2024)](https://arxiv.org/abs/2402.05120) — accuracy improvements only when base agent accuracy is below 45%.

---

### Anti-Pattern 2: Tool Space Explosion (Microsoft Research)

**Finding:** Microsoft Research observed 85% performance degradation when agents were given access to large tool spaces (100+ tools). The agent spends more tokens reasoning about which tool to use than actually solving the problem.

**Why it happens:** Each tool adds to the system prompt length, increases decision complexity, and creates more opportunities for tool hallucination (calling tools with wrong parameters or calling nonexistent tools).

**Rule for Software Factory:** Never give an agent more than ~20 tools per task. Use Stripe's per-dir rules pattern (`.minions.toml`) to scope tools to what's relevant. Pre-fetch deterministically instead of letting the agent discover tools at runtime.

**Source:** [Microsoft Research — Gorilla: Large Language Model Connected with Massive APIs (2023)](https://arxiv.org/abs/2305.15334) — performance degrades sharply beyond ~20 concurrent tool definitions. Also corroborated by Stripe's decision to use per-directory tool scoping despite having 400+ available.

---

### Anti-Pattern 3: LLM-as-Judge Without Grounding (Spotify Caveat)

**Finding:** Spotify found that using an LLM as the sole judge of code correctness produces a 79% false positive rate — the judge says the code is correct when it isn't. The judge hallucinates passing tests, imagines that edge cases are handled, and confirms its own biases.

**Why it happens:** The LLM judge has no access to runtime behavior. It reads the diff and *reasons about* correctness rather than *observing* correctness. It's especially bad at catching off-by-one errors, race conditions, and state mutation bugs — the exact class of bugs agents tend to introduce.

**Rule for Software Factory:** Never use LLM judge as the only verification. Always pair with deterministic verification (tests, linting, type checking) that runs in a sandbox. The LLM judge's job is *scope creep detection* and *intent alignment*, not *correctness verification*. The pipeline should be: deterministic verify first (fast, reliable) → LLM judge second (catches intent drift).

**Source:** [Spotify Honk Part 3 — Feedback Loops](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3) — 25% veto rate in production, but initial experiments without grounding showed 79% false positive rate for correctness claims.

---

### Anti-Pattern 4: Unbounded Retry Loops

**Finding:** Karpathy's autoresearch hit convergence bugs where the agent retried the same failing approach indefinitely, burning tokens without progress. Stripe independently capped retries at 2 after observing diminishing returns.

**Why it happens:** Without convergence detection, agents interpret "try harder" as "try the same thing again." After the second retry, the probability of success drops below 5% (Stripe data), but cost continues linearly.

**Rule for Software Factory:** Max 2 CI retries (Stripe pattern). Implement convergence detection: if `lastError === currentError`, mark failed immediately. Different error = progress; same error = stuck. Exponential backoff on retries (30s → 2m → 8m → 30m → 2h cap).

**Source:** [Stripe Minions Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) — max 2 CI retries. [Karpathy Autoresearch](https://github.com/karpathy/autoresearch) — crash recovery logic distinguishes fixable vs. fundamentally broken.

---

### Anti-Pattern 5: Shared Mutable State Between Agents

**Finding:** Ramp's multiplayer sessions work because they are carefully partitioned. Naive shared state — two agents editing the same file — produces merge conflicts, lost writes, and non-deterministic behavior that is nearly impossible to debug.

**Why it happens:** LLMs don't understand concurrency. They read a file, plan a change, and write it — without locks. If another agent modified the file between read and write, the first agent's change silently overwrites it.

**Rule for Software Factory:** Git worktree isolation (one worktree per task). Agents never share a workspace. If two agents must coordinate, use message passing (task checkout + result reporting) not shared filesystem. The Paperclip task checkout lock pattern prevents double-work.

**Source:** [Ramp Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) — multiplayer sessions require explicit workspace partitioning. Software Factory Design Principle #6: "Cattle, not pets — every sandbox identical and disposable."

---

## Sources

- [Stripe Minions Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) — One-shot agents, 1,300 PRs/week, max 2 retries
- [Stripe Minions Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2) — 400 MCP tools, per-dir rules, devbox isolation
- [Spotify Honk Part 1](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) — K8s containers, verification loops
- [Spotify Honk Part 2](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2) — Context engineering
- [Spotify Honk Part 3](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3) — LLM judge, 25% veto rate, false positive findings
- [Ramp Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) — Warm pools, Modal sandboxes, multiplayer sessions
- [OpenAI Harness Engineering](https://openai.com/index/harness-engineering/) — AGENTS.md, layered architecture, background GC agents
- [OpenAI Unlocking the Codex Harness](https://openai.com/index/unlocking-the-codex-harness/) — App server, per-worktree observability
- [Deep Agents (LangChain)](https://github.com/langchain-ai/deepagents) — Middleware pipelines, sub-agents, context summarization
- [Karpathy Autoresearch](https://github.com/karpathy/autoresearch) — NEVER STOP loop, git checkpoints, convergence
- [QMD (Tobi Lutke)](https://github.com/tobi/qmd) — BM25 + vector + LLM reranking, MCP server
- [Paperclip AI](https://github.com/paperclipai/paperclip) — Fleet orchestration, budgets, task locks, heartbeats, React dashboard
- [GitHub Copilot Coding Agent](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/) — Issue-to-PR, CI repair, custom agents
- [Copilot Agentic Code Review](https://github.blog/changelog/2026-03-05-copilot-code-review-now-runs-on-an-agentic-architecture/) — March 2026 GA
- [More Agents Is All You Need (Google/MIT)](https://arxiv.org/abs/2402.05120) — Multi-agent scaling limits
- [Gorilla: LLM Connected with Massive APIs (Microsoft Research)](https://arxiv.org/abs/2305.15334) — Tool space performance degradation
- [The Emerging Harness Engineering Playbook](https://www.ignorance.ai/p/the-emerging-harness-engineering) — Third-party analysis
- [Anthropic 2026 Agentic Coding Trends Report](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf)
