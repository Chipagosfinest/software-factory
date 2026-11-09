# AGENTS.md — Navigation Map

Read [README](README.md) first, then only the doc this map points at. The current market map is [Landscape](docs/landscape/README.md). Weekly posts are [X insights](docs/signals/x-insights.md). YouTube channels and recent teaching videos are [YouTube](docs/signals/youtube.md).
Use the decision table below to choose a pattern. Do not load the whole tree.
Every new doc is listed in [docs/index.json](docs/index.json) with a parent (`null` only for hubs) and `status` of `current` or `snapshot`. Run `npm run check:index` before you commit.

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
| You need the current market map | Landscape | — | [Landscape](docs/landscape/README.md) |
| You need an archived production survey | Case studies | Shopify, Block, DoorDash, Spotify | [State of play, as of 2026-07-16](docs/case-studies/production-case-studies-state-of-play-2026-07-16.md) |

Numbers live in [key numbers](docs/reference/key-numbers.md). Terms live in the [glossary](docs/reference/glossary.md). Unsettled conflicts live in [open questions](docs/reference/open-questions.md). This repo's build state lives under [Project](docs/project/README.md).

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
  - [Choosing a topology](docs/patterns/orchestration/topology-choice.md)
- [Verification](docs/patterns/verification/README.md)
  - [SWE-bench ecosystem](docs/patterns/verification/swe-bench-ecosystem.md)
  - [Quality loop](docs/patterns/verification/quality-loop.md)
- [Governance and safety](docs/patterns/governance-safety/README.md)
  - [Agent safety and cost control](docs/patterns/governance-safety/agent-safety-cost-control.md)
  - [Repo protection tooling (archived snapshot as of 2026-04-27)](docs/patterns/governance-safety/repo-protection-tooling-comparison-2026-04-27.md)
  - [Agent security catalog (archived snapshot as of April 2026)](docs/patterns/governance-safety/agent-security-catalog.md)
- [Memory and knowledge](docs/patterns/memory-knowledge/README.md)
  - [Agent memory systems](docs/patterns/memory-knowledge/agent-memory-systems.md)
  - [QMD](docs/patterns/memory-knowledge/qmd.md)
  - [Obsidian knowledge](docs/patterns/memory-knowledge/obsidian-knowledge.md)
  - [Latent briefing / KV compaction](docs/patterns/memory-knowledge/latent-briefing-kv-compaction.md)
- [Self-improvement](docs/patterns/self-improvement/README.md)
  - [Autoresearch](docs/patterns/self-improvement/autoresearch.md)
  - [Karpathy software factory thesis](docs/patterns/self-improvement/karpathy-software-factory-thesis.md)
  - [Ramp self-maintaining code](docs/patterns/self-improvement/ramp-self-maintaining-code.md)
- [Landscape](docs/landscape/README.md) — current state of play
  - [Enterprise adoption](docs/landscape/enterprise-adoption.md)
  - [Devin and Factory.ai](docs/landscape/devin-factory.md)
  - [GitHub ecosystem](docs/landscape/github-ecosystem.md)
  - [Dev tools stack](docs/landscape/dev-tools-stack.md)
  - [MCP ecosystem](docs/landscape/mcp-ecosystem-deep-dive.md)
  - [Why software factories](docs/landscape/why-software-factories.md)
- [Case studies](docs/case-studies/README.md) — archived snapshots
  - [State of play, as of 2026-07-16](docs/case-studies/production-case-studies-state-of-play-2026-07-16.md)
  - [Codebase sprawl, as of 2026-05-26](docs/case-studies/autonomous-codebase-sprawl-2026-05-26.md)
  - [Post-merge review, as of 2026-05-26](docs/case-studies/autonomous-codebase-post-merge-review-2026-05-26.md)
- [Signals](docs/signals/README.md)
  - [X insights](docs/signals/x-insights.md)
  - [YouTube](docs/signals/youtube.md)
- [Reference](docs/reference/README.md)
  - [Glossary](docs/reference/glossary.md)
  - [Key numbers](docs/reference/key-numbers.md)
  - [Open questions](docs/reference/open-questions.md)
  - [Corpus bibliography](docs/reference/corpus-bibliography.md)
- [Project](docs/project/README.md)
  - [Codebase status](docs/project/codebase-status.md) — audit as of 2026-07-16
  - [Roadmap](docs/project/roadmap.md)
  - [Risk forecast](docs/project/risk-forecast.md)
  - [Reference implementation](docs/project/reference-implementation.md)
  - [Operations (archived snapshot as of 2026-07-16)](docs/project/software-factory-operations-2026-07-16.md)
- [Practitioners](docs/practitioners/README.md) — 79 profiles in six categories; cited one-liners are in that README

## How the index is shaped

`parent` is the containment link. `children` is the inverse, maintained on the parent. `relatedDocs` is lateral. `patterns` on a practitioner and `practitioners` on a pattern are the cross-links. `sources` are URLs. `status` is `current` or `snapshot`. A snapshot is an archived survey as of the date in its name or header, not the current state of play.

A pattern hub (`docs/patterns/<name>/README.md`) is `kind: hub` with `parent: null`. Its writeups are `kind: pattern`. Practitioner profiles are `kind: practitioner` and parent to [practitioners](docs/practitioners/README.md). Do not file a new team note under a pattern directory; link it.

## Adding a doc

1. Pick the parent hub. If none fits, add a hub first. Do not leave the file at `docs/` root.
2. Use a kebab-case filename. The id matches that filename (`README.md` hubs use the directory name).
3. Add the entry to [docs/index.json](docs/index.json): `kind`, `parent`, `status` (`current` or `snapshot`), `sources`, and either `patterns` or `practitioners` when the kind requires it. Set `docCount` to the number of `docs/**/*.md` files. Label a snapshot "Archived snapshot as of <date>" in its parent README and in this tree.
4. Link the new file from its parent README and from this tree.
5. Run `npm run check:index`. Fix orphans, broken relative links, and id mismatches before committing.
