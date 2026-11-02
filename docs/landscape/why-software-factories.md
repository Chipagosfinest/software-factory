# Why Software Factories

Published production receipts for agent-native software delivery. This is a living compilation of company-reported scale, not a dated state-of-play survey. The current market map is [Landscape](./README.md). Archived production surveys are under [case studies](../case-studies/README.md).

## Thesis

**Core thesis:** Agents produce working but low-quality code, and instruction-based constraints (CLAUDE.md, AGENTS.md) don't enforce quality. The solution is programmatic verification — deterministic checks + LLM judge + bounded retries. How you wire the agents together matters more than how smart they are.

A dozen companies have proven the pattern at scale and published the receipts. All converged on the same primitives: isolated sandboxes, PRs as review gates, humans review before merge.

| Company | System | Scale | Key Insight |
|---------|--------|-------|-------------|
| **Uber** | [Minion / uReview / Autocover / Shepherd](https://newsletter.pragmaticengineer.com/p/how-uber-uses-ai-for-development) | 92% monthly eng adoption, 11% of PRs opened by agents, uReview analyzes 90% of ~65K weekly diffs, Autocover saved 21K dev-hours | Four-layer agent stack with specialized internal products |
| **Cloudflare** | [Internal AI eng stack (self-hosted on their own products)](https://blog.cloudflare.com/internal-ai-engineering-stack/) | 93% R&D adoption, MRs grew 5,600 → 8,700/wk in 11 months, 51B+ tokens/mo | Dogfooding AI Gateway + Workers + Sandboxes as the platform |
| **Meta** | [Capacity Efficiency AI](https://engineering.fb.com/2026/04/16/developer-tools/capacity-efficiency-at-meta-how-unified-ai-agents-optimize-performance-at-hyperscale/) + [MetaMateCR paper](https://arxiv.org/pdf/2507.13499) | Capacity AI compressed ~10hr investigations to ~30min, recovered hundreds of megawatts; separate MetaMateCR paper reports ~68% exact-match patches | Unified agent marketplace with MCP-layer tools shared across defense/offense agents |
| **Anthropic** | [Claude Code dogfooding + Managed Agents](https://www.claude.com/blog/code-review) | 200% growth in output per engineer, substantive reviews 16% → 54%, 84% of 1000+ line PRs get findings | "Decouple brain from hands" harness thesis |
| **LinkedIn** | [CAPT (Contextual Agent Playbooks & Tools)](https://www.linkedin.com/blog/engineering/ai/contextual-agent-playbooks-and-tools-how-linkedin-gave-ai-coding-agents-organizational-context) | 1,000+ engineers, 500+ playbooks, 70% triage time drop, 3x data workflows | Organizational context as the agent primitive |
| **Stripe** | [Minions](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) | 1,300 PRs/week | Goose fork + devboxes (10s spin-up) + 400 MCP tools |
| **Spotify** | [Honk + Fleet Management](https://engineering.atspotify.com/2026/6/code-with-claude-coding-is-no-longer-the-constraint) | >99% weekly AI use, PR frequency +76%, 2.5M+ lifetime automated maintenance PRs across the broader Fleet Management system | Deterministic targeting + agentic code changes; admit only standardized, verifiable task classes |
| **Ramp** | [Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) | ~50% of merged PRs | Modal snapshot warm pools + multiplayer sessions |
| **Coinbase** | [Forge](https://www.coinbase.com/blog/Tools-for-Developer-Productivity-at-Coinbase) *(née Cloudbot)* | 5% of merged PRs, 150h → 15h cycle time | Cloud sandboxes + Slack-first + agent councils |
| **Block** | [Builderbot](https://block.xyz/inside/block-rolls-out-builderbot-a-new-suite-of-ai-native-tools-that-changes-the-way-we-ship) | First-party claim: 200K operations/day, ~1,500 merged PRs/week, ~15% of production changes | Shared company platform, not a collection of isolated assistants |
| **DoorDash** | [DashBench](https://careersatdoordash.com/blog/how-we-learned-to-trust-our-ai-code-reviewer-at-doordash/) | 105 replay cases; production scout+reviewer found 504 findings at 53.6% weighted recall | Acceptance telemetry is not ground truth; measure recall, precision, severity, latency, and cost |
| **Cognition** | [How Cognition Uses Devin to Build Devin](https://www.cognition-labs.com/blog/how-cognition-uses-devin-to-build-devin) | Hundreds of Devin PRs merged per week internally *(vendor-reported)* | Agent-to-agent REST API triggers |
| **Nubank** | [Devin deployment](https://building.nubank.com/enhancing-engineering-workflows-with-ai-a-real-world-experience/) | 100K data class migrations; 12x efficiency claimed *(vendor-reported via Cognition case study)* | Fine-tuned Devin on the Nubank codebase |
| **OpenAI** | [Symphony](https://openai.com/index/open-source-codex-orchestration-symphony/) + [Harness Engineering](https://openai.com/index/harness-engineering/) | Some teams reported +500% landed PRs in Symphony's first three weeks | Board-as-control-plane, bounded WIP, review packets, and CI/rebase shepherding |
| **Airbnb** | [Large-scale test migration with LLMs](https://airbnb.tech/infrastructure/accelerating-large-scale-test-migration-with-llms/) | 3.5K files Enzyme → RTL in 6 weeks, 75% auto in 4 hrs, 97% after 4 days | Canonical batch migration harness pattern |
| **Google** | [Jules — async coding agent](https://blog.google/technology/google-labs/jules) | 140K code improvements during beta | Ephemeral VM per task, GitHub-issue driven |
| **Pinterest** | [AI skill testing](https://medium.com/pinterest-engineering/an-engineers-guide-to-better-ai-skills-implementing-a-testing-process-to-optimize-agent-a000c9c9abcd) | 100-test harness; 73% Codex vs 62% Claude on vanilla skill invocation | Test whether agents load the right skill, especially for terse and ambiguous prompts |
| **Datadog** | [Harness-first agents](https://www.datadoghq.com/blog/ai/harness-first-agents/) | Production-like verification reported 87% less memory in one migration and ~93% peak disk throughput in another | Production telemetry and deterministic simulation are the evaluation substrate |
| **Shopify** | [River + Aquifer](https://shopify.engineering/under-the-river) | 1 in 8 merged PRs coauthored; 3,536 merged River PRs in 30 days | Durable session/event state separated from disposable harnesses and sandboxes |
| **GitHub** | [Agentic harness evaluation](https://github.blog/ai-and-ml/github-copilot/evaluating-performance-and-efficiency-of-the-github-copilot-agentic-harness-across-models-and-tasks/) | Same-model controlled comparisons across harnesses, tasks, tokens, cost, and run variance | Evaluate the harness, not just the model |
| **Databricks** | [Genie Code](https://www.databricks.com/blog/introducing-genie-code) | 2x a leading coding agent on internal benchmarks | Data-specific coding agent with proactive prod monitoring |
| **Vercel** | [AEO tracking for agents](https://vercel.com/blog/how-we-built-aeo-tracking-for-coding-agents) | — | Coding agents run in ephemeral Firecracker microVMs as probe fleet |

**The convergent primitives:** isolated sandboxes, queue-based dispatch, PRs as review gates, verification loops, bounded retries, cost governance, MCP tool layer, organizational context injection.

**Cross-company survey:** Ry Walker's [In-House Coding Agents: Build vs Buy](http://rywalker.com/research/in-house-coding-agents) (Feb 2026) aggregates many of these systems in one place — useful as a starting overview.
