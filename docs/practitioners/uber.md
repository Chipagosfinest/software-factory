# Uber

*Refreshed 2026-11-02*

## What they do

Uber publishes a stack of internal agent tools rather than one assistant. The first-party uReview post describes a multi-stage review system. The public summary of Gergely Orosz's March 10, 2026 interview adds Minion, Autocover, Shepherd, and Code Inbox. The interview body is paywalled; figures below are the ones in that public summary or in Uber's own post. [Autocover](./uber-autocover.md) has its own profile.

## What they do well

- uReview analyzes over 90% of the weekly ~65,000 diffs landed at Uber. Engineers who interact with it mark 75% of its comments as useful, and Uber reports over 65% of posted comments addressed.
- The public interview summary says 92% of Uber developers use agents monthly, 65–72% of code inside IDEs is AI-generated, and 11% of pull requests are opened by agents. AI-related cost is described as up 6x since 2024.
- The same summary describes Minion as an internal background-agent platform with monorepo access, Autocover as generating 5,000+ unit tests per month, and Shepherd as managing large-scale migrations end to end. It does not describe Shepherd campaigns as multi-day, so this profile does not.

## Patterns shown

- [Verification](../patterns/verification/README.md) — uReview comments on landed diffs
- [Background agents](../patterns/background-agents/README.md) — Minion as an internal background-agent platform
- [Orchestration](../patterns/orchestration/README.md) — Shepherd for end-to-end migrations

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| >90% of ~65,000 | Weekly landed diffs uReview analyzes | Uber uReview post |
| 75% / >65% | Comments marked useful / posted comments addressed | Uber uReview post |
| 92% | Developers using agents monthly | Pragmatic Engineer public summary |
| 65–72% | IDE code described as AI-generated | Same summary |
| 11% | Pull requests opened by agents | Same summary |
| 5,000+ | Unit tests per month attributed to Autocover | Same summary |

## Sources

- [uReview](https://www.uber.com/us/en/blog/ureview/)
- [Pragmatic Engineer, public summary](https://newsletter.pragmaticengineer.com/p/how-uber-uses-ai-for-development)
