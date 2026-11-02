# Harness Engineering

*Refreshed 2026-11-01*

Parent hub for the environment around a model: instructions, tools, middleware, plans, and feedback loops. The model is a component. The harness is what makes its work reliable.

OpenAI's internal product and LangChain's Deep Agents are children of this hub. They describe the same pattern from two measurements: a product built with no hand-written code, and a fixed model whose score moved only when the harness changed.

## Children

- [OpenAI harness engineering](./harness-engineering-openai.md) — AGENTS.md as a map, layered docs, mechanical checks
- [LangChain harness engineering](./harness-engineering-langchain.md) — +13.7pp on Terminal Bench 2.0, model held fixed
- [Deep Agents](./deep-agents.md) — middleware, sub-agents, summarization, skills
- [Context engineering](./context-engineering.md) — what is allowed into the window
- [codex-planr](./codex-planr.md) — repo-local plans before execution

## Practitioners

- [OpenAI Codex](../../practitioners/openai-codex.md)
- [LangChain Deep Agents](../../practitioners/langchain-deep-agents.md)
- [Anthropic Claude Code](../../practitioners/anthropic-claude-code.md)
- [Stripe Minions](../../practitioners/stripe-minions.md)
- [StrongDM Software Factory](../../practitioners/strongdm-software-factory.md)

## Sources

- [OpenAI: Harness engineering](https://openai.com/index/harness-engineering/)
- [LangChain: Improving Deep Agents with harness engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/)
