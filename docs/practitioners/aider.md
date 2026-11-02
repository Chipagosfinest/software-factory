# Aider

*Refreshed 2026-11-02*

## What they do

Aider is a terminal pair-programming tool. The README says it edits an existing codebase or starts a new one, and that it automatically commits changes with commit messages so git can diff and undo them. The repo-map doc says Aider sends a map of the repository so edits can use code that lives elsewhere. The README links an LLM leaderboard.

## What they do well

The mechanism is git as the record of the agent's edits, and a repo map as the context, rather than an unseen sandbox. The README badge at fetch time showed 6.8M pip installs. That number is the badge, not an independent audit.

## Patterns shown

- [Harness engineering](../patterns/harness-engineering/README.md) — git commits plus a repo map as the edit context

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| 6.8M | Pip installs shown on the GitHub README badge | Aider README |

## Sources

- [GitHub](https://github.com/Aider-AI/aider)
- [Repo map](https://aider.chat/docs/repomap.html)
- [Leaderboards](https://aider.chat/docs/leaderboards/)
