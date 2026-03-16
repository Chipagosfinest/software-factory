# Software Factory Roadmap

## Now: Core Factory
Stand up the factory with the 5 core agents (PR review, CI debug, security, incident, merge). Establish governance layer, sandbox infrastructure, and event routing.

**Key metric:** Agent-written PRs as % of total PRs

## Next: Harness Engineering + Middleware Refactor
Apply OpenAI's harness engineering patterns alongside Deep Agents' composition model:
- Restructure knowledge base: AGENTS.md as map → structured `docs/` directory as system of record
- Enforce layer constraints mechanically (custom linters, not convention)
- Add background "garbage collection" agents that scan for deviations and open cleanup PRs
- Refactor from monolithic agent configs to composable middleware pipelines
- Add sub-agent delegation for context isolation and parallel execution
- Add observability stack per sandbox (queryable logs/metrics, not raw output)

**Key metric:** Time to add a new agent type (target: base middleware + prompt + domain tools) + code quality grade trending upward via background agents

## Then: General-Purpose Factory
Extract patterns into a reusable platform. Same container orchestration, same governance, same verification loops — different repos, different agents. Any project can plug in PR review, CI debugging, and security patching with minimal config.

**Key metric:** Time to onboard a new repo (target: <1 hour)

## Research Sources

| Source | Key Pattern | Applied Where |
|--------|------------|---------------|
| OpenAI Harness Engineering | AGENTS.md as map, layered architecture, golden principles, background GC agents, agent-legible observability, execution plans | Knowledge base structure, linter enforcement, codebase self-maintenance |
| Spotify Honk | K8s containers, LLM judge, verification loops | Sandbox, CI debugger |
| Ramp Inspect | Modal warm pools, multiplayer sessions | Sandbox warm pools |
| Stripe Minions | 400+ MCP tools, devboxes, conditional rules | Tool strategy, per-dir rules |
| LangChain Deep Agents | Middleware pipelines, sub-agents, context summarization, skills | Middleware refactor phase |
| OpenAI Symphony | Orchestrator state machine, reconciliation loop | Orchestrator |
| Karpathy Autoresearch | NEVER STOP loop, single-metric acceptance, fixed time budget, crash recovery, simplicity criterion | Agent loop design, convergence detection, safety guardrails |
| Tobi Lutke QMD | Hybrid search (BM25 + vector + reranking), MCP server, collections + context, query expansion | Agent knowledge retrieval, docs/ search |
| Paperclip AI | Per-agent monthly budgets, task checkout locks, heartbeat protocol, React dashboard, run transcript persistence | Budget guard upgrade (Now), transcript storage (Now), fleet orchestration + dashboard (Phase 3) |
