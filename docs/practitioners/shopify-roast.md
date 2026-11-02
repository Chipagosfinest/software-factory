# Shopify Roast

*Refreshed 2026-11-02*

## What they do

Roast is Shopify's open-source Ruby library for structured AI workflows. The README calls it a Ruby domain-specific language. Workflows are built from cogs that call models, run code, execute commands, or process data.

## What they do well

A cog's output can feed the next cog. The README shows a shell cog (`git diff`) whose file list is passed into an agent cog, and it says workflows can run local coding agents (Pi, Claude Code, or other providers) with filesystem access. Collection steps can run serially or in parallel. This profile does not call the shell steps "deterministic" — the README does not use that word — but the steps are ordinary Ruby and shell alongside model calls.

## Patterns shown

- [Orchestration](../patterns/orchestration/README.md) — named steps whose outputs feed the next step
- [Harness engineering](../patterns/harness-engineering/README.md) — LLM cogs beside shell commands and local coding agents

## Key numbers

No quantitative claim is repeated here. The sources describe the system without a figure this profile uses.

## Sources

- [GitHub](https://github.com/Shopify/roast)
