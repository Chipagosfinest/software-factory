# Orchestration

*Refreshed 2026-11-01*

Parent hub for how many agents share work: state machines, worktrees, org charts, plugin fleets, and the topologies in Potent Combos. A single agent loop is a harness concern. Orchestration starts when more than one run must be scheduled, locked, budgeted, or resumed.

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

## Sources

- [OpenAI Symphony spec](https://github.com/openai/symphony/blob/main/SPEC.md)
- [Paperclip](https://github.com/paperclipai/paperclip)
- [Composio Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator)
