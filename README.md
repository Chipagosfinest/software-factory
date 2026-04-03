# Software Factory

An agent-native software delivery platform that autonomously handles PR review, CI debugging, security patching, incident response, and merge conflict resolution. Background agents work continuously — developers stay **on the loop** instead of in the loop.

**Key thesis:** Agents produce working but low-quality code, and instruction-based constraints (CLAUDE.md, AGENTS.md) don't enforce quality. The solution is programmatic verification — deterministic checks + LLM judge + bounded retries. See [`docs/karpathy-software-factory-thesis.md`](docs/karpathy-software-factory-thesis.md) for the full evidence base.

---

## Why Build This?

Three companies have proven this pattern at scale:

| Company | System | Result | Key Insight |
|---------|--------|--------|-------------|
| **Spotify** | [Honk](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) | 1,500+ merged PRs, 50% of all PRs automated | Containerized K8s execution + verification loops + LLM judge |
| **Ramp** | [Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) | 30% of all PRs in months | Modal sandboxes with warm pools, multiplayer sessions, filesystem snapshots |
| **Stripe** | [Minions](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) | 1,300 PRs/week, zero human-written code | Goose fork + isolated devboxes (10s spin-up) + 400 MCP tools |

**The pattern is clear:** isolated sandboxes, PRs as review gates, humans review before merge.

---

## Agent Topologies

Nine topology types observed across production and research systems. How you wire agents matters more than how smart they are. This implementation uses a **Pipeline** topology with elements of **One-Shot Tree** for independent tasks.

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

Fire-and-forget. Dispatch fans out issues to independent agents. Each agent receives full context, produces one PR, and dies. No iteration, no feedback between siblings. Stripe processes 1,300 PRs/week this way. Partial success is the norm (~70% first-pass success on CI repair).

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

Linear with one feedback loop. Each stage transforms output and passes it forward. Judge can veto back to Fix (max 2 iterations). Spotify reports ~25% veto rate, catching scope creep and phantom fixes. Convergence detection stops the loop if the same error repeats.

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
```

Hierarchical delegation. Parent assigns tasks to children, children report upward. Budget flows down — each level gets a sub-allocation. Coordination overhead: messages traverse the hierarchy.

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
```

Peer-to-peer. Agents share state through a common workspace. No central coordinator. Warm pools mean agents spin up in <2s from snapshots. Humans can join live sessions and co-edit.

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
            ~12 experiments/hour
            ~100 experiments overnight
            git history = full audit trail
```

Self-directed with no external coordinator. One binary metric (improved / not improved) eliminates ambiguity. Karpathy completed 700 experiments in 2 days, discovering 20 optimizations yielding 11% training speedup. Shopify ran it overnight: 37 experiments, 19% performance gain.

### Sequential Multi-Agent (LangChain Open SWE)

```
  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │ MANAGER  │────▶│ PLANNER  │────▶│PROGRAMMER│────▶│ REVIEWER │
  │          │     │          │     │          │     │          │
  │ Route    │     │ Research │     │ Code in  │     │ Quality  │
  │ task     │     │ codebase │     │ sandbox  │     │ check    │
  └──────────┘     └──────────┘     └──────────┘     └──────────┘
```

Different specialized agents with distinct roles. Unlike Pipeline (same agent through stages), each agent has its own system prompt, tools, and reasoning mode. The Planner never writes code; the Programmer never reviews. Harness-only changes produced +13.7pp gain without changing the model.

### Deterministic Workflow Graph (Fabro)

```
   graph workflow {
     lint -> test -> implement -> review -> merge
     implement -> {sandbox, typecheck} [parallel]
     review -> implement [loop, max: 2]
     review -> HUMAN_GATE [approval]
   }
```

Human defines a DOT graph with branching, loops, parallelism, and approval gates. CSS-like stylesheets route steps to appropriate models (Opus for implementation, Haiku for linting). Git commits at every stage create checkpoints. Trades flexibility for reproducibility.

### Topology Comparison

| Topology | Control | Who Decides Path | Best Metric |
|----------|---------|-----------------|-------------|
| **One-Shot Tree** | Static | Dispatcher (fire-and-forget) | 1,300 PRs/week (Stripe) |
| **Pipeline** | Sequential | Hardcoded pipeline order | ~25% veto catch rate (Spotify) |
| **Org Chart** | Hierarchical | Parent delegates to children | $50 budget enforcement (Paperclip) |
| **Mesh** | Peer-to-peer | Agents discover work independently | <2s startup (Ramp) |
| **Ratchet** | Self-directed | Agent picks what to try next | ~100 experiments/night (Karpathy) |
| **Sequential Multi-Agent** | Hand-off | Fixed role sequence | +13.7pp harness-only (LangChain) |
| **Dynamic DAG** | RL-generated | RL orchestrator creates topology | +14.6% on APPS (AgentConductor) |
| **Deterministic Graph** | Prescriptive | Human-authored DOT graph | Reproducible, auditable (Fabro) |

**The autonomy spectrum:**

```
  Prescriptive ◄──────────────────────────────────────────────► Autonomous

  Fabro      Pipeline    Org Chart    Mesh    Seq. Multi    One-Shot    Ratchet
  (human     (fixed      (delegated   (shared  (role-based   (dispatch   (agent
   graph)     stages)     hierarchy)   state)   autonomy)     + forget)   decides)
```

Full topology analysis with combos, anti-patterns, and build profiles: [`docs/potent-combos.md`](docs/potent-combos.md)

---

## Architecture

```
GitHub Webhooks / Cron / Linear Issues
              │
        Event Router (src/router.ts)
              │
     ┌────────┼────────┬──────────┬──────────┐
     │        │        │          │          │
  PR Review  CI Debug  Security  Incident  Merge
   Agent      Agent    Agent     Agent     Agent
     │        │        │          │          │
     └────────┴────────┴──────────┴──────────┘
              │                   │
        Governance Layer    GitHub API
       (gate → budget →    (PRs/comments)
        breaker → timeout)
              │
        Human Review Gate
       (all output = PRs)
```

### Two Execution Paths

**Path 1: Webhook-driven** (reactive)
```
GitHub Webhook → POST /webhook/github → EventRouter → BullMQ Queue → Worker → Agent → GitHub API
```
Triggers: PR opened/updated, CI failure, Dependabot alert. Skips bot PRs, drafts, and `skip-review` labels.

**Path 2: Orchestrator-driven** (proactive, Symphony-style)
```
Linear Issue → Orchestrator Poll → Reconciler → Workspace (git worktree) → BullMQ → Agent → GitHub API
```
Disabled by default. Polls Linear every 30s, creates isolated git worktrees per task, manages a state machine with exponential backoff and convergence detection.

Both paths converge at the BullMQ queue and share the same Agent Runner.

---

## Agents

### Webhook Agents (can modify repos)

| Agent | Trigger | Output | Constraints |
|-------|---------|--------|-------------|
| **PR Reviewer** | `pull_request.opened` / `synchronize` | Review comments + approve/request changes | Cannot create PRs |
| **CI Debugger** | `check_suite.completed` (failure) | Diagnosis comment + fix PR | Max 10 files, 200 lines |
| **Security Patcher** | `dependabot_alert.created` | Patch PR | Lockfiles only |
| **Incident Responder** | PagerDuty / custom alert | RCA + fix PR | Max 10 files, 200 lines |
| **Merge Resolver** | PR with conflict label | Conflict resolution commit | Max 20 files, 500 lines |

---

## Safety & Governance

Five layers checked in order on every agent run:

1. **Global Daily Budget** — Hard cap across all agents (default $20/day). Warns at 80%.
2. **Executor Gate** — Kill switch via `executor_gate.json`. Hot-reloaded on every check.
3. **Per-Agent Governance** — File patterns, max files/lines changed, cost limit, PR creation rights.
4. **Circuit Breaker** — Per-API (OpenRouter, GitHub, Linear). Opens after 3 consecutive failures, half-open test after 60s.
5. **Timeout** — Agent runs race against configurable timeout (default 300s).

---

## Verification

The quality problem is industry-wide. Alibaba's SWE-CI benchmark shows 75% of agents break working code. AI PRs have 1.7x more issues than human PRs (CodeRabbit, 470 PRs). Three layers address this:

```
  Agent generates code
         │
  ┌──────▼──────────────────────────────────────────┐
  │  Layer 1: Deterministic Checks (free, fast)      │
  │  AST complexity, duplication, linting, types     │
  └──────┬──────────────────────────────────────────┘
         │ all pass
  ┌──────▼──────────────────────────────────────────┐
  │  Layer 2: Test Execution (hard gate)             │
  │  Build succeeds? Unit tests pass?                │
  └──────┬──────────────────────────────────────────┘
         │ all pass
  ┌──────▼──────────────────────────────────────────┐
  │  Layer 3: LLM-as-Judge (soft signal)             │
  │  Scope check, readability, architecture          │
  └──────┬──────────────────────────────────────────┘
         │
    pass ├──────▶ Open PR for human review
         │
    veto ├──▶ retry (max 2) ──▶ flag for human
```

- Layer 1 catches 60%+ of issues for free
- Layer 2 is the hard gate — if it doesn't build/test, it doesn't ship
- Layer 3 catches subtle quality issues (scope creep, readability)
- Goodhart's Law risk: agents optimized for LLM judge approval will game the metric — hard constraints are the real gate

---

## Context Engineering

From Spotify's Part 2 — context engineering is the single biggest lever for agent quality.

**Prompt design:**
- Describe the end state, not step-by-step instructions
- State preconditions — tell the agent when NOT to act
- Use concrete examples — code snippets heavily influence output quality
- One change at a time — combining changes exhausts context and produces partial results
- Define success as tests — "make this code better" fails; "these tests should pass" succeeds

**Tool strategy:**
- Spotify: minimal tools (verify MCP, Git, restricted Bash). Context goes in the prompt.
- Stripe: 400+ MCP tools via Toolshed, pre-hydrated before agent starts.
- Start constrained, add tools only when prompts aren't enough.

**Conditional rules (Stripe pattern):**
- Global agent rules don't work in large codebases — they conflict across domains
- Apply rules conditionally by subdirectory
- Use scoped config files (CLAUDE.md, AGENTS.md) per directory

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Runtime** | Node.js + TypeScript | Type safety, ecosystem |
| **Server** | Hono | Lightweight, fast |
| **LLM** | OpenRouter | Model-agnostic (Claude, GPT, Gemini) |
| **GitHub** | Octokit + GitHub App auth | PR creation, review comments |
| **Queue** | BullMQ + Redis | Reliable event processing |
| **Local DB** | SQLite (better-sqlite3) | Audit logs, agent state |
| **External DB** | Supabase (PostgreSQL) | Signals, validations |
| **Sandbox** | Docker containers / git worktrees | Isolated execution per agent |

---

## Quick Start

```bash
git clone <repo-url>
cd software-factory
npm install
cp .env.example .env
# Configure: GitHub App credentials, OpenRouter API key, Redis URL
npm run dev
```

---

## Design Principles

1. **PRs are the review gate** — Every agent action produces a PR or comment. Nothing merges without human approval.
2. **Hooks over instructions** — CLAUDE.md rules get violated. Only hooks that `exit 2` mechanically enforce constraints.
3. **Bounded blast radius** — Each agent operates on scoped files with cost caps.
4. **Shift feedback left** — Catch errors locally before expensive CI. Max 2 CI retry rounds.
5. **Verification loops, not hope** — Agents must call verifiers before opening PRs. LLM judge catches scope creep.
6. **Cattle, not pets** — Every sandbox is identical and disposable. No persistent agent state.
7. **3 focused workers > 10 parallel** — Focused, scoped agents outperform swarm patterns.

---

## References

### Production Systems

| System | Scale | Key Insight |
|--------|-------|-------------|
| [Stripe Minions](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) | 1,300 PRs/week | One-shot tree topology, 400+ MCP tools, warm EC2 instances |
| [Stripe Minions Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2) | Zero human-written code | Devboxes, conditional rules, max 2 CI retries |
| [Spotify Honk Part 1](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) | 650+ PRs/month | Containerized K8s fleet management |
| [Spotify Honk Part 2](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2) | 60-90% time savings | Context engineering, Claude Code as top agent |
| [Spotify Honk Part 3](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3) | ~25% veto rate | Verification loops, LLM judge |
| [Ramp Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) | ~50% of merged PRs | Modal snapshot-based warm pools |
| [Ramp on Modal](https://modal.com/blog/how-ramp-built-a-full-context-background-coding-agent-on-modal) | 1,000 Datadog monitors | Self-maintaining code, auto-generated monitoring |
| [OpenAI Harness Engineering](https://openai.com/index/harness-engineering/) | 1M lines, 1,500 PRs | Environment-first architecture, 3.5 PRs/engineer/day |
| [Nubank + Devin](https://building.nubank.com/enhancing-engineering-workflows-with-ai-a-real-world-experience/) | 100K data class migrations | 12x efficiency, 20x cost savings with fine-tuned Devin |
| [Coinbase Cloudbot](https://www.coinbase.com/blog/Tools-for-Developer-Productivity-at-Coinbase) | Internal platform | Cloud sandboxes, Slack-first invocation, agent councils |

### Architecture & Patterns

- [LangChain Harness Engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/) — Harness-only improvements: 52.8% → 66.5% on Terminal Bench 2.0 without model changes
- [LangChain Deep Agents](https://github.com/langchain-ai/deepagents) — Middleware composition, planning tool, sub-agent delegation, filesystem backend
- [Context Engineering (Martin Fowler)](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html) — Dynamic context assembly vs static prompts
- [Context Rot (Chroma Research)](https://research.trychroma.com/context-rot) — How context degrades over agent turns
- [Cloudflare Dynamic Workers](https://blog.cloudflare.com/dynamic-workers/) — V8 isolates, Code Mode collapses 2,500+ APIs to ~1,000 tokens
- [Sandbox Architecture (Weng Jialin)](https://wengjialin.com/blog/agent-sandbox/) — Agent-inside vs sandbox-as-tool patterns
- [Sandbox Comparison (Northflank)](https://northflank.com/blog/best-sandboxes-for-coding-agents) — Side-by-side comparison of agent sandbox platforms
- [Agent Filesystems (Arize)](https://arize.com/blog/agent-interfaces-in-2026-filesystem-vs-api-vs-database-what-actually-works/) — Filesystem vs API vs database interfaces for agents
- [Composio Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator) — Fleet management with plugin-based architecture (4.5K stars)
- [Paperclip](https://github.com/paperclipai/paperclip) — Org-chart orchestration with budgets, governance, live monitoring (26.7K stars)

### Research & Benchmarks

- [SWE-bench (ICLR 2024)](https://arxiv.org/abs/2310.06770) — 2,294 real GitHub issues, baseline evaluation standard
- [SWE-bench Pro (Scale AI)](https://arxiv.org/abs/2509.16941) — 1,865 long-horizon tasks across Python, Go, TypeScript, JavaScript
- [SWE-bench Multimodal](https://arxiv.org/abs/2410.03859) — 617 visual UI/diagram tasks, only ~12% solved by top systems
- [Alibaba SWE-CI](https://arxiv.org/abs/2504.08057) — 75% of agents break working code over consecutive PRs
- [AgentConductor](https://huggingface.co/papers/2602.17100) — RL-generated dynamic DAG topologies, +14.6% on APPS, 68% cost reduction
- [Building Effective AI Coding Agents](https://arxiv.org/abs/2603.05344) — Deep patterns for agent harness design
- [Agent-as-a-Judge Survey](https://arxiv.org/pdf/2601.05111) — LLM judge alone catches ~45% of errors, combined with deterministic tools reaches 94%
- [LLM Code Reviewers](https://arxiv.org/abs/2603.00539) — Evaluates judge reliability for code review
- [Anthropic 2026 Agentic Coding Trends](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf) — Context engineering, tool use patterns, error reduction metrics

### Platforms & Ecosystems

- [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/specification) — Open standard for connecting AI to external tools (MIT, 7.5K stars)
- [AGENTS.md Standard](https://agents.md/) — Open protocol for making repos agent-friendly
- [GitHub Agent HQ](https://github.blog/news-insights/company-news/welcome-home-agents/) — Multi-agent orchestration, Agentic Workflows, Copilot Coding Agent
- [Linear Agent API](https://linear.app/) — Agent-first project management (Developer Preview, March 2026)
- [Open-Inspect](https://github.com/ColeMurray/background-agents) — Open-source background agent system, Cloudflare Workers + Modal
- [background-agents.com](https://background-agents.com) — Industry overview of background agent platforms

### Agent Memory & Knowledge

- [Karpathy Autoresearch](https://github.com/karpathy/autoresearch) — Overnight research loop: prepare → train → evaluate → accept/reject
- [QMD (Tobi Lutke)](https://github.com/tobi/qmd) — Hybrid search (BM25 + vector + LLM reranking) with MCP server (16K stars)
- [Napkin](https://github.com/Michaelliv/napkin) — Progressive disclosure memory, BM25, sql.js, 99.8% recall on HotpotQA
- [TigerFS](https://tigerfs.io) — Mount databases as POSIX directories for transactional multi-agent state
- [AgentFS (Turso)](https://github.com/tursodatabase/agentfs) — Database-as-directory for agent workspaces

### Strategy & Cost

- [Karpathy Software Factory Thesis](docs/karpathy-software-factory-thesis.md) — Code quality findings, instruction compliance crisis, fleet management
- [Agent Pricing Analysis (Cosine)](https://cosine.sh/blog/ai-coding-agent-pricing-task-vs-token) — Per-run vs token-based vs task-based pricing models
- [FinOps for Agentic AI](https://analyticsweek.com/finops-for-agentic-ai-cloud-cost-2026/) — $400M collective cloud leak estimate
- [Stripe Walls > Models](https://www.anup.io/stripes-coding-agents-the-walls-matter-more-than-the-model/) — Why governance matters more than model capability

### Research Corpus

The `docs/` directory contains 34 research documents covering sandbox architectures, agent memory systems, harness engineering, context engineering, agent topologies, competitive landscape, and more. See [AGENTS.md](AGENTS.md) for a navigable index.

---

## License

Private — not yet open source.
