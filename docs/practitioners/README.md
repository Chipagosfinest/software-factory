# Practitioners

*Refreshed 2026-11-02*

Parent hub for teams and products that show the patterns in production or in a public system. Each profile uses the same template: what they do, what they do well (cited), patterns shown, key numbers, sources.

78 profiles. Mechanisms stay on the pattern hubs.

## Enterprise in-house factories (19)

- [Stripe Minions](./stripe-minions.md) — one-shot devboxes, 1,300+ merged PRs/week
- [Spotify Honk](./spotify-honk.md) — fleet jobs, small tool surface, LLM judge
- [Ramp Inspect](./ramp-inspect.md) — snapshot sandboxes and self-maintaining monitors
- [StrongDM Software Factory](./strongdm-software-factory.md) — specs and scenarios, no human code or review
- [Uber](./uber.md) — uReview on >90% of ~65k weekly diffs; Minion, Shepherd, Autocover
- [Uber AutoCover](./uber-autocover.md) — LangGraph test generation, ~11% of new tests
- [Airbnb](./airbnb.md) — per-file state machine, 3.5K files, 97% automated
- [Google internal migrations](./google-internal-migrations.md) — Kythe plus fine-tuned Gemini, test-gated edits
- [Shopify Helix](./shopify-helix.md) — checkpoint gates on a 300+ screen rewrite
- [Shopify Roast](./shopify-roast.md) — Ruby workflow DSL mixing commands and agents
- [Coinbase Forge](./coinbase-forge.md) — Slack/Linear task agents; Mux's 5,068 merges are a survey figure
- [Block Builderbot](./block-builderbot.md) — Goose platform, ~1,500 merged PRs/week
- [Meta Confucius](./meta-confucius.md) — shared internal framework; REA is the first-party example
- [Brex](./brex.md) — self-hosted Cursor agents, 180 services in a month
- [Datadog Bits](./datadog-bits.md) — observability to a fix pull request
- [DoorDash](./doordash.md) — DashBench replay, 53.6% weighted recall
- [Nubank](./nubank.md) — Devin migration, 12-fold efficiency on Nubank's page
- [Pinterest](./pinterest.md) — 100-test skill harness, 73% vs 62%
- [Databricks Genie Code](./databricks-genie-code.md) — data-work agent, >2x on an internal benchmark

## Coding-agent vendors (30)

- [OpenAI Codex](./openai-codex.md) — harness-built product and Symphony
- [Cognition Devin](./cognition-devin.md) — cloud autonomous engineer
- [LangChain Deep Agents](./langchain-deep-agents.md) — harness-only benchmark gain
- [Anthropic Claude Code](./anthropic-claude-code.md) — terminal agent and skills
- [Amp](./amp.md) — agent closes the loop with the people who hit a bug
- [Replit Agent Habitat](./replit-agent-habitat.md) — contained space for unpredictable agents
- [Sentry Seer](./sentry-seer.md) — production errors to a fix pull request; review from prod data
- [Factory.ai](./factory-ai.md) — Droids, Missions, remote environments
- [Cursor](./cursor.md) — parallel cloud-VM agents and Bugbot
- [GitHub Copilot](./github-copilot.md) — cloud agent from issue to pull request
- [Google Jules](./google-jules.md) — async VM per task
- [Augment Code](./augment-code.md) — context engine beside coding agents
- [Sourcegraph](./sourcegraph.md) — code search and agentic batch changes
- [Windsurf](./windsurf.md) — docs host now presents Devin Desktop; Cascade marked legacy
- [Linear agents](./linear-agents.md) — issue assignment starts the agent
- [Kiro](./kiro.md) — specs (requirements, design, tasks) and hooks
- [Warp](./warp.md) — terminal-native agent, local or cloud
- [Zed](./zed.md) — ACP for external agents
- [JetBrains Junie](./jetbrains-junie.md) — IDE agent; test coverage is a documented task
- [Tabnine](./tabnine.md) — agent, chat, CLI, context engine
- [Harness AI](./harness-ai.md) — delivery agents on pipelines
- [Mistral Devstral](./mistral-devstral.md) — Apache 2.0 agentic coding model
- [xAI Grok Code](./xai-grok-code.md) — grok-code-fast-1 for agentic coding
- [Poolside](./poolside.md) — reinforcement learning from code execution
- [Magic](./magic.md) — long-context code models (5M and 100M token posts)
- [Imbue Sculptor](./imbue-sculptor.md) — parallel containerized agents
- [Tessl](./tessl.md) — skill registry and before-and-after evals
- [Vercel v0](./vercel-v0.md) — prompt to app, then deploy
- [Bolt.new](./bolt-new.md) — in-browser agent on WebContainers
- [Lovable](./lovable.md) — prompt-built apps with a Supabase connection

## Open-source agents (11)

- [Open-Inspect](./open-inspect.md) — open-source Inspect-style background agents
- [OpenHands](./openhands.md) — open-source sandboxed coding agents
- [Goose](./goose.md) — Block's open-source agent, forked by Stripe
- [Cline](./cline.md) — VS Code agent with plan/act approval
- [Aider](./aider.md) — terminal edits, automatic git commits, repo map
- [Roo Code](./roo-code.md) — VS Code agent with Code, Architect, Ask, Debug modes
- [Kilo Code](./kilo-code.md) — VS Code, JetBrains, and CLI; 500+ models
- [OpenCode](./opencode.md) — terminal agent, any model provider
- [Charm Crush](./charm-crush.md) — terminal agent with LSP context
- [Continue](./continue-dev.md) — VS Code, CLI, JetBrains; repo YAML config
- [SWE-agent](./swe-agent.md) — agent-computer interface; development moved to mini-swe-agent

## Infra and sandboxes (9)

- [Vercel](./vercel.md) — agentic CI on fast microVM infrastructure
- [Modal](./modal.md) — sandboxes and snapshots
- [E2B](./e2b.md) — sandboxes; homepage shows Firecracker microVMs
- [Daytona](./daytona.md) — sandboxes, snapshots, warm pools
- [Runloop](./runloop.md) — devboxes and blueprints
- [Browserbase](./browserbase.md) — hosted browser sessions for agents
- [Morph](./morph.md) — Fast Apply edit model
- [Relace](./relace.md) — Instant Apply and Fast Agentic Search
- [Cloudflare Sandbox](./cloudflare-sandbox.md) — isolated containers on Workers

## Review and verification (5)

- [CodeRabbit](./coderabbit.md) — pull-request review, CLI, and IDE
- [Greptile](./greptile.md) — review on a code graph
- [Graphite](./graphite.md) — stacked PRs, merge queue, AI reviews
- [Qodo](./qodo.md) — git review and on-prem governance
- [SWE-bench](./swe-bench.md) — public coding-agent benchmark and leaderboards

## Orchestration (4)

- [Paperclip](./paperclip.md) — org chart, budgets, heartbeat
- [Composio Agent Orchestrator](./composio-agent-orchestrator.md) — plugin fleet and worktrees
- [Conductor](./conductor.md) — Claude Code, Codex, Cursor, and OpenCode in microVMs
- [Nimbalyst](./nimbalyst.md) — desktop workspace for parallel Claude Code, Codex, and OpenCode
