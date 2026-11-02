# Pinterest

*Refreshed 2026-11-02*

## What they do

Pinterest Engineering's May 12, 2026 post (Medium blocked a plain curl; the article was retrieved from that URL) is a test harness for skill invocation. The skill is an internal iOS architecture skill. The agents are Pin-agent, described as an internal fork of OpenAI Codex, and Claude Code.

## What they do well

The harness is 15 positive prompts and 5 negative prompts, five runs, 100 tests. Vanilla overall accuracy was 73% for the Codex-based agent and 62% for Claude. Explicit "load this skill" prompts succeeded on every run of both agents. Terse prompts did not. The post says frontmatter text and an AGENTS.md skill table changed invocation, and that stacking techniques helped Codex more than Claude Code. Models named for the runs: GPT 5.2-codex and Claude Opus 4.5.

## Patterns shown

- [Verification](../patterns/verification/README.md) — a repeated harness for whether a skill actually loaded
- [Harness engineering](../patterns/harness-engineering/README.md) — frontmatter, AGENTS.md, and prompt shape as the variables

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| 73% / 62% | Vanilla overall accuracy, Codex-based agent vs Claude Code | Pinterest |
| 100 | 5 runs × (15 positive + 5 negative) prompts | Pinterest |
| 100% of explicit loads | Both agents, when the prompt said to load the skill | Pinterest |

## Sources

- [Skill testing](https://medium.com/pinterest-engineering/an-engineers-guide-to-better-ai-skills-implementing-a-testing-process-to-optimize-agent-a000c9c9abcd)
