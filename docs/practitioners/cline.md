# Cline

*Refreshed 2026-11-01*

## What they do

Cline is an open-source VS Code coding agent (Apache 2.0). The landscape pass describes Plan and Act modes, with human approval on actions, first-class MCP (including creating MCP servers during a session), browser control via computer use, and sub-agents from v3.58 onward. Model access in that pass includes OpenRouter, Anthropic, OpenAI, Gemini, Bedrock, Azure, and local models.

The price shape recorded there is free software plus API cost, with a heavy-use range of about $50–200 per month on the model named in that pass.

## What they do well

- The open-source table in the landscape note lists 5M+ installs.
- Plan/Act is a governance choice: the agent does not apply an action until a person approves it. That is the opposite of a one-shot background agent and is why it sits under governance as well as harnesses.
- MCP is part of the product rather than an add-on, which matches the tool-surface theme in the harness notes.
- The same pass lists the costs of that shape: more setup, a less polished UX than hosted products, and a tendency to make aggressive edits if the approval step is treated casually.

## Patterns shown

- [Governance and safety](../patterns/governance-safety/README.md) — approval before each action
- [Harness engineering](../patterns/harness-engineering/README.md) — plan/act, sub-agents, MCP tools

## Key numbers

| Figure | Meaning | Where this repo records it |
|--------|---------|----------------------------|
| 5M+ | Installs | Landscape open-source table |
| Apache 2.0 | License | Landscape |
| v3.58+ | Sub-agent support | Landscape |
| ~$50–200/month | Heavy API use, as estimated in that pass | Landscape |

## Sources

- [Cline](https://cline.bot/)
- [GitHub](https://github.com/cline/cline)
