# Competency Graph — Research Sources

*Last updated: March 18, 2026*

Maps what each research source is best at, where they overlap, and how they compose into Software Factory.

---

## Competency Matrix

Scale: `████` = best-in-class, `███░` = strong, `██░░` = partial, `█░░░` = minimal, `░░░░` = absent

### Core Research Sources

| Competency | OpenAI Harness | Spotify Honk | Ramp Inspect | Stripe Minions | Deep Agents / Open SWE | Karpathy Auto | QMD | Paperclip | Composio |
|---|---|---|---|---|---|---|---|---|---|
| **Agent Internals** | | | | | | | | | |
| Context engineering | ███░ | ████ | ██░░ | ███░ | ███░ | █░░░ | ░░░░ | ░░░░ | █░░░ |
| Middleware composition | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ████ | ░░░░ | ░░░░ | ░░░░ | ████ |
| Sub-agent delegation | █░░░ | ░░░░ | ░░░░ | ░░░░ | ████ | ░░░░ | ░░░░ | ░░░░ | ██░░ |
| Context summarization | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ████ | ░░░░ | ░░░░ | ░░░░ | ░░░░ |
| Prompt/skills design | ████ | ███░ | ░░░░ | ███░ | ███░ | ██░░ | ░░░░ | ░░░░ | █░░░ |
| Planning tools | ██░░ | ░░░░ | ░░░░ | ░░░░ | ████ | ░░░░ | ░░░░ | ░░░░ | ██░░ |
| **Execution** | | | | | | | | | |
| Sandbox isolation | ██░░ | ████ | ████ | ████ | ███░ | █░░░ | ░░░░ | ░░░░ | ███░ |
| Warm pools / fast start | ░░░░ | ███░ | ████ | ████ | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ |
| Verification loops | ███░ | ████ | ██░░ | ████ | ███░ | ████ | ░░░░ | ░░░░ | ███░ |
| LLM judge / diff validation | ░░░░ | ████ | ░░░░ | ██░░ | ██░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ |
| Loop detection | ░░░░ | ██░░ | ░░░░ | ██░░ | ████ | ███░ | ░░░░ | ░░░░ | ░░░░ |
| Autonomous loop design | ██░░ | ███░ | ██░░ | ███░ | ██░░ | ████ | ░░░░ | ░░░░ | ██░░ |
| **Governance** | | | | | | | | | |
| Cost control / budgets | ██░░ | █░░░ | █░░░ | ██░░ | ░░░░ | ░░░░ | ░░░░ | ████ | ██░░ |
| Approval gates | █░░░ | ███░ | ██░░ | ██░░ | ██░░ | ░░░░ | ░░░░ | ████ | ░░░░ |
| Audit / compliance | ██░░ | ██░░ | ██░░ | ███░ | ░░░░ | ░░░░ | ░░░░ | ████ | ██░░ |
| Config versioning / rollback | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ████ | ░░░░ |
| Kill switch / safety | ██░░ | ██░░ | ░░░░ | ██░░ | ░░░░ | ░░░░ | ░░░░ | ███░ | ░░░░ |
| **Fleet Management** | | | | | | | | | |
| Multi-agent coordination | ░░░░ | ░░░░ | ██░░ | ██░░ | ███░ | ░░░░ | ░░░░ | ████ | ████ |
| Task assignment / locks | ░░░░ | ░░░░ | █░░░ | █░░░ | ░░░░ | ░░░░ | ░░░░ | ████ | ████ |
| Agent health monitoring | ░░░░ | ██░░ | ██░░ | ██░░ | ░░░░ | █░░░ | ░░░░ | ████ | ████ |
| Run persistence / transcripts | ░░░░ | ██░░ | ███░ | ██░░ | ░░░░ | ██░░ | ░░░░ | ████ | ██░░ |
| Observability UI | ░░░░ | ██░░ | ███░ | ██░░ | ░░░░ | ░░░░ | ░░░░ | ████ | ████ |
| **Knowledge** | | | | | | | | | |
| Knowledge search | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ████ | ░░░░ | ░░░░ |
| Codebase understanding | ████ | ███░ | ░░░░ | ███░ | ██░░ | ░░░░ | ██░░ | ░░░░ | █░░░ |
| Learning / fine-tuning | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ████ | ░░░░ | ░░░░ | ░░░░ |

**Key changes (March 18, 2026):**
- Deep Agents column updated to "Deep Agents / Open SWE" reflecting harness engineering gains (52.8→66.5% Terminal Bench)
- Added Composio column (plugin architecture, fleet management, 15-state lifecycle)
- Deep Agents verification/sandbox scores upgraded based on Open SWE v0.4 (Daytona sandboxes) and self-verification middleware
- Added "Planning tools" and "Loop detection" competency rows

### Extended Tools (March 2026)

| Competency | GitHub Copilot Agent | Devin | Factory.ai | Linear | Obsidian/MCP |
|---|---|---|---|---|---|
| **Agent Internals** | | | | | |
| Context engineering | ███░ | ██░░ | ███░ | ░░░░ | ░░░░ |
| Middleware composition | ░░░░ | █░░░ | ██░░ | ░░░░ | ░░░░ |
| Sub-agent delegation | ░░░░ | ███░ | ████ | ░░░░ | ░░░░ |
| Context summarization | ██░░ | ██░░ | ██░░ | ░░░░ | ░░░░ |
| Prompt/skills design | ██░░ | ██░░ | ███░ | ░░░░ | ░░░░ |
| **Execution** | | | | | |
| Sandbox isolation | ████ | ████ | ████ | ░░░░ | ░░░░ |
| Warm pools / fast start | ███░ | ██░░ | ████ | ░░░░ | ░░░░ |
| Verification loops | ███░ | ███░ | ████ | ░░░░ | ░░░░ |
| LLM judge / diff validation | ██░░ | ██░░ | ███░ | ░░░░ | ░░░░ |
| Autonomous loop design | ███░ | ████ | ████ | ░░░░ | ░░░░ |
| **Governance** | | | | | |
| Cost control / budgets | █░░░ | ██░░ | ███░ | ░░░░ | ░░░░ |
| Approval gates | ██░░ | ██░░ | ███░ | ░░░░ | ░░░░ |
| Audit / compliance | ██░░ | ██░░ | ████ | ░░░░ | ░░░░ |
| Config versioning / rollback | █░░░ | █░░░ | ███░ | ░░░░ | ░░░░ |
| Kill switch / safety | ██░░ | ██░░ | ███░ | ░░░░ | ░░░░ |
| **Fleet Management** | | | | | |
| Multi-agent coordination | ██░░ | ███░ | ████ | ░░░░ | ░░░░ |
| Task assignment / locks | █░░░ | ██░░ | ████ | ████ | ░░░░ |
| Agent health monitoring | █░░░ | ██░░ | ████ | ░░░░ | ░░░░ |
| Run persistence / transcripts | ██░░ | ███░ | ████ | ░░░░ | ░░░░ |
| Observability UI | ██░░ | ████ | ████ | ███░ | ░░░░ |
| **Knowledge** | | | | | |
| Knowledge search | █░░░ | █░░░ | ██░░ | ░░░░ | ████ |
| Codebase understanding | ███░ | ███░ | ████ | ░░░░ | █░░░ |
| Learning / fine-tuning | ░░░░ | ░░░░ | █░░░ | ░░░░ | ░░░░ |
| **New Competencies** | | | | | |
| IDE integration | ████ | ███░ | ██░░ | ██░░ | ██░░ |
| Project management | ░░░░ | █░░░ | ██░░ | ████ | ░░░░ |
| Knowledge graph / PKM | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ████ |

**Tool Descriptions:**
- **GitHub Copilot Agent** — GitHub-native background coding agent. Agentic Workflows (Feb 2026) run Markdown-defined automation in sandboxed environments. ~2 premium requests per run. SWE-bench not published.
- **Devin** — Fully autonomous cloud agent ($20/mo + $2.25/ACU). Full sandbox with own terminal/browser. 67% merge rate on well-defined tasks, 15% on ambiguous. Best at defined, bounded tasks.
- **Factory.ai** — Enterprise autonomous coding platform. Purpose-built for large orgs. Drafter (code gen), Reviewer (PR review), Documentor (doc gen). Focus on compliance and auditability.
- **Linear** — Purpose-built Agent API (Developer Preview). Agents are first-class workspace members, don't count as billable users. MCP server (1,800+ stars). Pre-built integrations with Cursor, Copilot, Devin, Codex.
- **Obsidian/MCP** — Local-first knowledge management with MCP plugin ecosystem. File-based (trivially writable by agents via Git). Combined with QMD-style search, provides the knowledge layer that coding agents lack.

---

## Complementary Pairs

Sources that are weak where the other is strong — maximum value when combined.

```
Deep Agents  ←→  Paperclip
  Agent INTERNALS        Agent FLEET
  (how one agent works)  (how many agents coordinate)
  Middleware, sub-agents  Budgets, locks, dashboards
  Context summarization   Run transcripts
  Skills directories      Org charts

Spotify Honk  ←→  Karpathy Autoresearch
  VERIFICATION           AUTONOMY
  (prove it works)       (never stop trying)
  LLM judge, sandbox     NEVER STOP loop
  Bounded retries        Crash recovery
  Convergence detect     Fixed time budgets

OpenAI Harness  ←→  QMD
  ENVIRONMENT DESIGN     KNOWLEDGE RETRIEVAL
  (structure the world)  (find the right context)
  AGENTS.md, layers      BM25 + vector + reranking
  Golden principles      Collections, expansion
  Background GC agents   MCP server interface

Ramp Inspect  ←→  Stripe Minions
  SPEED                  SCALE
  (fast execution)       (broad tooling)
  Warm pools, snapshots  400+ MCP tools
  Multiplayer sessions   Per-dir rules
  Modal sandboxes        Devbox philosophy

Deep Agents  ←→  Composio
  AGENT INTELLIGENCE     AGENT MANAGEMENT
  (one smart agent)      (many agents, any kind)
  write_todos planning   Plugin-based 8-slot arch
  Self-verification      LLM task decomposition
  Loop detection MW      15-state session lifecycle
  Reasoning sandwich     Fingerprinted review dispatch
```

---

## Software Factory Adoption Map

Which source feeds which phase:

```
Phase 1: Core Factory (NOW)
├── Spotify Honk ──────── Sandbox, verification loops, LLM judge
├── Stripe Minions ─────── Bounded retries, tool strategy
├── Karpathy Auto ──────── Loop design, convergence detection
├── Paperclip ──────────── Budget guard upgrade, transcript storage
├── OpenAI Harness ──────── AGENTS.md, prompt design
├── Linear ────────────── Agent API for task assignment, issue→agent trigger  ← NEW
└── GitHub Copilot Agent ── Agentic Workflows for CI/repo automation  ← NEW

Phase 2: Harness + Middleware Refactor (NEXT)
├── Deep Agents ────────── Middleware pipelines, sub-agents, context summarization  ★ PRIMARY
├── OpenAI Harness ──────── Layer enforcement, background GC agents, Symphony orchestrator
├── QMD ─────────────────── Knowledge retrieval for agent context
├── Obsidian/MCP ──────── Knowledge graph for agent memory + search  ← NEW
├── Paperclip ──────────── Heartbeat protocol for agent health
└── Devin ─────────────── Reference for autonomous loop patterns (67% merge rate benchmarks)  ← NEW

Phase 3: General-Purpose Factory (THEN)
├── Ramp Inspect ────────── Warm pools, multi-repo support
├── Stripe Minions ──────── 400+ tool ecosystem
├── Paperclip ──────────── React dashboard, multi-tenancy, fleet orchestration  ★ PRIMARY
├── Factory.ai ─────────── Enterprise compliance, fleet management reference  ← NEW
└── Deep Agents ────────── Backend abstraction for multi-node
```

---

## Strategic Takeaway

**No single source covers the full stack.** Software Factory needs all nine core sources, but at different times:

| Priority | Source | Why Now |
|----------|--------|---------|
| ★★★ | Deep Agents | Phase 2 hinges on middleware + sub-agents. Highest internal impact. |
| ★★★ | Spotify Honk | Verification loops are core to every agent. Already adopted. |
| ★★☆ | OpenAI Harness | Environment design is foundational. Partially adopted. |
| ★★☆ | Paperclip | Budget + transcripts now, dashboard in Phase 3. Fills governance gaps. |
| ★★☆ | Karpathy Auto | Loop patterns already in use. Crash recovery still needed. |
| ★☆☆ | Stripe Minions | Tool ecosystem matters at scale (Phase 3). |
| ★☆☆ | Ramp Inspect | Warm pools matter at scale (Phase 3). |
| ★☆☆ | QMD | Knowledge retrieval for Phase 2 agent context. |

**Deep Agents is the #1 priority for Phase 2.** Paperclip is the #1 priority for Phase 3. Both are complementary — one builds better agents, the other manages fleets of them.

### Extended Tool Priorities

| Priority | Tool | Why |
|----------|------|-----|
| ★★★ | Linear | Already in use. Agent API is purpose-built. Task assignment → agent trigger is the foundation of the event pipeline. |
| ★★☆ | GitHub Copilot Agent | Agentic Workflows automate repo hygiene (triage, docs, tests). Complements custom agents. |
| ★★☆ | Obsidian/MCP | Already in use (OpenClaw knowledge vault). QMD-style search on Obsidian vault fills the knowledge gap. |
| ★☆☆ | Devin | Reference implementation for autonomous background agents. 67% merge rate on bounded tasks sets the bar. |
| ★☆☆ | Factory.ai | Enterprise reference for Phase 3. Not needed until fleet scale. |
