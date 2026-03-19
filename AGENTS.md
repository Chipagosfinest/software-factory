# AGENTS.md — Navigation Map

> This file is a map, not an encyclopedia. ~100 lines. Read the linked docs for depth.

## Start Here

**First time?** Read these three in order:
1. [README.md](README.md) — The core insight, research sources, competency heat map
2. [Harness Engineering (OpenAI)](docs/harness-engineering.md) — The foundational pattern everything builds on
3. [Potent Combos](docs/potent-combos.md) — How the patterns compose into architectures

**Already familiar?** Jump to what you need below.

---

## If You Need To...

### Understand How Agents Work Internally

| Question | Read |
|----------|------|
| How do I structure the environment around a model? | [Harness Engineering (OpenAI)](docs/harness-engineering.md) |
| How do I compose agent capabilities via middleware? | [Deep Agents](docs/deep-agents.md) |
| What information should enter the context window? | [Context Engineering](docs/context-engineering.md) |
| How did LangChain get +13.7pp with harness-only changes? | [Harness Engineering (LangChain)](docs/harness-engineering-langchain.md) |
| How do I make agents plan before executing? | [codex-planr](docs/codex-planr.md) |
| How do I run agents in an infinite improvement loop? | [Autoresearch](docs/autoresearch.md) |
| How do agents search knowledge effectively? | [QMD](docs/qmd.md) |
| How do agents remember across sessions? | [Agent Memory Systems](docs/agent-memory-systems.md) |

### Deploy Agents at Scale

| Question | Read |
|----------|------|
| How does Spotify verify agent output with LLM judges? | [Sandbox Isolation](docs/sandbox-isolation.md) (Honk section) |
| How does Stripe process 1,300 PRs/week? | [Sandbox Isolation](docs/sandbox-isolation.md) (Minions section) |
| How does Ramp get sandboxes to start in seconds? | [Sandbox Isolation](docs/sandbox-isolation.md) (Inspect section) |
| How does Open-Inspect clone Ramp's architecture? | [Background Agents (Open-Inspect)](docs/background-agents-open-inspect.md) |
| What are the two sandbox architecture patterns? | [Sandbox Architecture 2026](docs/sandbox-architecture-2026.md) |
| How do I manage a fleet of agents? | [Paperclip](docs/paperclip.md) + [Agent Orchestrator](docs/agent-orchestrator.md) |
| How do I orchestrate with state machines and worktrees? | [Orchestrator](docs/orchestrator.md) |

### Govern and Control Agents

| Question | Read |
|----------|------|
| How do I prevent runaway costs? | [Agent Safety & Cost Control](docs/agent-safety-cost-control.md) |
| What approval patterns exist? | [Agent Safety & Cost Control](docs/agent-safety-cost-control.md) (Approval Gates) |
| What topologies/combos fit my team size? | [Potent Combos](docs/potent-combos.md) (Build Profiles) |

### Evaluate the Market

| Question | Read |
|----------|------|
| What tools exist and how do they compare? | [Coding Agents Landscape](docs/coding-agents-landscape.md) |
| How are enterprises adopting agentic coding? | [Enterprise Adoption](docs/enterprise-adoption.md) |
| How does Devin/Factory.ai compare to us? | [Competitive Analysis](docs/competitive-analysis.md) + [Devin + Factory.ai](docs/devin-factory.md) |
| What benchmarks matter and which are gamed? | [SWE-bench Ecosystem](docs/swe-bench-ecosystem.md) |
| What is GitHub building for agents? | [GitHub Ecosystem](docs/github-ecosystem.md) |
| What dev tools integrate well with agents? | [Dev Tools Stack](docs/dev-tools-stack.md) |
| How does MCP connect agents to tools? | [MCP Ecosystem](docs/mcp-ecosystem-deep-dive.md) |
| What does Carson's role-inversion thesis mean? | [Symphony + Carson](docs/symphony-carson.md) |

### Quick Reference

| Resource | What It Contains |
|----------|-----------------|
| [KEY-NUMBERS.md](docs/KEY-NUMBERS.md) | Every quantitative finding in one place |
| [GLOSSARY.md](docs/GLOSSARY.md) | Canonical definitions for ~40 terms |
| [OPEN-QUESTIONS.md](docs/OPEN-QUESTIONS.md) | Contradictions, unknowns, frontier |
| [Competency Graph](docs/competency-graph.md) | 25-dimension matrix across all sources |
| [index.json](docs/index.json) | Machine-parseable doc metadata for agents |

---

## For Agents Consuming This Repo

1. Parse [docs/index.json](docs/index.json) to find relevant docs by category/tags
2. Read only what's relevant — don't load all 34 docs
3. Numbers are consolidated in [KEY-NUMBERS.md](docs/KEY-NUMBERS.md) — no need to grep
4. Term definitions are in [GLOSSARY.md](docs/GLOSSARY.md) — use canonical meanings

---

## Internal Docs (Project-Specific)

| Document | Purpose |
|----------|---------|
| [Roadmap](docs/roadmap.md) | Software Factory build phases |
| [Risk Forecast](docs/risk-forecast.md) | First-30-days operational risks |
| [Codebase Status](docs/codebase-status.md) | Implementation progress tracking |
