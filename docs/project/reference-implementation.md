# Reference Implementation

The TypeScript prototype in this repository: a pipeline with one-shot dispatch. Effectful gaps are audited in [Codebase status](./codebase-status.md) (audit as of 2026-07-16).

The codebase prototypes a **Pipeline topology with One-Shot Tree dispatch** — GitHub webhooks fan out to independent handlers that share governance, queueing, state, and model infrastructure.

Only the PR-reviewer path currently completes its intended GitHub mutation. The other core agents return diagnoses and proposed actions but do not yet edit a workspace, commit, push, or open a PR. The diagram below is therefore the intended control flow, with the current effectful boundary called out explicitly.

### Architecture

```
GitHub Webhooks / Cron / Linear Issues
              │
        Event Router (src/router.ts)
              │
     ┌────────┼────────┬──────────┬──────────┐
     │        │        │          │          │
  PR Review  CI Debug  Security  Incident  Merge
   Agent      Agent    Agent     Agent     Agent
     │        │        │          │          │
     └────────┴────────┴──────────┴──────────┘
              │                   │
        Governance Layer    GitHub API
       (gate → budget →    (PRs/comments)
        breaker → timeout)
              │
       Human Review Gate
      (target architecture)
```

**Two execution paths:**

1. **Webhook-driven (reactive)** — `GitHub Webhook → EventRouter → BullMQ → Worker → Agent`. The PR reviewer continues to the GitHub API; the other handlers currently stop at proposed actions.
2. **Orchestrator-driven (proactive)** — `Linear Issue → Orchestrator Poll → Reconciler → Workspace → BullMQ → Agent`. Symphony-style and disabled by default; workspace mutation and PR finalization are not connected end to end.

Both paths converge at the BullMQ queue and share the same Agent Runner.

### Agents

| Agent | Current behavior | Missing effect |
|-------|------------------|----------------|
| **PR Reviewer** | Posts a GitHub review with approve/request-changes behavior | Live GitHub App integration test and invalid-line recovery |
| **CI Debugger** | Returns a diagnosis and proposed commit/PR actions | Apply edits, run checks, commit, push, and open the PR |
| **Security Patcher** | Returns a dependency assessment and proposed PR action | Apply the dependency change and create the PR |
| **Incident Responder** | Returns an RCA and proposed hotfix actions | Execute and verify the hotfix |
| **Merge Resolver** | Returns proposed conflict resolutions | Edit, test, commit, and push the resolution |

### Safety & Governance

Five layers checked in order on every agent run:

1. **Global Daily Budget** — Hard cap across all agents (default $20/day). Warns at 80%.
2. **Executor Gate** — Kill switch via `executor_gate.json`. Hot-reloaded on every check.
3. **Per-Agent Governance** — File patterns, max files/lines changed, cost limit, PR creation rights.
4. **Circuit Breaker** — Per-API (OpenRouter, GitHub, Linear). Opens after 3 consecutive failures, half-open test after 60s.
5. **Timeout** — Agent runs race against configurable timeout (default 300s).

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Runtime | Node.js + TypeScript | Type safety, ecosystem |
| Server | Hono | Lightweight, fast |
| LLM | OpenRouter | Model-agnostic (Claude, GPT, Gemini) |
| GitHub | Octokit + GitHub App auth | PR creation, review comments |
| Queue | BullMQ + Redis | Reliable event processing |
| Local DB | SQLite (better-sqlite3) | Audit logs, agent state |
| External DB | Supabase (PostgreSQL) | Signals, validations |
| Sandbox | Docker / git worktrees | Isolated execution per agent |

### Local Prototype

```bash
git clone https://github.com/Chipagosfinest/software-factory.git
cd software-factory
npm install
cp .env.example .env
# Configure: GitHub App credentials, OpenRouter API key, Redis URL
npm run dev
```

Redis and external credentials are required for effectful paths. Before treating a run as production evidence, add a disposable-repository integration test and verify the complete workspace → checks → commit → push → draft-PR loop.
