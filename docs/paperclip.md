# Paperclip — Agent Orchestration Platform

*Last updated: March 16, 2026*

**Source:** [github.com/paperclipai/paperclip](https://github.com/paperclipai/paperclip) — MIT License
**Tagline:** "If OpenClaw is an employee, Paperclip is the company."

---

## What It Is

Open-source platform that transforms individual autonomous agents into coordinated business operations. Provides the **company layer** on top of agents: org charts, budgets, task persistence, approval governance, live monitoring UI, and multi-agent coordination.

26.7k stars, 3.5k forks, rapid release cadence (v0.3.0 → v0.3.1 in 3 days as of March 2026).

---

## Key Problems Solved

| Problem | How Paperclip Addresses It |
|---------|---------------------------|
| Runaway agent spend | Per-agent monthly budgets with automatic throttling |
| Lost context between reboots | Persistent agent state and run transcripts across sessions |
| No governance over autonomous teams | Approval gates, config versioning, rollback support |
| No visibility into agent work | React UI with WebSocket live transcripts, inbox with unread tracking |
| Scaling agents as a team | Org charts, roles, hierarchies, task assignment |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + TypeScript (95.8% of codebase) |
| Database | PostgreSQL (embedded SQLite option for local dev) |
| Frontend | React + WebSocket for live updates |
| Runtime | Node.js 20+, pnpm 9.15+ |
| Architecture | Monorepo (multiple packages) |
| License | MIT |

---

## Core Architecture

### Agent Integration via Heartbeat Protocol

Paperclip doesn't implement agents — it orchestrates them. Any agent type connects via a heartbeat protocol:

- **Native adapters**: OpenClaw, Claude Code, Cursor, Bash, HTTP
- **Planned adapters**: Gemini CLI, Qwen, OpenRouter
- **OpenClaw gateway adapter** shipped in v0.3.0 — designed for direct integration

### Key Components

1. **Task Management** — Ticket-based work system with persistent sessions. Agents check out tasks, execute, report back.
2. **Financial Control** — Monthly budgets per agent with automatic throttling. Dashboard shows spend per agent/run.
3. **Governance** — Approval gates, configuration versioning with rollback, audit logs for every action.
4. **Organization** — Hierarchical org charts with roles and reporting lines. Agents have defined scopes.
5. **Multi-tenancy** — Unlimited "companies" per deployment with complete data isolation.
6. **Live Monitoring** — WebSocket-based real-time run output, markdown rendering with Mermaid diagrams.
7. **Inbox** — Unread tracking, task notifications, agent status updates.

### Database Migrations

Active schema evolution — v0.3.1 includes migrations 0026-0027, indicating rapid feature development with proper schema management.

---

## Extractable Patterns for Software Factory

### 1. Per-Agent Budget Enforcement (Upgrade Our `budget-guard.ts`)

Paperclip's budget system is more granular than our current $2/run + $5/day caps:

- **Monthly budget per agent** — not just per-run, but accumulated monthly tracking
- **Automatic throttling** — agents slow down when approaching limits (vs. our hard kill)
- **Dashboard visibility** — spend per agent/per run in real-time UI

**Apply to:** `src/core/budget-guard.ts` — add monthly accumulation + throttling mode before hard cap.

### 2. Run Transcript Persistence

Our agents are stateless (Design Principle #6: "Cattle, not pets"). Paperclip adds persistent run transcripts with markdown rendering without making agents stateful:

- Agent runs produce immutable transcripts
- Transcripts stored in PostgreSQL with full-text search
- Markdown + Mermaid rendering for human review
- Useful for overnight build review and debugging failures

**Apply to:** `src/core/db.ts` — extend audit log to store full run transcripts, not just metadata.

### 3. Task Checkout Model

Paperclip uses a task checkout system that prevents double-work:

- Agents "check out" tasks (atomic lock)
- If agent dies mid-task, task returns to queue after timeout
- Prevents two agents from working the same issue

**Apply to:** `src/orchestrator/` — our reconciliation loop could adopt checkout locks.

### 4. Heartbeat Protocol for Agent Health

Instead of polling or push-only, Paperclip uses heartbeats:

- Agents send periodic heartbeats during execution
- Missing heartbeats trigger alerts and task requeue
- Heartbeat carries progress percentage and current step

**Apply to:** `src/agents/runner.ts` — add heartbeat reporting during sandbox execution.

### 5. React Dashboard (Closes Our P2 Gap)

Our competitive analysis identified "Web dashboard" as a P2 gap. Paperclip's dashboard covers:

- Live run streaming (WebSocket)
- Agent status overview
- Budget tracking
- Task queue management
- Run transcript viewer

**Apply to:** Phase 3 (General-Purpose Factory) — could adopt Paperclip's dashboard wholesale or extract patterns.

---

## How It Compares to Our Existing Research

| Pattern | Our Source | Paperclip's Take | Delta |
|---------|-----------|-------------------|-------|
| Cost control | Budget Guard ($2/run, $5/day) | Monthly per-agent budgets + throttling | More granular, additive |
| Governance | `governance.ts` (permissions, blast radius) | Config versioning + rollback + approval gates | Stronger — adds rollback |
| Orchestration | Symphony reconciliation loop | Task checkout + heartbeat protocol | Different approach, composable |
| Agent composition | Deep Agents middleware pipelines | Adapter protocol (heartbeat-based) | Complementary, not competing |
| Observability | SQLite audit log | React UI + WebSocket + transcript persistence | Major upgrade path |
| Knowledge | QMD hybrid search | N/A (no knowledge system) | We're ahead here |
| Context engineering | Spotify Honk patterns | N/A (delegates to agents) | We're ahead here |

### Key Insight

**Paperclip is strong where we're weak (UI, budget granularity, transcript persistence) and weak where we're strong (context engineering, knowledge graph, verification loops).** This makes it a complementary reference, not a replacement.

---

## Deep Agents vs. Paperclip: Where Each Excels

**Deep Agents** (LangChain) gives us the **internal composition model** — how a single agent is structured:
- Middleware pipelines for layered capabilities
- Sub-agent delegation for context isolation
- Automatic context summarization
- Skills directories for reusable behavior

**Paperclip** gives us the **external orchestration model** — how multiple agents coordinate:
- Task assignment and checkout locks
- Budget enforcement across a fleet
- Run persistence and observability
- Org chart governance

**For Software Factory, Deep Agents is the higher-priority integration** because our agents need better internal composition (Phase 2) before we need fleet-level orchestration (Phase 3). But Paperclip's patterns for budget throttling, transcript persistence, and heartbeat health are immediately applicable.

---

## Integration Approach

### Immediate (Backport patterns into existing code)
1. Extend `budget-guard.ts` with monthly accumulation + throttle mode
2. Add run transcript storage to `db.ts`
3. Add heartbeat reporting to `runner.ts`

### Phase 2 (Middleware Refactor)
4. Use Deep Agents middleware for agent internals (primary)
5. Adopt Paperclip's adapter protocol for external agent integration

### Phase 3 (General-Purpose Factory)
6. Evaluate Paperclip's React dashboard as our observability UI
7. Consider Paperclip's multi-tenancy model for multi-repo support

---

## Quick Start

```bash
npx paperclipai onboard --yes
# Requires: Node.js 20+, pnpm 9.15+, PostgreSQL (or auto-SQLite)
```

---

## Sources

- [Paperclip GitHub](https://github.com/paperclipai/paperclip) — MIT License, 26.7k stars
- [v0.3.1 Release](https://github.com/paperclipai/paperclip/releases/tag/v0.3.1) — March 12, 2026
- [v0.3.0 Release](https://github.com/paperclipai/paperclip/releases/tag/v0.3.0) — March 9, 2026 (OpenClaw adapter)
