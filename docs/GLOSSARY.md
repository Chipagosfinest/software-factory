# Glossary — Canonical Term Definitions

*Terms used throughout this research corpus, defined once.*

---

### AGENTS.md
A short (~100 line) navigation file that acts as a table of contents pointing to structured docs, not a monolithic instruction set. Coined by OpenAI's harness engineering team. The "one big file" approach failed because context is scarce.
→ [Harness Engineering (OpenAI)](harness-engineering.md)

### Approval Gate
A governance checkpoint that pauses agent execution and requires human approval before proceeding. Can be per-tool (Deep Agents `interrupt_on`), per-cost (Paperclip budget threshold), or per-action (Telegram inline buttons in OpenClaw).
→ [Agent Safety & Cost Control](agent-safety-cost-control.md), [Deep Agents](deep-agents.md)

### Background Agent
An agent that runs without human presence — triggered by webhooks, crons, or issue trackers. Distinct from interactive copilots. Examples: Spotify Honk, Stripe Minions, Cursor Background Agents.
→ [Enterprise Adoption](enterprise-adoption.md)

### Blast Radius
The scope of files/systems an agent can affect. A governance primitive — each agent is scoped to relevant files only. Prevents a CI debugger from accidentally rewriting your auth module.
→ [Agent Safety & Cost Control](agent-safety-cost-control.md)

### Blueprint (Stripe)
A state machine alternating between deterministic code nodes (git ops, linting, PR templating) and agentic nodes (implementation, CI fixing). Prevents unbounded LLM execution.
→ [Enterprise Adoption](enterprise-adoption.md)

### Circuit Breaker
Auto-stop mechanism that kills an agent when it detects failure patterns: repeated errors, rate spikes, or cost overruns. Prevents runaway loops.
→ [Agent Safety & Cost Control](agent-safety-cost-control.md)

### Context Engineering
The practice of designing all information entering an LLM's context window to enable reliable decisions. Coined by Tobi Lutke (June 2025), endorsed by Karpathy. A subset of harness engineering.
→ [Context Engineering](context-engineering.md)

### Context Rot
The finding that LLM reliability decreases with longer inputs, even on simple tasks. The "effective context window" is often much smaller than advertised. From Chroma Research.
→ [Context Engineering](context-engineering.md)

### Convergence Detection
Detecting when an agent is stuck in a loop producing the same error. Triggers circuit breaker. Used by Spotify (pipeline stall detection) and Deep Agents (trace analysis skill).
→ [Harness Engineering (LangChain)](harness-engineering-langchain.md), [Potent Combos](potent-combos.md)

### Durable Object (Cloudflare)
A Cloudflare Workers primitive that provides per-session isolation with embedded SQLite and WebSocket hub. Used by Open-Inspect as the control plane for multiplayer agent sessions.
→ [Background Agents (Open-Inspect)](background-agents-open-inspect.md)

### Devbox
Isolated VM (typically EC2) pre-warmed with the full codebase, services, and build caches. Stripe's Minions inherit developer devboxes — originally built for humans. Spin up in ~10 seconds.
→ [Enterprise Adoption](enterprise-adoption.md), [Sandbox Isolation](sandbox-isolation.md)

### Golden Principles
Opinionated, mechanically-enforced rules that keep a codebase legible for agents. Examples: prefer shared utilities, structured logging, file size limits, naming conventions. Background GC agents scan for deviations.
→ [Harness Engineering (OpenAI)](harness-engineering.md)

### Harness Engineering
The entire execution environment around a model: system prompts, tools, middleware, flow control, sandbox, verification. The harness — not the model — determines agent quality. Term popularized by OpenAI (Feb 2026).
→ [Harness Engineering (OpenAI)](harness-engineering.md), [Harness Engineering (LangChain)](harness-engineering-langchain.md)

### Hybrid Search
Three-layer retrieval: BM25 (keyword) + vector (semantic) + LLM reranking (quality). Used by QMD. Dramatically improves recall over any single approach.
→ [QMD](qmd.md)

### Kill Switch
A JSON-based gate file (`executor_gate.json`) that stops all agent execution without redeployment. A governance primitive for emergencies.
→ [Agent Safety & Cost Control](agent-safety-cost-control.md)

### LLM Judge
A secondary LLM call that reviews agent output before submission. Spotify's Honk uses this with a ~25% veto rate, catching scope creep and phantom fixes.
→ [Potent Combos](potent-combos.md), [Sandbox Isolation](sandbox-isolation.md)

### Mesh Topology
Peer-to-peer agent architecture where multiple agents (and humans) share state through a common workspace. No central coordinator — agents discover work via shared filesystem. Ramp Inspect pioneered this with Modal snapshots; Open-Inspect is the open-source clone.
→ [Potent Combos](potent-combos.md), [Background Agents (Open-Inspect)](background-agents-open-inspect.md)

### Middleware Pipeline
Composable agent behavior through stacked middleware layers (e.g., TodoList → Filesystem → SubAgent → Summarization → Skills → HumanInTheLoop). Each transforms the request/response independently. Deep Agents' core pattern.
→ [Deep Agents](deep-agents.md)

### Multiplayer Session
A shared agent workspace where multiple humans and bots participate simultaneously. Features real-time event streaming, per-user prompt attribution in git commits, and sequential prompt processing (FIFO queue). Pioneered by Ramp Inspect, open-sourced by Open-Inspect.
→ [Background Agents (Open-Inspect)](background-agents-open-inspect.md)

### Observation Masking
Replacing old tool outputs with placeholders while keeping reasoning and actions. 52% cheaper, +2.6% solve rate vs raw context. From JetBrains "Complexity Trap" paper (NeurIPS 2025).
→ [Context Engineering](context-engineering.md)

### One-Shot Architecture
Fully assembled context payload → single LLM call → structured result. No multi-turn conversation. Stripe Minions uses this.
→ [Enterprise Adoption](enterprise-adoption.md)

### Org Chart Topology
Hierarchical agent structure with a CEO/orchestrator at top, leads below, workers at bottom. Each level has its own budget. Paperclip's pattern.
→ [Potent Combos](potent-combos.md)

### Pipeline Topology
Same agent, sequential stages (parse → reason → fix → verify → judge). Distinct from Sequential Multi-Agent where different specialized agents handle each stage.
→ [Potent Combos](potent-combos.md)

### Progressive Disclosure
Start agents with a small, stable entry point and teach them where to look next. Don't overwhelm up front. Applied to AGENTS.md (OpenAI), skills loading (Deep Agents), and memory (Napkin).
→ [Harness Engineering (OpenAI)](harness-engineering.md), [Deep Agents](deep-agents.md), [Agent Memory Systems](agent-memory-systems.md)

### Ratchet Pattern
Keep improvements, discard regressions. Git commit on success, `git reset` on failure. Each experiment either advances the branch or doesn't. From Karpathy's autoresearch.
→ [Autoresearch](autoresearch.md)

### Reasoning Sandwich
High-capability model → low-capability model → high-capability model. Saves tokens and time without sacrificing quality on critical steps. Used by LangChain Open SWE.
→ [Harness Engineering (LangChain)](harness-engineering-langchain.md)

### Reconciliation Loop
Self-healing poll loop that detects and fixes drift: claims unclaimed tasks, restarts stalled agents, retries failed work, cleans up exhausted tasks. From Symphony/OpenAI pattern.
→ [Orchestrator](orchestrator.md)

### Role Inversion
The thesis that developers now spend 80% filing issues and 20% reviewing PRs (reversed from 80% writing code). The bottleneck moved from implementation to judgment. From Ryan Carson.
→ [Symphony + Carson](symphony-carson.md)

### Self-Verification Loop
Agents must prove their work before terminating. Plan → Build → Verify → Done (or Fix → re-verify). `PreCompletionChecklistMiddleware` enforces this in Deep Agents.
→ [Harness Engineering (LangChain)](harness-engineering-langchain.md)

### Sequential Multi-Agent
Different specialized agents handle each stage (Manager → Planner → Programmer → Reviewer). The Planner never writes code; the Programmer never reviews. Distinct from Pipeline where the same agent does sequential stages.
→ [Potent Combos](potent-combos.md)

### Snapshot-Based Warm Pool
Not keeping idle containers running, but keeping filesystem snapshots fresh so new containers launch pre-loaded. Ramp's key innovation — sandboxes start in seconds, at most 30 min stale.
→ [Sandbox Isolation](sandbox-isolation.md)

### Sub-Agent
Ephemeral child agent with isolated context. Returns a single result, then dies. Prevents parent context pollution. Multiple can run in parallel.
→ [Deep Agents](deep-agents.md)

### Toolshed (Stripe)
Centralized MCP server hosting ~500 tools. Agents receive curated subsets of ~15 per task via deterministic prefetching that scans prompts for links/keywords.
→ [Enterprise Adoption](enterprise-adoption.md)

### Warm Pool
Pre-provisioned sandbox instances ready for instant assignment. Eliminates cold-start latency. Used by Ramp (Modal snapshots), Stripe (devboxes), and E2B.
→ [Sandbox Isolation](sandbox-isolation.md), [Sandbox Architecture 2026](sandbox-architecture-2026.md)

### write_todos
A "no-op" planning tool that forces the agent to maintain an explicit to-do list visible throughout execution. Dramatically improves long-term coherence for complex tasks. From LangChain Deep Agents.
→ [Harness Engineering (LangChain)](harness-engineering-langchain.md), [Deep Agents](deep-agents.md)
