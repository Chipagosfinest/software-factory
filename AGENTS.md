# AGENTS.md — Navigation Map

> Map, not an encyclopedia. Parse [docs/index.json](docs/index.json) and open only the nodes you need.

*Refreshed 2026-11-01*

## Rule

Every new doc declares a parent in [docs/index.json](docs/index.json) and is listed there. Hubs use `"parent": null`. Anything else with no parent is an orphan. Before you commit, run `npm run check:index`. It fails on unindexed files, missing files, broken ids or links, orphans, and a `docCount` that does not match the markdown files under `docs/`.

## Tree

- [Harness engineering](docs/patterns/harness-engineering/README.md)
  - [OpenAI](docs/patterns/harness-engineering/harness-engineering-openai.md)
  - [LangChain](docs/patterns/harness-engineering/harness-engineering-langchain.md)
  - [Deep Agents](docs/patterns/harness-engineering/deep-agents.md)
  - [Context engineering](docs/patterns/harness-engineering/context-engineering.md)
  - [codex-planr](docs/patterns/harness-engineering/codex-planr.md)
- [Background agents](docs/patterns/background-agents/README.md)
  - [Sandbox isolation](docs/patterns/background-agents/sandbox-isolation.md)
  - [Sandbox architecture 2026](docs/patterns/background-agents/sandbox-architecture-2026.md)
  - [Open-Inspect architecture](docs/patterns/background-agents/background-agents-open-inspect.md)
  - [Agent filesystems](docs/patterns/background-agents/agent-filesystems.md)
  - [Cloudflare Dynamic Workers](docs/patterns/background-agents/cloudflare-dynamic-workers.md)
- [Orchestration](docs/patterns/orchestration/README.md)
  - [Symphony-style orchestrator](docs/patterns/orchestration/orchestrator.md)
  - [Composio Agent Orchestrator](docs/patterns/orchestration/agent-orchestrator.md)
  - [Paperclip org chart](docs/patterns/orchestration/paperclip-org-chart.md)
  - [Symphony role inversion](docs/patterns/orchestration/symphony-carson.md)
  - [Potent Combos](docs/patterns/orchestration/potent-combos.md)
- [Verification](docs/patterns/verification/README.md)
  - [SWE-bench ecosystem](docs/patterns/verification/swe-bench-ecosystem.md)
- [Governance and safety](docs/patterns/governance-safety/README.md)
  - [Agent safety and cost control](docs/patterns/governance-safety/agent-safety-cost-control.md)
  - [Repo protection tooling](docs/patterns/governance-safety/repo-protection-tooling-comparison-2026-04-27.md)
- [Memory and knowledge](docs/patterns/memory-knowledge/README.md)
  - [Agent memory systems](docs/patterns/memory-knowledge/agent-memory-systems.md)
  - [QMD](docs/patterns/memory-knowledge/qmd.md)
  - [Obsidian knowledge](docs/patterns/memory-knowledge/obsidian-knowledge.md)
  - [Latent briefing / KV compaction](docs/patterns/memory-knowledge/latent-briefing-kv-compaction.md)
- [Self-improvement](docs/patterns/self-improvement/README.md)
  - [Autoresearch](docs/patterns/self-improvement/autoresearch.md)
  - [Karpathy software factory thesis](docs/patterns/self-improvement/karpathy-software-factory-thesis.md)
  - [Ramp self-maintaining code](docs/patterns/self-improvement/ramp-self-maintaining-code.md)
- [Landscape](docs/landscape/README.md)
  - [Enterprise adoption](docs/landscape/enterprise-adoption.md)
  - [Devin and Factory.ai](docs/landscape/devin-factory.md)
  - [GitHub ecosystem](docs/landscape/github-ecosystem.md)
  - [Dev tools stack](docs/landscape/dev-tools-stack.md)
  - [MCP ecosystem](docs/landscape/mcp-ecosystem-deep-dive.md)
- [Case studies](docs/case-studies/README.md)
  - [State of play, 2026-07-16](docs/case-studies/production-case-studies-state-of-play-2026-07-16.md)
  - [Codebase sprawl, 2026-05-26](docs/case-studies/autonomous-codebase-sprawl-2026-05-26.md)
  - [Post-merge review, 2026-05-26](docs/case-studies/autonomous-codebase-post-merge-review-2026-05-26.md)
- [Signals](docs/signals/README.md)
  - [X insights](docs/signals/x-insights.md)
- [Reference](docs/reference/README.md)
  - [Glossary](docs/reference/glossary.md)
  - [Key numbers](docs/reference/key-numbers.md)
  - [Open questions](docs/reference/open-questions.md)
- [Project](docs/project/README.md)
  - [Codebase status](docs/project/codebase-status.md)
  - [Roadmap](docs/project/roadmap.md)
  - [Risk forecast](docs/project/risk-forecast.md)
  - [Operations](docs/project/software-factory-operations-2026-07-16.md)
- [Practitioners](docs/practitioners/README.md) — one profile per team; see the README section "Practitioners doing this well"

## When to use what

| Situation | Pattern | Example teams | Doc |
|-----------|---------|---------------|-----|
| Many independent, well-scoped tasks | Background agents | Stripe Minions, Spotify Honk | [Background agents](docs/patterns/background-agents/README.md) |
| Humans join one sandbox mid-flight | Background agents | Ramp Inspect, Open-Inspect | [Sandbox isolation](docs/patterns/background-agents/sandbox-isolation.md) |
| Same model, weak results | Harness engineering | OpenAI Codex, LangChain Deep Agents | [Harness engineering](docs/patterns/harness-engineering/README.md) |
| Clear done-signal, scope creep is the risk | Verification | Spotify Honk, StrongDM | [Verification](docs/patterns/verification/README.md) |
| CI latency blocks agent throughput | Verification | Vercel, Stripe Minions | [Vercel](docs/practitioners/vercel.md) |
| Several agents need budget, locks, or a lifecycle | Orchestration | Paperclip, Composio | [Orchestration](docs/patterns/orchestration/README.md) |
| Spend or blast radius can run away | Governance and safety | Paperclip, Replit Agent Habitat, Cline | [Governance and safety](docs/patterns/governance-safety/README.md) |
| The window is full, or the next run must remember | Memory and knowledge | LangChain Deep Agents, Ramp Labs | [Memory and knowledge](docs/patterns/memory-knowledge/README.md) |
| An objective metric should keep a loop running | Self-improvement | Ramp Inspect, StrongDM, Amp | [Self-improvement](docs/patterns/self-improvement/README.md) |
| You need the market map, not a mechanism | Landscape | — | [Landscape](docs/landscape/README.md) |
| You need a dated production survey | Case studies | Shopify, Block, DoorDash, Spotify | [State of play](docs/case-studies/production-case-studies-state-of-play-2026-07-16.md) |

Numbers live in [key numbers](docs/reference/key-numbers.md). Terms live in the [glossary](docs/reference/glossary.md). Unsettled conflicts live in [open questions](docs/reference/open-questions.md). Recent primary posts live in [X insights](docs/signals/x-insights.md). This repo's own build state lives under [Project](docs/project/README.md).

## How the index is shaped

`parent` is the containment link. `children` is the inverse, maintained on the parent. `relatedDocs` is lateral: a note can point at a peer without becoming its child. `patterns` on a practitioner and `practitioners` on a pattern are the cross-links between those two kinds. `sources` are URLs, not nicknames.

A pattern hub (`docs/patterns/<name>/README.md`) is `kind: hub` with `parent: null`. Its writeups are `kind: pattern`. Practitioner profiles are `kind: practitioner` and parent to [practitioners](docs/practitioners/README.md). Do not file a new team note under a pattern directory; link it.

## Adding a doc

1. Pick the parent hub. If none fits, add a hub first. Do not leave the file at `docs/` root.
2. Use a kebab-case filename. The id matches that filename (`README.md` hubs use the directory name).
3. Add the entry to [docs/index.json](docs/index.json): `kind`, `parent`, `sources`, and either `patterns` or `practitioners` when the kind requires it. Set `docCount` to the number of `docs/**/*.md` files.
4. Link the new file from its parent README and from this tree.
5. Run `npm run check:index`. Fix orphans, broken relative links, and id mismatches before committing.

## First read

1. [README](README.md) — thesis, topology sketches, practitioner one-liners
2. [Harness engineering](docs/patterns/harness-engineering/README.md) — the environment around the model
3. [Potent Combos](docs/patterns/orchestration/potent-combos.md) — how the topologies compose
4. [Verification](docs/patterns/verification/README.md) — deterministic checks, judge, bounded retries
