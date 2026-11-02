# Vercel

*Refreshed 2026-11-01*

## What they do

This profile uses the October 28, 2026 post on agentic CI, also summarized in [X insights](../signals/x-insights.md), plus one infrastructure line already in the README.

The post says the bottleneck in AI coding is CI, and names three fixes:

1. Fast, stable infrastructure. The post says Vercel runs 20 clusters worldwide and millions of microVMs per day.
2. Turborepo-style caching. The dependency graph is computed, and prior work is skipped, including for teams that do not host the build on Vercel.
3. Agentic CI. A CLI can inspect, abort, trigger, and replay CI runs, so an agent can operate the pipeline instead of waiting out a human's click-path. The post treats this as the start of hooks that can also decide whether a test is worth running.

Separately, the README records Vercel coding agents running in ephemeral Firecracker microVMs as a probe fleet for agent-experience tracking.

## What they do well

The claim is specific: agent throughput stalls on slow or flaky CI, and the remedies are cache, hardware, and a CI control surface the agent can call. That matches the verification pattern (a fast deterministic gate) more than another model leaderboard.

Other October 2026 posts in X insights, not used as the primary source for this profile, say agents will talk to other agents and that Vercel is opening harness durability beyond a single runtime. They are logged in the signals note.

## Patterns shown

- [Verification](../patterns/verification/README.md) — CI the agent can inspect, abort, trigger, and replay
- [Background agents](../patterns/background-agents/README.md) — microVM fleets as the execution substrate

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| 20 | Worldwide clusters named in the CI post | [2026-10-28 post](https://x.com/rauchg/status/2115539426684408300) |
| millions / day | MicroVMs, same post | Same |

## Sources

- [Agentic CI, 2026-10-28](https://x.com/rauchg/status/2115539426684408300)
- [AEO tracking for coding agents](https://vercel.com/blog/how-we-built-aeo-tracking-for-coding-agents)
