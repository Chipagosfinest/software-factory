# Stripe Minions

*Refreshed 2026-11-23*

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

On November 19, 2026, two Stripe Developers talks describe the current production shape. Orbit is the in-house web app for agentic engineering. It is about four months old, used weekly by 92% of engineers, and about 50% of pull requests pass through it. Explorer is the cloud-hosted harness. It stays online and starts a per-branch devbox only when it needs to write code. Minions remain one prompt to a pull request, with no conversation. They produce about 9,000 pull requests a week, about 20% of all pull requests, up from about 1,000 at the speaker's previous talk. Most services now include a `test.md` that tells any agent how to test that service. With synthetic test data, a Minion can start the service, open the UI in a browser, and return before-and-after screenshots.

Gru is an on-box adversarial reviewer. It argues with the Minion, looking for defects, cross-service dependencies, and ways to shrink the diff, before anything reaches CI. The Minion can accept or push back until they agree. The first talk says pull requests then merge about 20 minutes faster at scale. Mark Doyle says about 15–20 minutes faster on average. Doyle also says a Minion reports back only once CI is green, including nearly 3 million Ruby unit tests, and once the agent has run the code or opened the UI. Work that needs many rounds, such as front-end design, stays on interactive harnesses such as Claude Code or Codex. Owning the harness lets the team change behavior overnight in a codebase of almost 300 million lines. The example is a deterministic phase that slims down tests after models started writing too many. One Slack investigation of slow tool calls in the Minions harness produced a flame graph and 10–15 optimization pull requests within a week. About 5% of Stripe engineers work on developer productivity. The reasons given for building in-house are that code is already written on VMs, Stripe wants to stay model-agnostic, and engineer-agent conversations stay inside Orbit.

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
| about 9,000 / week | Pull requests Minions produce, about 20% of all pull requests | [2026-11-19 talk](https://www.youtube.com/watch?v=Yuo2V3f0ltY) |
| 92% | Engineers who use Orbit weekly | Same |
| about 50% | Pull requests that pass through Orbit | Same |
| about 20 minutes | Faster merges after Gru, at scale, in the first talk | Same |
| about 15–20 minutes | Faster merges on average, in Doyle's account of Gru | [2026-11-19 interview](https://www.youtube.com/watch?v=Ev47nMM5Jf4) |
| nearly 3 million | Ruby unit tests that must pass before a Minion reports back | Same |
| almost 300 million | Lines in the codebase a harness change applies to overnight | [2026-11-19 talk](https://www.youtube.com/watch?v=Yuo2V3f0ltY) |

## Sources

- [Minions, part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)
- [Minions, part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)
- [ByteByteGo analysis](https://blog.bytebytego.com/p/how-stripes-minions-ship-1300-prs)
- [Minions ship 9,000 pull requests a week](https://www.youtube.com/watch?v=Yuo2V3f0ltY) (2026-11-19)
- [Why Stripe's coding agents argue before they open a PR](https://www.youtube.com/watch?v=Ev47nMM5Jf4) (2026-11-19)
