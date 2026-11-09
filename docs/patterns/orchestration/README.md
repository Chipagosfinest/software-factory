# Orchestration

*Refreshed 2026-11-09*

Parent hub for how many agents share work: state machines, worktrees, org charts, plugin fleets, and the topologies in Potent Combos. A single agent loop is a harness concern. Orchestration starts when more than one run must be scheduled, locked, budgeted, or resumed.

Warp's factory line is an ordered set of steps on one shared agent: triage, a planning gate that can stop for a human, implementation, verification, adversarial review, then a post-ship loop that files the next task from production signals ([workshop](https://www.youtube.com/watch?v=Shqcc2aRTGY)). Sourcegraph's [Agentic Batch Changes](https://www.youtube.com/watch?v=kY0_rRtJ8BM) is the cross-repo version of that handoff: one request, a pull request per repo, existing checks still required.

## Children

- [Symphony-style orchestrator](./orchestrator.md) — reconciliation loop, worktrees, task state machine
- [Composio Agent Orchestrator](./agent-orchestrator.md) — eight plugin slots and a PR lifecycle
- [Paperclip org chart](./paperclip-org-chart.md) — budgets, heartbeat, approval gates
- [Symphony role inversion](./symphony-carson.md) — board as control plane, agents as the workforce
- [Potent Combos](./potent-combos.md) — topologies and build profiles
- [Choosing a topology](./topology-choice.md) — design dimensions, pros and cons, decision matrix

## Practitioners

- [Paperclip](../../practitioners/paperclip.md)
- [Composio Agent Orchestrator](../../practitioners/composio-agent-orchestrator.md)
- [OpenAI Codex](../../practitioners/openai-codex.md)
- [Stripe Minions](../../practitioners/stripe-minions.md)
- [Uber](../../practitioners/uber.md)
- [Airbnb](../../practitioners/airbnb.md)
- [Shopify Roast](../../practitioners/shopify-roast.md)
- [Coinbase Forge](../../practitioners/coinbase-forge.md)
- [Block Builderbot](../../practitioners/block-builderbot.md)
- [Meta Confucius](../../practitioners/meta-confucius.md)
- [Brex](../../practitioners/brex.md)
- [Factory.ai](../../practitioners/factory-ai.md)
- [Sourcegraph](../../practitioners/sourcegraph.md)
- [Linear agents](../../practitioners/linear-agents.md)
- [Warp](../../practitioners/warp.md)
- [Harness AI](../../practitioners/harness-ai.md)
- [Graphite](../../practitioners/graphite.md)
- [Conductor](../../practitioners/conductor.md)
- [Nimbalyst](../../practitioners/nimbalyst.md)
- [Levi Strauss](../../practitioners/levi-strauss.md)

## Sources

- [OpenAI Symphony spec](https://github.com/openai/symphony/blob/main/SPEC.md)
- [Paperclip](https://github.com/paperclipai/paperclip)
- [Composio Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator)
- [Powering Warp Factories with Sentry](https://www.youtube.com/watch?v=Shqcc2aRTGY) (2026-10-23)
- [Introducing Agentic Batch Changes](https://www.youtube.com/watch?v=kY0_rRtJ8BM) (2026-09-14)
