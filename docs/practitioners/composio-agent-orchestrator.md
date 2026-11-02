# Composio Agent Orchestrator

*Refreshed 2026-11-01*

## What they do

Agent Orchestrator (`ao`) is an open-source fleet manager for parallel coding agents. Each agent runs in its own git worktree and branch, and can fix CI, respond to review, and open a pull request. A person watches one dashboard. The pattern note is [Composio Agent Orchestrator](../patterns/orchestration/agent-orchestrator.md).

The design claim in that note: agents are managed processes with a lifecycle, not stateless chat loops. Eight slots are pluggable (runtime, agent, workspace, tracker, source control, notifier, terminal, lifecycle). Defaults include tmux, Claude Code, git worktrees, and GitHub. The stack is TypeScript, Node.js 20+, a pnpm monorepo. License: MIT. Created 2026-02-13.

A planner/executor pass classifies tasks as atomic or composite and splits composite tasks into 2–7 subtasks, max depth 3, with an optional human gate before execution.

## What they do well

- Worktree-per-agent isolation is the same idea as the orchestrator notes, with a plugin boundary so the runtime and the tracker can change without rewriting the lifecycle.
- The state machine covers the pull-request lifecycle, including CI failure and review, not only "queued" and "done." The pattern note calls it a 15-state model (the comparison table says 15+ states).
- Indexed traction in the note: 4,543 stars, described there as arriving in about a month.

## Patterns shown

- [Orchestration](../patterns/orchestration/README.md) — fleet, worktrees, decomposition
- [Background agents](../patterns/background-agents/README.md) — isolated workspace per agent

## Key numbers

| Figure | Meaning | Where this repo records it |
|--------|---------|----------------------------|
| 4,543 | GitHub stars | Agent Orchestrator note |
| 8 | Pluggable slots | Agent Orchestrator note |
| 15+ | Lifecycle states | Agent Orchestrator note |
| 2–7 | Subtasks per composite task | Agent Orchestrator note |
| 3 | Max decomposition depth | Agent Orchestrator note |
| MIT | License | Agent Orchestrator note |

## Sources

- [ComposioHQ/agent-orchestrator](https://github.com/ComposioHQ/agent-orchestrator)
