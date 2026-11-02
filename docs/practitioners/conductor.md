# Conductor

*Refreshed 2026-11-02*

## What they do

Conductor's homepage describes a product for running a team of coding agents in the cloud. Each agent gets an isolated microVM with repos and dependencies preinstalled. The page says sandboxes boot in seconds and that agents can run for hours, and it names Firecracker and repository snapshots in the boot log it shows. Conductor runs Claude Code, Codex, Cursor, and OpenCode, and the user brings those subscriptions.

## What they do well

A 2026 survey described Conductor as parallel Claude Code, Codex, and Cursor sessions in git worktrees. The homepage fetched for this profile describes cloud microVMs instead, so the worktree sentence is not the current first-party description. The homepage also says "trusted by 100k+ builders," which is the site's claim.

## Patterns shown

- [Orchestration](../patterns/orchestration/README.md) — many coding agents scheduled from one workspace
- [Background agents](../patterns/background-agents/README.md) — a Firecracker microVM per agent

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| 100k+ | Builders the homepage says trust the product | conductor.build |

## Sources

- [Site](https://conductor.build)
