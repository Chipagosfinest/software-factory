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

## Resources

- [langchain-ai/deepagents](https://github.com/langchain-ai/deepagents) — Source code
- [Deep Agents Docs](https://docs.langchain.com/oss/python/deepagents/overview) — Full documentation and quickstart
