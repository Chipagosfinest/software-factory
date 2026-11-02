# Brex

*Refreshed 2026-11-02*

## What they do

Brex's July 22, 2026 engineering post describes a migration of its Kotlin services from Micronaut 3 to 4. The earlier attempt, 50 services, took three engineers a quarter. The later attempt is a pipeline of custom self-hosted Cursor agents.

## What they do well

One engineer migrated 180 microservices in a month. Brex calls that a 32x per-capita acceleration against the earlier effort. The agents write, build, and self-correct. The post also says the same approach patched vulnerabilities across 180+ services. The corpus of services on Micronaut is described as over 500.

## Patterns shown

- [Background agents](../patterns/background-agents/README.md) — self-hosted Cursor agents that edit, build, and correct
- [Orchestration](../patterns/orchestration/README.md) — a pipeline aimed at a framework upgrade

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| 180 | Microservices migrated by one engineer in a month | Brex |
| 32x | Per-capita acceleration versus the prior 50-service quarter | Brex |
| 3 engineers, 1 quarter | Prior attempt, 50 services | Brex |
| >500 | Microservices on the Kotlin framework | Brex |

## Sources

- [Framework upgrades](https://www.brex.com/journal/agent-automations-for-big-migrations)
