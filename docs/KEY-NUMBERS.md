# Key Numbers — Quantitative Findings Index

*Every data point from the research corpus in one scannable reference.*

---

## Performance & Effectiveness

| Number | What It Means | Source Doc |
|--------|---------------|-----------|
| 52.8% → 66.5% | Terminal Bench 2.0 score, harness-only changes (GPT-5.2-Codex fixed) | [Harness Engineering (LangChain)](harness-engineering-langchain.md) |
| +13.7pp | Gain from harness engineering alone, no model changes | [Harness Engineering (LangChain)](harness-engineering-langchain.md) |
| 53.9% vs 66.5% | xhigh reasoning everywhere vs. reasoning sandwich | [Harness Engineering (LangChain)](harness-engineering-langchain.md) |
| 17pts apart | Same model, different harness (Spotify) | [Context Engineering](context-engineering.md) |
| 80.9% | Claude Code on SWE-bench Verified | [Coding Agents Landscape](coding-agents-landscape.md) |
| ~46% vs ~81% | Best model on SWE-bench Pro vs Verified (contamination gap) | [SWE-bench Ecosystem](swe-bench-ecosystem.md) |
| 40% fewer stalls | Sandboxing eliminates per-command approval (Cursor data) | [Sandbox Architecture 2026](sandbox-architecture-2026.md) |
| ~25% veto rate | Spotify LLM judge catches scope creep and phantom fixes | [Potent Combos](potent-combos.md) |
| ~70% first-pass CI | Stripe agent success rate on CI repair | [Potent Combos](potent-combos.md) |
| 89% acceptance rate | With diff summaries vs 62% without (Anthropic 2026) | [Context Engineering](context-engineering.md) |
| 40% error reduction | Context engineering impact (Anthropic 2026 Report) | [README](../README.md) |
| 2-4x faster delivery | Plan → production with agents (Anthropic 2026) | [README](../README.md) |
| 1.75x more logic errors | AI-generated code vs human (CodeRabbit) | [Enterprise Adoption](enterprise-adoption.md) |
| 2.74x more XSS vulns | AI-generated code vs human (CodeRabbit) | [Enterprise Adoption](enterprise-adoption.md) |

## Context & Token Management

| Number | What It Means | Source Doc |
|--------|---------------|-----------|
| 52% cheaper | Observation masking vs raw context (JetBrains) | [Context Engineering](context-engineering.md) |
| +2.6% solve rate | Observation masking bonus over baseline (JetBrains) | [Context Engineering](context-engineering.md) |
| 22-37% less hallucination | BM25 pre-filtering impact | [README](../README.md) |
| 85% perf degradation | Large tool spaces — scope to ~20 tools | [README](../README.md) |
| 47 tool calls/session | Average in 2026 (Anthropic Report) | [README](../README.md) |
| 78% multi-file edits | Up from 34% in 2025 (Anthropic Report) | [README](../README.md) |
| ~500 MCP tools | Stripe Toolshed, curated to ~15 per task | [Enterprise Adoption](enterprise-adoption.md) |
| 64% accuracy | MCPBench benchmark for MCP tool use | [MCP Ecosystem](mcp-ecosystem-deep-dive.md) |
| 81K GitHub stars | MCP protocol adoption metric | [MCP Ecosystem](mcp-ecosystem-deep-dive.md) |
| 96% token savings | QMD vs grep for 600+ note Obsidian vault (15K → ~500 tokens) | [Agent Memory Systems](agent-memory-systems.md) |
| 70,000x cheaper | Obsidian CLI vs grep for orphan detection (7M → 100 tokens) | [Agent Memory Systems](agent-memory-systems.md) |
| 16K stars | QMD (Tobi Lütke) — local BM25 + vector + LLM re-ranking | [Agent Memory Systems](agent-memory-systems.md) |

## Cost & Economics

| Number | What It Means | Source Doc |
|--------|---------------|-----------|
| $297 → $50K value | Carson's Symphony: API cost vs work delivered | [Symphony + Carson](symphony-carson.md) |
| $0.50–$3.00/PR | Stripe simple PRs, $5-$20 complex | [Agent Safety & Cost Control](agent-safety-cost-control.md) |
| $4.50–$9.00/task | Devin ACU pricing (30-60 min) | [Agent Safety & Cost Control](agent-safety-cost-control.md) |
| $2.25/ACU (~$9/hr) | Devin compute unit pricing | [Agent Safety & Cost Control](agent-safety-cost-control.md) |
| $400M unbudgeted | Fortune 500 collective cloud leak from runaway agents | [Agent Safety & Cost Control](agent-safety-cost-control.md) |
| 5x cost spread | Sonnet → Opus token pricing difference | [Agent Safety & Cost Control](agent-safety-cost-control.md) |
| $7.8B → $52.6B | Market size 2025→2030 at 46% CAGR | [Enterprise Adoption](enterprise-adoption.md) |
| >$10B ARR | Autonomous coding agent market in 2026 | [Coding Agents Landscape](coding-agents-landscape.md) |
| $2B ARR | Cursor alone | [Coding Agents Landscape](coding-agents-landscape.md) |
| $2.5B ARR | Claude Code alone | [Coding Agents Landscape](coding-agents-landscape.md) |
| $42/mo | Full CI/CD dev tools stack | [Dev Tools Stack](dev-tools-stack.md) |

## Enterprise Adoption

| Number | What It Means | Source Doc |
|--------|---------------|-----------|
| 1,300 PRs/week | Stripe Minions throughput | [Enterprise Adoption](enterprise-adoption.md) |
| 3.5 PRs/eng/day | OpenAI harness-built product | [Harness Engineering (OpenAI)](harness-engineering.md) |
| ~1M lines, 0 hand-written | OpenAI product built entirely by agents | [Harness Engineering (OpenAI)](harness-engineering.md) |
| 650+ PRs/month | Spotify Honk merged into production | [Enterprise Adoption](enterprise-adoption.md) |
| 84% of developers | Uber agentic coding adoption rate | [Enterprise Adoption](enterprise-adoption.md) |
| 65-72% of code | AI-generated at Uber | [Enterprise Adoption](enterprise-adoption.md) |
| 5,000+ engineers | EY on Factory.ai Droids | [Enterprise Adoption](enterprise-adoption.md) |
| 80% of Fortune 500 | Using active AI agents in production (Microsoft) | [Enterprise Adoption](enterprise-adoption.md) |
| 57% have agents in prod | LangChain survey of their users | [README](../README.md) |
| 89% adopted observability | LangChain survey | [README](../README.md) |
| 52% adopted evals | LangChain survey (low!) | [README](../README.md) |
| 32% cite quality barrier | LangChain survey | [README](../README.md) |
| 12x efficiency | Nubank data migrations with Devin | [Devin + Factory.ai](devin-factory.md) |
| 20x cost savings | Nubank with Devin | [Devin + Factory.ai](devin-factory.md) |
| 79% time reduction | Rakuten: 24 days → 5 days time-to-market | [Enterprise Adoption](enterprise-adoption.md) |
| 30% faster shipping | TELUS with AI coding tools | [Enterprise Adoption](enterprise-adoption.md) |
| 500K hours saved | TELUS across 13,000+ custom solutions | [Enterprise Adoption](enterprise-adoption.md) |
| 1,000 PRs / 10 days | Spotify Honk current velocity (was 1,000/3mo) | [Potent Combos](potent-combos.md) |
| ~100 experiments overnight | Karpathy autoresearch output | [Autoresearch](autoresearch.md) |
| 700 experiments / 2 days | Karpathy autoresearch scaled run, 20 optimizations found | [Potent Combos](potent-combos.md) |
| 19% performance gain | Shopify CEO using autoresearch overnight (37 experiments) | [Potent Combos](potent-combos.md) |
| 11% training speedup | Karpathy's 20 tweaks applied to larger LM | [Potent Combos](potent-combos.md) |
| 10 parallel agents | Carson Symphony max concurrency | [Symphony + Carson](symphony-carson.md) |
| 14.2K stars in 1 week | Paperclip AI GitHub traction | [Potent Combos](potent-combos.md) |
| 53% faster parse+render | Shopify Liquid PR #2056 (Lütke autoresearch loop, ~120 iterations) | [Autoresearch](autoresearch.md) |
| 61% fewer allocations | Shopify Liquid PR #2056 (62,620 → 24,530 objects) | [Autoresearch](autoresearch.md) |
| +18.3% robustness | AutoResearchClaw MetaClaw cross-run learning | [Autoresearch](autoresearch.md) |
| 23 stages, 8 phases | AutoResearchClaw full idea-to-paper pipeline | [Autoresearch](autoresearch.md) |
| 2.2K stars | pi-autoresearch extension (productized autoresearch pattern) | [Autoresearch](autoresearch.md) |
| 625 stars | Executor (code-as-tool-calling, RhysSullivan) | [MCP Ecosystem](mcp-ecosystem-deep-dive.md) |
| 67% vs 17% accept rate | GPT-5.4 vs Codex-Spark autoresearch proposal acceptance (0xSero/SarahXC) | [Autoresearch](autoresearch.md) |
| 100+ iterations | 0xSero/SarahXC autoresearch experiments across 2 setups, 12h on H100 | [Autoresearch](autoresearch.md) |
| 97% API cost reduction | Joe McCann: X API costs via one pi-autoresearch loop | [Autoresearch](autoresearch.md) |
| 10x rendering speedup | Kaspars Dancis: canvas rendering engine via pi-autoresearch (hours) | [Autoresearch](autoresearch.md) |
| 1,377 stars | pi-autoresearch ecosystem adoption (8 days after Karpathy open-source) | [Autoresearch](autoresearch.md) |
| 701 stars | autoresearch-mlx (Apple Silicon port, M4 Max: val_bpb 2.667→1.294) | [Autoresearch](autoresearch.md) |
| 608 stars | autokernel (GPU CUDA/Triton optimization, ~40 exp/hr) | [Autoresearch](autoresearch.md) |
| 6 ecosystem forks | Active autoresearch derivatives in 8 days (pi, mlx, kernel, agents, factory, ports) | [Autoresearch](autoresearch.md) |
| 2.1K stars | GSD 2 — spec-driven agent session controller | [Potent Combos](potent-combos.md), [Coding Agents Landscape](coding-agents-landscape.md) |
| 1,393 commits | GSD 2 maturity (v2.29) | [Potent Combos](potent-combos.md) |
| 200K tokens | GSD 2 fresh context window per task | [Potent Combos](potent-combos.md) |

## Multi-Agent Topology Research

| Number | What It Means | Source Doc |
|--------|---------------|-----------|
| 58.8% pass@1 | AgentConductor on APPS (+14.6% over MetaGPT) | [Potent Combos](potent-combos.md) |
| 68% token reduction | AgentConductor vs strongest baseline | [Potent Combos](potent-combos.md) |
| 3B params | AgentConductor orchestrator model (vs 32B for competitors) | [Potent Combos](potent-combos.md) |
| ~45% error detection | LLM-as-Judge alone; 94% combined with deterministic tools | [Potent Combos](potent-combos.md) |
| 79% false positive rate | LLM judge for code correctness without grounding (Spotify) | [Potent Combos](potent-combos.md) |

## Anti-Pattern Thresholds

| Number | What It Means | Source Doc |
|--------|---------------|-----------|
| Max 2 CI retries | Stripe hard limit before escalating to human | [Enterprise Adoption](enterprise-adoption.md) |
| <5s local lint | Stripe: lint locally before any CI push | [Enterprise Adoption](enterprise-adoption.md) |
| 5-min hard kill | Timeout for runaway agent execution | [Agent Safety & Cost Control](agent-safety-cost-control.md) |
| $2/run, $5/day | Software Factory default budget caps | [Agent Safety & Cost Control](agent-safety-cost-control.md) |
| ~20 tools max | Beyond this, 85% performance degradation | [README](../README.md) |
| 400 lines max | File size limit before mandatory split | CLAUDE.md |
| 85% context threshold | Deep Agents auto-summarization trigger | [Deep Agents](deep-agents.md) |
