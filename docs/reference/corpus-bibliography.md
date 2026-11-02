# Corpus Bibliography

Link index moved off the landing page. It is a catalog of sources, not the current state of play. For the market map read [Landscape](../landscape/README.md). For weekly primary posts read [X insights](../signals/x-insights.md). Navigation rules are in [AGENTS.md](../../AGENTS.md).

### Internal Engineering Deployments (recruiting-tool eng blogs)

These are the first-person accounts from company engineering teams — the richest source of real numbers and architecture details. Tech companies publish these as recruiting signals, so the bylines are real engineers.

**Tier 1 — Deep case studies with numbers:**

- [Production case studies (archived snapshot as of 2026-07-16)](../case-studies/production-case-studies-state-of-play-2026-07-16.md) — matched Exa/Parallel refresh, source grading, and follow-up status
- [Uber: uReview](https://blog.uber.com/blog/ureview/) — Multi-stage Commenter GenAI reviews 90% of ~65K weekly Phabricator diffs (Sonal Mahajan byline)
- [Pragmatic Engineer: How Uber uses AI for development](https://newsletter.pragmaticengineer.com/p/how-uber-uses-ai-for-development) — Deep dive on Uber's 4-layer stack (Minion, Shepherd, uReview, Autocover)
- [Cloudflare: The AI engineering stack we built internally](https://blog.cloudflare.com/internal-ai-engineering-stack/) — 93% R&D adoption, running on their own Workers/AI Gateway
- [Meta: Capacity Efficiency at Meta — Unified AI Agents](https://engineering.fb.com/2026/04/16/developer-tools/capacity-efficiency-at-meta-how-unified-ai-agents-optimize-performance-at-hyperscale/) — Agent marketplace + FBDetect regression auto-fix
- [Meta: MetaMateCR (IEEE TSE paper)](https://arxiv.org/pdf/2507.13499) — LargeLSFT generates exact-match patches 68% of the time
- [Anthropic: Bringing Code Review to Claude Code](https://www.claude.com/blog/code-review) — Multi-agent parallel review; 16% → 54% of PRs get substantive comments
- [Anthropic: Scaling Managed Agents — Decoupling brain from hands](https://www.anthropic.com/engineering/managed-agents) — Meta-harness thesis for long-horizon agents
- [LinkedIn: CAPT — Contextual Agent Playbooks](https://www.linkedin.com/blog/engineering/ai/contextual-agent-playbooks-and-tools-how-linkedin-gave-ai-coding-agents-organizational-context) — 1,000+ engineers, 70% triage time drop (Ajay Prakash byline)
- [Block: Builderbot](https://block.xyz/inside/block-rolls-out-builderbot-a-new-suite-of-ai-native-tools-that-changes-the-way-we-ship) — First-party scale claim of ~1,500 merged PRs/week and ~15% of production changes
- [DoorDash: DashBench](https://careersatdoordash.com/blog/how-we-learned-to-trust-our-ai-code-reviewer-at-doordash/) — Replay benchmark for measuring reviewer recall, precision, severity, latency, and cost
- [Shopify: Under the River](https://shopify.engineering/under-the-river) — River production scale and Aquifer's durable-state/disposable-execution architecture
- [OpenAI: Separating signal from noise in coding evaluations](https://openai.com/index/separating-signal-from-noise-coding-evaluations) — Human-audited benchmark quality correction

**Tier 2 — Strong patterns + production numbers:**

- [Airbnb: Accelerating Large-Scale Test Migration with LLMs](https://airbnb.tech/infrastructure/accelerating-large-scale-test-migration-with-llms/) — 3.5K files Enzyme → RTL in 6 weeks (the canonical batch migration harness post)
- [Airbnb: GraphQL Data Mocking at Scale with LLMs](https://airbnb.tech/uncategorized/graphql-data-mocking-at-scale-with-llms-and-generatemock/) — Type-safe mock data inside the dev loop
- [DoorDash: Beyond Single Agents — Collaborative AI Ecosystem](https://careersatdoordash.com/blog/beyond-single-agents-doordash-building-collaborative-ai-ecosystem/) — Earlier 4-stage progression: workflows → agents → deep agents → swarms
- [Pinterest: Testing AI skills](https://medium.com/pinterest-engineering/an-engineers-guide-to-better-ai-skills-implementing-a-testing-process-to-optimize-agent-a000c9c9abcd) — 100-test harness for explicit and implicit skill invocation
- [Datadog: Harness-first agents](https://www.datadoghq.com/blog/ai/harness-first-agents/) — Production-like deterministic verification
- [Datadog: Autoresearch for LLM experimentation](https://www.datadoghq.com/blog/llm-experimentation-autoresearch/) — Experiments, self-verification, and handoffs improved an internal SQL agent
- [Shopify: Introducing Roast](https://shopifyengineering.myshopify.com/blogs/engineering/introducing-roast) — Earlier structured AI workflow framework
- [Databricks: Introducing Genie Code](https://www.databricks.com/blog/introducing-genie-code) — Data-specific coding agent
- [Cognition: How Cognition Uses Devin to Build Devin](https://www.cognition-labs.com/blog/how-cognition-uses-devin-to-build-devin) — 659 Devin PRs merged in one week
- [Google: Jules async coding agent](https://blog.google/technology/google-labs/jules) — Ephemeral VM per task, GitHub-issue driven
- [Vercel: AEO tracking for coding agents](https://vercel.com/blog/how-we-built-aeo-tracking-for-coding-agents) — Agents in ephemeral Firecracker microVMs
- [Figma: Agents Meet the Figma Canvas](https://www.figma.com/blog/the-figma-canvas-is-now-open-to-agents) — Design canvas as a tool for coding agents
- [GitHub: Mission Control](https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/) — Fleet-orchestration UI for Copilot cloud agent
- [Ry Walker: In-House Coding Agents — Build vs Buy](http://rywalker.com/research/in-house-coding-agents) — Cross-company survey aggregating many of the above

### Production Systems (agent frameworks + case studies)

| System | Scale | Key Insight |
|--------|-------|-------------|
| [Stripe Minions Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) | 1,300 PRs/week | One-shot tree, 400+ MCP tools, warm EC2 |
| [Stripe Minions Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2) | Zero human-written code | Devboxes, conditional rules, max 2 CI retries |
| [Spotify Honk Part 1](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) | 650+ PRs/month | Containerized K8s fleet management |
| [Spotify Honk Part 2](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2) | 60-90% time savings | Context engineering, Claude Code as top agent |
| [Spotify Honk Part 3](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3) | Judge catches scope-creep / phantom fixes | Verification loops, LLM judge |
| [Spotify Honk Part 4](https://engineering.atspotify.com/2026/4/background-coding-agents-dataset-migrations-honk-part-4) | 240 automated PRs, ~10 engineering weeks saved | Standardization and executable verification define the automation boundary |
| [Spotify: Coding Is No Longer the Constraint](https://engineering.atspotify.com/2026/6/code-with-claude-coding-is-no-longer-the-constraint) | PR frequency +76% | Review and organizational adaptation become the constraint |
| [Spotify x Anthropic (April 2026)](https://engineering.atspotify.com/2026/4/anthropic-agentic-development/) | Slack-@mention-driven | Backstage evolving to agent-first MCP platform |
| [Ramp Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) | ~50% of merged PRs | Modal snapshot-based warm pools |
| [Ramp on Modal](https://modal.com/blog/how-ramp-built-a-full-context-background-coding-agent-on-modal) | 1,000 Datadog monitors | Self-maintaining code, auto-generated monitoring |
| [OpenAI Harness Engineering](https://openai.com/index/harness-engineering/) | 1M lines, 1,500 PRs | Environment-first, 3.5 PRs/engineer/day |
| [OpenAI Symphony](https://openai.com/index/open-source-codex-orchestration-symphony/) | Some teams +500% landed PRs in three weeks | Bounded interactive WIP plus background issue orchestration |
| [Shopify River + Aquifer](https://shopify.engineering/under-the-river) | 3,536 merged PRs in 30 days | Durable sessions, append-only event log, disposable harness/sandbox |
| [Block Builderbot](https://block.xyz/inside/block-rolls-out-builderbot-a-new-suite-of-ai-native-tools-that-changes-the-way-we-ship) | First-party claim: ~1,500 merged PRs/week | Shared agent-native delivery platform |
| [Nubank + Devin](https://building.nubank.com/enhancing-engineering-workflows-with-ai-a-real-world-experience/) | 100K migrations | 12x efficiency, 20x cost savings |
| [Nubank Agent Infra](http://nubank.dev/) *(Mar 2026)* | 131M customers | Clojure-based internal agent infrastructure |
| [Coinbase Forge (née Cloudbot)](https://www.coinbase.com/blog/Tools-for-Developer-Productivity-at-Coinbase) | 5% of merged PRs | 150h → 15h cycle time, agent councils |
| [LangChain Open SWE](https://blog.langchain.com/open-swe-an-open-source-framework-for-internal-coding-agents/) *(Mar 2026)* | — | Open-source framework distilling Minions + Inspect + Forge |

### Architecture & Patterns

- [LangChain Harness Engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/) — Harness-only improvements: 52.8% → 66.5% on Terminal Bench 2.0
- [LangChain Deep Agents](https://github.com/langchain-ai/deepagents) — 21K stars, v0.5.3 (April 2026) with AGENTS.md integration, subagent structured output
- [Context Engineering (Martin Fowler)](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html) — Dynamic context assembly vs static prompts
- [Context Rot (Chroma Research)](https://research.trychroma.com/context-rot) — How context degrades over agent turns
- [Cloudflare Agents Week 2026](https://blog.cloudflare.com/agents-week-in-review/) — Dynamic Workers GA, Artifacts (Git-versioned agent storage), Cloudflare Mesh, Project Think
- [Cloudflare Dynamic Workers](https://blog.cloudflare.com/dynamic-workers/) — V8 isolates, $0.002/Worker/day, 100x faster/cheaper than containers
- [Sandbox Architecture (Weng Jialin)](https://wengjialin.com/blog/agent-sandbox/) — Agent-inside vs sandbox-as-tool patterns
- [Sandbox Comparison (Northflank)](https://northflank.com/blog/best-sandboxes-for-coding-agents) — Side-by-side agent sandbox platforms
- [Agent Filesystems (Arize)](https://arize.com/blog/agent-interfaces-in-2026-filesystem-vs-api-vs-database-what-actually-works/) — Filesystem vs API vs database interfaces
- [Composio Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator) — Fleet management with plugin-based architecture (4.5K stars)
- [Paperclip](https://github.com/paperclipai/paperclip) — Org-chart orchestration, **57.4K stars** (April 2026), v2026.416.0

### Research Foundations

The papers that shaped how technical audiences think about coding agents. Missing any of these is a red flag.

- [ReAct (Yao et al., 2022)](https://arxiv.org/abs/2210.03629) — Reasoning + acting interleaved; foundation of most modern agent loops
- [Toolformer (Schick et al., 2023)](https://arxiv.org/abs/2302.04761) — LLMs self-teaching tool use
- [SWE-agent (Yang et al., NeurIPS 2024)](https://arxiv.org/abs/2405.15793) — Agent-computer interface design; one of the first strong coding-agent harnesses
- [OpenHands / CodeAct (Wang et al., 2024)](https://arxiv.org/abs/2407.16741) — Executable code as unified action space; open-source agent framework with 30K+ stars
- [SWE-bench (ICLR 2024)](https://arxiv.org/abs/2310.06770) — 2,294 real GitHub issues, baseline eval standard
- [SWE-bench Official Leaderboard](https://www.swebench.com/) — Public benchmark signal; do not treat rankings as production readiness
- [SWE-bench Pro (Scale AI, 2025)](https://arxiv.org/abs/2509.16941) — 1,865 long-horizon tasks, but benchmark quality is now disputed
- [OpenAI coding-evaluation audit (July 2026)](https://openai.com/index/separating-signal-from-noise-coding-evaluations) — Estimates ~30% of Pro tasks are broken and retracts the earlier recommendation to replace Verified with Pro
- [SWE-bench Multimodal](https://arxiv.org/abs/2410.03859) — 617 visual UI tasks, only ~12% solved by top systems
- [Alibaba SWE-CI (2025)](https://arxiv.org/abs/2504.08057) — 75% of agents break working code across consecutive PRs
- [Answer.AI Devin Critique (Jan 2025)](https://www.answer.ai/posts/2025-01-08-devin.html) — Independent teardown of Devin's actual completion rate on real tasks
- [Anthropic 2026 Agentic Coding Trends](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf) — Context engineering, tool use, error reduction metrics
- [AI Writes Faster Than Humans Can Review](https://arxiv.org/abs/2607.01904) — 802-developer longitudinal study of throughput, review load, and quality proxies
- [ProdCodeBench](https://arxiv.org/abs/2604.01527) — Production-derived prompts, diffs, and stable executable tests across seven languages
- [Needle in the Repo](https://arxiv.org/abs/2603.27745) — Functional tests plus structural maintainability oracles
- [AgentLens](https://arxiv.org/abs/2607.06624) — Formal verification plus whole-trajectory review

### IDE / Pair-Programming Agents

These sit on a different axis from background agents — human-in-loop editors. Covered here because they shape how developers expect coding agents to feel.

- [Cursor](https://cursor.com) — AI-native IDE, dominant category incumbent
- [Windsurf](https://codeium.com/windsurf) — Cascade agent mode, Codeium successor IDE
- [Cline](https://github.com/cline/cline) — Open-source VS Code autonomous assistant, Plan+Act modes
- [Continue.dev](https://continue.dev) — Open-source IDE extensions (VS Code, JetBrains)
- [JetBrains Junie + Air](https://www.jetbrains.com/junie/) — Standalone coding agent + structural code awareness
- [Cognition Devin](https://devin.ai) — Cloud IDE with autonomous agent
- [Factory.ai](https://factory.ai) — Droids across 6+ surfaces
- [Replit Agent](https://replit.com) — Browser-based autonomous agent

### Platforms & Ecosystems

- [Model Context Protocol](https://github.com/modelcontextprotocol/specification) — Open standard, 7.5K+ stars
- [MCP 2026 Roadmap](https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/) *(March 2026)* — Next spec tentatively June 2026
- [JFrog MCP Registry](https://jfrog.com/blog/announcing-general-availability-of-the-jfrog-mcp-registry/) *(March 2026)* — Enterprise MCP control plane, GA
- [AGENTS.md Standard](https://agents.md/) — 60K+ repos adoption, Linux Foundation stewardship
- [GitHub Agent HQ](https://github.blog/news-insights/company-news/welcome-home-agents/) — Claude + Codex now live in Agent HQ (Pro+/Enterprise)
- [GitHub Agent Sessions in Issues/Projects](https://github.blog/changelog/2026-03-26-agent-activity-in-github-issues-and-projects) *(March 2026)*
- [Linear Agent](https://linear.app/changelog/2026-03-24-introducing-linear-agent) *(March 2026)* — Public beta, 75% of Linear enterprise workspaces have a coding agent
- [Open-Inspect](https://github.com/ColeMurray/background-agents) — OSS reimplementation of Ramp Inspect on Cloudflare + Modal (~1K stars)
- [background-agents.com](https://background-agents.com) — Industry overview

### Agent Memory & Knowledge

- [Karpathy Autoresearch](https://github.com/karpathy/autoresearch) — Overnight research loop: prepare → train → evaluate → accept/reject
- [Karpathy LLM Wiki Pattern](https://x.com/karpathy) *(April 2026)* — 18M views, spawned memory-layer discourse
- [QMD (Tobi Lutke)](https://github.com/tobi/qmd) — v2.1.0 (April 2026), 21K+ stars, 96% token reduction on agentic retrieval
- [Napkin](https://github.com/Michaelliv/napkin) — Progressive disclosure memory, BM25, sql.js, 99.8% recall on HotpotQA
- [TigerFS](https://tigerfs.io) — Mount databases as POSIX directories
- [AgentFS (Turso)](https://github.com/tursodatabase/agentfs) — Database-as-directory for agent workspaces

### Strategy & Cost

- [Karpathy Software Factory Thesis](../patterns/self-improvement/karpathy-software-factory-thesis.md) — Code quality findings, instruction compliance crisis
- [Agent Pricing Analysis (Cosine)](https://cosine.sh/blog/ai-coding-agent-pricing-task-vs-token) — Per-run vs token-based vs task-based pricing
- [FinOps for Agentic AI](https://analyticsweek.com/finops-for-agentic-ai-cloud-cost-2026/) — $400M collective cloud leak estimate
- [Stripe Walls > Models](https://www.anup.io/stripes-coding-agents-the-walls-matter-more-than-the-model/) — Why governance matters more than model capability

### Full Research Corpus

The `docs/` tree is the research corpus: pattern hubs, practitioner profiles, landscape, case studies, signals, and reference tables. See [AGENTS.md](../../AGENTS.md) for the parent/child map and [docs/index.json](../index.json) for the machine-readable index.
