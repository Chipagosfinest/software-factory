# Software Factory

An agent-native software development platform that autonomously handles PR review, CI debugging, security patching, and incident response. Background agents work continuously — developers stay **on the loop** instead of in the loop.

Built for [ProductRank](https://github.com/alecgutman/productrank) and designed to extend into [Visa's agentic commerce platform](https://github.com/alecgutman/productrank/blob/main/.planning/FUTURE-FEATURES.md).

---

## Why Build This?

Three companies have proven this pattern at scale:

| Company | System | Result | Key Insight |
|---------|--------|--------|-------------|
| **Spotify** | [Honk](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) | 1,500+ merged PRs, 50% of all PRs automated | Containerized K8s execution + verification loops + LLM judge. Claude Code is top-performing agent. |
| **Ramp** | [Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) | 30% of all PRs in months | Modal sandboxes with warm pools, multiplayer sessions, filesystem snapshots. Sessions are fast to start and effectively free to run. |
| **Stripe** | [Minions](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) | 1,300 PRs/week, zero human-written code | Goose fork + isolated devboxes (10s spin-up) + 400 MCP tools via "Toolshed". Max 2 CI retries — diminishing returns after that. |

**The pattern is clear:** isolated sandboxes, PRs as review gates, humans review before merge. We apply the same architecture to ProductRank's knowledge graph maintenance and Visa's commerce platform.

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

1. **Isolated Compute** — Each agent runs in a sandboxed environment. No shared state, automatic teardown. A single agent failure can't cascade. Inspired by Spotify's K8s containerized jobs and Stripe's devbox "cattle not pets" philosophy.

2. **Event Router** — Webhooks, cron schedules, and alert feeds are normalized into typed events, then dispatched to the right agent with full context. Pre-hydrates context (like Stripe's deterministic MCP pre-fetch) before the agent loop begins.

3. **Governance Layer** — Permissions, audit trails, blast-radius controls, cost caps ($2/run default), 5-minute timeouts. All agent output goes through PRs — humans review before merge.

---

## Core Agents

### 1. PR Reviewer
| | |
|---|---|
| **Trigger** | `pull_request.opened` / `pull_request.synchronize` |
| **Output** | Review comments + approval/request changes |
| **Prompt** | `src/agents/prompts/pr-reviewer.md` |

### 2. CI Debugger
| | |
|---|---|
| **Trigger** | `check_suite.completed` (failure) |
| **Output** | Diagnosis comment + fix PR on new branch |
| **Prompt** | `src/agents/prompts/ci-debugger.md` |

The CI debugger follows a **shift-left feedback loop** (Stripe/Spotify pattern):

```
CI Failure Event
      │
  ┌───▼────────────────┐
  │ Parse failure logs  │ ← Extract only relevant errors (regex, not raw dump)
  │ Classify error type │ ← lint | type | test | build | dependency | flaky
  └───┬────────────────┘
      │
  ┌───▼────────────────┐
  │ Local verification  │ ← Run linters/formatters locally first (< 5 seconds)
  │ Apply autofixes     │ ← Many failures have deterministic fixes
  └───┬────────────────┘
      │
  ┌───▼────────────────┐
  │ Agent reasoning     │ ← LLM analyzes remaining failures with repo context
  │ Generate fix        │ ← Code changes in sandbox
  └───┬────────────────┘
      │
  ┌───▼────────────────┐
  │ Verification loop   │ ← Run build + tests in sandbox
  │ Max 2 CI rounds     │ ← Diminishing returns after 2 (Stripe finding)
  └───┬────────────────┘
      │
  ┌───▼────────────────┐
  │ LLM Judge           │ ← Verify fix matches original intent (Spotify pattern)
  │ Veto if off-scope   │ ← ~25% of sessions vetoed at Spotify
  └───┬────────────────┘
      │
  Fix PR opened for review
```

**Key CI debugging patterns from production (Spotify Part 3):**
- **Verification loops** — Agent doesn't know what verifiers do, just that it must call them. Verifiers activate automatically based on file detection (e.g., `pom.xml` → Maven verifier, `package.json` → npm verifier).
- **Error parsing** — Don't send raw CI logs to the agent. Use regex to extract only relevant error messages. This saves context window and improves fix accuracy.
- **LLM Judge** — After fix passes CI, a separate LLM evaluates the diff against the original prompt. Catches "ambitious" agents that refactor unrelated code or disable flaky tests.
- **Bounded retries** — Stripe caps at 2 CI rounds. Spotify uses 10 turns per session, 3 session retries total. More iterations hit diminishing returns.

### 3. Security Patcher
| | |
|---|---|
| **Trigger** | `dependabot_alert.created` / CVE feed cron |
| **Output** | Patch PR with explanation |
| **Prompt** | `src/agents/prompts/security.md` |

### 4. Incident Responder
| | |
|---|---|
| **Trigger** | PagerDuty webhook / custom alert |
| **Output** | Root cause analysis + fix PR |
| **Prompt** | `src/agents/prompts/incident.md` |

### 5. Merge Resolver
| | |
|---|---|
| **Trigger** | `pull_request` with conflict label |
| **Output** | Conflict resolution commit |
| **Prompt** | `src/agents/prompts/merge.md` |

---

## Knowledge Graph Agents (Cron)

Five autonomous agents expand the ProductRank knowledge graph daily. Each agent updates a product's `confidence` score — products graduate from "raw" to "trusted" as confidence accumulates.

| Agent | Schedule | Dimension | Δ Confidence | Cost |
|-------|----------|-----------|-------------|------|
| **Tool Discovery** | Daily 3:00 AM | Breadth — new tools | — | ~$1.50/day |
| **Signal Harvester** | Daily 2:00 AM | Accuracy — fresh metrics | +0.3 | Free (GitHub/npm APIs) |
| **Drift Detector** | Daily 4:00 AM | Reliability — staleness | +0.2 | ~$0.50/day |
| **Backfill** | Daily 1:00 AM | Depth — rich profiles | +0.2 | ~$3.00/day |
| **Integration Tester** | Weekly Sun 5:00 AM | Completeness — verified | +0.3 | Free (Docker) |

**Confidence threshold:** Products with `confidence >= 0.8` rank normally in GraphRank. Below 0.8, they're weighted down.

**The flywheel:**
```
DISCOVER → VALIDATE → BACKFILL → DISCOVER
   (new)    (verify)    (gaps)     (more)
```

---

## Sandbox & Execution Model

Lessons applied from the three production systems:

### Containerized Execution (Spotify Pattern)
- Agents run in **isolated containers** — each gets its own filesystem, limited permissions, no network access to production
- Verifiers activate automatically based on project detection (Maven, npm, Gradle, etc.)
- Agent doesn't know verifier internals — abstracted behind MCP tool interface
- Future: multi-architecture support (Linux x86, macOS for iOS, ARM64)

### Warm Pools (Ramp + Stripe Pattern)
- Pre-built images refreshed every 30 minutes with latest repo state
- Snapshot/restore for fast session resumption
- Agent starts reading files immediately (block writes until sync completes)
- Warm sandbox ready before user finishes typing prompt

### Governance
- **Cost caps**: $2/run default, tracked per-agent
- **Timeouts**: 5-minute hard kill
- **Blast radius**: Each agent scoped to relevant files only
- **Audit**: Every LLM call, GitHub API call, and file change logged
- **No force pushes, no direct main commits** — everything through PRs

---

## Context Engineering

From Spotify's Part 2 — context engineering is the single biggest lever for agent quality:

### Prompt Design (What Works)
- **Describe the end state**, not step-by-step instructions (Claude Code prefers outcome-oriented prompts)
- **State preconditions** — tell the agent when NOT to act (prevents impossible tasks across heterogeneous repos)
- **Use examples** — concrete code snippets heavily influence output quality
- **One change at a time** — combining changes exhausts context window and produces partial results
- **Define success as tests** — "make this code better" fails; "these tests should pass" succeeds

### Tool Strategy (Less Is More)
- Spotify limits agents to: verify MCP (formatters/linters/tests), Git tool (restricted), Bash (strict allowlist)
- No code search or docs tools — context goes in the prompt upfront
- Stripe takes the opposite approach: 400+ MCP tools via Toolshed, pre-hydrated before agent starts
- **Our approach:** Start constrained (Spotify-style), add tools only when prompts aren't enough

### Conditional Rules (Stripe Pattern)
- Global agent rules don't work in large codebases — they conflict across different domains
- Apply rules conditionally by subdirectory: `src/agents/` gets agent-specific rules, `src/core/` gets infra rules
- Use `.cursorrules` / `AGENTS.md` / `CLAUDE.md` files scoped to directories

---

## Entry Points

Inspired by Stripe's multi-entry design (Slack is most common, then CLI, web, internal tools):

| Entry Point | Status | Description |
|-------------|--------|-------------|
| **GitHub Webhooks** | ✅ Built | Primary trigger for PR review, CI debug, security, merge |
| **Cron Jobs** | ✅ Built | Knowledge graph agents (discovery, signals, drift, backfill, integration) |
| **Alert Webhooks** | ✅ Built | PagerDuty/custom alerts → incident responder |
| **Slack** | 🔮 Planned | Tag bot in thread → classify repo → kick off agent (Stripe/Ramp pattern) |
| **CLI** | 🔮 Planned | `sf run --agent=ci-debugger --pr=123` |
| **Web UI** | 🔮 Planned | Session dashboard, live agent streaming, usage metrics |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Runtime** | Node.js + TypeScript | Type safety, ecosystem |
| **Server** | Hono | Lightweight, fast, Cloudflare-ready |
| **LLM** | OpenRouter | Model-agnostic (Claude, GPT, Gemini, DeepSeek) |
| **GitHub** | Octokit + GitHub App auth | PR creation, review comments, check annotations |
| **Queue** | BullMQ + Redis | Reliable event processing with retries |
| **Audit DB** | SQLite (better-sqlite3) | Local audit logs and agent state |
| **ProductRank DB** | Supabase (PostgreSQL) | Knowledge graph storage (304 products, 19.4k edges) |
| **Sandbox** | Docker containers | Isolated execution per agent run |

---

## Project Structure

```
src/
  index.ts                    # Webhook server (Hono)
  router.ts                   # Event normalization + agent dispatch
  types.ts                    # Shared type definitions
  agents/
    pr-reviewer.ts            # PR review agent
    ci-debugger.ts            # CI failure investigation + fix
    security.ts               # CVE/dependency patching
    incident.ts               # Production incident response
    merge.ts                  # Merge conflict resolution
    runner.ts                 # Agent execution harness
    judge.ts                  # LLM judge (Spotify-style diff validation)
    prompts/                  # Agent system prompts (markdown)
      pr-reviewer.md
      ci-debugger.md
      security.md
      incident.md
      merge.md
      judge.md
    cron/                     # ProductRank knowledge graph agents
      tool-discovery.ts       # Find new developer tools daily
      signal-harvester.ts     # Refresh GitHub stars, npm downloads
      drift-detector.ts       # Detect deprecated/archived tools
      backfill.ts             # Enrich incomplete product profiles
      integration-tester.ts   # Verify claimed integrations in Docker
  core/
    budget-guard.ts           # Per-agent LLM cost tracking + caps
    circuit-breaker.ts        # Failure rate detection + auto-disable
    context.ts                # Repo context builder (file tree, recent changes)
    db.ts                     # SQLite audit log
    executor-gate.ts          # Pre-execution governance checks
    flywheel.ts               # Product confidence scoring
    github.ts                 # GitHub API client (PRs, comments, checks)
    governance.ts             # Permissions, audit logging, blast radius
    llm.ts                    # OpenRouter LLM client with cost tracking
    scheduler.ts              # Cron schedule management
    supabase.ts               # ProductRank DB connection
    webhook.ts                # GitHub webhook verification
  queue/
    queue.ts                  # BullMQ job definitions
    worker.ts                 # BullMQ worker processing
docs/
  roadmap.md                  # Factory → Claws → Network evolution
  knowledge-graph.md          # Five-dimension graph expansion strategy
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

For webhook development:
```bash
npm run tunnel  # Exposes localhost:3847 via localtunnel
```

---

## Design Principles

1. **PRs are the review gate** — Every agent action produces a PR or comment. Nothing merges without human approval. (Universal across Spotify/Ramp/Stripe.)

2. **Constraints over instructions** — Tell agents what NOT to do. "No TODOs, no partial implementations, no refactoring outside scope" works better than step-by-step guides.

3. **Bounded blast radius** — Each agent operates on scoped files. A security agent can't refactor your auth system. Cost caps prevent runaway LLM spend.

4. **Shift feedback left** — Catch errors locally before expensive CI runs. Local lint in <5 seconds, then CI only if local passes. Max 2 CI retry rounds. (Stripe pattern.)

5. **Verification loops, not hope** — Agents must call verifiers before opening PRs. Verifiers are black boxes to the agent — abstracted behind MCP. LLM judge catches scope creep. (Spotify pattern.)

6. **Cattle, not pets** — Every sandbox is identical and disposable. Pre-warmed from a pool, torn down after use. No persistent agent state. (Stripe devbox philosophy.)

---

## Roadmap

### Now: Software Factory
Autonomous PR review, CI debugging, security patching, incident response. Cron agents expand the ProductRank knowledge graph daily.

**Key metric:** Agent-written PRs as % of total PRs

### Next: Visa Claws
Reuse factory infrastructure as backend for Visa's agentic commerce platform. Same agent patterns that review PRs can review transactions, flag fraud, automate compliance.

**Key metric:** Infrastructure reuse ratio

### Then: Visa Network
Expand from single-org to multi-org. Knowledge graph becomes shared data layer across the Visa partner network.

**Key metric:** Graph coverage (% of developer tools with trusted profiles)

| Component | Factory | Claws | Network |
|-----------|---------|-------|---------|
| Event Router | GitHub webhooks | Transaction events | Multi-org events |
| Agent Runner | PR review, CI debug | Fraud detection, compliance | Cross-org analysis |
| Governance | File/cost limits | Transaction limits | Org-level permissions |
| Queue | Webhook processing | Transaction processing | Federated queues |
| Audit Log | Agent actions | Compliance trail | Cross-org audit |
| Knowledge Graph | Tool rankings | Merchant intelligence | Network intelligence |

---

## References

- [Spotify Honk Part 1](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) — 1,500+ PRs, Fleet Management → AI agents, containerized K8s execution
- [Spotify Honk Part 2](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2) — Context engineering, Claude Code as top agent, static prompts > dynamic tools
- [Spotify Honk Part 3](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3) — Verification loops, LLM judge (~25% veto rate), sandboxed containers
- [Ramp Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) — 30% of PRs, Modal sandboxes, warm pools, multiplayer sessions, OpenCode agent
- [Stripe Minions Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) — 1,300 PRs/week, Goose fork, Slack-first entry, 400+ MCP tools
- [Stripe Minions Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2) — Devboxes (AWS EC2), 10s warm spin-up, conditional rules, max 2 CI retries
- [background-agents.com](https://background-agents.com) — Industry overview of background agent platforms

---

## License

Private — not yet open source.
