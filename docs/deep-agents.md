# Deep Agents (LangChain) — Middleware-Driven Agent Composition

**Source:** [langchain-ai/deepagents](https://github.com/langchain-ai/deepagents) — 10.9k stars, MIT, 939 commits, Claude Code-inspired

While Spotify/Ramp/Stripe show how to **deploy** agents at scale, Deep Agents shows how to **compose** them. Built on LangGraph, it's an open-source implementation of the patterns that make Claude Code general-purpose — planning, sub-agents, filesystem access, and detailed prompts — packaged as composable middleware.

**Key differentiator:** Deep Agents provides composition but explicitly **does not provide governance** (circuit breakers, cost caps, audit trails, blast radius). That's our gap to fill.

---

## Key Architectural Patterns

### 1. Middleware Pipeline (vs. Monolithic Agent Config)

Deep Agents composes agent behavior through stacked middleware, not monolithic configs:

```
TodoListMiddleware → FilesystemMiddleware → SubAgentMiddleware → SummarizationMiddleware → SkillsMiddleware → HumanInTheLoopMiddleware
```

Each middleware transforms the request/response pipeline independently:
- **Base middleware** (logging, cost tracking) applies to all agents
- **Domain middleware** (GitHub tools, Telegram, media gen) is layered on per-agent
- Middleware ordering matters — later layers can override or wrap earlier ones
- New capabilities = new middleware, not rewriting agent configs

### 2. Sub-Agent Delegation via `task` Tool

The `task` tool spawns **ephemeral sub-agents with isolated context windows**:

```python
SubAgent = {
    "name": "research-analyst",
    "description": "Conduct thorough research on complex topics",
    "system_prompt": "...",
    "tools": [...],            # Can differ from parent
    "model": "openai:gpt-4o",  # Can differ from parent
    "middleware": [...]         # Gets its own middleware stack
}
```

Key design decisions:
- Sub-agents are **stateless** — they return a single result message, then die
- Multiple sub-agents can run **in parallel** (single message, multiple tool calls)
- State keys are **explicitly excluded** to prevent parent→child state leaking (`_EXCLUDED_STATE_KEYS`)
- Each sub-agent gets its own middleware stack (can be simpler than parent)
- A default "general-purpose" sub-agent is always available for miscellaneous delegation

### 3. Automatic Context Summarization

When token usage exceeds a fraction-based threshold:
1. Older messages summarized via LLM call
2. Full history offloaded to backend storage (`/conversation_history/{thread_id}.md`)
3. Summary replaces original messages in active context
4. On-demand `compact_conversation` tool for agent-initiated compaction

```python
SummarizationMiddleware(
    model="gpt-4o-mini",        # Cheap model for summarization
    trigger=("fraction", 0.85), # Trigger at 85% of context window
    keep=("fraction", 0.10),    # Keep 10% of recent messages verbatim
)
```

### 4. Skills as Layered, Override-able Directories

Skills are loaded from **ordered source paths** — later sources override earlier ones (last wins):

```python
sources=["/skills/base/", "/skills/user/", "/skills/project/"]
```

Each skill is a directory with `SKILL.md` (YAML frontmatter + markdown instructions). Skills are injected into the system prompt with progressive disclosure — metadata (name + description) loads first, full content only when the agent decides to use it.

### 5. Human-in-the-Loop via `interrupt_on`

Configurable per-tool interrupts that pause execution for human approval:

```python
create_deep_agent(
    interrupt_on={
        "edit_file": True,                          # Pause before every edit
        "execute": InterruptOnConfig(filter=...),   # Conditional pause
    }
)
```

Requires a checkpointer for state persistence during the approval wait. The `HumanInTheLoopMiddleware` handles serialization/deserialization of agent state across the interrupt boundary.

### 6. Backend Abstraction

Multiple storage backends behind a protocol interface:

| Backend | Storage | Use Case |
|---------|---------|----------|
| `StateBackend` | In-memory (ephemeral) | Testing, stateless runs |
| `FilesystemBackend` | Local disk | Development, single-node |
| `StoreBackend` | LangGraph persistent store | Production, multi-node |
| `CompositeBackend` | Multiple backends composed | Hybrid (local cache + remote) |

Agent code never touches storage directly — everything through `BackendProtocol`:
- `read_file()`, `write_file()`, `edit_file()` — file operations
- `ls()`, `glob()`, `grep()` — search operations
- `execute()` — shell commands (via `SandboxBackendProtocol`)

### Planning via `write_todos`

Built-in task decomposition — the agent creates/updates a todo list as it works:

```python
TodoListMiddleware()  # Adds write_todos tool to every agent
```

The agent reads its own todos to track multi-step progress. Not just for display — the todo state persists across tool calls and is used for planning complex operations.

---

## How Deep Agents Complements Other Systems

| Dimension | Spotify/Ramp/Stripe | Deep Agents | Combined Insight |
|-----------|---------------------|-------------|------------------|
| **Execution** | K8s pods, Modal, EC2 devboxes | Backend abstraction (protocol-based) | Use their infra patterns with DA's abstraction layer |
| **Agent composition** | Monolithic agents per task | Middleware pipeline + sub-agents | Layer shared behaviors, delegate subtasks |
| **Context management** | Static prompts, pre-hydration | Auto-summarization + compaction | Pre-hydrate (Stripe) then manage window (DA) |
| **Verification** | External verifiers, LLM judge | Internal todo tracking + planning | Judge + plan = fewer wasted verification rounds |
| **Governance** | Cost caps, file scoping, audit | `interrupt_on` per-tool | Pre-checks (ours) + runtime interrupts (DA) |
| **Reusability** | Per-repo config | Skills directories with layering | Skills = reusable prompt fragments across agents |

---

## Key Design Principle: "Trust But Verify at the Tool Level"

Deep Agents explicitly adopts a security model where "the agent can do anything its tools allow." Rather than hoping LLMs will self-police, boundaries are enforced at the **tool and sandbox implementation level**. This aligns with our executor-gate pattern — governance is a hard gate, not a suggestion.

---

## Implementation Ideas

1. **Middleware refactor** — Extract governance, cost tracking, and audit logging into shared middleware. New agents = base middleware + domain tools + prompt.
2. **Sub-agent delegation** — Let CI Debugger spawn cheap sub-agents for log parsing. Let PR Reviewer parallelize file group reviews.
3. **Context summarization** — Add summarization for long-running agent sessions (multi-file PRs, complex incidents).
4. **Layered skills** — Move from flat `prompts/*.md` to `skills/base/` + `skills/{agent}/` with override semantics.
5. **Backend protocol** — Abstract sandbox interface so agents work against local Docker, Modal, or Fly.io without code changes.

---

## Middleware Pipeline: Fixed Order Matters (March 2026 Update)

The middleware pipeline is **not** arbitrary — Deep Agents enforces a fixed execution order that reflects dependencies between layers:

```
1. PlanningMiddleware (TodoList)    — Decomposes task into steps
2. MemoryMiddleware                 — Retrieves relevant past context
3. SkillsMiddleware                 — Injects relevant skill instructions
4. FilesystemMiddleware             — Provides file read/write/search tools
5. SubAgentMiddleware               — Enables spawning child agents
6. SummarizationMiddleware          — Manages context window via compaction
```

**Why this order:**
- Planning must happen first so memory retrieval and skill loading can be informed by the plan
- Skills must load before filesystem access so the agent knows *how* to use files (coding conventions, patterns)
- Sub-agents must be available before summarization, because sub-agent delegation is a strategy for avoiding context overflow
- Summarization runs last as a safety net — it only triggers when the context window is near capacity

Reversing or reordering these layers degrades agent performance. The Deep Agents docs note that middleware ordering is "the most common source of subtle bugs in custom agent configurations."

---

## Observation Masking vs. Summarization

A key finding from JetBrains research (2026) on context management in coding agents:

| Strategy | How It Works | Cost Impact | Quality Impact |
|----------|-------------|-------------|----------------|
| **Summarization** (Deep Agents default) | LLM call compacts older messages into summary | Adds ~1 LLM call per compaction | Good — preserves intent, loses detail |
| **Observation masking** (JetBrains approach) | Truncate/mask tool outputs *before* they enter context | Zero additional LLM calls | Better — keeps recent context intact |

JetBrains reported that observation masking achieved:
- **52% lower cost** compared to full-context approaches
- **2.6% higher solve rates** on SWE-bench tasks

The insight: most tool outputs (file listings, grep results, test logs) contain far more text than the agent needs. Masking strategies include:
- **Truncation** — Keep first/last N lines of tool output
- **Regex extraction** — Pull only error lines, key metrics, or specific patterns
- **Structured extraction** — Convert verbose output to structured data (JSON) before inserting into context

**Implication for Software Factory:** Combine both approaches — mask verbose tool outputs at the tool level (observation masking), then use summarization as a second-line defense when context still grows too large.

---

## Context Engineering: The Emerging Discipline

The 2026 agent ecosystem has converged on "context engineering" as the primary lever for agent quality. Key findings across sources:

1. **Context is the bottleneck, not model capability** — Same model (Opus 4.5) scores 17 problems apart in different agent harnesses. Architecture matters as much as the underlying LLM. (Source: MorphLLM benchmark, 731 test issues)

2. **Progressive disclosure beats front-loading** — OpenAI's AGENTS.md pattern (small entry point → deep docs on demand) outperforms monolithic system prompts. Deep Agents' skills system implements this via metadata-first loading.

3. **Pre-hydration + runtime management** — Stripe pre-fetches relevant context deterministically before agent execution (MCP pre-fetch). Deep Agents manages the window during execution via summarization. Both are needed.

4. **Negative constraints outperform positive instructions** — Telling agents what NOT to do is more effective than step-by-step guides. (Source: Spotify Part 2, Anthropic 2026 Agentic Coding Trends Report)

5. **One change at a time** — Combining multiple changes in a single agent session exhausts context and produces partial results. Single-purpose sessions with focused context consistently outperform multi-task sessions.

---

## Resources

- [langchain-ai/deepagents](https://github.com/langchain-ai/deepagents) — Source code
- [Deep Agents Docs](https://docs.langchain.com/oss/python/deepagents/overview) — Full documentation and quickstart
- [Agent Harness Anatomy](https://blog.langchain.com/the-anatomy-of-an-agent-harness/) — LangChain's harness pattern analysis (includes middleware ordering rationale)
- [Anthropic 2026 Agentic Coding Trends Report](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf) — Context engineering best practices
- [MorphLLM AI Coding Agent Benchmark](https://www.morphllm.com/ai-coding-agent) — Same-model, different-harness performance gaps
- [Spotify Context Engineering (Part 2)](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2) — Negative constraints, one-change-at-a-time
