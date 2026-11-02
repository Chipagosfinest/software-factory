# Landscape

Current state of play for this corpus: product categories, where this factory sits against other products, and which research sources are strong at which jobs.

Last updated: 2026-11-01

Dated production surveys live under [case studies](../case-studies/README.md) and are archived snapshots. Weekly primary posts land in [X insights](../signals/x-insights.md). Company receipts moved off the landing page are in [Why software factories](./why-software-factories.md).

Child docs:

- [Enterprise adoption](./enterprise-adoption.md)
- [Devin and Factory.ai](./devin-factory.md)
- [GitHub ecosystem](./github-ecosystem.md)
- [Dev tools stack](./dev-tools-stack.md)
- [MCP ecosystem](./mcp-ecosystem-deep-dive.md)
- [Why software factories](./why-software-factories.md) — published production receipts and the corpus thesis

## Coding Agents Landscape: Comprehensive Market Analysis

*Compiled: March 18, 2026*

---

### Executive Summary

The autonomous coding agent market exceeds $10B ARR in 2026, with Cursor alone at $2B and Claude Code at $2.5B. The key differentiator is no longer the underlying model but the **agent scaffolding and context engine** -- identical models (Opus 4.5) score 6+ points apart depending on the agent framework wrapping them. Total disclosed valuations across top platforms exceed $56B.

The market has split into four categories: IDE-based assistants, terminal agents, cloud-based autonomous agents, and no-code builders. This document covers all significant players across every category.

---

### 1. Market Categories

#### Category Taxonomy

| Category | Model | Key Players | Target User |
|----------|-------|-------------|-------------|
| **IDE-based** | Human-in-loop, inline suggestions + agent modes | Cursor, Windsurf, GitHub Copilot, Amazon Q, Augment Code | Individual developers |
| **Terminal agents** | CLI-native, git-integrated | Claude Code, Aider, OpenCode, Codex CLI | Power developers |
| **Cloud autonomous** | Fire-and-forget, sandboxed execution | Devin, Factory.ai, Jules, OpenHands | Engineering teams |
| **Background/async** | Webhook-triggered, runs without human presence | Cursor Background Agents, Codex Automations, Software Factory | DevOps/SRE teams |
| **Workflow orchestrators** | Deterministic graphs over agent execution | Fabro, GSD 2, Symphony | Teams wanting reproducibility |
| **Code review** | PR-level review and auto-fix | CodeRabbit, Ellipsis, Cursor BugBot | Teams with PR workflows |
| **No-code builders** | Prompt-to-app, non-technical users | Lovable, Bolt.new, v0, Replit Agent | Non-developers |

---

### 2. Master Comparison Matrix

| Tool | Type | SWE-bench Pro | SWE-bench Verified | Monthly Cost | Open Source | Enterprise | Autonomy |
|------|------|--------------|-------------------|-------------|-------------|------------|----------|
| **Codex CLI** | Cloud agent | **57.0%** | N/A | $20-200 (ChatGPT) | CLI: Apache 2.0 | Yes | Very High |
| **Augment/Intent** | IDE + Workspace | **51.8%** | 70.6% | $20+ | No | Yes | High |
| **Cursor** | AI IDE | 50.2% | N/A | $16+ | No | Yes (50%+ F500) | Medium-High |
| **Claude Code** | Terminal | N/A | **80.9%** | $20-200 | No | Yes | High |
| **SWE-Agent** | Research | N/A | **79.2%** | Free | Yes | No | High |
| **OpenHands** | Platform | N/A | **77.6%** | Free (BYOK) | Yes (MIT) | No | High |
| **Factory.ai** | Multi-agent | N/A (58.75% Terminal-Bench) | 31.67% (Lite) | $20-2,000 | No | Yes | Very High |
| **Devin** | Autonomous | N/A | ~67% merge rate | $20 + ACUs | No | Yes | Very High |
| **OpenCode** | Terminal/IDE/Desktop | N/A | N/A | Free (BYOK) | Yes | Proven (Ramp) | Medium-High |
| **Cline** | VS Code ext | N/A | N/A | Free + API | Yes (Apache 2.0) | Coming | Medium |
| **Aider** | Terminal | N/A | ~72% (Claude) | Free (BYOK) | Yes | No | Medium |
| **Jules** | Cloud agent | N/A | N/A | Free-$125 | No | Not yet | Medium-High |
| **Amazon Q** | IDE + AWS | N/A | N/A | Free-$19 | No | Yes (SOC/HIPAA) | Medium |
| **GitHub Copilot** | IDE | N/A | N/A | $10-39 | No | Yes | Medium |
| **Windsurf** | AI IDE | N/A | N/A | $15-60 | No | Acquired by Google | Medium |
| **CodeRabbit** | Code review | N/A | N/A | Free-$24/dev | No | Yes | Low |
| **Blitzy** | Swarm builder | N/A | 86.8% | Enterprise custom | No | Yes | Very High |
| **Slate/RLM** | Swarm agent | N/A | N/A | TBD (soft launch) | No | Not yet | Very High |

---

### 3. Detailed Profiles

#### IDE-Based Agents

##### Cursor (Anysphere)

**Valuation:** $29.3B | **ARR:** $2B+ | **Investors:** Google, Nvidia, Accel, Thrive, a16z

The dominant AI IDE. VS Code fork with Tab completion, Composer (multi-file), Agent mode, and up to 8 parallel agents via Git worktrees.

- **Background Agents**: Cloud Ubuntu VMs; trigger from IDE, Slack, or mobile; ~$4.63/PR during preview
- **BugBot**: Automated PR scanner ($40/user/month); catches bugs, security flaws, code quality issues
- **Enterprise**: 50%+ Fortune 500 use Cursor; 60% of revenue from enterprise
- **Pricing**: $16/month (credit-based); BugBot $40/user/month; Background Agents usage-based

**Strengths**: Largest developer community, best tab completion, parallel agent execution, massive enterprise footprint.
**Weaknesses**: Unpredictable credit billing (teams report credits depleted in a day), struggles with very large multi-file changes, VS Code fork lock-in.

Sources: [TechCrunch](https://techcrunch.com/2026/03/02/cursor-has-reportedly-surpassed-2b-in-annualized-revenue/) | [DevClass](https://devclass.com/2025/06/06/cursor-ai-editor-hits-1-0-milestone-including-bugbot-and-high-risk-background-agents/) | [Cursor Enterprise](https://cursor.com/enterprise)

##### GitHub Copilot

The volume leader with 15M+ developers. Native to GitHub, includes agent mode for Issue-to-PR automation.

- **Coding Agent**: Assigns GitHub issues to Copilot; it creates branches, writes code, opens PRs
- **Agentic Code Review**: GA March 2026, runs on agentic architecture
- **Custom Agents**: Define via `.github/agents/` directory
- **Repair Agent**: Auto-fixes CI failures
- **Pricing**: $10/mo (Individual), $19/mo (Business), $39/mo (Enterprise)

**Strengths**: Deepest GitHub integration, lowest barrier to entry, broadest editor support, included in existing GitHub subscriptions.
**Weaknesses**: GitHub-only, no background/async agents, limited to GitHub ecosystem.

Sources: [GitHub Blog](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/) | [Agentic Review GA](https://github.blog/changelog/2026-03-05-copilot-code-review-now-runs-on-an-agentic-architecture/)

##### Windsurf (Acquired by Google)

AI-native IDE (VS Code fork) with Cascade for multi-step agentic flows. Google acquired the CEO, co-founder, and key research leads in early 2026 for ~$2.4B equivalent.

- **Pricing**: $15-60/month
- **Status**: Uncertain post-acquisition; technology likely folding into Google's Antigravity/Jules products

Source: [Windsurf](https://windsurf.com)

##### Amazon Q Developer

AWS-integrated coding assistant with specialized agent modes.

- **/dev**: Bootstraps projects, implements features
- **/doc**: Scans source, creates knowledge graphs, generates READMEs
- **/review**: Detects code smells, anti-patterns, security vulnerabilities; auto-generates fixes
- **/test**: Generates unit tests, improves coverage
- **/transform**: Upgrades legacy Java/.NET applications
- **Pricing**: Free tier (50 chats + 10 agents/month); Pro $19/user/month (unlimited)
- **Enterprise**: SOC, ISO, HIPAA, PCI eligible; IP indemnity

**Strengths**: Deepest AWS integration, strongest compliance story, IP indemnity, Java/.NET modernization.
**Weaknesses**: AWS-centric, less autonomous than dedicated agents, no background/async.

Sources: [AWS Q Features](https://aws.amazon.com/q/developer/features/) | [AWS Q Pricing](https://aws.amazon.com/q/developer/pricing/)

##### Augment Code / Intent

**Valuation:** $977M | **Funding:** $252M | **Investors:** Eric Schmidt, Index Ventures

Multi-agent workspace with the most sophisticated context engine in the market.

- **Context Engine**: Indexes 400K+ files including deps, commit history, architecture; released as MCP server
- **SWE-bench Pro**: #1 at 51.8% (Auggie agent, Opus 4.5 backbone)
- **Intent Workspace**: macOS-only desktop app; isolated Git worktrees per agent; built-in Chrome, terminal, editor
- **Spec-driven development**: Living specs as source of truth, mandatory approval gates
- **Key metric**: Context Engine MCP server improves any third-party agent's performance by 70%+

**Strengths**: Best context engine, #1 SWE-bench Pro, spec-driven eliminates drift, resumable sessions.
**Weaknesses**: macOS-only (Apple Silicon) for Intent, credit system can be opaque.

Sources: [Auggie Tops SWE-Bench Pro](https://www.augmentcode.com/blog/auggie-tops-swe-bench-pro) | [VentureBeat](https://venturebeat.com/ai/augment-code-debuts-ai-agent-with-70-win-rate-over-github-copilot-and-record-breaking-swe-bench-score)

#### Terminal Agents

##### Claude Code (Anthropic)

Terminal agent. The comparison matrix above records the 80.9% SWE-bench Verified figure and the $2.5B ARR figure from this landscape pass. Profile: [Anthropic Claude Code](../practitioners/anthropic-claude-code.md).

##### Aider

Git-native terminal pair programmer. 39K GitHub stars, 4.1M installs, 15B tokens/week.

- Every edit is a commit; every session is a branch
- Auto-runs linters and tests on generated code; fixes detected problems
- Repo Map: tree-sitter AST graph + PageRank ranking for intelligent context selection (zero API cost for indexing)
- Model-agnostic; works with any LLM provider
- **40-60% lower cost** than Cursor for comparable tasks

**Strengths**: Strongest Git integration, model flexibility, lowest cost, battle-tested.
**Weaknesses**: Terminal-only, single-task-at-a-time, no autonomous planning.

Sources: [Aider](https://aider.chat/) | [Aider Repo Map](https://aider.chat/docs/repomap.html)

##### OpenCode

Open-source terminal/IDE/desktop coding agent. 120K+ GitHub stars, 800+ contributors, 5M+ monthly users.

- **Dual-agent**: Build (full access) + Plan (read-only analysis); subagents (General + Explore)
- **Multi-model**: 75+ models; can mix providers in same agent team
- **Powers Ramp's Inspect**: Modal sandboxes. Profile: [Ramp Inspect](../practitioners/ramp-inspect.md).
- **Interfaces**: CLI (Bubble Tea TUI), Desktop app, VS Code/Cursor extension
- **Self-written**: 80%+ of Ramp Inspect's codebase written by Inspect itself

**Strengths**: Largest open-source agent by stars, proven at enterprise scale, multi-provider model mixing, privacy-first.
**Weaknesses**: Documentation still maturing, plugin ecosystem growing.

Sources: [OpenCode](https://opencode.ai/) | [Ramp + OpenCode on Modal](https://modal.com/blog/how-ramp-built-a-full-context-background-coding-agent-on-modal)

##### Codex CLI / Desktop (OpenAI)

Cloud agent with an Apache 2.0 CLI. This landscape pass records 57.0% on SWE-bench Pro. Symphony is the orchestration layer (Linear, workspaces, PRs). Profile: [OpenAI Codex](../practitioners/openai-codex.md).

#### Cloud Autonomous Agents

##### OpenHands (formerly OpenDevin)

Open-source cloud coding-agent platform. The matrix above records 77.6% SWE-bench Verified in this landscape pass. Profile: [OpenHands](../practitioners/openhands.md).

##### Jules (Google Labs)

Asynchronous cloud coding agent powered by Gemini 2.5 Pro.

- **Proactive features**: Scans repos for TODOs, proposes follow-on work, scheduled recurring tasks
- **Critic**: Adversarial self-review before presenting changes
- **Jules API**: Integrate into CI/CD, Slack triggers, custom workflows
- **Pricing**: Free (15 tasks/day); AI Pro $19.99/mo; AI Ultra $124.99/mo

**Strengths**: Deep GitHub integration, proactive suggestions, scheduled automation, generous free tier.
**Weaknesses**: Slow performance, frequent timeouts, context limits on large codebases, only Google accounts for paid.

Sources: [Jules Official](https://blog.google/technology/google-labs/jules/) | [TechCrunch](https://techcrunch.com/2025/08/06/googles-ai-coding-agent-jules-is-now-out-of-beta/)

#### Research / Open-Source Agents

##### SWE-Agent (Princeton)

Research-focused agent. 15K+ GitHub stars, published at NeurIPS 2024.

- **SWE-bench Verified**: 79.2% (Opus 4.5 + Live-SWE-agent)
- **Mini-SWE-Agent**: 100-line Python implementation scoring >74%
- **Key innovation**: Agent-Computer Interface preventing context loss in long-horizon tasks
- Model-agnostic; can be employed for offensive cybersecurity and competitive coding

**Strengths**: Highest open-source SWE-bench scores, foundational research, proves simplicity works.
**Weaknesses**: Research tool, not production-ready, no IDE/enterprise features.

Sources: [SWE-Agent GitHub](https://github.com/SWE-agent/SWE-agent) | [SWE-bench](https://www.swebench.com/)

##### Cline

Open-source VS Code agent. Plan/Act approval, MCP, and subagents are the product shape. Profile: [Cline](../practitioners/cline.md).

#### Code Review Agents

| Tool | Focus | Scale | Auto-Fix | Pricing |
|------|-------|-------|----------|---------|
| **CodeRabbit** | Comprehensive PR review | 2M+ repos, 13M PRs reviewed | No (review only) | Free-$24/dev/mo |
| **Ellipsis** | Review + auto-fix | 9,300+ GitHub users | Yes (generates fix commits) | $20/dev/mo |
| **Cursor BugBot** | PR scanning + agent fix | Cursor ecosystem | Yes (spawns cloud agents) | $40/user/mo |

CodeRabbit detects 46% of real-world runtime bugs but generates noise. Ellipsis uniquely auto-implements feedback as commits. BugBot is Cursor-ecosystem only.

Sources: [CodeRabbit](https://www.coderabbit.ai/) | [Ellipsis](https://www.ellipsis.dev/) | [State of AI Code Review](https://www.devtoolsacademy.com/blog/state-of-ai-code-review-tools-2025/)

#### No-Code / Low-Code Builders

These serve a fundamentally different market -- non-technical users building apps from prompts. They compete with each other, not with coding agents.

| Tool | Valuation | Users | Best For |
|------|-----------|-------|----------|
| **Lovable** | $6.6B | 8M+ | Cleanest React code generation |
| **Bolt.new** | N/A | Large | Framework flexibility, deployment |
| **v0** | Part of Vercel | Large | Beautiful Next.js apps |
| **Replit Agent** | Part of Replit | Large | Most autonomous, 30+ integrations |

Sources: [Best AI App Builder 2026](https://getmocha.com/blog/best-ai-app-builder-2026/)

#### Swarm Agents

##### Blitzy

3,000-agent swarm for greenfield development. Enterprise-only.

- **SWE-bench Verified**: 86.8% (#1)
- **Scale**: Infinite code context (100M+ lines), generates up to 3M lines
- **Speed**: 3-5x dev velocity via System 2 reasoning (8-12 hours compute)
- **Limitation**: Greenfield-only; no maintenance, no PR review, no existing codebase support

Source: [Blitzy](https://blitzy.com/)

##### Slate / RLM (Realm)

Swarm-native coding agent. Self-described as "the first frontier agent to directly use a code environment for swarm orchestration."

- **Architecture**: "Hive mind" — orchestrator runs in a code environment and programmatically spawns/synchronizes parallel subagent threads. Not message-passing between agents; a shared execution context.
- **Auto model selection**: Orchestrator (Sonnet, Opus, GPT 5.4) dynamically selects execution models (Codex 5.3, GLM 5, Haiku) per-subtask based on complexity and cost.
- **Threads**: Subagents run as "threads" — massive parallel execution with synchronization primitives in the code environment.
- **Status**: Soft launch (March 2026), actively developing. No published benchmarks yet.

**How it differs from Blitzy:** Blitzy runs 3,000 static agents for greenfield. Slate's orchestrator is itself running code that spawns agents dynamically — the topology emerges from execution, not configuration. Closer to AgentConductor's dynamic topology concept but implemented as code execution rather than RL-generated YAML DAGs.

Source: [@realmcore_ announcement](https://x.com/realmcore_/status/2032146316730778004)

#### Workflow Orchestrators

##### Fabro (Bryan Helmkamp)

Open-source "dark software factory" — deterministic workflow graphs layered over agent execution. Single Rust binary.

- **Architecture**: Define workflows as Graphviz DOT graphs with branching, loops, parallelism, and human gates. Agents execute steps; humans intervene only where it matters.
- **Multi-model routing**: CSS-like stylesheets route tasks to appropriate models with fallback chains. Solves the "reasoning sandwich" problem declaratively.
- **Sandboxes**: Isolated Daytona VMs with snapshot setup, network controls, auto-cleanup (same provider as LangChain Open SWE).
- **Git checkpointing**: Automatic commits at each workflow stage with full execution metadata — the autoresearch ratchet pattern generalized to arbitrary workflows.
- **Automatic retrospectives**: Post-run summaries with cost, duration, file changes, and LLM narratives.
- **Stats**: 356 stars, 1,333 commits, v0.174.0, MIT license
- **Install**: `curl -fsSL https://fabro.sh/install.md | claude`

**Strengths**: Solves the "babysit every step OR review 50-file diff" problem. Deterministic reproducibility. Single binary, zero runtime deps. Git audit trail.
**Weaknesses**: New (March 2026 open-source), small community, no published benchmarks.

**How it differs from Symphony:** Symphony (OpenAI/Elixir) polls Linear for tasks and dispatches agents autonomously. Fabro lets humans define the *exact workflow graph* the agent follows — it's prescriptive rather than autonomous. Symphony is "agent decides what to do"; Fabro is "human defines the process, agent executes it."

Sources: [@brynary announcement](https://x.com/brynary/status/2033901199603241012) | [GitHub](https://github.com/fabro-sh/fabro) | [Docs](https://docs.fabro.sh)

##### GSD 2

Spec-driven agent session controller. 2.1K GitHub stars, 1,393 commits, v2.29. TypeScript CLI.

- **Architecture**: Milestone (shippable version, 4-10 slices) → Slice (demoable capability, 1-7 tasks) → Task (single context-window unit). Deterministic state machine reads `.gsd/` files — the CLI controls the context window programmatically, not via prompt injection or LLM self-loops.
- **Per-slice lifecycle**: Research → Plan → Execute → Complete → Reassess → Next
- **Context management**: Fresh 200K-token context window per task. Same insight as Stripe's one-shot tree (fully assembled context, deterministic dispatch) applied to a development lifecycle.
- **Isolation**: Git worktree per slice, sequential commits, squash merge
- **Reliability**: Crash recovery with session forensics + exponential backoff, stuck loop detection with diagnostic recovery, verification commands (lint, test) with auto-fix retries
- **Multi-model**: 20+ LLM providers (Anthropic, OpenAI, Google, OpenRouter, GitHub Copilot)
- **Ops**: Headless CI/cron support with JSON queries, parallel multi-worker orchestration, self-contained HTML reports with DAG visualizations, cost tracking per unit with projections
- **Built on**: Pi SDK (TypeScript), Node.js 24 LTS

**Strengths**: Programmatic session control (not prompt-dependent), fresh context per task eliminates degradation, cost tracking at every level, crash recovery, model-agnostic.
**Weaknesses**: Fixed hierarchy (Milestone → Slice → Task) less flexible than arbitrary workflow graphs (Fabro), single context window per task limits individual task complexity.

**How it differs from Fabro:** Fabro defines arbitrary workflow graphs (DOT files) with CSS-like model routing. GSD 2 enforces a fixed three-level hierarchy with a fixed lifecycle per slice. Fabro is "define any process"; GSD 2 is "one process (spec-driven development), deeply optimized." Both share the deterministic thesis: the CLI/tool controls execution, not the LLM.

Source: [GSD 2 (GitHub)](https://github.com/gsd-build/gsd-2)

---

### 4. Annual Team Cost Comparison (10 Developers)

| Tool | Annual Cost | Model |
|------|------------|-------|
| GitHub Copilot Business | $2,280/yr | Flat per-seat |
| Windsurf Pro | $3,600/yr | Flat per-seat |
| Cursor Pro | $4,800/yr | Credit-based (overage risk) |
| Amazon Q Pro | $2,280/yr | Flat per-seat |
| Cline | API costs only (~$6,000-24,000/yr) | Pay-per-token |
| Claude Code Teams | $18,000/yr | Usage-based |
| Devin Team | $60,000/yr | ACU-based |
| Factory Max | $24,000/yr + token overage | Token-based |

---

### 5. Cost Per Task Estimates

| Agent | Simple Bug Fix | Medium Feature | Complex Refactor |
|-------|---------------|----------------|-----------------|
| Claude Code | $2-5 | $5-15 | $15-50 |
| Devin | ~$2.25 (1 ACU) | $4.50-9 (2-4 ACU) | $9-18+ (4-8 ACU) |
| Copilot | Included | Included | Included (limited) |
| OpenHands | API costs only | API costs only | API costs only |
| Aider | API costs only | API costs only | API costs only |

---

### 6. Critical Finding: Architecture > Model

> "Same model can score 17 problems apart in different agents. Augment, Cursor, and Claude Code all ran Opus 4.5 but scored dramatically differently across 731 test issues."

-- [MorphLLM 15-Agent Comparison](https://www.morphllm.com/ai-coding-agent)

This is the most important insight in the market: the harness, context engine, and verification loops matter more than the underlying LLM. LangChain demonstrated this by jumping from #30 to #5 on Terminal-Bench (52.8% to 66.5%) by changing only the harness, not the model.

---

### 7. Open-Source Landscape

Open-source agents match or exceed commercial ones on benchmarks:

| Agent | License | Stars | SWE-bench Score | Key Differentiator |
|-------|---------|-------|-----------------|-------------------|
| OpenCode | Open source | 120K+ | N/A (proven at Ramp) | Multi-provider, powers 50% of Ramp PRs |
| OpenHands | MIT | 50K+ | 77.6% Verified | Broadest benchmark coverage |
| Aider | Open source | 39K | ~72% (Claude) | Best Git integration |
| SWE-Agent | Open source | 15K+ | 79.2% Verified | Foundational research |
| Cline | Apache 2.0 | 5M+ installs | N/A | Maximum model flexibility |
| Codex CLI | Apache 2.0 | OpenAI-backed | 57.0% Pro | Highest Pro benchmark |

For teams wanting control and cost savings, the open-source stack (OpenCode/Aider + Cline + OpenHands) delivers competitive quality at API-cost-only pricing.

---

### 8. Emerging Trends

#### 1. From Agents to Harnesses (2026 Defining Shift)
Focus has moved from building individual agents to building the environments, verification loops, and supervision layers that make agents reliable at scale. The harness is the moat, not the model.

#### 2. Context Engineering > Prompt Engineering
Andrej Karpathy's framing: "The LLM is a CPU, the context window is RAM, and your job is to be the operating system." Most agent failures are context failures, not model failures.

#### 3. Multi-Agent Teams
Gartner reported 1,445% surge in multi-agent inquiries. Successful architecture: Planners (explore codebase), Workers (execute in isolation), Judges (determine continue/stop).

#### 4. Architectural Convergence
All major agents converging on: long-running execution loops, MCP tool use, background/async execution, git-based output (PRs), human-in-the-loop approval gates.

#### 5. AGENTS.md Standard
60,000+ repos adopted. Co-authored by Factory, Anthropic, OpenAI, Google DeepMind. Under Linux Foundation's Agentic AI Foundation.

---

### 9. Where Software Factory Fits

| Category | Tools in Category | Our Position |
|----------|------------------|-------------|
| IDE-based | Cursor, Copilot, Windsurf, Amazon Q, Augment | Not competing here |
| Terminal agents | Claude Code, Aider, OpenCode, Codex | Not competing here |
| Cloud autonomous | Devin, Factory, Jules, OpenHands | Adjacent (we're webhook-triggered, not task-assigned) |
| Background/async | Cursor BG Agents, Codex Automations | **Our category** -- webhook-triggered maintenance agents |
| Code review | CodeRabbit, Ellipsis, BugBot | **Competing** via PR Review agent |
| No-code builders | Lovable, Bolt, v0, Replit | Not competing here |

Our unique position: the only platform combining incident response, security patching, merge conflict resolution, and knowledge graph in a single webhook-triggered system. The closest alternative is assembling CodeRabbit (review) + PagerDuty SRE Agent (incidents) + Dependabot (security) -- but nobody integrates these into a unified agent platform with shared context.

---

### Sources

- [MorphLLM: 15 AI Coding Agents Tested](https://www.morphllm.com/ai-coding-agent) -- Benchmark comparison
- [Codegen: Best AI Coding Agents 2026](https://codegen.com/blog/best-ai-coding-agents/) -- Rankings
- [LushBinary: AI Coding Agents Pricing](https://lushbinary.com/blog/ai-coding-agents-comparison-cursor-windsurf-claude-copilot-kiro-2026/) -- Cost analysis
- [AwesomeAgents: Pricing March 2026](https://awesomeagents.ai/pricing/ai-coding-tools-pricing/) -- Pricing data
- [Taskade: Devin Alternatives 2026](https://www.taskade.com/blog/devin-ai-alternatives) -- Alternatives roundup
- [OpenHands vs SWE-Agent](https://localaimaster.com/blog/openhands-vs-swe-agent) -- Comparison
- [SWE-bench Leaderboard](https://www.swebench.com/) -- Latest scores
- [TechCrunch: Cursor $2B Revenue](https://techcrunch.com/2026/03/02/cursor-has-reportedly-surpassed-2b-in-annualized-revenue/) -- Cursor ARR
- [Cursor Series D](https://cursor.com/blog/series-d) -- Funding
- [Factory Series B](https://factory.ai/news/series-b) -- Funding
- [Augment Funding](https://www.augmentcode.com/blog/augment-inc-raises-227-million) -- Funding
- [OpenAI Codex](https://openai.com/index/introducing-the-codex-app/) -- Product
- [Symphony Spec](https://github.com/openai/symphony/blob/main/SPEC.md) -- Orchestration
- [Anthropic 2026 Agentic Coding Trends Report](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf) -- Industry trends
- [5 Key Agentic Trends -- The New Stack](https://thenewstack.io/5-key-trends-shaping-agentic-development-in-2026/) -- Trends
- [Context Engineering -- Martin Fowler](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html) -- Context engineering
- [LangChain Harness Engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/) -- Harness patterns
- [AGENTS.md Spec](https://github.com/agentsmd/agents.md) -- Open standard
- [AWS Q Developer](https://aws.amazon.com/q/developer/features/) -- Product
- [Jules Official](https://blog.google/technology/google-labs/jules/) -- Product
- [Aider](https://aider.chat/) -- Product
- [OpenCode](https://opencode.ai/) -- Product
- [Cline](https://cline.bot/) -- Product
- [CodeRabbit](https://www.coderabbit.ai/) -- Product
- [Ellipsis](https://www.ellipsis.dev/) -- Product
- [Blitzy](https://blitzy.com/) -- Product
- [Ona Automations: Proactive Background Agents](https://ona.com/stories/ona-automations-proactive-background-agents) -- Background agent platform
- [A Visual Guide to Self-Driving Codebases (Ona)](https://ona.com/stories/visual-guide-self-driving-codebases) -- Agent infrastructure taxonomy
- [AI Agent Automations That Keep Your Codebase Healthy (Ona)](https://ona.com/stories/codebase-health-automations) -- Automated maintenance agents

## Competitive Analysis — Software Factory vs. Market

*Compiled: March 21, 2026*

---

### Executive Summary

Software Factory occupies a **unique niche**: autonomous DevOps/SRE agents (webhook-triggered maintenance) with a knowledge graph integration. No competitor combines all five of our core agents (PR Review, CI Debug, Security Patch, Incident Response, Merge Resolution) with a product intelligence graph.

Our closest competitor is **Factory.ai** (agent-native SDLC platform). Devin is tangential — it's a "hire an AI engineer" product focused on feature building, not production maintenance.

---

### Competitor Profiles

#### Devin (Cognition)
- **Model**: Task-based autonomous agent — you give it a ticket, it builds the feature
- **Pricing**: $20/mo Core (pay-per-ACU), $500/mo Team (250 ACUs), Enterprise custom
- **Strengths**: Interactive planning, codebase fine-tuning, Devin Search/Wiki, mobile support, Nubank case study (12x efficiency, 20x cost savings on migrations)
- **Weaknesses**: No incident response, no merge conflict resolution, no knowledge graph, expensive at scale, long execution times on complex tasks
- **Key Features**: Code migration, data engineering, bug resolution, performance optimization
- **Integrations**: GitHub, Slack, Teams, Linear, Jira, AWS, Stripe, 20+ MCP servers
- **Website**: https://devin.ai

#### Factory.ai
- **Model**: "Droids" — autonomous agents across the SDLC
- **Pricing**: Starts ~$80/mo, token-based billing, enterprise custom
- **Strengths**: IDE integration (VS Code, JetBrains, Vim), CLI automation, Slack/Teams triage, self-healing builds, EY deployment (5,000+ engineers), SOC II/GDPR/ISO 42001 compliance
- **Weaknesses**: No knowledge graph, no dedicated merge conflict agent, pricing opaque, no PagerDuty incident→fix pipeline
- **Key Features**: PR review, CI/CD automation, incident triage, refactoring at scale, migrations
- **Website**: https://factory.ai

#### GitHub Copilot Coding Agent
- **Model**: Issue→PR agent, native to GitHub
- **Pricing**: Included in Copilot Pro/Pro+/Business/Enterprise plans
- **Strengths**: Native GitHub integration, self-review before PR, automated security/secret/dependency scanning, custom agents via `.github/agents/`, repair agent for CI, agentic code review (GA March 2026)
- **Weaknesses**: GitHub-only, no incident response, no knowledge graph, no cross-platform support, limited to GitHub ecosystem
- **Key Features**: Issue→implementation→PR, CI repair, security scanning, custom agent definitions
- **Website**: https://github.com/features/copilot

#### Blitzy
- **Model**: 3,000-agent swarm for greenfield development
- **Pricing**: Enterprise custom
- **Strengths**: #1 SWE-bench Verified (86.8%), infinite code context (100M+ lines), 3-5x dev velocity, System 2 reasoning (8-12 hours compute), generates up to 3M lines
- **Weaknesses**: Greenfield-only (not maintenance), no PR review/CI debug/security, long execution times, enterprise-only pricing, no existing codebase support
- **Key Features**: Full application generation, requirements→design→code pipeline
- **Website**: https://blitzy.com

#### Paperclip (NEW — March 2026)
- **Model**: "Zero-human company" orchestration — org charts for AI agents
- **Pricing**: Free, open-source (MIT), self-hosted
- **Strengths**: 24K+ GitHub stars in 2 weeks, BYOA (any agent runtime), goal alignment (mission→project→task hierarchy), multi-company isolation, cost governance with per-agent budgets, ClipMart marketplace (coming), beautiful React UI dashboard
- **Weaknesses**: No agent runtimes of its own (orchestration only), no CI/CD integration, no incident response, no knowledge graph, early-stage (v2026.318.0), no verification loops or LLM judge
- **Key Features**: Org charts, heartbeat monitoring, goal alignment, multi-company support, audit trails, SKILLS.md for agent context
- **Positioning**: "If OpenClaw is an employee, Paperclip is the company." Orchestration layer, not an agent builder.
- **Website**: https://paperclip.ing | [GitHub](https://github.com/paperclipai/paperclip)
- **Stack**: Node.js, React, embedded PostgreSQL, TypeScript (96.8%)
- **Relevance**: **HIGH** — directly addresses the "agent command center" gap Karpathy described (Mar 2, 2026). Could serve as our orchestration UI or be a competitor if they add CI/CD and verification.

#### LangSmith Fleet (NEW — March 2026)
- **Model**: Centralized enterprise agent management hub
- **Pricing**: Part of LangSmith (enterprise tiers)
- **Strengths**: LangChain ecosystem, enterprise cross-team collaboration, end-to-end agent lifecycle (build/use/manage)
- **Weaknesses**: Enterprise-only, closed-source, LangChain dependency
- **Key Features**: Fleet-wide agent management, rebranded from Agent Builder
- **Website**: LangChain blog
- **Relevance**: MEDIUM — enterprise play, different market than our self-hosted approach

#### Other Notable Players

| Player | Focus | Relevance |
|--------|-------|-----------|
| **Cursor** | AI-native IDE (pair programming) | Different category — human-in-loop editor, not autonomous agents |
| **Windsurf** | AI-native IDE | Similar to Cursor — IDE, not background agents |
| **OpenHands** | Open-source autonomous agent | Closest OSS competitor to Devin, could integrate as our agent runtime |
| **SWE-Agent** | Open-source issue→fix agent | Academic/research, could be a runner option |
| **Cline** | VS Code autonomous assistant | IDE-based, Plan+Act modes, not background |
| **Amazon Q** | AWS AI coding assistant | /dev, /doc, /review agents — enterprise-only, AWS-locked |
| **Augment Code (Intent)** | macOS multi-agent workspace | Spec-driven coordination, mandatory approval gates |
| **Replit Agent** | Browser-based autonomous agent | Greenfield web apps, not production maintenance |
| **JetBrains Junie CLI** | Standalone coding agent + Air platform | "Shadow Tech Debt" framing, structural code awareness, vendor-neutral |
| **Orbit (trine.dev)** | Multi-agent harness | Scout→Worker→Verifier pattern, "power drill not architect" philosophy |

---

### Feature Comparison Matrix

| Capability | Software Factory | Devin | Factory.ai | Copilot Agent | Paperclip | Blitzy |
|---|---|---|---|---|---|---|
| **PR Review** | ✅ Core agent | ✅ | ✅ | ✅ Agentic (GA) | ❌ | ❌ |
| **CI Debugging** | ✅ Shift-left + LLM judge | ✅ | ✅ Self-healing | ✅ Repair agent | ❌ | ❌ |
| **Security Patching** | ✅ CVE auto-patch | ❌ Manual | ⚠️ Limited | ✅ Secret/dep scanning | ❌ | ❌ |
| **Incident Response** | ✅ PagerDuty→RCA→fix PR | ❌ | ⚠️ Slack triage only | ❌ | ❌ | ❌ |
| **Merge Conflicts** | ✅ Dedicated agent | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Feature Building** | ❌ Not yet | ✅ Core use case | ✅ | ✅ Issue→PR | ⚠️ Via agents | ✅ Core use case |
| **Knowledge Graph** | ✅ Built-in | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Agent Orchestration** | ⚠️ Queue-based | ❌ Single | ⚠️ Internal | ❌ Single | ✅ Org charts + goals | ❌ Swarm |
| **Multi-Agent Fleet** | ⚠️ BullMQ dispatch | ❌ | ⚠️ Internal | ❌ | ✅ BYOA, heartbeats | ✅ 3000 agents |
| **Cost Governance** | ✅ $2/run caps, audit | ❌ Flat pricing | ⚠️ Token billing | ❌ Subscription | ✅ Per-agent budgets | ❌ |
| **Goal Alignment** | ❌ | ❌ | ❌ | ❌ | ✅ Mission→Project→Task | ❌ |
| **Dashboard/UI** | ❌ CLI only | ✅ Web IDE | ✅ IDE plugins | ✅ VS Code native | ✅ React dashboard | ❌ |
| **Self-hosted** | ✅ Your infra | ❌ SaaS only | ⚠️ VPC option | ❌ GitHub-native | ✅ MIT, self-hosted | ❌ SaaS only |
| **Open Source** | Private (could open) | ❌ | ❌ | ❌ | ✅ MIT | ❌ |
| **Verification Loops** | ✅ LLM judge + CI | ❌ | ⚠️ | ⚠️ | ❌ | ❌ |

---

### Our Differentiators

#### 1. Incident Response Pipeline (Unique)
Nobody else does PagerDuty alert → root cause analysis → fix PR. Factory.ai has Slack triage but stops at diagnosis. We go all the way to a fix PR with RCA comments.

#### 2. Merge Conflict Resolution (Unique)
No competitor has a dedicated merge conflict agent. This is a real pain point in active repos — merge conflicts block PRs and waste developer time.

#### 3. Knowledge Graph Integration (Unique)
Cron agents feeding a knowledge graph are unique. No competitor ties autonomous dev agents to a product intelligence graph.

#### 4. Cost Governance (Best-in-class)
$2/run caps, 5-minute timeouts, per-agent cost tracking, audit trails, executor gate kill switch. Devin charges $500/mo flat. Factory bills by token with less transparency.

#### 5. Shift-Left CI Debugging (Most Sophisticated)
Local verification → agent reasoning → LLM judge → bounded retries (max 2). Copilot has a simpler "repair agent." Our pipeline is modeled on Spotify Honk + Stripe Minions patterns.

#### 6. Self-Hosted (Strategic)
Full control over data, models, and infrastructure. Critical for enterprise deployment where SaaS isn't an option.

---

### Competitive Gaps to Close

#### P0 — Must Have

| Gap | Competitor with it | Effort | Impact |
|-----|-------------------|--------|--------|
| **Feature Builder agent** (ticket→implementation→PR) | Devin, Factory.ai, Copilot | 2-3 weeks | Covers the #1 use case we're missing |

#### P1 — Should Have

| Gap | Competitor with it | Effort | Impact |
|-----|-------------------|--------|--------|
| **IDE integration** (VS Code extension) | Factory.ai, Copilot, Cursor | 2-4 weeks | Entry point for individual devs |
| **Interactive planning** (Slack/Discord task scoping) | Devin | 1-2 weeks | Better UX for complex tasks |
| **Codebase learning** (fine-tuning on repo patterns) | Devin | 3-4 weeks | Higher quality output over time |

#### P2 — Nice to Have

| Gap | Competitor with it | Effort | Impact |
|-----|-------------------|--------|--------|
| **Web dashboard** (session streaming, metrics) | Devin, Factory.ai | 2-3 weeks | Observability for teams |
| **Codebase search/wiki** (Devin Search/Wiki) | Devin | 1-2 weeks | Developer productivity |
| **Mobile support** | Devin | 2-3 weeks | Convenience |

---

### Strategic Positioning

```
                    Feature Building ──────────────────── Production Maintenance
                          │                                        │
            Devin ────────┤                                        │
            Blitzy ───────┤                                        │
            Copilot ──────┼────────────────────────────────────────┤
            Factory.ai ───┼────────────────────────────────────────┤
                          │                                        │
                          │                    Software Factory ────┤
                          │                    + Knowledge Graph ───┤
                          │                    + Domain Intelligence ┤

     Agent Orchestration ──────────────────────── Agent Execution
           │                                          │
  Paperclip ──────┤                                   │
  LangSmith Fleet ┤                                   │
                   │                Software Factory ──┤
                   │                Factory.ai ────────┤
                   │                Devin ─────────────┤
```

**Two axes of competition now:**

1. **Feature building vs. production maintenance** — We're on the maintenance side. Devin/Blitzy on the feature side.
2. **Agent orchestration vs. agent execution** — Paperclip is pure orchestration (no agents of its own). We're pure execution (no dashboard). The overlap opportunity is clear.

**We don't compete with Devin head-on.** Devin is "hire an AI engineer." We're "autonomous DevOps/SRE that keeps production running while humans sleep."

**We don't compete with Paperclip head-on either.** Paperclip is "the company" (org charts, goals, budgets). We're "the factory floor" (agents, verification, governance). They're complementary — Paperclip could orchestrate Software Factory agents.

**Our wedge:** Incident response + security patching + knowledge graph + verification loops. Then expand into orchestration UI (or integrate Paperclip).

**The moat:** Knowledge graph + domain intelligence + verification/governance layer. Nobody else has domain-specific intelligence AND quality enforcement feeding into their agents. Paperclip has governance but no verification. Factory.ai has agents but no knowledge graph.

---

### Market Sizing

| Segment | TAM | Our Position |
|---------|-----|-------------|
| AI coding assistants | $15B+ by 2028 | Niche (maintenance/ops) |
| DevOps automation | $8B by 2027 | Direct competitor |
| Incident management | $3B by 2026 | Adjacent (PagerDuty→fix) |
| Developer tool commerce | New category | First mover |

---

### Key Takeaways

1. **Ship the 5 core agents NOW** — they're production-ready and differentiated
2. **Add a Feature Builder agent** — this is the #1 gap vs. every competitor
3. **The knowledge graph is our moat** — no competitor has domain intelligence
4. **Self-hosted + cost governance = enterprise story** — critical for regulated industries
5. **Don't chase IDE integration yet** — focus on background agents first (our strength)
6. **Factory.ai is the real competitor** — not Devin. Watch their enterprise expansion closely
7. **Paperclip is a complement, not a threat** — evaluate as orchestration UI layer. Their 24K-star growth validates the "agent command center" category Karpathy called for. Our verification loops + knowledge graph are what they lack.
8. **Verification loops are our unique differentiator** — no competitor (including Paperclip) has LLM judge + bounded CI retries + shift-left patterns. This is the gap the industry is waking up to (JetBrains "Shadow Tech Debt", SWE-CI benchmark).

---

### Sources

- [Devin AI](https://devin.ai/) — Product page, pricing
- [Factory.ai](https://factory.ai) — Product page, EY case study
- [GitHub Copilot Coding Agent](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/) — GA announcement
- [Copilot Code Review Agentic Architecture](https://github.blog/changelog/2026-03-05-copilot-code-review-now-runs-on-an-agentic-architecture/) — March 2026 update
- [Blitzy](https://blitzy.com/) — Product page, SWE-bench results
- [Devin 2.0 Price Drop](https://venturebeat.com/programming-development/devin-2-0-is-here-cognition-slashes-price-of-ai-software-engineer-to-20-per-month-from-500/) — VentureBeat
- [Factory.ai Pricing via Orb](https://www.withorb.com/case-studies/factory) — Billing model
- [Devin Alternatives Roundups](https://www.taskade.com/blog/devin-ai-alternatives) — Taskade, PlayCode, ClickUp, Augment Code
- [Anthropic 2026 Agentic Coding Trends Report](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf)
- [Paperclip](https://paperclip.ing/) — Open-source agent orchestration, 24K+ GitHub stars
- [Paperclip GitHub](https://github.com/paperclipai/paperclip) — MIT, TypeScript, Node.js + React
- [eWeek — Meet Paperclip](https://www.eweek.com/news/meet-paperclip-openclaw-ai-company-tool/) — "The Tool Turning OpenClaw Agents Into an AI Company"
- [LangSmith Fleet announcement](https://aitoolly.com/ai-news/article/2026-03-20-langchain-rebrands-agent-builder-to-langsmith-fleet-a-centralized-enterprise-agent-management-platfo) — LangChain rebrand
- [JetBrains Junie CLI + Air](https://thenewstack.io/jetbrains-names-the-debt-ai-agents-leave-behind/) — "Shadow Tech Debt" framing
- [Orbit — 7 Agents Across 3 Repos](https://blog.trine.dev/posts/2026-03-08-orbit-ai-agents/) — Multi-agent harness patterns
- [Zylos — AI Agent Fleet Management](https://zylos.ai/research/2026-02-19-ai-agent-fleet-management) — Market sizing, enterprise platforms

## Competency Graph — Research Sources

*Compiled: March 18, 2026*

Maps what each research source is best at, where they overlap, and how they compose into Software Factory.

---

### Competency Matrix

Scale: `████` = best-in-class, `███░` = strong, `██░░` = partial, `█░░░` = minimal, `░░░░` = absent

#### Core Research Sources

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

#### Extended Tools (March 2026)

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

### Complementary Pairs

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

### Software Factory Adoption Map

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

### Strategic Takeaway

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

#### Extended Tool Priorities

| Priority | Tool | Why |
|----------|------|-----|
| ★★★ | Linear | Already in use. Agent API is purpose-built. Task assignment → agent trigger is the foundation of the event pipeline. |
| ★★☆ | GitHub Copilot Agent | Agentic Workflows automate repo hygiene (triage, docs, tests). Complements custom agents. |
| ★★☆ | Obsidian/MCP | Already in use (OpenClaw knowledge vault). QMD-style search on Obsidian vault fills the knowledge gap. |
| ★☆☆ | Devin | Reference implementation for autonomous background agents. 67% merge rate on bounded tasks sets the bar. |
| ★☆☆ | Factory.ai | Enterprise reference for Phase 3. Not needed until fleet scale. |
