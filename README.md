# Autonomous Coding Agents: Research Corpus

*Last updated: March 18, 2026 | 27 research documents | 10+ production systems studied*

> How do you build agents that ship code while humans sleep?
>
> This repo collects patterns from 10+ production systems (Stripe, Spotify, OpenAI, Ramp, LangChain, Karpathy) and distills them into reusable architectural primitives.

```
                    THE QUESTION THIS RESEARCH ANSWERS

  "What separates agents that ship 1,300 PRs/week (Stripe)
   from agents that loop forever and burn $7K in API costs?"

                              Answer:
            Harness engineering > model selection.
            Governance > trust.
            Verification loops > hope.
```

---

## The Core Insight

The harness — not the model — determines agent quality.

```
  ┌─────────────────────────────────────────────────────────────────┐
  │                                                                 │
  │  Same model, different harness = 17pts apart (Spotify)         │
  │  Same model, harness-only changes = +13.7pp (LangChain)       │
  │  xhigh reasoning everywhere = WORSE (53.9% vs 66.5%)          │
  │                                                                 │
  │  Observation masking: 52% cheaper, 2.6% higher solve rates     │
  │  BM25 pre-filtering reduces hallucination 22-37%               │
  │  85% perf degradation with large tool spaces (scope to ~20)    │
  │  "Reasoning sandwich": high→low→high saves tokens + time      │
  │  Sandboxing reduces agent stalls by 40% (Cursor)               │
  │                                                                 │
  │  Anthropic 2026 Report:                                        │
  │  • 78% of sessions now do multi-file edits (was 34% in 2025)  │
  │  • 47 tool calls per session average                           │
  │  • 89% acceptance rate with diff summaries (62% without)       │
  │  • Context engineering reduces errors by 40%                    │
  │  • 2-4x faster feature delivery (plan → production)            │
  │                                                                 │
  │  ✓  Describe END STATE, not step-by-step instructions          │
  │  ✓  State PRECONDITIONS — tell agent when NOT to act           │
  │  ✓  ONE CHANGE at a time — combined changes exhaust context    │
  │  ✓  Define success as TESTS — not "make this better"           │
  │  ✓  Start CONSTRAINED — add tools only when prompts fail       │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘
```

---

## Research Sources

Ten production systems and open-source frameworks, organized by what they teach:

```
  ┌──────────────────────────────────────────────────────────────────────┐
  │                     RESEARCH LANDSCAPE                              │
  │                                                                      │
  │  HARNESS               DEPLOYMENT              COMPOSITION          │
  │  ENGINEERING            & SCALE                 & PLANNING           │
  │                                                                      │
  │  ┌──────────┐    ┌──────────────────┐    ┌──────────────┐          │
  │  │  OpenAI  │    │ Spotify  Ramp    │    │ Deep Agents  │          │
  │  │ Harness  │    │ Honk    Inspect  │    │ + Open SWE   │          │
  │  │          │    │                  │    │              │          │
  │  │ AGENTS.md│    │ Stripe  Minions  │    │ Middleware   │          │
  │  │ Layers   │    │                  │    │ Sub-agents   │          │
  │  │ GC bots  │    │ Sandboxes, PRs   │    │ write_todos  │          │
  │  └──────────┘    │ Warm pools, retry│    │ codex-planr  │          │
  │                  └──────────────────┘    └──────────────┘          │
  │                                                                      │
  │  KNOWLEDGE           AUTONOMY           FLEET MGMT                   │
  │                                                                      │
  │  ┌──────────┐    ┌──────────┐    ┌──────────┐  ┌─────────┐        │
  │  │   QMD    │    │Autoresrch│    │ Composio │  │Paperclip│        │
  │  │ (Lutke)  │    │(Karpathy)│    │  Agent   │  │   AI    │        │
  │  │          │    │          │    │  Orch.   │  │         │        │
  │  │ BM25 +   │    │NEVER STOP│    │          │  │ Budgets │        │
  │  │ Vector + │    │Git memory│    │ Plugins  │  │ Tasks   │        │
  │  │ Reranking│    │Ratchet   │    │ Worktrees│  │ Health  │        │
  │  └──────────┘    └──────────┘    │ States   │  │Dashboard│        │
  │                                  └──────────┘  └─────────┘        │
  └──────────────────────────────────────────────────────────────────────┘
```

| Source | System | Result | Key Insight |
|--------|--------|--------|-------------|
| **OpenAI** | [Harness Engineering](https://openai.com/index/harness-engineering/) | ~1M lines, 0 hand-written, 3.5 PRs/eng/day | AGENTS.md as map, layered architecture, background GC agents |
| **Spotify** | [Honk](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) | 1,500+ merged PRs, 50% automated | K8s containers + verification loops + LLM judge (~25% veto rate) |
| **Ramp** | [Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) | 30% of all PRs | Modal sandboxes, warm pools, multiplayer sessions |
| **Stripe** | [Minions](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) | 1,300 PRs/week | Goose fork + devboxes + 400 MCP tools, max 2 CI retries |
| **LangChain** | [Deep Agents](https://github.com/langchain-ai/deepagents) / [Open SWE](https://github.com/langchain-ai/open-swe) | 52.8→66.5% Terminal Bench (harness-only) | Self-verification, loop detection, reasoning sandwich, Manager→Planner→Programmer→Reviewer |
| **Karpathy** | [Autoresearch](https://github.com/karpathy/autoresearch) | ~100 experiments overnight | NEVER STOP loop, single-metric acceptance, fixed time budgets |
| **Lutke** | [QMD](https://github.com/tobi/qmd) | Local-first knowledge search | Hybrid search (BM25 + vector + LLM reranking), MCP server |
| **Paperclip** | [paperclipai/paperclip](https://github.com/paperclipai/paperclip) | 26.7k stars | Per-agent budgets, task checkout locks, heartbeat health, React dashboard |
| **Composio** | [Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator) | 4.5k stars | Plugin-based 8-slot architecture, LLM task decomposition, 15-state session lifecycle |
| **Carson** | [Symphony](https://x.com/ryancarson/status/2033958219891028302) | $297 API → $50K value | Elixir/OTP orchestrator + Codex, 10 parallel agents, role inversion |

---

## Competency Heat Map

Where each source is best — and which patterns complement each other:

```
Scale: ████ best-in-class  ███░ strong  ██░░ partial  █░░░ minimal  ░░░░ absent
```

| Competency | OpenAI | Spotify | Stripe | Deep Agents | Karpathy | QMD | Paperclip | Composio |
|---|---|---|---|---|---|---|---|---|
| Context engineering | ███░ | ████ | ███░ | ███░ | █░░░ | ░░░░ | ░░░░ | █░░░ |
| Middleware/composition | ░░░░ | ░░░░ | ░░░░ | ████ | ░░░░ | ░░░░ | ░░░░ | ████ |
| Sandbox isolation | ██░░ | ████ | ████ | ███░ | █░░░ | ░░░░ | ░░░░ | ███░ |
| Verification loops | ███░ | ████ | ████ | ███░ | ████ | ░░░░ | ░░░░ | ███░ |
| Planning tools | ██░░ | ░░░░ | ░░░░ | ████ | ░░░░ | ░░░░ | ░░░░ | ██░░ |
| LLM judge | ░░░░ | ████ | ██░░ | ██░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ |
| Cost control | ██░░ | █░░░ | ██░░ | ░░░░ | ░░░░ | ░░░░ | ████ | ██░░ |
| Fleet management | ░░░░ | ░░░░ | ██░░ | ███░ | ░░░░ | ░░░░ | ████ | ████ |
| Knowledge search | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ░░░░ | ████ | ░░░░ | ░░░░ |

[Full 25-dimension matrix →](docs/competency-graph.md)

---

## Agent Topology Patterns

Five topology types observed across production systems:

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

[Full topology diagrams + 6 combo architectures →](docs/potent-combos.md)

---

## Which Architecture Fits Your Team?

Six combos mapped to six build profiles — pick the right topology for your constraints:

```
  ┌─────────────────────────────────────────────────────────────────────┐
  │                                                                     │
  │  SOLO HACKER ($50/mo)                                              │
  │  → Combo 5: Copilot + Ratchet. One-shot tree. No fleet overhead.   │
  │                                                                     │
  │  STARTUP 5-20 ($500/mo)                                            │
  │  → Combo 5 + 3: Copilot + Knowledge + CI Debug pipeline.           │
  │                                                                     │
  │  GROWTH 20-100 ($5K/mo)                                            │
  │  → Combo 1 + 3 + 5 + 6: Deep Agents + Paperclip fleet + Linear.   │
  │    Org Chart topology. Budget controls. Dashboard.                  │
  │                                                                     │
  │  ENTERPRISE 100+ ($50K/mo)                                         │
  │  → Full Mega-Topology. All combos. Compliance. Audit. SSO.         │
  │                                                                     │
  │  RESEARCH / ML (variable)                                          │
  │  → Combo 2: Verified Ratchet. Optimize one metric forever.         │
  │                                                                     │
  │  OPEN SOURCE ($50/mo)                                              │
  │  → Combo 5 + 3: Copilot triage + CI debug. Read-only defaults.    │
  │                                                                     │
  └─────────────────────────────────────────────────────────────────────┘
```

[Full build profiles + decision flowchart →](docs/potent-combos.md#5-build-profile--topology-selector)

---

## Governance Patterns

What separates "autonomous" from "uncontrolled" — extracted from all 10 sources:

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

## Enterprise Adoption (March 2026)

```
  ┌─────────────────────────────────────────────────────────────────────┐
  │                                                                     │
  │   Stripe        1,300 PRs/week via Minions                         │
  │   ██████████████████████████████████████████████████               │
  │                                                                     │
  │   OpenAI        3.5 PRs/eng/day, 0 hand-written code              │
  │   █████████████████████████████████████████████████                │
  │                                                                     │
  │   Shopify       CEO: 0 → 2,000 commits in 2 months               │
  │   ████████████████████████████████████████████████░                │
  │                                                                     │
  │   Uber          84% of engineers using AI tools                    │
  │   ████████████████████████████████████████░░░░░░░░░░               │
  │                                                                     │
  │   Spotify       650+ agent PRs merged/month                        │
  │   ████████████████████████████████░░░░░░░░░░░░░░░░                │
  │                                                                     │
  │   EY            5,000+ engineers on Factory.ai Droids              │
  │   ████████████████████████████░░░░░░░░░░░░░░░░░░░░                │
  │                                                                     │
  │   Market        $7.8B (2025) → $52.6B (2030) at 46% CAGR         │
  │                                                                     │
  │   LangChain     57% have agents in prod, 89% observability        │
  │   survey        Only 52% adopted evals. 32% cite quality barrier  │
  │                                                                     │
  └─────────────────────────────────────────────────────────────────────┘
```

[14 company case studies →](docs/enterprise-adoption.md)

---

## The Role Inversion

Ryan Carson proved it live: filed 6 bugs from his phone at the doctor's office. First merged before he left.

```
  Before:  Developer = 80% writing code  + 20% deciding what to build
  After:   Developer = 80% filing issues + 20% reviewing agent PRs

  The bottleneck moved from IMPLEMENTATION → JUDGMENT.

  Cost: $297 in API calls for $50,000 worth of work.
  Setup: 2-3 days. Runs 14-hour unattended sessions.
```

```
  Developer (phone) ──▶ Linear Issue ──▶ Symphony (Elixir/OTP)
                                              │
                                     ┌────────┼────────┐
                                     ▼        ▼        ▼
                                  Codex 1  Codex 2  Codex 3  ... (10 max)
                               (isolated (isolated (isolated
                                git clone) git clone) git clone)
                                     │        │        │
                                     └────────┼────────┘
                                              ▼
                                       PRs on GitHub → Human reviews → Merged ✓
```

[Full Symphony architecture →](docs/symphony-carson.md)

---

## Patterns That Work

Seven principles extracted from studying all 10 systems:

1. **PRs are the review gate** — every agent action produces a PR. Nothing merges without human approval.
2. **Constraints over instructions** — tell agents what NOT to do. Negative constraints outperform step-by-step guides.
3. **Bounded blast radius** — each agent scoped to relevant files. Cost caps prevent runaway spend.
4. **Shift feedback left** — local lint in <5s, then CI only if local passes. Max 2 CI retries.
5. **Verification loops, not hope** — agents call black-box verifiers before opening PRs. LLM judge catches scope creep.
6. **Cattle, not pets** — every sandbox identical and disposable. No persistent agent state.
7. **Compose via middleware, govern at the boundary** — governance enforced at the tool/sandbox level, not via LLM self-policing.

---

## Research Index

### Core Systems

| Document | Source | Key Patterns |
|----------|--------|-------------|
| [Harness Engineering (OpenAI)](docs/harness-engineering.md) | OpenAI | AGENTS.md, layered architecture, Symphony framework, execution plans |
| [Deep Agents](docs/deep-agents.md) | LangChain | Middleware pipelines, sub-agent delegation, observation masking |
| [Harness Engineering (LangChain)](docs/harness-engineering-langchain.md) | LangChain, Harrison Chase | Self-verification loops, loop detection, reasoning sandwich, Open SWE pipeline |
| [codex-planr](docs/codex-planr.md) | regenrek | Repo-local plan/fix/review, honest `current.json` status, Git-diff review |
| [Autoresearch](docs/autoresearch.md) | Karpathy | NEVER STOP loop, ratchet pattern, three-part circuit breaker |
| [QMD](docs/qmd.md) | Tobi Lutke | Hybrid search (BM25 + vector + reranking), hallucination reduction |
| [Paperclip](docs/paperclip.md) | Paperclip AI | Fleet orchestration, per-agent budgets, task checkout, heartbeat |
| [Orchestrator](docs/orchestrator.md) | Symphony | Reconciliation loop, task state machine, git worktree isolation |
| [Agent Orchestrator](docs/agent-orchestrator.md) | Composio | Plugin-based fleet management, LLM task decomposition, 15-state lifecycle |

### Landscape & Adoption

| Document | Source | Key Patterns |
|----------|--------|-------------|
| [Competitive Analysis](docs/competitive-analysis.md) | — | Feature matrix across 6 products |
| [Devin + Factory.ai](docs/devin-factory.md) | Devin, Factory.ai | Architecture, pricing, Nubank 8x, EY 5000 engineers |
| [Coding Agents Landscape](docs/coding-agents-landscape.md) | 12+ tools | Claude Code, Codex, Cursor, OpenHands, Aider, Cline, Amazon Q |
| [Enterprise Adoption](docs/enterprise-adoption.md) | 14 companies | Uber, Anthropic, OpenAI, Spotify, Shopify, Microsoft, Goldman Sachs |
| [Symphony + Carson](docs/symphony-carson.md) | Ryan Carson | Live code factory demo, role inversion thesis |

### Deep-Dive Topics

| Document | Source | Key Patterns |
|----------|--------|-------------|
| [Context Engineering](docs/context-engineering.md) | Spotify, OpenAI, Anthropic | Observation masking, AGENTS.md (60K repos), tool sprawl, dynamic assembly |
| [Agent Safety & Cost Control](docs/agent-safety-cost-control.md) | Stripe, OWASP, Microsoft | Kill switches, approval gates, blast radius, $400M cloud leak |
| [Sandbox Isolation](docs/sandbox-isolation.md) | Spotify, Stripe, Ramp, E2B | Containers, VMs, warm pools, git worktrees, network isolation |
| [Sandbox Architecture 2026](docs/sandbox-architecture-2026.md) | Weng Jialin, Rivet, GKE, Northflank | Two patterns (agent-in-sandbox vs sandbox-as-tool), warm pools, universal HTTP adapter, enterprise 3-tier arch |
| [SWE-bench Ecosystem](docs/swe-bench-ecosystem.md) | Princeton, METR, Scale AI | 7 variants, leaderboard gaming, METR 19% slowdown paradox |
| [MCP Ecosystem](docs/mcp-ecosystem-deep-dive.md) | Anthropic, Microsoft | Protocol spec, 81K stars, tool poisoning, MCPBench (64% accuracy) |
| [Agent Memory Systems](docs/agent-memory-systems.md) | Napkin, Mem0, Letta, hmem | Progressive disclosure, BM25 vs vector, memory security |

### Architecture & Patterns

| Document | Source | Key Patterns |
|----------|--------|-------------|
| [Potent Combos + Build Profiles](docs/potent-combos.md) | All sources | 5 topologies, 6 combos, 6 build profiles, decision flowchart, anti-patterns |
| [Competency Graph](docs/competency-graph.md) | All sources | 25-dimension matrix, complementary pairs, phase adoption map |
| [GitHub Ecosystem](docs/github-ecosystem.md) | GitHub | Agent HQ, Agentic Workflows, Copilot Agent, MCP servers |
| [Dev Tools Stack](docs/dev-tools-stack.md) | Multiple | Linear Agent API, PagerDuty, Sentry, CI/CD at $42/mo |
| [Obsidian Knowledge](docs/obsidian-knowledge.md) | Obsidian/QMD | MCP servers, integration patterns, knowledge stores |

---

## References

**Harness Engineering:** [OpenAI](https://openai.com/index/harness-engineering/) | [Unlocking Codex](https://openai.com/index/unlocking-the-codex-harness/) | [Codex Agent Loop](https://openai.com/index/unrolling-the-codex-agent-loop/) | [LangChain Blog](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/) | [Harrison Chase @ Sequoia](https://sequoiacap.com/podcast/context-engineering-our-way-to-long-horizon-agents-langchains-harrison-chase/)

**Production Systems:** [Spotify Honk Pt 1](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) | [Pt 2](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2) | [Pt 3](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3) | [Ramp Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) | [Stripe Minions Pt 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) | [Pt 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)

**Frameworks:** [Deep Agents](https://github.com/langchain-ai/deepagents) | [Open SWE](https://github.com/langchain-ai/open-swe) | [codex-planr](https://github.com/regenrek/codex-planr) | [sandbox-agent](https://github.com/rivet-dev/sandbox-agent) | [Autoresearch](https://github.com/karpathy/autoresearch) | [QMD](https://github.com/tobi/qmd) | [Paperclip](https://github.com/paperclipai/paperclip) | [Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator)

**Industry Data:** [Anthropic 2026 Agentic Coding Trends](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf) | [State of Agent Engineering 2026](https://www.langchain.com/state-of-agent-engineering) | [VentureBeat](https://venturebeat.com/orchestration/langchains-ceo-argues-that-better-models-alone-wont-get-your-ai-agent-to) | [Agent Sandbox Architecture](https://wengjialin.com/blog/agent-sandbox/)

**Security:** [Claude Code Sandbox Escape (Ona)](https://ona.com/stories/how-claude-code-escapes-its-own-denylist-and-sandbox) | [Veto: Kernel-Level Enforcement (Ona)](https://ona.com/stories/introducing-veto-security-for-the-next-era-of-software) | [Don't Build Your Own Sandbox (Ona)](https://ona.com/stories/dont-build-a-coding-agent-sandbox)

**Verification:** [Spec-Driven Verification](https://agent-wars.com/news/2026-03-14-spec-driven-verification-claude-code-agents) | [Agent-as-a-Judge Survey](https://arxiv.org/pdf/2601.05111)

**Community:** [Emerging Harness Playbook](https://www.ignorance.ai/p/the-emerging-harness-engineering) | [background-agents.com](https://background-agents.com) | [Interrupt 2026](https://interrupt.langchain.com/) (May 13-14, SF)

---

*Private research corpus. Not yet open source.*
