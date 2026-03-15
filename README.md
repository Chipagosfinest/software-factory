# Software Factory

Research and implementation of agent-native software development patterns — autonomous PR review, CI debugging, security patching, incident response, and background maintenance. Aggregated from OpenAI, Spotify, Ramp, Stripe, and LangChain's production systems.

Background agents work continuously — developers stay **on the loop** instead of in the loop.

---

## Why Build This?

Four companies and one open-source framework have proven these patterns:

| Source | System | Result | Key Insight |
|--------|--------|--------|-------------|
| **OpenAI** | [Harness Engineering](https://openai.com/index/harness-engineering/) | ~1M lines, 1,500 PRs, 0 hand-written code, 3→7 engineers | AGENTS.md as table of contents, layered architecture enforced by linters, background "garbage collection" agents, 6-hour autonomous runs, 3.5 PRs/engineer/day. |
| **Spotify** | [Honk](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) | 1,500+ merged PRs, 50% of all PRs automated | Containerized K8s execution + verification loops + LLM judge. Claude Code is top-performing agent. |
| **Ramp** | [Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) | 30% of all PRs in months | Modal sandboxes with warm pools, multiplayer sessions, filesystem snapshots. Sessions are fast to start and effectively free to run. |
| **Stripe** | [Minions](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) | 1,300 PRs/week, zero human-written code | Goose fork + isolated devboxes (10s spin-up) + 400 MCP tools via "Toolshed". Max 2 CI retries — diminishing returns after that. |
| **LangChain** | [Deep Agents](https://github.com/langchain-ai/deepagents) | 10.9k stars, Claude Code-inspired | Middleware pipelines + sub-agent delegation + context summarization. Composition patterns, not deployment — **no governance layer** (that's our differentiator). |

**Three complementary pattern sets emerge:**
- **Environment Design** (OpenAI) — the engineer's job is not to write code, but to design environments, specify intent, and build feedback loops. AGENTS.md is a map, not a manual. Architecture enforced mechanically. Background agents handle entropy.
- **Deployment & Scale** (Spotify/Ramp/Stripe) — isolated sandboxes, PRs as review gates, warm pools, humans review before merge
- **Composition & Structure** (Deep Agents) — middleware pipelines for reusable agent behavior, sub-agents for context isolation, auto-summarization for long sessions

Software Factory combines all three: OpenAI-style environment design, Deep Agents-style composition, and production-grade governance.

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

## Harness Engineering (OpenAI) — Environment-First Agent Development

**Source:** [OpenAI Harness Engineering](https://openai.com/index/harness-engineering/) — Feb 2026, by Ryan Lopopolo

OpenAI built and shipped an internal beta product with **zero lines of manually-written code** — ~1M lines of code, 1,500 PRs, 3→7 engineers over 5 months, 3.5 PRs/engineer/day. The throughput *increased* as the team grew, validating that the harness was the bottleneck, not model capability.

**The core thesis:** The software engineer's primary job is no longer to write code, but to **design environments, specify intent, and build feedback loops** that allow agents to do reliable work.

### Key Architectural Patterns

#### 1. AGENTS.md as Table of Contents, Not Encyclopedia

The "one big AGENTS.md" approach failed for four reasons:
1. **Context is scarce** — a giant instruction file crowds out the task, code, and relevant docs
2. **Too much guidance = non-guidance** — when everything is "important," nothing is
3. **It rots instantly** — becomes a graveyard of stale rules agents can't verify
4. **Hard to verify** — a single blob doesn't lend itself to mechanical checks

Instead, AGENTS.md (~100 lines) is a **map with pointers** to a structured `docs/` knowledge base:

```
AGENTS.md              # ~100 lines, table of contents only
ARCHITECTURE.md        # Top-level map of domains and package layering
docs/
├── design-docs/       # Catalogued, indexed, with verification status
│   ├── index.md
│   └── core-beliefs.md
├── exec-plans/        # Execution plans as first-class artifacts
│   ├── active/
│   ├── completed/
│   └── tech-debt-tracker.md
├── generated/         # Auto-generated docs (e.g., DB schema)
├── product-specs/     # Product requirements
├── references/        # External llms.txt files for libraries
├── DESIGN.md
├── FRONTEND.md
├── QUALITY_SCORE.md   # Grades each domain, tracks gaps over time
├── RELIABILITY.md
└── SECURITY.md
```

**Progressive disclosure:** Agents start with a small, stable entry point and are taught where to look next, rather than being overwhelmed up front.

**Relevance to Software Factory:** Our agent prompts in `src/agents/prompts/` should adopt this pattern. Each prompt should be a short map that points to domain-specific docs, not a monolithic instruction set.

#### 2. Layered Domain Architecture (Mechanically Enforced)

Code can only depend "forward" through fixed layers:

```
Types → Config → Repo → Service → Runtime → UI
```

Cross-cutting concerns (auth, connectors, telemetry, feature flags) enter through a single explicit interface: **Providers**. Anything else is disallowed and enforced via custom linters (themselves generated by agents).

**Key insight:** "This is the kind of architecture you usually postpone until you have hundreds of engineers. With coding agents, it's an early prerequisite: the constraints are what allows speed without decay."

**Relevance to Software Factory:** We should enforce our own layer constraints (`core/` → `agents/` → `queue/` → `router`) with linter rules, not just convention.

#### 3. Golden Principles + Background Garbage Collection

"Golden principles" are opinionated, mechanical rules that keep the codebase legible:
1. Prefer shared utility packages over hand-rolled helpers (centralize invariants)
2. Don't probe data "YOLO-style" — validate boundaries or use typed SDKs
3. Structured logging enforced statically
4. Naming conventions for schemas and types
5. File size limits

On a regular cadence, **background Codex tasks**:
- Scan for deviations from golden principles
- Update quality grades per domain
- Open targeted refactoring PRs (most reviewable in under a minute, automerged)
- Scan for stale documentation and open cleanup PRs ("doc-gardening agent")

**"Technical debt is like a high-interest loan: it's almost always better to pay it down continuously in small increments than to let it compound."**

**Relevance to Software Factory:** Our cron agents already do this for the knowledge graph. The same pattern should apply to the factory's own codebase — background agents that enforce golden principles and open cleanup PRs.

#### 4. Application Legibility for Agents

OpenAI made their app bootable per git worktree, so agents could launch and drive one instance per change. They wired in:
- **Chrome DevTools Protocol** — DOM snapshots, screenshots, navigation
- **Full observability stack per worktree** — LogQL, PromQL, TraceQL queries
- Each worktree gets an isolated version of the app including its own logs and metrics
- **6-hour single Codex runs** — agents work overnight while humans sleep

**Relevance to Software Factory:** Our sandbox model should include observability. Agents debugging CI failures should be able to query logs and metrics, not just read raw output.

#### 5. Custom Linter Errors as Agent Teaching Tools

Rather than just flagging violations, linter error messages include **remediation instructions**. This allows agents to self-correct while learning architectural constraints during execution.

**Relevance to Software Factory:** Our pre-commit guard (`scripts/pre-commit-guard.sh`) already does this for shell command safety and empty catch blocks. Extend to all golden principles.

#### 6. Execution Plans as First-Class Artifacts

Complex work is captured in **execution plans** with progress and decision logs that are checked into the repository. Active plans, completed plans, and known tech debt are all versioned and co-located, allowing agents to operate without relying on external context.

**Relevance to Software Factory:** Our orchestrator tasks in Linear could benefit from companion execution plans in the repo that track progress and decisions.

#### 7. End-to-End Agent Autonomy Loop

Given a single prompt, the agent can:
1. Validate current state of codebase
2. Reproduce a reported bug
3. Record a video demonstrating the failure
4. Implement a fix
5. Validate the fix by driving the application
6. Record a second video demonstrating the resolution
7. Open a pull request
8. Respond to agent and human feedback
9. Detect and remediate build failures
10. Escalate to a human only when judgment is required
11. Merge the change

**Relevance to Software Factory:** Our CI Debugger already does steps 1-8. Video recording (step 3, 6) and self-merge (step 11) are natural extensions.

### Key Metrics & Learnings

| Metric | Value |
|--------|-------|
| Team size | 3 → 7 engineers |
| Codebase | ~1M lines of code |
| PRs merged | ~1,500 |
| Throughput | 3.5 PRs/engineer/day (increasing with team size) |
| Human code | 0 lines (intentional constraint) |
| Time estimate | ~1/10th of hand-written equivalent |
| Max single run | 6+ hours (overnight) |
| Weekly cleanup | 20% of engineer time → automated to near-zero |

### Harness Engineering vs. Software Factory

| Dimension | OpenAI Harness | Software Factory | Gap/Opportunity |
|-----------|---------------|------------------|-----------------|
| Knowledge base | Structured docs/, ~100-line AGENTS.md as map | Flat prompts/ directory | Adopt docs/ structure with progressive disclosure |
| Architecture enforcement | Custom linters + structural tests | Pre-commit guard (partial) | Expand to full layer enforcement |
| Background cleanup agents | Garbage collection + doc-gardening | Knowledge graph cron agents only | Add codebase self-maintenance agents |
| Observability for agents | Full LogQL/PromQL/TraceQL per worktree | Log file reading only | Add queryable observability stack |
| Agent-to-agent review | Agents review other agents' PRs | Human review only | Add LLM judge (already planned, Spotify-style) |
| Application driving | Chrome DevTools Protocol, bootable per worktree | Sandbox execution only | Add browser automation for UI products |
| Execution plans | Versioned in repo, with progress logs | Linear issues only | Dual-write: Linear + repo-local plan |
| Merge philosophy | Minimal blocking gates, corrections cheap | Everything requires human review | Consider auto-merge for low-risk agent PRs |

---

## Entry Points

Inspired by Stripe's multi-entry design (Slack is most common, then CLI, web, internal tools):

| Entry Point | Status | Description |
|-------------|--------|-------------|
| **GitHub Webhooks** | ✅ Built | Primary trigger for PR review, CI debug, security, merge |
| **Cron Jobs** | ✅ Built | Scheduled background agents (cleanup, drift detection, data freshness) |
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
    cron/                     # Scheduled background agents (per-project)
  core/
    budget-guard.ts           # Per-agent LLM cost tracking + caps
    circuit-breaker.ts        # Failure rate detection + auto-disable
    context.ts                # Repo context builder (file tree, recent changes)
    db.ts                     # SQLite audit log
    executor-gate.ts          # Pre-execution governance checks
    github.ts                 # GitHub API client (PRs, comments, checks)
    governance.ts             # Permissions, audit logging, blast radius
    llm.ts                    # OpenRouter LLM client with cost tracking
    scheduler.ts              # Cron schedule management
    webhook.ts                # GitHub webhook verification
  queue/
    queue.ts                  # BullMQ job definitions
    worker.ts                 # BullMQ worker processing
docs/
  roadmap.md                  # Factory evolution roadmap
  orchestrator.md             # Symphony-style orchestrator design
  risk-forecast.md            # Risk assessment and mitigation
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

7. **Compose via middleware, govern at the boundary** — Agent capabilities are composed through middleware pipelines (planning, filesystem, sub-agents, summarization). Governance is enforced at the tool/sandbox level, not via LLM self-policing. Deep Agents explicitly takes this approach: "the agent can do anything its tools allow." We add the governance layer that the framework leaves to integrators — circuit breakers, cost caps, blast radius controls, audit trails.

### Governance: What We Add That Frameworks Don't

Deep Agents provides composition (middleware, sub-agents, skills) but explicitly **does not provide governance**. Their security model delegates all safety to the tool/sandbox level. Software Factory fills this gap:

| Safety Layer | Software Factory | Deep Agents | Why It Matters |
|---|---|---|---|
| Circuit breaker | `core/circuit-breaker.ts` — auto-disables on failure rate | None | Prevents cascading failures across agents |
| Budget guard | `core/budget-guard.ts` — $5/day hard cap | None | Stops runaway LLM spend |
| Per-run cost cap | `governance.ts` — $2/run | None | Bounds individual agent sessions |
| Blast radius | `governance.ts` — file scoping per agent | None | Security agent can't rewrite auth system |
| Audit trail | `core/db.ts` — every LLM call, API call, file change | None | Compliance, debugging, cost attribution |
| Max retries | 2 retries (Stripe pattern) | `recursion_limit: 1000` (too high for production) | Prevents infinite loops on non-converging errors |
| Convergence detection | Same error = immediate fail | None | Stops retrying identical failures |
| Kill switch | `executor_gate.json` — blocks all execution | None | Emergency stop without redeployment |
| Execution timeout | 5-min hard kill | Optional `timeout` param (no default) | Prevents hung agents from consuming resources |
| Human-in-the-loop | Planned (approval gates) | `interrupt_on` per-tool | DA has this one — we should adopt their pattern |

**The takeaway:** Use Deep Agents' composition patterns (middleware, sub-agents, context summarization) for building agents. Use Software Factory's governance patterns (circuit breakers, cost caps, audit trails) for running them safely in production. The two are complementary.

---

## Roadmap

At its core, this is **container management running different automation tasks per system**. Each new system we onboard is the same problem — isolated containers, cron schedules, verification loops, governance — just with different agents and different data. Every system we add compounds the value of the shared infrastructure.

### Phase 1: Core Factory
Stand up the factory with the 5 core agents (PR review, CI debug, security, incident, merge). Establish governance layer, sandbox infrastructure, and event routing.

**Key metric:** Agent-written PRs as % of total PRs

### Phase 2: Harness Engineering + Middleware Refactor
Apply OpenAI's harness engineering patterns alongside Deep Agents' composition model:
- Restructure knowledge base: AGENTS.md as map → structured `docs/` directory as system of record
- Enforce layer constraints mechanically (custom linters, not convention)
- Add background "garbage collection" agents that scan for deviations and open cleanup PRs
- Refactor from monolithic agent configs to composable middleware pipelines
- Add sub-agent delegation for context isolation and parallel execution
- Add observability stack per sandbox (queryable logs/metrics, not raw output)

**Key metric:** Time to add a new agent type (target: base middleware + prompt + domain tools)

### Phase 3: General-Purpose Factory
Extract patterns into a reusable platform. Same container orchestration, same governance, same verification loops — different repos, different agents. Any project can plug in PR review, CI debugging, and security patching with minimal config.

**Key metric:** Time to onboard a new repo (target: <1 hour)

### The Compounding Effect

Each phase adds ~2-5 new agent types but reuses 100% of:
- Container management (sandbox creation, warm pools, teardown)
- Queue infrastructure (BullMQ dispatch, retry logic, dead letter)
- Governance (permissions, cost caps, audit trails, blast radius)
- Verification loops (verifiers, LLM judge, bounded retries)
- Entry points (webhooks, cron, Slack, CLI)

---

## Deep Agents (LangChain) — Middleware-Driven Agent Composition

**Source:** [langchain-ai/deepagents](https://github.com/langchain-ai/deepagents) — 10.9k stars, MIT, 939 commits, Claude Code-inspired

While Spotify/Ramp/Stripe show how to **deploy** agents at scale, Deep Agents shows how to **compose** them. Built on LangGraph, it's an open-source implementation of the patterns that make Claude Code general-purpose — planning, sub-agents, filesystem access, and detailed prompts — packaged as composable middleware.

### Key Architectural Patterns

#### 1. Middleware Pipeline (vs. Monolithic Agent Config)

Deep Agents composes agent behavior through stacked middleware, not monolithic configs:

```
TodoListMiddleware → FilesystemMiddleware → SubAgentMiddleware → SummarizationMiddleware → SkillsMiddleware → HumanInTheLoopMiddleware
```

Each middleware transforms the request/response pipeline independently. This means:
- **Base middleware** (logging, cost tracking) applies to all agents
- **Domain middleware** (GitHub tools, Telegram, media gen) is layered on per-agent
- Middleware ordering matters — later layers can override or wrap earlier ones
- New capabilities = new middleware, not rewriting agent configs

**Relevance to Software Factory:** Our agents are defined as monolithic prompt + tool configs. A middleware approach would let us share governance, cost tracking, and audit logging as base middleware, then layer agent-specific capabilities on top. Adding a new agent type would be: base middleware + domain middleware + prompt.

#### 2. Sub-Agent Delegation via `task` Tool

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

**Relevance to Software Factory:** Our CI Debugger could delegate log parsing to a cheap sub-agent, then use results for reasoning. PR Reviewer could spawn parallel sub-agents to review different file groups. The pattern keeps the parent agent's context window clean.

#### 3. Automatic Context Summarization

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

**Relevance to Software Factory:** Long CI debugging sessions or multi-file PR reviews can exhaust context. Auto-summarization would let agents work on larger PRs without degrading quality.

#### 4. Skills as Layered, Override-able Directories

Skills are loaded from **ordered source paths** — later sources override earlier ones (last wins):

```python
sources=["/skills/base/", "/skills/user/", "/skills/project/"]
```

Each skill is a directory with `SKILL.md` (YAML frontmatter + markdown instructions). Skills are injected into the system prompt with progressive disclosure — metadata (name + description) loads first, full content only when the agent decides to use it.

```
/skills/user/web-research/
├── SKILL.md          # YAML frontmatter + instructions
└── helper.py         # Supporting files
```

**Relevance to Software Factory:** Our agent prompts are currently flat files in `src/agents/prompts/`. A layered skill system would let us define base skills (code review patterns, test writing) shared across all agents, then agent-specific overrides.

#### 5. Human-in-the-Loop via `interrupt_on`

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

**Relevance to Software Factory:** Maps directly to our governance layer. Currently governance is checked pre-execution. `interrupt_on` would let agents plan their changes, pause for review, then execute — instead of our current all-or-nothing model.

#### 6. Backend Abstraction

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

**Relevance to Software Factory:** Our agents are tightly coupled to Docker + local filesystem. Backend abstraction would enable remote sandboxes (Modal, Fly.io), cloud storage, and multi-node execution without changing agent code.

### Planning via `write_todos`

Built-in task decomposition — the agent creates/updates a todo list as it works:

```python
TodoListMiddleware()  # Adds write_todos tool to every agent
```

The agent reads its own todos to track multi-step progress. Not just for display — the todo state persists across tool calls and is used for planning complex operations.

**Relevance to Software Factory:** Our agents are currently single-shot (receive event → reason → act). Adding self-planning would help with complex CI failures that require multiple investigation steps.

### How Deep Agents Complements Existing Research

| Dimension | Spotify/Ramp/Stripe | Deep Agents | Combined Insight |
|-----------|---------------------|-------------|------------------|
| **Execution** | K8s pods, Modal, EC2 devboxes | Backend abstraction (protocol-based) | Use their infra patterns with DA's abstraction layer |
| **Agent composition** | Monolithic agents per task | Middleware pipeline + sub-agents | Layer shared behaviors, delegate subtasks |
| **Context management** | Static prompts, pre-hydration | Auto-summarization + compaction | Pre-hydrate (Stripe) then manage window (DA) |
| **Verification** | External verifiers, LLM judge | Internal todo tracking + planning | Judge + plan = fewer wasted verification rounds |
| **Governance** | Cost caps, file scoping, audit | `interrupt_on` per-tool | Pre-checks (ours) + runtime interrupts (DA) |
| **Reusability** | Per-repo config | Skills directories with layering | Skills = reusable prompt fragments across agents |

### Key Design Principle: "Trust But Verify at the Tool Level"

Deep Agents explicitly adopts a security model where "the agent can do anything its tools allow." Rather than hoping LLMs will self-police, boundaries are enforced at the **tool and sandbox implementation level**. This aligns with our executor-gate pattern — governance is a hard gate, not a suggestion.

### Implementation Ideas for Software Factory

1. **Middleware refactor** — Extract governance, cost tracking, and audit logging into shared middleware. New agents = base middleware + domain tools + prompt.
2. **Sub-agent delegation** — Let CI Debugger spawn cheap sub-agents for log parsing. Let PR Reviewer parallelize file group reviews.
3. **Context summarization** — Add summarization for long-running agent sessions (multi-file PRs, complex incidents).
4. **Layered skills** — Move from flat `prompts/*.md` to `skills/base/` + `skills/{agent}/` with override semantics.
5. **Backend protocol** — Abstract sandbox interface so agents work against local Docker, Modal, or Fly.io without code changes.

---

## Autoresearch (Karpathy) — Autonomous Agent Experimentation Loop

**Source:** [karpathy/autoresearch](https://github.com/karpathy/autoresearch) — MIT, March 2026

Karpathy's framework for autonomous overnight research. While built for ML training, the agent loop patterns are universally applicable to any iterative autonomous work.

### Core Architecture: Three-File System

```
prepare.py   — fixed constants, data prep, evaluation (IMMUTABLE)
train.py     — the single file the agent modifies (AGENT-EDITED)
program.md   — agent instructions and constraints (HUMAN-EDITED)
```

**Key insight:** Humans program `program.md` markdown files, not Python. The agent programs the code. This is the same "harness engineering" pattern OpenAI describes — humans design the environment, agents execute.

### Patterns Relevant to Software Factory

#### 1. The NEVER STOP Loop

```
LOOP FOREVER:
  1. Read current state (git branch/commit)
  2. Modify code with experimental idea
  3. Git commit
  4. Run experiment (redirect output to log, don't flood context)
  5. Read results (grep key metrics from log)
  6. If improved → keep commit, advance branch
  7. If equal/worse → git reset to previous state
  8. If crashed → distinguish fixable bug vs fundamentally broken, decide accordingly
```

**"Do NOT pause to ask the human if you should continue. The human might be asleep."** The loop runs until manually interrupted. ~12 experiments/hour, ~100 overnight.

**Relevance:** Our background agents should adopt this philosophy. Cron-triggered agents shouldn't need human confirmation to continue iterating on a problem.

#### 2. Single Metric Acceptance (Binary Keep/Discard)

One metric (`val_bpb`), one decision: did it improve or not? This eliminates ambiguity — no multi-criteria evaluation, no subjective assessment. The agent never debates whether a change is "good enough."

**Relevance:** Each Software Factory agent should have a single clear success metric:
- CI Debugger: did the build pass?
- PR Reviewer: does the review catch the known issue category?
- Security Patcher: did the vulnerability scan pass?

#### 3. Fixed Time Budget per Experiment

Every experiment runs for exactly 5 minutes, regardless of what the agent changed. This makes experiments directly comparable and prevents runaway resource consumption.

**Relevance:** Our 5-minute agent timeout is the same pattern. Fixed budgets make cost predictable and experiments comparable.

#### 4. Simplicity Criterion

"A 0.001 improvement that adds 20 lines of hacky code? Probably not worth it. A 0.001 improvement from deleting code? Definitely keep."

**Relevance:** Agent-generated PRs should be evaluated on complexity cost vs. improvement magnitude, not just "does it pass tests."

#### 5. Structured Experiment Logging (results.tsv)

Every experiment is logged with: commit hash, metric, memory usage, status (keep/discard/crash), and description. This creates a reviewable audit trail of all attempts.

```
commit   val_bpb   memory_gb  status   description
a1b2c3d  0.997900  44.0       keep     baseline
b2c3d4e  0.993200  44.2       keep     increase LR to 0.04
c3d4e5f  1.005000  44.0       discard  switch to GeLU activation
d4e5f6g  0.000000  0.0        crash    double model width (OOM)
```

**Relevance:** Our audit log in `core/db.ts` serves the same purpose. The structured format enables post-hoc analysis of what agent strategies work.

#### 6. Crash Recovery Logic

Distinguish between:
- **Fixable bugs** (typo, missing import) → fix and re-run
- **Fundamentally broken ideas** → log "crash," discard, move on
- **Stuck** → "think harder, read papers, try combining previous near-misses, try radical changes"

**Relevance:** Our convergence detection pattern. If the same error repeats, mark failed immediately. If a different error appears, the agent is making progress (even if failing).

---

## QMD (Tobi Lutke) — Local-First Knowledge Search for Agents

**Source:** [tobi/qmd](https://github.com/tobi/qmd) — by Shopify CEO

A local-first search engine for personal knowledge management. Indexes markdown, meeting transcripts, and documentation with hybrid search (BM25 + vector + LLM reranking). All processing runs locally via node-llama-cpp with GGUF models.

### Patterns Relevant to Software Factory

#### 1. Hybrid Search (Three-Layer)

```
BM25 (keyword) + Vector (semantic) + LLM Reranking (quality)
```

Not just keyword matching, not just embeddings — both, then LLM-reranked. This is the pattern for making agent context retrieval actually work.

**Relevance:** When agents need to search codebases, docs, or previous experiment results, hybrid search dramatically improves recall over any single approach.

#### 2. MCP Server for Agent Access

QMD exposes search as MCP tools (`query`, `get`, `multi_get`, `status`), allowing AI agents to search indexed documents directly.

**Relevance:** Software Factory agents could use QMD-style search to query the structured `docs/` knowledge base (OpenAI harness pattern) rather than relying on grep/glob alone.

#### 3. Collections + Context Metadata

Documents are organized into named collections with glob patterns. Hierarchical context descriptors improve search relevance — the search engine knows *what kind* of document it's searching, not just the content.

```bash
qmd collection add ~/notes --name notes
qmd context add qmd://notes "Personal notes and ideas"
```

**Relevance:** Agent prompts, design docs, and execution plans could be organized as QMD collections with domain-specific context, enabling semantic search across the factory's knowledge base.

#### 4. Query Expansion

Simple queries auto-expand via LLM into structured sub-queries with types: `lex` (keyword), `vec` (semantic), `hyde` (hypothetical document). Users can also manually specify query types for fine-grained control.

**Relevance:** When agents search for context before acting, query expansion finds related information that exact-match search misses.

---

## References

### Environment Design & Harness Engineering (OpenAI)
- [Harness Engineering](https://openai.com/index/harness-engineering/) — ~1M lines, 0 hand-written code, 3.5 PRs/eng/day. AGENTS.md as map, layered architecture, golden principles, background GC agents, 6-hour autonomous runs
- [Unlocking the Codex Harness](https://openai.com/index/unlocking-the-codex-harness/) — App Server architecture powering Codex's sandboxed execution
- [Unrolling the Codex Agent Loop](https://openai.com/index/unrolling-the-codex-agent-loop/) — Internal agent loop design and execution model

### Production Systems (Deployment & Scale)
- [Spotify Honk Part 1](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) — 1,500+ PRs, Fleet Management → AI agents, containerized K8s execution
- [Spotify Honk Part 2](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2) — Context engineering, Claude Code as top agent, static prompts > dynamic tools
- [Spotify Honk Part 3](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3) — Verification loops, LLM judge (~25% veto rate), sandboxed containers
- [Ramp Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) — 30% of PRs, Modal sandboxes, warm pools, multiplayer sessions, OpenCode agent
- [Stripe Minions Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) — 1,300 PRs/week, Goose fork, Slack-first entry, 400+ MCP tools
- [Stripe Minions Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2) — Devboxes (AWS EC2), 10s warm spin-up, conditional rules, max 2 CI retries

### Frameworks & Architecture (Composition & Design)
- [LangChain Deep Agents](https://github.com/langchain-ai/deepagents) — Middleware-driven agent composition, sub-agent delegation, context summarization, skills system. Claude Code-inspired, LangGraph-native. 10.9k stars, MIT.
- [Deep Agents Docs](https://docs.langchain.com/oss/python/deepagents/overview) — Full documentation and quickstart

### Autonomous Agent Loops & Knowledge
- [Karpathy Autoresearch](https://github.com/karpathy/autoresearch) — NEVER STOP loop, single-metric acceptance, fixed time budget, crash recovery, simplicity criterion. Overnight autonomous experimentation.
- [Tobi Lutke QMD](https://github.com/tobi/qmd) — Local-first hybrid search (BM25 + vector + LLM reranking), MCP server for agent access, collections with context metadata, query expansion. By Shopify CEO.

### Community Analysis
- [The Emerging Harness Engineering Playbook](https://www.ignorance.ai/p/the-emerging-harness-engineering) — Third-party analysis of OpenAI's approach
- [Harness Engineering for Coding Agents](https://alexlavaee.me/blog/harness-engineering-why-coding-agents-need-infrastructure/) — Infrastructure perspective on agent harness patterns
- [HumanLayer: Skill Issue](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents) — Human-in-the-loop perspective on harness engineering
- [background-agents.com](https://background-agents.com) — Industry overview of background agent platforms

---

## License

Private — not yet open source.
