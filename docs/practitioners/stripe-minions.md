# Stripe Minions

*Refreshed 2026-11-01*

## What they do

Stripe Minions are one-shot coding agents. A run takes a disposable devbox from a warm pool, calls a curated slice of internal tools, and opens a pull request. In the sandbox notes, a "devbox" is a standardized AWS EC2 instance preloaded with the source tree and warmed caches, the same class of environment human engineers use. The agent is a fork of Block's open-source [Goose](./goose.md).

Blueprints alternate deterministic nodes (git, lint, pull-request template) with agentic nodes (implementation, CI repair) so the model loop is not open-ended.

## What they do well

Cited from Stripe's Minions posts as recorded in [sandbox isolation](../patterns/background-agents/sandbox-isolation.md) and [enterprise adoption](../landscape/enterprise-adoption.md):

- Warm-pool devboxes are ready in about 10 seconds. The pool is provisioned ahead of time: repos cloned, caches warm, background services started. Instances are treated as cattle: identical and disposable.
- Local lint finishes in under 5 seconds, before any CI push. CI is capped at two rounds (initial push plus one retry), then the run escalates to a human.
- Toolshed, an internal MCP server, exposes a large catalog. The sandbox note says 400+ tools; the enterprise note says about 500. Either way, a task receives a prefetched subset of about 15 tools, chosen by scanning the prompt.
- Merged agent pull requests contain no human-written code, and humans still review them before merge.
- The enterprise note's reading of the ByteByteGo writeup: the advantage is the existing test suite, devboxes, and CI, not a unique model.

## Patterns shown

- [Background agents](../patterns/background-agents/README.md) — one-shot devbox per run
- [Harness engineering](../patterns/harness-engineering/README.md) — blueprints and a bounded tool set
- [Verification](../patterns/verification/README.md) — local lint, capped CI, large test battery
- [Governance and safety](../patterns/governance-safety/README.md) — no production network, mandatory human review
- [Orchestration](../patterns/orchestration/README.md) — fan-out of independent one-shot runs

## Key numbers

| Figure | Meaning | Where this repo records it |
|--------|---------|----------------------------|
| 1,300+ PRs/week | Merged agent pull requests | Enterprise adoption; sandbox isolation |
| ~10 seconds | Devbox startup from the warm pool | Sandbox isolation |
| 2 | Maximum CI rounds before human escalation | Enterprise adoption |
| <5 seconds | Local lint before CI | Enterprise adoption |
| ~15 tools | Per-task slice of Toolshed | Enterprise adoption |
| 400+ / ~500 | Toolshed catalog size, two notes in this repo | Sandbox isolation / enterprise adoption |
| 3+ million | Tests in the validation battery | Enterprise adoption |

## Sources

- [Minions, part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)
- [Minions, part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)
- [ByteByteGo analysis](https://blog.bytebytego.com/p/how-stripes-minions-ship-1300-prs)
