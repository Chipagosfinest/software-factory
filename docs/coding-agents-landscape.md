# Coding Agents Landscape: Comprehensive Market Analysis

*Last updated: March 16, 2026*

---

## Executive Summary

The autonomous coding agent market exceeds $10B ARR in 2026, with Cursor alone at $2B and Claude Code at $2.5B. The key differentiator is no longer the underlying model but the **agent scaffolding and context engine** -- identical models (Opus 4.5) score 6+ points apart depending on the agent framework wrapping them. Total disclosed valuations across top platforms exceed $56B.

The market has split into four categories: IDE-based assistants, terminal agents, cloud-based autonomous agents, and no-code builders. This document covers all significant players across every category.

---

## 1. Market Categories

### Category Taxonomy

| Category | Model | Key Players | Target User |
|----------|-------|-------------|-------------|
| **IDE-based** | Human-in-loop, inline suggestions + agent modes | Cursor, Windsurf, GitHub Copilot, Amazon Q, Augment Code | Individual developers |
| **Terminal agents** | CLI-native, git-integrated | Claude Code, Aider, OpenCode, Codex CLI | Power developers |
| **Cloud autonomous** | Fire-and-forget, sandboxed execution | Devin, Factory.ai, Jules, OpenHands | Engineering teams |
| **Background/async** | Webhook-triggered, runs without human presence | Cursor Background Agents, Codex Automations, Software Factory | DevOps/SRE teams |
| **Code review** | PR-level review and auto-fix | CodeRabbit, Ellipsis, Cursor BugBot | Teams with PR workflows |
| **No-code builders** | Prompt-to-app, non-technical users | Lovable, Bolt.new, v0, Replit Agent | Non-developers |

---

## 2. Master Comparison Matrix

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

---

## 3. Detailed Profiles

### IDE-Based Agents

#### Cursor (Anysphere)

**Valuation:** $29.3B | **ARR:** $2B+ | **Investors:** Google, Nvidia, Accel, Thrive, a16z

The dominant AI IDE. VS Code fork with Tab completion, Composer (multi-file), Agent mode, and up to 8 parallel agents via Git worktrees.

- **Background Agents**: Cloud Ubuntu VMs; trigger from IDE, Slack, or mobile; ~$4.63/PR during preview
- **BugBot**: Automated PR scanner ($40/user/month); catches bugs, security flaws, code quality issues
- **Enterprise**: 50%+ Fortune 500 use Cursor; 60% of revenue from enterprise
- **Pricing**: $16/month (credit-based); BugBot $40/user/month; Background Agents usage-based

**Strengths**: Largest developer community, best tab completion, parallel agent execution, massive enterprise footprint.
**Weaknesses**: Unpredictable credit billing (teams report credits depleted in a day), struggles with very large multi-file changes, VS Code fork lock-in.

Sources: [TechCrunch](https://techcrunch.com/2026/03/02/cursor-has-reportedly-surpassed-2b-in-annualized-revenue/) | [DevClass](https://devclass.com/2025/06/06/cursor-ai-editor-hits-1-0-milestone-including-bugbot-and-high-risk-background-agents/) | [Cursor Enterprise](https://cursor.com/enterprise)

#### GitHub Copilot

The volume leader with 15M+ developers. Native to GitHub, includes agent mode for Issue-to-PR automation.

- **Coding Agent**: Assigns GitHub issues to Copilot; it creates branches, writes code, opens PRs
- **Agentic Code Review**: GA March 2026, runs on agentic architecture
- **Custom Agents**: Define via `.github/agents/` directory
- **Repair Agent**: Auto-fixes CI failures
- **Pricing**: $10/mo (Individual), $19/mo (Business), $39/mo (Enterprise)

**Strengths**: Deepest GitHub integration, lowest barrier to entry, broadest editor support, included in existing GitHub subscriptions.
**Weaknesses**: GitHub-only, no background/async agents, limited to GitHub ecosystem.

Sources: [GitHub Blog](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/) | [Agentic Review GA](https://github.blog/changelog/2026-03-05-copilot-code-review-now-runs-on-an-agentic-architecture/)

#### Windsurf (Acquired by Google)

AI-native IDE (VS Code fork) with Cascade for multi-step agentic flows. Google acquired the CEO, co-founder, and key research leads in early 2026 for ~$2.4B equivalent.

- **Pricing**: $15-60/month
- **Status**: Uncertain post-acquisition; technology likely folding into Google's Antigravity/Jules products

Source: [Windsurf](https://windsurf.com)

#### Amazon Q Developer

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

#### Augment Code / Intent

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

### Terminal Agents

#### Claude Code (Anthropic)

The deepest reasoning engine for hard problems. Terminal-native CLI agent.

- **SWE-bench Verified**: 80.9% (Opus 4.5) -- highest published score for a commercial product
- **ARR**: $2.5B
- **Agent Teams**: Multi-agent coordination where agents communicate directly and connect to company systems via MCP
- **Pricing**: $20/mo (Pro), $100/mo (Max 5x), $200/mo (Max 20x)
- **Used by**: Uber, Netflix, Spotify, Salesforce, Accenture, Snowflake

**Strengths**: Highest reasoning quality on hard problems, handles multi-file architectural refactors, strong enterprise adoption.
**Weaknesses**: Terminal-only (IDE extensions emerging), usage-based costs can be high.

Sources: [MorphLLM Comparison](https://www.morphllm.com/ai-coding-agent) | [Claude Code](https://claude.ai/code)

#### Aider

Git-native terminal pair programmer. 39K GitHub stars, 4.1M installs, 15B tokens/week.

- Every edit is a commit; every session is a branch
- Auto-runs linters and tests on generated code; fixes detected problems
- Repo Map: tree-sitter AST graph + PageRank ranking for intelligent context selection (zero API cost for indexing)
- Model-agnostic; works with any LLM provider
- **40-60% lower cost** than Cursor for comparable tasks

**Strengths**: Strongest Git integration, model flexibility, lowest cost, battle-tested.
**Weaknesses**: Terminal-only, single-task-at-a-time, no autonomous planning.

Sources: [Aider](https://aider.chat/) | [Aider Repo Map](https://aider.chat/docs/repomap.html)

#### OpenCode

Open-source terminal/IDE/desktop coding agent. 120K+ GitHub stars, 800+ contributors, 5M+ monthly users.

- **Dual-agent**: Build (full access) + Plan (read-only analysis); subagents (General + Explore)
- **Multi-model**: 75+ models; can mix providers in same agent team
- **Powers Ramp's "Inspect"**: ~50% of Ramp's merged PRs; runs in Modal sandboxes
- **Interfaces**: CLI (Bubble Tea TUI), Desktop app, VS Code/Cursor extension
- **Self-written**: 80%+ of Ramp Inspect's codebase written by Inspect itself

**Strengths**: Largest open-source agent by stars, proven at enterprise scale, multi-provider model mixing, privacy-first.
**Weaknesses**: Documentation still maturing, plugin ecosystem growing.

Sources: [OpenCode](https://opencode.ai/) | [Ramp + OpenCode on Modal](https://modal.com/blog/how-ramp-built-a-full-context-background-coding-agent-on-modal)

#### Codex CLI / Desktop (OpenAI)

Cloud-based autonomous agent built on GPT-5.3 Codex (Spark). Apache 2.0 CLI.

- **SWE-bench Pro**: #1 at 57.0%
- **Symphony Orchestrator**: Elixir/BEAM framework; polls Linear, creates workspaces, dispatches agents, delivers PRs autonomously
- **Automations**: Unprompted routine work -- issue triage, alert monitoring, CI/CD
- **Interfaces**: CLI, Desktop (macOS + Windows), IDE extension, Web (ChatGPT)
- **Pricing**: Included with ChatGPT ($20/mo Plus, $200/mo Pro)

**Strengths**: Highest SWE-bench Pro score, Symphony enables autonomous Linear-to-PR pipeline, included with ChatGPT.
**Weaknesses**: Locked to OpenAI models, Symphony requires Elixir, Pro tier expensive.

Sources: [OpenAI Codex](https://openai.com/index/introducing-the-codex-app/) | [Symphony Spec](https://github.com/openai/symphony/blob/main/SPEC.md)

### Cloud Autonomous Agents

#### OpenHands (formerly OpenDevin)

Open-source autonomous agent platform. 50K+ GitHub stars, MIT license.

- **SWE-bench Verified**: 77.6% (Claude 3.5 Sonnet Thinking)
- **Architecture**: Python SDK + Docker sandboxing, event-sourced state, LiteLLM for 100+ providers
- **Agent-Computer Interface (ACI)**: Optimized for LLM code navigation
- **15+ benchmarks supported**: SWE-bench, WebArena, GAIA, GPQA, MiniWoB++, etc.
- **Cloud SDK**: Scales to 1,000s of concurrent agents

**Strengths**: Model-agnostic, broadest benchmark coverage, strong research pedigree (Princeton), scalable.
**Weaknesses**: Requires Docker for sandboxing, less polished UX, steeper learning curve.

Sources: [OpenHands](https://openhands.dev/) | [OpenHands GitHub](https://github.com/OpenHands/OpenHands) | [arXiv Paper](https://arxiv.org/abs/2407.16741)

#### Jules (Google Labs)

Asynchronous cloud coding agent powered by Gemini 2.5 Pro.

- **Proactive features**: Scans repos for TODOs, proposes follow-on work, scheduled recurring tasks
- **Critic**: Adversarial self-review before presenting changes
- **Jules API**: Integrate into CI/CD, Slack triggers, custom workflows
- **Pricing**: Free (15 tasks/day); AI Pro $19.99/mo; AI Ultra $124.99/mo

**Strengths**: Deep GitHub integration, proactive suggestions, scheduled automation, generous free tier.
**Weaknesses**: Slow performance, frequent timeouts, context limits on large codebases, only Google accounts for paid.

Sources: [Jules Official](https://blog.google/technology/google-labs/jules/) | [TechCrunch](https://techcrunch.com/2025/08/06/googles-ai-coding-agent-jules-is-now-out-of-beta/)

### Research / Open-Source Agents

#### SWE-Agent (Princeton)

Research-focused agent. 15K+ GitHub stars, published at NeurIPS 2024.

- **SWE-bench Verified**: 79.2% (Opus 4.5 + Live-SWE-agent)
- **Mini-SWE-Agent**: 100-line Python implementation scoring >74%
- **Key innovation**: Agent-Computer Interface preventing context loss in long-horizon tasks
- Model-agnostic; can be employed for offensive cybersecurity and competitive coding

**Strengths**: Highest open-source SWE-bench scores, foundational research, proves simplicity works.
**Weaknesses**: Research tool, not production-ready, no IDE/enterprise features.

Sources: [SWE-Agent GitHub](https://github.com/SWE-agent/SWE-agent) | [SWE-bench](https://www.swebench.com/)

#### Cline

Open-source VS Code autonomous agent. 5M+ installs, Apache 2.0.

- **Plan/Act modes**: Human-in-the-loop approval for every action
- **MCP integration**: First-class; can create and install custom MCP servers on the fly
- **Browser automation**: Via Computer Use capability
- **Model support**: OpenRouter, Anthropic, OpenAI, Gemini, Bedrock, Azure, local models (Ollama/LM Studio)
- **Subagents**: Native support (v3.58+)
- **Pricing**: Free + API costs (~$50-200/month heavy use on Sonnet 4.6)

**Strengths**: Zero platform markup, maximum model flexibility, MCP-native, transparent, strong community.
**Weaknesses**: Less polished UX, setup effort, can be aggressive with changes.

Sources: [Cline](https://cline.bot/) | [Cline GitHub](https://github.com/cline/cline)

### Code Review Agents

| Tool | Focus | Scale | Auto-Fix | Pricing |
|------|-------|-------|----------|---------|
| **CodeRabbit** | Comprehensive PR review | 2M+ repos, 13M PRs reviewed | No (review only) | Free-$24/dev/mo |
| **Ellipsis** | Review + auto-fix | 9,300+ GitHub users | Yes (generates fix commits) | $20/dev/mo |
| **Cursor BugBot** | PR scanning + agent fix | Cursor ecosystem | Yes (spawns cloud agents) | $40/user/mo |

CodeRabbit detects 46% of real-world runtime bugs but generates noise. Ellipsis uniquely auto-implements feedback as commits. BugBot is Cursor-ecosystem only.

Sources: [CodeRabbit](https://www.coderabbit.ai/) | [Ellipsis](https://www.ellipsis.dev/) | [State of AI Code Review](https://www.devtoolsacademy.com/blog/state-of-ai-code-review-tools-2025/)

### No-Code / Low-Code Builders

These serve a fundamentally different market -- non-technical users building apps from prompts. They compete with each other, not with coding agents.

| Tool | Valuation | Users | Best For |
|------|-----------|-------|----------|
| **Lovable** | $6.6B | 8M+ | Cleanest React code generation |
| **Bolt.new** | N/A | Large | Framework flexibility, deployment |
| **v0** | Part of Vercel | Large | Beautiful Next.js apps |
| **Replit Agent** | Part of Replit | Large | Most autonomous, 30+ integrations |

Sources: [Best AI App Builder 2026](https://getmocha.com/blog/best-ai-app-builder-2026/)

### Swarm Agents

#### Blitzy

3,000-agent swarm for greenfield development. Enterprise-only.

- **SWE-bench Verified**: 86.8% (#1)
- **Scale**: Infinite code context (100M+ lines), generates up to 3M lines
- **Speed**: 3-5x dev velocity via System 2 reasoning (8-12 hours compute)
- **Limitation**: Greenfield-only; no maintenance, no PR review, no existing codebase support

Source: [Blitzy](https://blitzy.com/)

---

## 4. Annual Team Cost Comparison (10 Developers)

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

## 5. Cost Per Task Estimates

| Agent | Simple Bug Fix | Medium Feature | Complex Refactor |
|-------|---------------|----------------|-----------------|
| Claude Code | $2-5 | $5-15 | $15-50 |
| Devin | ~$2.25 (1 ACU) | $4.50-9 (2-4 ACU) | $9-18+ (4-8 ACU) |
| Copilot | Included | Included | Included (limited) |
| OpenHands | API costs only | API costs only | API costs only |
| Aider | API costs only | API costs only | API costs only |

---

## 6. Critical Finding: Architecture > Model

> "Same model can score 17 problems apart in different agents. Augment, Cursor, and Claude Code all ran Opus 4.5 but scored dramatically differently across 731 test issues."

-- [MorphLLM 15-Agent Comparison](https://www.morphllm.com/ai-coding-agent)

This is the most important insight in the market: the harness, context engine, and verification loops matter more than the underlying LLM. LangChain demonstrated this by jumping from #30 to #5 on Terminal-Bench (52.8% to 66.5%) by changing only the harness, not the model.

---

## 7. Open-Source Landscape

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

## 8. Emerging Trends

### 1. From Agents to Harnesses (2026 Defining Shift)
Focus has moved from building individual agents to building the environments, verification loops, and supervision layers that make agents reliable at scale. The harness is the moat, not the model.

### 2. Context Engineering > Prompt Engineering
Andrej Karpathy's framing: "The LLM is a CPU, the context window is RAM, and your job is to be the operating system." Most agent failures are context failures, not model failures.

### 3. Multi-Agent Teams
Gartner reported 1,445% surge in multi-agent inquiries. Successful architecture: Planners (explore codebase), Workers (execute in isolation), Judges (determine continue/stop).

### 4. Architectural Convergence
All major agents converging on: long-running execution loops, MCP tool use, background/async execution, git-based output (PRs), human-in-the-loop approval gates.

### 5. AGENTS.md Standard
60,000+ repos adopted. Co-authored by Factory, Anthropic, OpenAI, Google DeepMind. Under Linux Foundation's Agentic AI Foundation.

---

## 9. Where Software Factory Fits

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

## Sources

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
