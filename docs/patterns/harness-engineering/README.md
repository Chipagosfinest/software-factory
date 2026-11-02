# Harness Engineering

*Refreshed 2026-11-02*

Parent hub for the environment around a model: instructions, tools, middleware, plans, and feedback loops. The model is a component. The harness is what makes its work reliable.

OpenAI's internal product and LangChain's Deep Agents are children of this hub. They describe the same pattern from two measurements: a product built with no hand-written code, and a fixed model whose score moved only when the harness changed.

LangChain's [27 October 2026 talk](https://www.youtube.com/watch?v=xy_7SzwsIjM) splits an agent into model, harness, and context, and says a harness change read from traces should stay human-reviewed because it applies to every user. [Managed Deep Agents](https://www.youtube.com/watch?v=Wb3hQaG_xf0), the day before, puts that harness on LangSmith Deployment so durable execution and the task queue are runtime rather than team-owned infrastructure.

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
- [Uber AutoCover](../../practitioners/uber-autocover.md)
- [Airbnb](../../practitioners/airbnb.md)
- [Google internal migrations](../../practitioners/google-internal-migrations.md)
- [Shopify Helix](../../practitioners/shopify-helix.md)
- [Shopify Roast](../../practitioners/shopify-roast.md)
- [Meta Confucius](../../practitioners/meta-confucius.md)
- [Pinterest](../../practitioners/pinterest.md)
- [Augment Code](../../practitioners/augment-code.md)
- [Sourcegraph](../../practitioners/sourcegraph.md)
- [Windsurf](../../practitioners/windsurf.md)
- [Kiro](../../practitioners/kiro.md)
- [Warp](../../practitioners/warp.md)
- [Zed](../../practitioners/zed.md)
- [JetBrains Junie](../../practitioners/jetbrains-junie.md)
- [Tabnine](../../practitioners/tabnine.md)
- [Mistral Devstral](../../practitioners/mistral-devstral.md)
- [xAI Grok Code](../../practitioners/xai-grok-code.md)
- [Poolside](../../practitioners/poolside.md)
- [Magic](../../practitioners/magic.md)
- [Tessl](../../practitioners/tessl.md)
- [Aider](../../practitioners/aider.md)
- [Roo Code](../../practitioners/roo-code.md)
- [Kilo Code](../../practitioners/kilo-code.md)
- [OpenCode](../../practitioners/opencode.md)
- [Charm Crush](../../practitioners/charm-crush.md)
- [Continue](../../practitioners/continue-dev.md)
- [SWE-agent](../../practitioners/swe-agent.md)
- [Runloop](../../practitioners/runloop.md)
- [Morph](../../practitioners/morph.md)
- [Relace](../../practitioners/relace.md)

## Sources

- [OpenAI: Harness engineering](https://openai.com/index/harness-engineering/)
- [LangChain: Improving Deep Agents with harness engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/)
- [How to Build Agents That Improve Over Time](https://www.youtube.com/watch?v=xy_7SzwsIjM) (2026-10-27)
- [Inside Managed Deep Agents](https://www.youtube.com/watch?v=Wb3hQaG_xf0) (2026-10-26)
