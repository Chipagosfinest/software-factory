# Vercel

*Refreshed 2026-11-23*

## What they do

This profile uses the October 28, 2026 post on agentic CI, also summarized in [X insights](../signals/x-insights.md), later posts on Vercel CI speed and agent-desktop, plus one infrastructure line already in the README.

The post says the bottleneck in AI coding is CI, and names three fixes:

1. Fast, stable infrastructure. The post says Vercel runs 20 clusters worldwide and millions of microVMs per day.
2. Turborepo-style caching. The dependency graph is computed, and prior work is skipped, including for teams that do not host the build on Vercel.
3. Agentic CI. A CLI can inspect, abort, trigger, and replay CI runs, so an agent can operate the pipeline instead of waiting out a human's click-path. The post treats this as the start of hooks that can also decide whether a test is worth running.

On November 2, 2026, Malte Ubl attributed Vercel CI's speed to task caching by default (tasks unaffected by the diff never start), installing dependencies once and sharing them across tasks, and running all tasks at maximum concurrency. On October 31, 2026, Vercel Labs released agent-desktop, which brings agent-browser's token-efficient computer use to the whole desktop operating system.

Vercel Security Review is source-code-aware security review combined with knowledge of the app's production risks on Vercel. Vercel's security team used it internally for months before release.

On November 14, 2026, Guillermo Rauch described the ship path as the agent writing feature-gated code, verification gates on push (proof checking and security audits), and the agent watching metrics, through `vercel flags`, `vercel metrics`, and `vercel deploy`. The same day, Malte Ubl's post on long-lived static credentials says API keys and database passwords that get reused, often with no expiration, leak into repos and chats, get stolen, or get revealed by prompt injection. Vendors that do not support OIDC from Vercel and still use long-lived secrets get a "Not secure" label on their Marketplace listing by November 30, 2026. Vendors that do not offer secure auth are delisted in January 2027. His summary of the Cursor incident is that static credentials leaked through stolen LLM transcripts.

On November 20, 2026, Malte Ubl merged per-harness tool mappings into the Vercel Board skill. Each mapping translates that harness's tools for talking to other agents into the matching Board commands, so a model trained on its own tools can use the cloud board. He says the mappings cover the common harnesses.

Separately, the README records Vercel coding agents running in ephemeral Firecracker microVMs as a probe fleet for agent-experience tracking.

## What they do well

The claim is specific: agent throughput stalls on slow or flaky CI, and the remedies are cache, hardware, and a CI control surface the agent can call. That matches the verification pattern (a fast deterministic gate) more than another model leaderboard.

Other October 2026 posts in X insights, not used as the primary source for this profile, say agents will talk to other agents and that Vercel is opening harness durability beyond a single runtime. They are logged in the signals note.

## Patterns shown

- [Verification](../patterns/verification/README.md) — CI the agent can inspect, abort, trigger, and replay
- [Background agents](../patterns/background-agents/README.md) — microVM fleets as the execution substrate
- [Governance and safety](../patterns/governance-safety/README.md) — short-lived identity tokens in place of static credentials
- [Harness engineering](../patterns/harness-engineering/README.md) — per-harness tool mappings that stay on the tools a model was trained on

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| 20 | Worldwide clusters named in the CI post | [2026-10-28 post](https://x.com/rauchg/status/2115539426684408300) |
| millions / day | MicroVMs, same post | Same |
| 2026-11-30 | "Not secure" on Marketplace listings that lack OIDC and still use long-lived secrets | [Credentials post](https://vercel.com/blog/death-to-long-lived-static-credentials) |
| January 2027 | Vendors without secure auth are delisted | Same |

## Sources

- [Agentic CI, 2026-10-28](https://x.com/rauchg/status/2115539426684408300)
- [Vercel CI speed, 2026-11-02](https://x.com/cramforce/status/2117267405923815913)
- [agent-desktop, 2026-10-31](https://x.com/cramforce/status/2116323769967128620)
- [Security Review](https://x.com/cramforce/status/2117731626100863085)
- [AEO tracking for coding agents](https://vercel.com/blog/how-we-built-aeo-tracking-for-coding-agents)
- [How agents will ship all code, 2026-11-14](https://x.com/rauchg/status/2121711321347715093)
- [Death to long-lived static credentials](https://vercel.com/blog/death-to-long-lived-static-credentials)
- [Static credentials, 2026-11-14](https://x.com/cramforce/status/2121646284612501738)
- [Per-harness tool mappings, 2026-11-20](https://x.com/cramforce/status/2123926740842213768)
