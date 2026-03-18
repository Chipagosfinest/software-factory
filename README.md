# Software Factory

> Autonomous DevOps/SRE agents that keep production running while humans sleep.

Research and implementation of agent-native software development patterns — autonomous PR review, CI debugging, security patching, incident response, and background maintenance.

```
                        ┌─────────────────────────────────────────┐
                        │          SOFTWARE FACTORY               │
                        │                                         │
  GitHub Webhooks ─────▶│  5 Agents  ·  Governance  ·  Sandbox   │──────▶ PRs
  PagerDuty Alerts ────▶│                                         │──────▶ Reviews
  Cron Schedules ──────▶│  "On the loop, not in the loop"        │──────▶ Fix Commits
  Slack Commands ──────▶│                                         │──────▶ RCA Reports
                        └─────────────────────────────────────────┘
```

---

## How It Works

```
  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │  EVENT   │────▶│  ROUTE   │────▶│  AGENT   │────▶│  VERIFY  │────▶│  OUTPUT  │
  │          │     │          │     │          │     │          │     │          │
  │ Webhook  │     │ Normalize│     │ Reason + │     │ Sandbox  │     │ PR or    │
  │ Alert    │     │ Hydrate  │     │ Fix in   │     │ Tests    │     │ Comment  │
  │ Cron     │     │ Context  │     │ Sandbox  │     │ LLM Judge│     │ on GitHub│
  └──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                           │
                                                    ┌──────┴──────┐
                                                    │  Max 2 CI   │
                                                    │  retries    │
                                                    │  then stop  │
                                                    └─────────────┘
```

**Every agent action produces a PR. Nothing merges without human approval.**

---

## Core Agents

```
  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
  │   PR REVIEWER   │  │   CI DEBUGGER   │  │ SECURITY PATCHER│
  │                 │  │                 │  │                 │
  │ pull_request.   │  │ check_suite.    │  │ dependabot_     │
  │ opened          │  │ completed       │  │ alert.created   │
  │                 │  │ (failure)       │  │ + CVE cron      │
  │ ──────────────  │  │ ──────────────  │  │ ──────────────  │
  │ Review comments │  │ Diagnosis +     │  │ Patch PR with   │
  │ Approve/reject  │  │ fix PR          │  │ explanation     │
  └─────────────────┘  └─────────────────┘  └─────────────────┘

  ┌─────────────────┐  ┌─────────────────┐
  │    INCIDENT     │  │     MERGE       │
  │    RESPONDER    │  │    RESOLVER     │
  │                 │  │                 │
  │ PagerDuty       │  │ PR with         │
  │ webhook         │  │ conflict label  │
  │                 │  │                 │
  │ ──────────────  │  │ ──────────────  │
  │ RCA + fix PR    │  │ Resolution      │
  │                 │  │ commit          │
  └─────────────────┘  └─────────────────┘
```

### CI Debugger: Shift-Left Feedback Loop

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

1. Parse failure logs (regex extraction, not raw dump)
2. Local verification (<5s lint/format checks)
3. Agent reasoning + fix generation in sandbox
4. Verification loop (max 2 CI rounds — diminishing returns after that)
5. LLM Judge validates diff against original intent (~25% veto rate at Spotify)

---

## Competitive Position

```
  Feature Building ◀──────────────────────────────────▶ Production Maintenance
       │                                                         │
       │  Devin ─────────┐                                       │
       │  Blitzy ────────┤                                       │
       │  Codex ─────────┤                                       │
       │                 │                                       │
       │  Copilot ───────┼───────────────────────────────────────┤
       │  Factory.ai ────┼───────────────────────────────────────┤
       │  Cursor ────────┤                                       │
       │                 │                                       │
       │                 │               Software Factory ───────┤
       │                 │               + Knowledge Graph ──────┤
       │                 │               + Incident Response ────┤  ◀── UNIQUE
       │                 │               + Merge Resolution ─────┤  ◀── UNIQUE
       │                 │                                       │
```

**We don't compete with Devin head-on.** Devin is "hire an AI engineer." We're "autonomous DevOps/SRE that keeps production running while humans sleep." [Full analysis →](docs/competitive-analysis.md)

---

## Live Proof-of-Concept: The Code Factory in the Wild

On March 17, 2026, Ryan Carson [@ryancarson](https://x.com/ryancarson/status/2033958219891028302) filed 6 bugs from his phone while waiting at the doctor's office. The first was merged before he left. 3–6 were running in parallel.

```
  THE ROLE INVERSION (what Carson proved)

  Before:  Developer = 80% writing code  + 20% deciding what to build
  After:   Developer = 80% filing issues + 20% reviewing agent PRs

  The bottleneck moved from IMPLEMENTATION → JUDGMENT.

  Stack: Symphony (Elixir/OTP orchestrator, Apache 2.0)
         + Codex App Server (one isolated instance per task)
         + Linear (issue tracker as the human interface)
         + GitHub (PR creation + auto-merge on success)
         Setup time: 2-3 days. Default concurrency: 10 agents.
```

```
  Developer (phone) ──▶ Linear Issue ──▶ Symphony
                                              │
                                     ┌────────┼────────┐
                                     ▼        ▼        ▼
                                  Codex 1  Codex 2  Codex 3  ... (10 max)
                               (isolated (isolated (isolated
                                git clone) git clone) git clone)
                                     │        │        │
                                     ▼        ▼        ▼
                                  CI pass  CI pass  CI pass
                                     │        │        │
                                     └────────┼────────┘
                                              ▼
                                      PRs on GitHub
                                              │
                                       Human reviews
                                              │
                                           Merged ✓
```

Carson's cost data: **$297 in API costs** to complete work worth **$50,000**. Setup: 2–3 days. Runs 14-hour unattended sessions.

[Full Symphony architecture + Ralph loop origin + role inversion thesis →](docs/symphony-carson.md)

---

## Agent Topology Patterns

Five topology types observed across production agent systems:

```
  ONE-SHOT TREE          PIPELINE              ORG CHART
  (Stripe: 1300 PR/wk)  (Spotify: verify+judge) (Paperclip: budgets)

       [D]                A → B → C → D → E       [CEO]
      / | \                           ↑   |       /  |  \
    [A] [B] [C]                       └───┘     [E] [Q] [O]
     ↓   ↓   ↓               (max 2 retries)   / \  |   |
   PR1  PR2  PR3                              [d][d][q] [s]


  MESH                   RATCHET
  (Ramp: multiplayer)    (Karpathy: git memory)

    [A] ←→ [B]           ┌─────────────────┐
     ↕  ╲╱  ↕            │ Read → Modify → │
    shared state          │ Commit → Run →  │
     ↕  ╱╲  ↕            │ Improved? ──────│
    [C] ←→ [D]           │  yes: keep      │
        ↕                 │  no:  reset     │
     [Human]              │ LOOP FOREVER    │
                          └─────────────────┘
```

[Full topology diagrams + 6 potent combo architectures →](docs/potent-combos.md)

---

## Governance: What We Add That Frameworks Don't

```
  ┌─────────────────────────── GOVERNANCE LAYER ───────────────────────────┐
  │                                                                        │
  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
  │  │  CIRCUIT   │  │   BUDGET   │  │   BLAST    │  │    KILL    │      │
  │  │  BREAKER   │  │   GUARD    │  │   RADIUS   │  │   SWITCH   │      │
  │  │            │  │            │  │            │  │            │      │
  │  │ Auto-off   │  │ $2/run     │  │ File-scope │  │ JSON gate  │      │
  │  │ on failure │  │ $5/day     │  │ per agent  │  │ no redeploy│      │
  │  │ rate spike │  │ hard caps  │  │ isolation  │  │ needed     │      │
  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘      │
  │                                                                        │
  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
  │  │ CONVERGENCE│  │   AUDIT    │  │  TIMEOUT   │  │  LLM JUDGE │      │
  │  │ DETECTION  │  │   TRAIL    │  │            │  │            │      │
  │  │            │  │            │  │            │  │            │      │
  │  │ Same error │  │ Every call │  │ 5-min hard │  │ Diff review│      │
  │  │ = stop now │  │ logged     │  │ kill       │  │ scope check│      │
  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘      │
  │                                                                        │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## Research Sources

Nine production systems and open-source frameworks inform this design:

```
  ┌──────────────────────────────────────────────────────────────────────┐
  │                     RESEARCH → SOFTWARE FACTORY                      │
  │                                                                      │
  │  ENVIRONMENT          DEPLOYMENT           COMPOSITION    FLEET      │
  │  DESIGN               & SCALE              & STRUCTURE    MGMT       │
  │                                                                      │
  │  ┌──────────┐    ┌──────────────────┐    ┌──────────┐  ┌─────────┐ │
  │  │  OpenAI  │    │ Spotify  Ramp    │    │   Deep   │  │Paperclip│ │
  │  │ Harness  │    │ Honk    Inspect  │    │  Agents  │  │   AI    │ │
  │  │          │    │                  │    │          │  │         │ │
  │  │ AGENTS.md│    │ Stripe  Minions  │    │Middleware│  │ Budgets │ │
  │  │ Layers   │    │                  │    │Sub-agents│  │ Tasks   │ │
  │  │ GC bots  │    │ Sandboxes, PRs   │    │Summaries │  │ Health  │ │
  │  └──────────┘    │ Warm pools, retry│    └──────────┘  │Dashboard│ │
  │                  └──────────────────┘                  └─────────┘ │
  │                                                                      │
  │  KNOWLEDGE           AUTONOMY           FLEET MGMT                   │
  │                                                                      │
  │  ┌──────────┐    ┌──────────┐    ┌──────────┐                      │
  │  │   QMD    │    │Autoresrch│    │ Composio │                      │
  │  │ (Lutke)  │    │(Karpathy)│    │  Agent   │                      │
  │  │          │    │          │    │  Orch.   │                      │
  │  │ BM25 +   │    │NEVER STOP│    │          │                      │
  │  │ Vector + │    │Git memory│    │ Plugins  │                      │
  │  │ Reranking│    │Ratchet   │    │ Worktrees│                      │
  │  └──────────┘    └──────────┘    │ States   │                      │
  │                                  └──────────┘                      │
  └──────────────────────────────────────────────────────────────────────┘
```

| Source | System | Result | Key Insight |
|--------|--------|--------|-------------|
| **OpenAI** | [Harness Engineering](https://openai.com/index/harness-engineering/) | ~1M lines, 0 hand-written code, 3.5 PRs/eng/day | AGENTS.md as map, layered architecture, background GC agents |
| **Spotify** | [Honk](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) | 1,500+ merged PRs, 50% automated | K8s containers + verification loops + LLM judge |
| **Ramp** | [Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) | 30% of all PRs | Modal sandboxes, warm pools, multiplayer sessions |
| **Stripe** | [Minions](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) | 1,300 PRs/week | Goose fork + devboxes + 400 MCP tools, max 2 CI retries |
| **LangChain** | [Deep Agents](https://github.com/langchain-ai/deepagents) / [Open SWE](https://github.com/langchain-ai/open-swe) | 52.8→66.5% Terminal Bench (harness-only) | Middleware pipelines, self-verification loops, loop detection, reasoning sandwich, trace analysis, `write_todos` planning, Manager→Planner→Programmer→Reviewer pipeline |
| **Karpathy** | [Autoresearch](https://github.com/karpathy/autoresearch) | ~100 experiments overnight | NEVER STOP loop, single-metric acceptance, fixed time budgets |
| **Tobi Lutke** | [QMD](https://github.com/tobi/qmd) | Local-first knowledge search | Hybrid search (BM25 + vector + LLM reranking), MCP server |
| **Paperclip** | [paperclipai/paperclip](https://github.com/paperclipai/paperclip) | 26.7k★ agent orchestration | Per-agent budgets, task checkout locks, heartbeat health, React dashboard |
| **Composio** | [ComposioHQ/agent-orchestrator](https://github.com/ComposioHQ/agent-orchestrator) | 4.5k★ fleet management | Plugin-based 8-slot architecture, LLM task decomposition, fingerprinted review dispatch, 15-state session lifecycle |

---

## Competency Heat Map

Which source is best at what — and where Software Factory draws from each:

```
Scale: ████ best-in-class  ███░ strong  ██░░ partial  █░░░ minimal  ░░░░ absent
```

| Competency | OpenAI | Spotify | Stripe | Deep Agents | Karpathy | QMD | Paperclip | Composio |
|---|---|---|---|---|---|---|---|---|
| Context engineering | ███░ | ████ | ███░ | ██░░ | █░░░ | ░░░░ | ░░░░ | █░░░ |
| Middleware/composition | ░░░░ | ░░░░ | ░░░░ | ████ | ░░░░ | ░░░░ | ░░░░ | ████ |
| Sandbox isolation | ██░░ | ████ | ████ | ░░░░ | █░░░ | ░░░░ | ░░░░ | ███░ |
| Verification loops | ███░ | ████ | ████ | ░░░░ | ████ | ░░░░ | ░░░░ | ███░ |
| LLM judge | ░░░░ | ████ | ██░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ |
| Cost control | ██░░ | █░░░ | ██░░ | ░░░░ | ░░░░ | ░░░░ | ████ | ██░░ |
| Fleet management | ░░░░ | ░░░░ | ██░░ | ██░░ | ░░░░ | ░░░░ | ████ | ████ |
| Knowledge search | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ████ | ░░░░ | ░░░░ |
| Plugin architecture | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ████ |
| Task decomposition | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ████ |

[Full competency matrix with 25 dimensions →](docs/competency-graph.md)

---

## Enterprise Adoption (March 2026)

Real-world results from companies running autonomous coding agents at scale:

```
  ┌─────────────────────────────────────────────────────────────────────┐
  │                                                                     │
  │   Uber          84% of engineers using AI tools                    │
  │   ████████████████████████████████████████░░░░░░░░░░               │
  │                                                                     │
  │   Stripe        1,300 PRs/week via Minions                         │
  │   ██████████████████████████████████████████████████               │
  │                                                                     │
  │   Spotify       650+ agent PRs merged/month                        │
  │   ████████████████████████████████░░░░░░░░░░░░░░░░                │
  │                                                                     │
  │   OpenAI        3.5 PRs/eng/day, 0 hand-written code              │
  │   █████████████████████████████████████████████████                │
  │                                                                     │
  │   Shopify       CEO: 0 → 2,000 commits in 2 months               │
  │   ████████████████████████████████████████████████░                │
  │                                                                     │
  │   EY            5,000+ engineers on Factory.ai Droids              │
  │   ████████████████████████████░░░░░░░░░░░░░░░░░░░░                │
  │                                                                     │
  │   Market        $7.8B (2025) → $52.6B (2030) at 46% CAGR         │
  │                                                                     │
  └─────────────────────────────────────────────────────────────────────┘
```

[Full enterprise adoption data with 14 company case studies →](docs/enterprise-adoption.md)

---

## Context Engineering

The single biggest lever for agent quality (from Spotify Part 2):

```
  ┌─────────────────────────────────────────────────────────────────┐
  │                                                                 │
  │  ✓  Describe the END STATE, not step-by-step instructions      │
  │  ✓  State PRECONDITIONS — tell agent when NOT to act           │
  │  ✓  ONE CHANGE at a time — combined changes exhaust context    │
  │  ✓  Define success as TESTS — not "make this better"           │
  │  ✓  Start CONSTRAINED — add tools only when prompts fail       │
  │                                                                 │
  │  Key findings:                                                  │
  │  • Same model scores 17pts apart in different harnesses        │
  │  • LangChain: 13.7pp gain on Terminal Bench via harness-only   │
  │  • Observation masking: 52% cheaper, 2.6% higher solve rates   │
  │  • BM25 pre-filtering reduces hallucination 22-37%             │
  │  • 85% perf degradation with large tool spaces (scope to ~20)  │
  │  • "Reasoning sandwich": high→low→high saves tokens + time    │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

```
  ┌─────────────────────────────────────────────┐
  │  Runtime        Node.js + TypeScript        │
  │  Server         Hono (lightweight, fast)    │
  │  LLM            OpenRouter (model-agnostic) │
  │  GitHub         Octokit + GitHub App auth   │
  │  Queue          BullMQ + Redis              │
  │  Audit DB       SQLite                      │
  │  Sandbox        Docker containers           │
  └─────────────────────────────────────────────┘
```

---

## Roadmap

```
  Phase 1 (NOW)              Phase 2 (NEXT)              Phase 3 (THEN)
  ━━━━━━━━━━━━━━             ━━━━━━━━━━━━━━━             ━━━━━━━━━━━━━━

  Core Factory               Harness + Middleware        General-Purpose
                             Refactor                    Factory

  ▪ 5 core agents            ▪ Middleware pipelines      ▪ Multi-repo support
  ▪ Governance layer         ▪ Sub-agent delegation      ▪ React dashboard
  ▪ Sandbox infra            ▪ Background GC agents      ▪ Warm pools
  ▪ Event routing            ▪ Layer enforcement         ▪ Fleet orchestration
  ▪ Audit logging            ▪ QMD knowledge search      ▪ Multi-tenancy

  Sources:                   Sources:                    Sources:
  Spotify, Stripe,           Deep Agents ★               Paperclip ★
  Karpathy, OpenAI           OpenAI, QMD                 Ramp, Stripe

  Metric: Agent PR %         Metric: Time to add         Metric: Onboard
                             new agent type              repo in <1 hour
```

[Full roadmap →](docs/roadmap.md)

---

## Project Structure

```
src/
  index.ts              # Webhook server (Hono)
  router.ts             # Event normalization + agent dispatch
  types.ts              # Shared type definitions
  agents/
    pr-reviewer.ts      # PR review agent
    ci-debugger.ts      # CI failure investigation + fix
    security.ts         # CVE/dependency patching
    incident.ts         # Production incident response
    merge.ts            # Merge conflict resolution
    runner.ts           # Agent execution harness
    judge.ts            # LLM judge (diff validation)
    prompts/            # Agent system prompts (markdown)
    cron/               # Scheduled background agents
  core/
    budget-guard.ts     # Per-agent LLM cost tracking + caps
    circuit-breaker.ts  # Failure rate detection + auto-disable
    context.ts          # Repo context builder
    db.ts               # SQLite audit log
    executor-gate.ts    # Pre-execution governance checks
    github.ts           # GitHub API client
    governance.ts       # Permissions, audit, blast radius
    llm.ts              # OpenRouter client with cost tracking
  queue/
    queue.ts            # BullMQ job definitions
    worker.ts           # BullMQ worker processing
  orchestrator/
    orchestrator.ts     # Symphony-style reconciliation loop
    reconciler.ts       # Task state machine
    workspace.ts        # Git worktree isolation
```

---

## Quick Start

```bash
git clone https://github.com/Chipagosfinest/software-factory.git
cd software-factory
npm install
cp .env.example .env
# Configure: GitHub App credentials, OpenRouter API key, Redis URL
npm run dev
```

---

## Research Deep-Dives

### Core Systems

| Document | Source | Key Patterns |
|----------|--------|-------------|
| [Harness Engineering](docs/harness-engineering.md) | OpenAI | AGENTS.md, layered architecture, Symphony framework, execution plans, AAIF/Linux Foundation |
| [Deep Agents](docs/deep-agents.md) | LangChain | Middleware pipelines, sub-agent delegation, observation masking, context engineering |
| [Autoresearch](docs/autoresearch.md) | Karpathy | NEVER STOP loop, ratchet pattern, three-part circuit breaker, crash recovery |
| [QMD](docs/qmd.md) | Tobi Lutke | Hybrid search (BM25 + vector + reranking), hallucination reduction, query expansion |
| [Paperclip](docs/paperclip.md) | Paperclip AI | Fleet orchestration, per-agent budgets, task checkout, heartbeat protocol |
| [Orchestrator](docs/orchestrator.md) | Symphony | Reconciliation loop, task state machine, git worktree isolation |
| [Agent Orchestrator](docs/agent-orchestrator.md) | Composio | Plugin-based fleet management, LLM task decomposition, fingerprinted review dispatch, 15-state session lifecycle, agent-agnostic interface |

### Competitive Landscape

| Document | Source | Key Patterns |
|----------|--------|-------------|
| [Competitive Analysis](docs/competitive-analysis.md) | — | Feature matrix: Software Factory vs Devin vs Factory.ai vs Copilot vs Blitzy vs Paperclip |
| [Devin + Factory.ai](docs/devin-factory.md) | Devin, Factory.ai | Architecture deep-dive, pricing, Nubank 8x efficiency, EY 5000 engineers |
| [Coding Agents Landscape](docs/coding-agents-landscape.md) | 12+ tools | Claude Code, Codex, Cursor, OpenHands, Aider, Cline, Amazon Q — full comparison |
| [Enterprise Adoption](docs/enterprise-adoption.md) | 14 companies | Uber, Anthropic, OpenAI, Spotify, Shopify, Microsoft, Goldman Sachs |

### Live Demonstrations

| Document | Source | Key Patterns |
|----------|--------|-------------|
| [Symphony + Carson Code Factory](docs/symphony-carson.md) | Ryan Carson (@ryancarson) | 6 bugs filed from phone, resolved in parallel — Symphony (Elixir) + Codex + Linear + GitHub. Ralph loop origin. Role inversion thesis. |

### Harness Engineering & Planning

| Document | Source | Key Patterns |
|----------|--------|-------------|
| [Harness Engineering: LangChain Deep Agents](docs/harness-engineering-langchain.md) | LangChain, Harrison Chase | 52.8→66.5% on Terminal Bench via harness-only changes; self-verification loops, loop detection middleware, reasoning sandwich, trace analysis, `write_todos` planning tool |
| [codex-planr](docs/codex-planr.md) | regenrek | Repo-local plan/fix/review workflow; honest `current.json` status tracking, Git-diff-based review, zero-dependency markdown skills |

### Deep-Dive Topics

| Document | Source | Key Patterns |
|----------|--------|-------------|
| [Context Engineering](docs/context-engineering.md) | Spotify, OpenAI, Anthropic, JetBrains | Observation masking (52% cheaper), AGENTS.md (60K repos), tool sprawl (85% degradation), dynamic assembly |
| [Agent Safety & Cost Control](docs/agent-safety-cost-control.md) | Stripe, OWASP, Microsoft | Kill switches, approval gates, blast radius, failure taxonomy, $400M cloud leak, Replit/AWS incidents |
| [Sandbox Isolation](docs/sandbox-isolation.md) | Spotify, Stripe, Ramp, E2B | Containers, VMs, warm pools, git worktrees, network isolation, cost at scale |
| [SWE-bench Ecosystem](docs/swe-bench-ecosystem.md) | Princeton, METR, Scale AI | 7 variants, leaderboard gaming, METR 19% slowdown paradox, real-world metrics |
| [MCP Ecosystem](docs/mcp-ecosystem-deep-dive.md) | Anthropic, Microsoft | Protocol spec, 81K stars, tool poisoning, MCPBench (64% accuracy), competing protocols |
| [Agent Memory Systems](docs/agent-memory-systems.md) | Napkin, Mem0, Letta, hmem | Progressive disclosure, BM25 vs vector, write-time vs read-time curation, memory security |

### Ecosystem & Architecture

| Document | Source | Key Patterns |
|----------|--------|-------------|
| [Potent Combos](docs/potent-combos.md) | All sources | 5 topology types, 6 high-synergy combos, mega-topology diagram, anti-patterns |
| [Competency Graph](docs/competency-graph.md) | All sources | 25-dimension competency matrix, complementary pairs, phase adoption map |
| [GitHub Ecosystem](docs/github-ecosystem.md) | GitHub | Agent HQ, Agentic Workflows, Copilot Agent, custom agents, MCP servers |
| [Dev Tools Stack](docs/dev-tools-stack.md) | Multiple | Linear Agent API, PagerDuty, Sentry, CI/CD — recommended stack at $42/mo |
| [Obsidian Knowledge](docs/obsidian-knowledge.md) | Obsidian/QMD | MCP servers, integration patterns, comparison with other knowledge stores |

---

## Design Principles

1. **PRs are the review gate** — every agent action produces a PR. Nothing merges without human approval.
2. **Constraints over instructions** — tell agents what NOT to do. Negative constraints outperform step-by-step guides.
3. **Bounded blast radius** — each agent scoped to relevant files. Cost caps prevent runaway spend.
4. **Shift feedback left** — local lint in <5s, then CI only if local passes. Max 2 CI retries.
5. **Verification loops, not hope** — agents call black-box verifiers before opening PRs. LLM judge catches scope creep.
6. **Cattle, not pets** — every sandbox identical and disposable. No persistent agent state.
7. **Compose via middleware, govern at the boundary** — capabilities composed through middleware pipelines. Governance enforced at the tool/sandbox level, not via LLM self-policing.

---

## References

**Environment Design:** [Harness Engineering](https://openai.com/index/harness-engineering/) | [Unlocking Codex Harness](https://openai.com/index/unlocking-the-codex-harness/) | [Codex Agent Loop](https://openai.com/index/unrolling-the-codex-agent-loop/)

**Production Systems:** [Spotify Honk Pt 1](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) | [Pt 2](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2) | [Pt 3](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3) | [Ramp Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) | [Stripe Minions Pt 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) | [Pt 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)

**Frameworks:** [Deep Agents](https://github.com/langchain-ai/deepagents) | [Open SWE](https://github.com/langchain-ai/open-swe) | [Harness Engineering Blog](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/) | [codex-planr](https://github.com/regenrek/codex-planr) | [Autoresearch](https://github.com/karpathy/autoresearch) | [QMD](https://github.com/tobi/qmd) | [Paperclip](https://github.com/paperclipai/paperclip) | [Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator)

**Extended Tools:** [Linear Agent API](https://linear.app/developers/agents) | [GitHub Agentic Workflows](https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows/) | [Devin](https://devin.ai) | [Factory.ai](https://factory.ai)

**Research:** [Harrison Chase @ Sequoia: Context Engineering](https://sequoiacap.com/podcast/context-engineering-our-way-to-long-horizon-agents-langchains-harrison-chase/) | [State of Agent Engineering 2026](https://www.langchain.com/state-of-agent-engineering) | [VentureBeat: Models alone won't get agents to production](https://venturebeat.com/orchestration/langchains-ceo-argues-that-better-models-alone-wont-get-your-ai-agent-to)

**Community:** [Emerging Harness Playbook](https://www.ignorance.ai/p/the-emerging-harness-engineering) | [background-agents.com](https://background-agents.com) | [Anthropic 2026 Agentic Coding Trends](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf) | [Interrupt 2026](https://interrupt.langchain.com/) (May 13-14, SF)

---

## License

Private — not yet open source.
