# Paperclip

*Refreshed 2026-11-01*

## What they do

Paperclip is an open-source layer above individual agents: org charts, monthly budgets, task checkout, approval gates, and a live dashboard. It does not implement the agent. Agents connect through a heartbeat. Adapters named in the pattern note include OpenClaw, Claude Code, Cursor, Bash, and HTTP. The pattern note is [Paperclip org chart](../patterns/orchestration/paperclip-org-chart.md). License: MIT.

The control loop is hierarchical. A parent assigns work, budget flows down, and children report up. That is the org-chart topology in the README and in [Potent Combos](../patterns/orchestration/potent-combos.md).

## What they do well

- Per-agent monthly budgets with throttling, which is finer than a single per-run cap. The pattern note contrasts that with a hard kill.
- Persistent tasks and transcripts across restarts, so a reboot does not drop the assignment.
- Approval gates, config versioning with rollback, and an audit log.
- A React UI with WebSocket transcripts so a person can see the run without attaching to every session.

Star counts in this repo disagree by date, and both are kept:

- Pattern note, March 16, 2026: 26.7k stars and 3.5k forks.
- README, April 2026: 57K+ stars, and a later line of 57.4K stars (v2026.416.0).

## Patterns shown

- [Orchestration](../patterns/orchestration/README.md) — org chart and task checkout
- [Governance and safety](../patterns/governance-safety/README.md) — budgets, approvals, audit

## Key numbers

| Figure | Meaning | Where this repo records it |
|--------|---------|----------------------------|
| 26.7k stars | March 16, 2026 | Paperclip pattern note |
| 3.5k forks | Same date | Paperclip pattern note |
| 57.4K stars | April 2026 | README |
| MIT | License | Paperclip pattern note |

## Sources

- [paperclipai/paperclip](https://github.com/paperclipai/paperclip)
