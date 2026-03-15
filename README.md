# Software Factory

Research and implementation of agent-native software development patterns — autonomous PR review, CI debugging, security patching, incident response, and background maintenance.

Background agents work continuously — developers stay **on the loop** instead of in the loop.

---

## Research Sources

Seven production systems and open-source frameworks inform this design:

| Source | System | Result | Key Insight |
|--------|--------|--------|-------------|
| **OpenAI** | [Harness Engineering](https://openai.com/index/harness-engineering/) | ~1M lines, 0 hand-written code, 3.5 PRs/eng/day | AGENTS.md as map, layered architecture enforced by linters, background GC agents |
| **Spotify** | [Honk](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) | 1,500+ merged PRs, 50% automated | K8s containers + verification loops + LLM judge |
| **Ramp** | [Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) | 30% of all PRs | Modal sandboxes, warm pools, multiplayer sessions |
| **Stripe** | [Minions](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) | 1,300 PRs/week | Goose fork + devboxes + 400 MCP tools, max 2 CI retries |
| **LangChain** | [Deep Agents](https://github.com/langchain-ai/deepagents) | 10.9k stars, Claude Code-inspired | Middleware pipelines + sub-agent delegation + context summarization |
| **Karpathy** | [Autoresearch](https://github.com/karpathy/autoresearch) | ~100 experiments overnight | NEVER STOP loop, single-metric acceptance, fixed time budgets |
| **Tobi Lutke** | [QMD](https://github.com/tobi/qmd) | Local-first knowledge search | Hybrid search (BM25 + vector + LLM reranking), MCP server |

**Three complementary pattern sets:**
- **Environment Design** (OpenAI) — humans design environments and feedback loops, agents execute. [Details →](docs/harness-engineering.md)
- **Deployment & Scale** (Spotify/Ramp/Stripe) — isolated sandboxes, PRs as review gates, warm pools, bounded retries
- **Composition & Structure** (Deep Agents) — middleware pipelines for reusable behavior, sub-agents for context isolation. [Details →](docs/deep-agents.md)

---

## Architecture

```
GitHub Webhooks / Cron / PagerDuty / Slack
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
        Sandbox Runner      GitHub API
       (isolated env)      (PRs/comments)
              │
        Human Review Gate
       (all output = PRs)
```

### Three Infrastructure Pillars

1. **Isolated Compute** — Each agent runs in a sandboxed environment. No shared state, automatic teardown. Inspired by Spotify's K8s jobs and Stripe's devbox philosophy.

2. **Event Router** — Webhooks, cron schedules, and alert feeds normalized into typed events, dispatched with full context. Pre-hydrates context (Stripe-style deterministic MCP pre-fetch).

3. **Governance Layer** — Permissions, audit trails, blast-radius controls, cost caps ($2/run), 5-minute timeouts. All output goes through PRs — humans review before merge.

---

## Core Agents

| Agent | Trigger | Output |
|-------|---------|--------|
| **PR Reviewer** | `pull_request.opened` / `.synchronize` | Review comments + approval/request changes |
| **CI Debugger** | `check_suite.completed` (failure) | Diagnosis comment + fix PR on new branch |
| **Security Patcher** | `dependabot_alert.created` / CVE cron | Patch PR with explanation |
| **Incident Responder** | PagerDuty webhook / custom alert | Root cause analysis + fix PR |
| **Merge Resolver** | PR with conflict label | Conflict resolution commit |

The CI Debugger follows a **shift-left feedback loop** combining patterns from Spotify and Stripe:
1. Parse failure logs (regex extraction, not raw dump)
2. Local verification (<5s lint/format checks)
3. Agent reasoning + fix generation in sandbox
4. Verification loop (max 2 CI rounds — diminishing returns after that)
5. LLM Judge validates diff against original intent (~25% veto rate at Spotify)

---

## Context Engineering

From Spotify Part 2 — the single biggest lever for agent quality:

- **Describe the end state**, not step-by-step instructions
- **State preconditions** — tell the agent when NOT to act
- **One change at a time** — combining changes exhausts context and produces partial results
- **Define success as tests** — "make this code better" fails; "these tests should pass" succeeds
- **Start constrained** (Spotify-style few tools), add only when prompts aren't enough

---

## Sandbox & Execution Model

| Pattern | Source | Implementation |
|---------|--------|---------------|
| Containerized execution | Spotify | Isolated containers per run, auto-detected verifiers |
| Warm pools | Ramp + Stripe | Pre-built images refreshed every 30 min, snapshot/restore |
| Cost caps | All | $2/run default, $5/day hard limit, per-call tracking |
| Bounded retries | Stripe | Max 2 CI rounds, convergence detection |
| LLM Judge | Spotify | Post-fix diff validation, scope creep detection |
| Kill switch | Custom | `executor_gate.json` blocks all execution without redeployment |

---

## Design Principles

1. **PRs are the review gate** — every agent action produces a PR. Nothing merges without human approval.
2. **Constraints over instructions** — tell agents what NOT to do. Negative constraints outperform step-by-step guides.
3. **Bounded blast radius** — each agent scoped to relevant files. Cost caps prevent runaway spend.
4. **Shift feedback left** — local lint in <5s, then CI only if local passes. Max 2 CI retries.
5. **Verification loops, not hope** — agents call black-box verifiers before opening PRs. LLM judge catches scope creep.
6. **Cattle, not pets** — every sandbox identical and disposable. No persistent agent state.
7. **Compose via middleware, govern at the boundary** — capabilities composed through middleware pipelines. Governance enforced at the tool/sandbox level, not via LLM self-policing.

### Governance: What We Add That Frameworks Don't

Deep Agents provides composition but explicitly **does not provide governance**. Software Factory fills this gap:

| Safety Layer | Implementation | Why It Matters |
|---|---|---|
| Circuit breaker | Auto-disables on failure rate | Prevents cascading failures |
| Budget guard | $5/day hard cap | Stops runaway LLM spend |
| Per-run cost cap | $2/run default | Bounds individual sessions |
| Blast radius | File scoping per agent | Agent can't rewrite unrelated code |
| Audit trail | Every LLM call, API call, file change logged | Compliance and debugging |
| Convergence detection | Same error = immediate fail | Stops retrying identical failures |
| Kill switch | JSON gate file, no redeployment needed | Emergency stop |
| Execution timeout | 5-min hard kill | Prevents hung agents |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript |
| Server | Hono |
| LLM | OpenRouter (model-agnostic) |
| GitHub | Octokit + GitHub App auth |
| Queue | BullMQ + Redis |
| Audit DB | SQLite |
| Sandbox | Docker containers |

---

## Project Structure

```
src/
  index.ts              # Webhook server (Hono)
  router.ts             # Event normalization + agent dispatch
  types.ts              # Shared type definitions
  agents/
    pr-reviewer.ts      # PR review agent
    ci-debugger.ts      # CI failure investigation + fix
    security.ts         # CVE/dependency patching
    incident.ts         # Production incident response
    merge.ts            # Merge conflict resolution
    runner.ts           # Agent execution harness
    judge.ts            # LLM judge (diff validation)
    prompts/            # Agent system prompts (markdown)
    cron/               # Scheduled background agents
  core/
    budget-guard.ts     # Per-agent LLM cost tracking + caps
    circuit-breaker.ts  # Failure rate detection + auto-disable
    context.ts          # Repo context builder
    db.ts               # SQLite audit log
    executor-gate.ts    # Pre-execution governance checks
    github.ts           # GitHub API client
    governance.ts       # Permissions, audit, blast radius
    llm.ts              # OpenRouter client with cost tracking
  queue/
    queue.ts            # BullMQ job definitions
    worker.ts           # BullMQ worker processing
  orchestrator/
    orchestrator.ts     # Symphony-style reconciliation loop
    reconciler.ts       # Task state machine
    workspace.ts        # Git worktree isolation
docs/
  harness-engineering.md  # OpenAI patterns deep-dive
  deep-agents.md          # LangChain composition patterns
  autoresearch.md         # Karpathy autonomous loop patterns
  qmd.md                  # Tobi Lutke knowledge search patterns
  orchestrator.md         # Symphony-style orchestrator design
  competitive-analysis.md # Devin, Factory.ai, Copilot Agent, etc.
  codebase-status.md      # Implementation completeness tracker
  roadmap.md              # Factory evolution roadmap
  risk-forecast.md        # Risk assessment and mitigation
```

---

## Quick Start

```bash
git clone https://github.com/Chipagosfinest/software-factory.git
cd software-factory
npm install
cp .env.example .env
# Configure: GitHub App credentials, OpenRouter API key, Redis URL
npm run dev
```

---

## Roadmap

### Phase 1: Core Factory (Current)
Stand up the 5 core agents, governance layer, sandbox infrastructure, and event routing.

### Phase 2: Harness Engineering + Middleware Refactor
Apply [OpenAI's patterns](docs/harness-engineering.md) alongside [Deep Agents' composition model](docs/deep-agents.md) — structured docs, linter enforcement, background GC agents, middleware pipelines, sub-agent delegation, observability.

### Phase 3: General-Purpose Factory
Extract into a reusable platform. Same orchestration, governance, and verification — different repos, different agents. Target: onboard a new repo in <1 hour.

[Full roadmap →](docs/roadmap.md)

---

## Research Deep-Dives

| Document | Source | Key Patterns |
|----------|--------|-------------|
| [Harness Engineering](docs/harness-engineering.md) | OpenAI | AGENTS.md as map, layered architecture, golden principles, background GC agents, 6-hour runs |
| [Deep Agents](docs/deep-agents.md) | LangChain | Middleware pipelines, sub-agent delegation, context summarization, skills, backend abstraction |
| [Autoresearch](docs/autoresearch.md) | Karpathy | NEVER STOP loop, single-metric acceptance, fixed time budget, crash recovery |
| [QMD](docs/qmd.md) | Tobi Lutke | Hybrid search (BM25 + vector + reranking), MCP server, collections, query expansion |
| [Competitive Analysis](docs/competitive-analysis.md) | — | Devin, Factory.ai, GitHub Copilot Agent, Blitzy |
| [Orchestrator](docs/orchestrator.md) | Symphony/Autoresearch | Reconciliation loop, task state machine, git worktree isolation |

---

## References

**Environment Design:** [Harness Engineering](https://openai.com/index/harness-engineering/) | [Unlocking Codex Harness](https://openai.com/index/unlocking-the-codex-harness/) | [Codex Agent Loop](https://openai.com/index/unrolling-the-codex-agent-loop/)

**Production Systems:** [Spotify Honk Pt 1](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) | [Pt 2](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2) | [Pt 3](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3) | [Ramp Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) | [Stripe Minions Pt 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) | [Pt 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)

**Frameworks:** [Deep Agents](https://github.com/langchain-ai/deepagents) | [Deep Agents Docs](https://docs.langchain.com/oss/python/deepagents/overview) | [Autoresearch](https://github.com/karpathy/autoresearch) | [QMD](https://github.com/tobi/qmd)

**Community:** [Emerging Harness Playbook](https://www.ignorance.ai/p/the-emerging-harness-engineering) | [background-agents.com](https://background-agents.com)

---

## License

Private — not yet open source.
