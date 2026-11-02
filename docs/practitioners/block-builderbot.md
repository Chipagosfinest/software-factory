# Block Builderbot

*Refreshed 2026-11-02*

## What they do

Builderbot is Block's internal suite of AI coding tools, described in Block's June 17, 2026 post. It sits on top of [Goose](./goose.md), which Block open-sourced. The post is the source for the counts; a later survey repeats them and links the same post.

## What they do well

Block says Builderbot takes work from Linear and Jira, creates a branch, writes code, opens a pull request, watches CI, and iterates on feedback. The post's figures: more than 200,000 operations a day, about 1,500 pull requests merged a week, and about 15% of production code changes across Block.

## Patterns shown

- [Background agents](../patterns/background-agents/README.md) — ticket to branch, code, pull request, and CI
- [Orchestration](../patterns/orchestration/README.md) — one company platform across subsidiaries

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| >200,000 / day | Operations | Block |
| ~1,500 / week | Merged pull requests | Block |
| ~15% | Share of production code changes | Block |

## Sources

- [Builderbot](https://block.xyz/inside/block-rolls-out-builderbot-a-new-suite-of-ai-native-tools-that-changes-the-way-we-ship)
