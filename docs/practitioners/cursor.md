# Cursor

*Refreshed 2026-11-16*

## What they do

Cursor's current docs split remote execution and review. The older path `docs.cursor.com/background-agent` now lands on the docs index, which lists Cloud Agents and Bugbot. This profile cites the pages that describe those products.

## What they do well

Cloud Agents run in parallel on their own virtual machines, so they can build and test without the developer's laptop staying online. Bugbot is the pull-request review product documented beside them. No throughput figure is taken from these two pages.

On October 30, 2026, Cursor disclosed a security incident: a modified, malicious Claude Code VS Code extension (not developed by Anthropic) reached at most 5,000 users through Cursor's IDE extension marketplace. The [November 13, 2026 update](https://cursor.com/blog/security-incident-update) says the attacker used a key Cursor had issued to Fireworks to copy coding-agent traces, mostly from 2025 and not in Privacy Mode. A small number of those traces contained unredacted credentials: less than 0.01% of customers had API credentials exposed, and traces were exposed for fewer than 0.05% of users. Prompts and code for Privacy Mode users were not in that set. The malicious extension copies, Anthropic.claude-code 2.1.312 and 2.1.313, were available for about 11 hours. On November 10, 2026, Cursor said Projects was rebuilt so teammates and their agents work in one workspace.

## Patterns shown

- [Background agents](../patterns/background-agents/README.md) — cloud agents on their own virtual machines
- [Verification](../patterns/verification/README.md) — Bugbot reviews pull requests
- [Governance and safety](../patterns/governance-safety/README.md) — the November update on which traces and credentials were exposed

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| at most 5,000 | Users who potentially received the malicious extension build | [2026-11-13 update](https://cursor.com/blog/security-incident-update) |
| about 11 hours | How long that build was available | Same |
| less than 0.01% | Customers with API credentials in the exposed traces | Same |
| fewer than 0.05% | Users whose coding-agent traces were exposed | Same |

## Sources

- [Cloud Agents](https://cursor.com/docs/cloud-agent)
- [Bugbot](https://cursor.com/docs/bugbot)
- [Marketplace incident, 2026-10-30](https://x.com/cursor_ai/status/2116074289053175808)
- [Incident update, 2026-11-13](https://cursor.com/blog/security-incident-update)
- [Projects for multiplayer, 2026-11-10](https://x.com/cursor_ai/status/2120295553309565139)
