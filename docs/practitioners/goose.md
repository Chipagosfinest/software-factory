# Goose

*Refreshed 2026-11-01*

## What they do

Goose is Block's open-source coding agent. This corpus does not have a standalone Goose architecture note. It appears in three places:

- [Stripe Minions](./stripe-minions.md) are a heavily modified fork. The sandbox note says the fork adds deep internal tool integrations on top of Goose.
- On December 9, 2025, the Linux Foundation's Agentic AI Foundation launched with three founding projects: Anthropic's MCP, Block's Goose, and OpenAI's AGENTS.md. Recorded in [context engineering](../patterns/harness-engineering/context-engineering.md).
- [Cloudflare Dynamic Workers](../patterns/background-agents/cloudflare-dynamic-workers.md) groups Goose with other client-side Code Mode clients, and with CLI-based approaches that need a sandbox on the client.

## What they do well

The evidence in this repo is adoption, not a Goose benchmark. A production one-shot system (Minions, 1,300+ merged pull requests a week) chose Goose as the agent to fork, then wrapped it in devboxes, blueprints, and a tool catalog. The foundation listing puts Goose next to MCP and AGENTS.md as shared infrastructure rather than a single vendor runtime.

No Goose-specific solve rate or star count is stated in the notes used here, so none is added.

## Patterns shown

- [Background agents](../patterns/background-agents/README.md) — the agent Stripe runs inside devboxes
- [Harness engineering](../patterns/harness-engineering/README.md) — a client runtime that still needs a sandbox and a tool harness around it

## Key numbers

No Goose-only quantitative claim is recorded in this repo. Stripe's throughput is on the [Minions profile](./stripe-minions.md).

## Sources

- [Goose](https://github.com/block/goose)
- [Agentic AI Foundation announcement](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)
- [Stripe Minions](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)
