# Ramp Inspect

*Refreshed 2026-11-01*

## What they do

Inspect is Ramp's background coding agent. Sessions run on Modal sandboxes with a full dev stack (Postgres, Redis, Temporal, RabbitMQ, and the rest of a local environment). A cron job refreshes filesystem snapshots about every 30 minutes, stored as diffs from a base image. A new session restores the latest snapshot and syncs to HEAD, so startup is a few seconds rather than a cold install.

Clients include a Slack bot, a web UI, and a Chrome extension. Session state for multiplayer use is described, in the enterprise note, as Cloudflare Durable Objects so more than one person can watch a session. The agent runtime called out in the landscape note is OpenCode.

A second loop, documented in [Ramp self-maintaining code](../patterns/self-improvement/ramp-self-maintaining-code.md), generates Datadog monitors from merged diffs, triages firings, and sends real bugs into an Inspect sandbox to reproduce, test, and open a fix. A human still reviews the pull request.

## What they do well

- The snapshot pool keeps project state warm without holding an idle container per repo. That mechanism is the pattern in [sandbox isolation](../patterns/background-agents/sandbox-isolation.md).
- The Modal and Ramp writeups summarized in this repo say Inspect accounts for about 50% of merged pull requests, and that more than 80% of Inspect's own codebase was written by Inspect. An InfoQ headline linked from the same sandbox note says 30%. Both figures are left as published; they are not reconciled here.
- The self-maintaining loop moved from a nightly crawl that repeated the same paths to event-driven monitors: about 1,000 monitors, one per 75 lines, up from 10 hand-written monitors. False alarms can be tuned or deleted by the triage agent. A real alarm becomes a sandboxed fix.

## Patterns shown

- [Background agents](../patterns/background-agents/README.md) — snapshot-restore sandboxes
- [Self-improvement](../patterns/self-improvement/README.md) — monitors that open their own fixes
- [Memory and knowledge](../patterns/memory-knowledge/README.md) — [KV compaction](../patterns/memory-knowledge/latent-briefing-kv-compaction.md) from Ramp Labs

## Key numbers

| Figure | Meaning | Where this repo records it |
|--------|---------|----------------------------|
| ~50% of merged PRs | Inspect's share in the Modal/Ramp writeups | Sandbox isolation; enterprise adoption |
| 30% | InfoQ headline linked beside those writeups | Sandbox isolation source list |
| ~30 minutes | Snapshot refresh interval | Sandbox isolation |
| a few seconds | Session start from the latest snapshot | Sandbox isolation |
| 80%+ | Inspect codebase written by Inspect | Enterprise adoption; landscape OpenCode note |
| 1,000 monitors | One per 75 lines, up from 10 manual | Ramp self-maintaining code |

## Sources

- [How Ramp built Inspect on Modal](https://modal.com/blog/how-ramp-built-a-full-context-background-coding-agent-on-modal)
- [Why Ramp built a background agent](https://builders.ramp.com/post/why-we-built-our-background-agent)
- [InfoQ: Ramp coding agent](https://www.infoq.com/news/2026/01/ramp-coding-agent-platform/)
- [Ramp Labs](https://x.com/RampLabs)
