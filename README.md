# Software Factory

<p align="center">
  <img src="docs/assets/banner.svg" alt="Software Factory: field guide to agentic software factories" width="100%">
</p>

[![Updated 2026-11-09](https://img.shields.io/badge/updated-2026--11--09-3f3f46)](docs/index.json) [![140 docs](https://img.shields.io/badge/docs-140-3f3f46)](docs/index.json) [![Weekly updates](https://img.shields.io/badge/updates-weekly-3f3f46)](docs/signals/x-insights.md)

A research corpus on agent-native software delivery: how teams wire coding agents, what they verify before merge, and which topologies show up in production. Pattern hubs hold the mechanisms. Practitioner profiles hold the cited team record. Dated surveys are archived snapshots; [landscape](docs/landscape/README.md) is the current state of play. Agents parse [`docs/index.json`](docs/index.json).

## Start here

- [When to use what](AGENTS.md#when-to-use-what) — decision map
- [Practitioners](docs/practitioners/README.md) — 79 profiles in six categories
- [Patterns](docs/patterns/) — mechanism hubs
- [X insights](docs/signals/x-insights.md) — weekly updates

## How the repo is organized

```mermaid
flowchart LR
  signals["Signals feed"] --> updates["Weekly updates"] --> hubs["Pattern hubs"] --> practitioners["Practitioners"]
  updates --> landscape["Landscape"]
```

## When to use what

| Situation | Pattern |
| --- | --- |
| Many independent, well-scoped tasks | [Background agents](docs/patterns/background-agents/README.md) |
| Humans join one sandbox mid-flight | [Background agents](docs/patterns/background-agents/README.md) |
| Same model, weak results | [Harness engineering](docs/patterns/harness-engineering/README.md) |
| Clear done-signal, scope creep is the risk | [Verification](docs/patterns/verification/README.md) |
| CI latency blocks agent throughput | [Verification](docs/patterns/verification/README.md) |
| Several agents need budget, locks, or a lifecycle | [Orchestration](docs/patterns/orchestration/README.md) |
| Spend or blast radius can run away | [Governance and safety](docs/patterns/governance-safety/README.md) |
| The window is full, or the next run must remember | [Memory and knowledge](docs/patterns/memory-knowledge/README.md) |
| An objective metric should keep a loop running | [Self-improvement](docs/patterns/self-improvement/README.md) |
| You need the current market map | [Landscape](docs/landscape/README.md) |
| You need an archived production survey | [Case studies](docs/case-studies/README.md) |

## Practitioners

79 profiles. Citations live in the [catalog](docs/practitioners/README.md).

| Category | Profiles |
| --- | --- |
| Enterprise in-house factories | 20 |
| Coding-agent vendors | 30 |
| Open-source agents | 11 |
| Infra and sandboxes | 9 |
| Review and verification | 5 |
| Orchestration | 4 |

## The loop

```mermaid
flowchart LR
  spec[Spec] --> agent[Agent] --> verify["Harness / verify"] --> merge[Merge] --> learn[Learn] --> spec
```

Lookup: [key numbers](docs/reference/key-numbers.md) · [glossary](docs/reference/glossary.md) · [project](docs/project/README.md). [MIT License](LICENSE).
