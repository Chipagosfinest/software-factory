# Spotify Honk

*Refreshed 2026-11-01*

## What they do

Honk is Spotify's background coding agent, built on Claude Code and the Claude Agent SDK. It sits on Fleet Management, the system Spotify has used for large-scale automated code changes since 2022. Each run is a Kubernetes job: clone, transform, format, lint, build, test, open a pull request. The container has limited permissions, few binaries, and almost no access to surrounding systems.

Spotify did not stand up a new sandbox product for Honk. The pattern note is [sandbox isolation](../patterns/background-agents/sandbox-isolation.md).

## What they do well

From the three Honk engineering posts, as summarized in [enterprise adoption](../landscape/enterprise-adoption.md) and the sandbox note:

- Migrations covered by the posts include Java records, Scio pipelines, Backstage UI components, and config updates. A Maven dependency updater had grown past 20,000 lines of corner cases before agents took that class of change.
- The tool surface is intentionally small: a Verify tool (build), a Git tool limited to safe subcommands, and a bash allowlist (ripgrep, no documentation tools). Prompts are large and static so they can be versioned and tested, instead of fetched dynamically.
- Five context rules from part 2: say when not to act, give before/after examples, make the goal a test, one transformation per prompt, and feed lessons back after the session.
- Part 3 splits verification in two. Deterministic verifiers run from Claude Code's stop hook and block the pull request if they fail. An LLM judge compares the diff to the original prompt. The recorded veto rate is about 25%. About half of vetoed attempts are then corrected. The stated trigger is the agent leaving the prompt. Spotify's own line, recorded in the enterprise note: "We have yet to invest in evals for our judge."
- Three failure modes are distinguished: no pull request (acceptable), CI failure (review burden), and a pull request that passes CI but is wrong (the trust failure). The last two show up when the target has little test coverage or the agent cannot run the build.

Company-level adoption figures in the archived case-study snapshot as of 2026-07-16 (greater than 99% weekly AI use, +76% pull-request frequency, 2.5M+ lifetime Fleet Management pull requests) describe Spotify's broader system, not Honk alone. See [production case studies](../case-studies/production-case-studies-state-of-play-2026-07-16.md).

## Patterns shown

- [Background agents](../patterns/background-agents/README.md) — Kubernetes jobs on an existing fleet
- [Verification](../patterns/verification/README.md) — stop hooks plus an LLM judge
- [Harness engineering](../patterns/harness-engineering/README.md) — context rules and a tiny tool list

## Key numbers

| Figure | Meaning | Where this repo records it |
|--------|---------|----------------------------|
| 650+ PRs/month | Agent pull requests merged, late 2025 | Sandbox isolation |
| 1,500+ PRs | Merged into production | Enterprise adoption |
| 60–90% | Time saved versus manual coding on migrations | Enterprise adoption |
| ~50% | Spotify pull requests automated since mid-2024 | Enterprise adoption |
| ~25% | LLM-judge veto rate | Enterprise adoption |
| ~50% | Vetoed attempts that were then corrected | Enterprise adoption |
| up to 90% | Engineering time saved on complex migrations | Sandbox isolation |

## Sources

- [Honk, part 1](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1)
- [Honk, part 2: context engineering](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2)
- [Honk, part 3: feedback loops](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3)
- [June 2026: coding is no longer the constraint](https://engineering.atspotify.com/2026/6/code-with-claude-coding-is-no-longer-the-constraint)
