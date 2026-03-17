# Composio Agent Orchestrator

> Fleet management for parallel AI coding agents with plugin-based architecture

**Repo:** [ComposioHQ/agent-orchestrator](https://github.com/ComposioHQ/agent-orchestrator) | **Stars:** 4,543 | **License:** MIT | **Created:** 2026-02-13
**Stack:** TypeScript, Node.js 20+, pnpm monorepo, tmux, Git 2.25+ (worktrees)

---

## What It Is

Agent Orchestrator (`ao` CLI) is an open-source platform for managing fleets of parallel AI coding agents. Each agent runs in an isolated git worktree with its own branch, autonomously fixes CI failures, addresses review comments, and opens PRs. A human supervises from a single dashboard.

**Key thesis:** Agents are managed processes, not chat loops. Traditional ReAct agents are stateless loops — Agent Orchestrator provides structured state machines, resume-on-failure, deterministic lifecycle management, and an audit trail.

---

## Architecture

### Plugin-Based — 8 Pluggable Slots

| Slot | Default | Alternatives |
|------|---------|-------------|
| Runtime | tmux | docker, k8s, process |
| Agent | claude-code | codex, aider, opencode |
| Workspace | worktree | clone |
| Tracker | github | linear, gitlab |
| SCM | github | gitlab |
| Notifier | desktop | slack, composio, webhook, **openclaw** |
| Terminal | iterm2 | web |
| Lifecycle | core | — |

**Monorepo packages:** `core`, `cli`, `web` (dashboard), `mobile`, `plugins` (20 plugin packages), `integration-tests`

### Zero-Path-Configuration Model

All paths auto-derive. Runtime data in `~/.agent-orchestrator/` with hash-based namespacing (12-char SHA256 of config dir path) to prevent collisions across multiple orchestrator instances.

### Dual Naming Convention

User-facing names (`int-1`) vs tmux session names (`a3f2b1c-int-1`) for usability + uniqueness. Session prefixes auto-derived from project name (CamelCase → uppercase letters, kebab-case → initials).

---

## Key Patterns

### 1. Task Decomposer (Planner/Executor)

Uses Claude Sonnet to classify tasks as "atomic" vs "composite." Recursively decomposes composite tasks into 2–7 subtasks (max depth: 3). Produces a `DecompositionPlan` with a tree of `TaskNode` objects.

```
Composite Task
├── Subtask A (atomic) → Agent 1
├── Subtask B (composite)
│   ├── Subtask B.1 (atomic) → Agent 2
│   └── Subtask B.2 (atomic) → Agent 3
└── Subtask C (atomic) → Agent 4
```

- Optional human approval gate before execution begins
- Propagates done/failed status upward through the tree
- Passes lineage (ancestor chain) and sibling awareness to each agent

**Software Factory relevance:** This is a more sophisticated version of the one-shot tree topology (Stripe pattern). The recursive decomposition with depth limits and lineage passing is a pattern we should adopt for the orchestrator layer.

### 2. Session State Machine

Full lifecycle tracking with deterministic state transitions:

```
spawning → working → pr_open → ci_failed ↔ review_pending ↔ changes_requested
         → mergeable → merged → cleanup → done
         → needs_input, stuck, errored, idle, killed, terminated
```

**Software Factory relevance:** Our reconciler in `src/orchestrator/reconciler.ts` has a simpler state machine. Agent Orchestrator's state machine covers the full PR lifecycle including CI failure loops and review cycles — exactly the states we need for Phase 2.

### 3. Reaction System (Autonomous Feedback Loop)

Configurable reactions to external events:

| Trigger | Actions Available |
|---------|-------------------|
| CI failure | `send-to-agent` (auto-fix), `notify` (escalate) |
| Review comment | `send-to-agent` (address feedback) |
| PR approval | `auto-merge` |
| Stuck detection | `notify` (human intervention) |

- Retry tracking with escalation after max retries or time threshold
- Review backlog dispatch with **fingerprinting** to prevent duplicate handling
- Each dispatched review comment gets a unique fingerprint — agent won't re-process it

**Software Factory relevance:** The fingerprinted review dispatch is a pattern we don't have. Our CI debugger retries blindly — adding fingerprinting would prevent duplicate work on the same failure.

### 4. Lifecycle Manager (Polling-Based State Detection)

Concurrent polling of all active sessions with a multi-step detection pipeline:

```
Runtime alive? → Agent activity? → PR state? → CI/review status? → Merge ready?
     │                │                │               │                │
     ▼                ▼                ▼               ▼                ▼
  Event:          Event:           Event:          Event:          Event:
  session_dead    agent_idle       pr_opened       ci_failed       all_complete
```

- JSONL or terminal parsing for activity detection (agent-agnostic)
- Event generation with priority routing (urgent/action/warning/info)
- Emits `summary.all_complete` when all sessions reach terminal states

**Software Factory relevance:** This is a cleaner version of what our orchestrator's reconciliation loop should do. The multi-step detection pipeline with priority-routed events is more robust than our current approach.

### 5. Agent-Agnostic Interface

Each agent plugin implements:

```typescript
interface AgentPlugin {
  getLaunchCommand(): string[];           // How to start the agent
  detectActivity(): ActivityState;         // Is it doing something?
  getActivityState(): 'active' | 'idle';   // Simplified status
  getSessionInfo(): { cost: CostEstimate }; // Token/cost tracking
  getRestoreCommand(): string[];           // Resume after crash
}
```

Supports Claude Code, Codex, Aider, and OpenCode out of the box.

**Software Factory relevance:** Our `src/agents/runner.ts` is tightly coupled to OpenRouter LLM calls. Agent Orchestrator's plugin interface shows how to make the runner agent-agnostic — useful for Phase 3 when we want to support multiple LLM backends or external agents.

### 6. Permission Modes

Four levels of agent autonomy:

| Mode | Behavior |
|------|----------|
| `permissionless` | Full autonomy, no human gates |
| `default` | Standard safety checks |
| `auto-edit` | Can edit but not merge |
| `suggest` | Propose only, no direct changes |

**Software Factory relevance:** Maps directly to our governance layer. Our kill switch + blast radius + budget guard effectively implement `default` mode. We should formalize the other modes.

---

## Comparison to Software Factory Sources

| Dimension | Agent Orchestrator | Symphony (Carson) | Paperclip | Software Factory |
|-----------|-------------------|-------------------|-----------|-----------------|
| **Focus** | Fleet management for coding agents | Single-dev code factory | General agent fleet | Autonomous DevOps/SRE |
| **Agent model** | Agent-agnostic (Claude Code, Codex, Aider) | Codex-specific | Custom agents | OpenRouter LLM calls |
| **Orchestration** | Plugin-based slots, YAML config | Elixir/OTP reconciliation | Org chart topology | Webhook → router → agent |
| **Isolation** | Git worktrees | Git clones | Per-agent sandboxes | Docker containers |
| **State machine** | 15+ states, full PR lifecycle | Linear-driven | Task checkout locks | Simple reconciler |
| **Task decomposition** | LLM-powered recursive (depth 3) | Manual (Linear issues) | Manual (dashboard) | Event-driven (webhooks) |
| **CI integration** | Auto-fix + retry + escalation | CI pass → merge | Health checks | Max 2 retries |
| **Review handling** | Fingerprinted dispatch | Not built-in | Not built-in | Not built-in |
| **Cost tracking** | Per-session token + USD | Not explicit | Per-agent budgets | Budget guard ($2/run) |
| **Scale** | Many agents, many repos | 10 parallel agents | Dashboard + fleet | Single repo, 5 agents |
| **Stars** | 4,543 | N/A (private) | 26,700 | Private |

### Complementary Strengths

Agent Orchestrator fills gaps that other sources don't:

1. **Agent-agnostic plugin system** — Neither Symphony nor Paperclip support swapping agent backends. AO's 8-slot plugin architecture is the most modular design in the space.

2. **Fingerprinted review dispatch** — Unique pattern. Prevents duplicate work when multiple review comments arrive in quick succession.

3. **LLM-powered task decomposition** — Symphony requires manual issue creation. AO auto-decomposes complex tasks into parallel subtasks with lineage tracking.

4. **Multi-instance support** — Hash-based namespacing allows multiple orchestrator instances on the same machine without conflicts. Relevant for multi-repo Phase 3.

5. **`ao doctor --fix`** — Self-healing diagnostics (checks PATH, binaries, tmux, configs, stale files). Similar to OpenClaw's `openclaw doctor`.

---

## Patterns to Adopt

### High Priority (Phase 2)

1. **Session state machine expansion** — Adopt AO's 15-state model covering full PR lifecycle. Our reconciler is too simple for production.

2. **Fingerprinted event dispatch** — Add SHA fingerprints to webhook events to prevent duplicate processing. Critical for CI failure loops.

3. **Reaction system with escalation** — Configurable reactions (auto-fix vs notify) with retry tracking and escalation thresholds.

### Medium Priority (Phase 2–3)

4. **LLM task decomposition** — For complex incidents or multi-file security patches, use LLM to decompose into parallel subtasks.

5. **Agent plugin interface** — Formalize the agent abstraction so we can support Claude Code, Codex, and Aider as execution backends.

6. **Permission modes** — Formalize permissionless/default/auto-edit/suggest as governance configuration.

### Phase 3

7. **Multi-instance namespacing** — Hash-based isolation for multi-repo support.

8. **Dual naming convention** — User-friendly names + unique internal names for fleet management at scale.

---

## OpenClaw Integration

Notable: Agent Orchestrator has a `notifier-openclaw` plugin and a `DESIGN-OPENCLAW-PLUGIN.md` design doc. This means AO can send notifications to OpenClaw Hub's Telegram interface. Potential integration path:

```
Agent Orchestrator (fleet management)
  → notifier-openclaw plugin
    → OpenClaw Hub (Telegram notification)
      → Alec reviews PRs from phone
```

This mirrors Carson's workflow (file bugs from phone → agents resolve) but with AO managing the fleet and OpenClaw as the human interface.

---

## Key Metrics

- **3,288 test cases** — Well-tested codebase
- **20 plugin packages** — Highly modular
- **92.7% TypeScript** — Same stack as Software Factory
- **4,543 stars in ~1 month** — Strong community interest
- **MIT license** — Can freely adopt patterns or fork

---

## Sources

- [GitHub: ComposioHQ/agent-orchestrator](https://github.com/ComposioHQ/agent-orchestrator)
- [Composio Open Sources Agent Orchestrator — MarkTechPost](https://www.marktechpost.com/2026/02/23/composio-open-sources-agent-orchestrator-to-help-ai-developers-build-scalable-multi-agent-workflows-beyond-the-traditional-react-loops/)
- [Composio Agent Orchestrator: Reliable AI Agent Building — i10x](https://i10x.ai/news/composio-agent-orchestrator-ai-frameworks)
