# Cursor

*Refreshed 2026-11-02*

## What they do

Cursor's current docs split remote execution and review. The older path `docs.cursor.com/background-agent` now lands on the docs index, which lists Cloud Agents and Bugbot. This profile cites the pages that describe those products.

## What they do well

Cloud Agents run in parallel on their own virtual machines, so they can build and test without the developer's laptop staying online. Bugbot is the pull-request review product documented beside them. No throughput figure is taken from these two pages.

On October 30, 2026, Cursor disclosed a security incident: a modified, malicious Claude Code VS Code extension (not developed by Anthropic) reached at most 5,000 users through Cursor's IDE extension marketplace.

## Patterns shown

- [Background agents](../patterns/background-agents/README.md) — cloud agents on their own virtual machines
- [Verification](../patterns/verification/README.md) — Bugbot reviews pull requests

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| at most 5,000 | Users reached by the modified extension in the marketplace incident | [2026-10-30 post](https://x.com/cursor_ai/status/2116074289053175808) |

## Sources

- [Cloud Agents](https://cursor.com/docs/cloud-agent)
- [Bugbot](https://cursor.com/docs/bugbot)
- [Marketplace incident, 2026-10-30](https://x.com/cursor_ai/status/2116074289053175808)
