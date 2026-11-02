# Coinbase Forge

*Refreshed 2026-11-02*

## What they do

Two public texts describe Coinbase's coding agents, and they do not use the same names. The August 6, 2025 Coinbase post (the blog returned a block page to curl; the article text was retrieved from that URL) is about Cursor, MCP, and an internal model router. A 2026 survey of coding orchestrators is the text that uses the name Forge, and it points at that blog.

## What they do well

- Coinbase's post says every Coinbase engineer had used Cursor by February 2025, that DevX built GitHub and Linear MCP servers, and that an OpenAI-compatible router is used daily by more than 1,500 engineers. It also says single engineers have refactored or upgraded codebases in days instead of months, and that a repository sensitivity matrix gates which repos LLM tools may touch. The retrieved text does not name Forge or give a pull-request count.
- The survey says Forge is the Slack, Linear, and GitHub task agent (1,000+ engineers, 5% of merged PRs, cycle time 150h to 15h), and that Mux is a parallel-agent layer on Forge: 600+ users and 5,068 merged PRs across 461 repos in one month. Those counts belong to the survey's Forge/Mux split, not to a sentence in the Coinbase post this pass could read. The 5,068 figure is Mux's, not a Forge-only total.

## Patterns shown

- [Orchestration](../patterns/orchestration/README.md) — task agents and a parallel layer described on top of them
- [Background agents](../patterns/background-agents/README.md) — background agents named in the first-party productivity post

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| >1,500 | Engineers using the OpenAI-compatible router daily | Coinbase, Aug 6, 2025 |
| 5% / 150h→15h | Survey's description of Forge | Kora survey |
| 5,068 / 461 | Survey's one-month Mux merges and repos | Kora survey |

## Sources

- [Developer productivity](https://www.coinbase.com/blog/Tools-for-Developer-Productivity-at-Coinbase)
- [Orchestrator survey](https://jackkora.com/p/mapping-the-ai-coding-orchestrator)
