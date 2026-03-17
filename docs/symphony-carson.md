# Symphony + Carson's Code Factory Pattern

*Last updated: March 17, 2026*

Ryan Carson's live demonstration of a working code factory: 6 bugs filed from a phone in a doctor's waiting room, first merged before leaving, 3-6 resolving in parallel.

---

## The Demo (March 17, 2026)

> "This is how a code factory should work.
> I was waiting at the doc's office and filed 6 bugs — all from my phone.
> 1 is already merged, 2nd is merging, 3-6 are getting done in parallel.
> Using Symphony + Codex (Elixir, Codex App Server, Linear, GitHub)"
>
> — [@ryancarson](https://x.com/ryancarson/status/2033958219891028302), 18K views, 319 bookmarks

**This is not a tutorial. This is the psychological proof point.** The bottleneck in software development is no longer writing code — it's identifying what needs to be done. The developer's value has shifted entirely to judgment and issue quality.

**Setup**: 2-3 days to configure. Then it just cranks.

---

## The Stack

```
┌──────────────────────────────────────────────────────────────────┐
│                    CARSON'S CODE FACTORY                          │
│                                                                  │
│  Developer (phone) ──▶ Linear Issue ──▶ Symphony Orchestrator    │
│                              │                                   │
│                         polls issues                             │
│                              │                                   │
│                    ┌─────────┼─────────┐                        │
│                    ▼         ▼         ▼                        │
│               Agent 1    Agent 2    Agent 3  (up to 10 parallel) │
│             (Codex)     (Codex)    (Codex)                       │
│               isolated  isolated  isolated                        │
│               git clone git clone git clone                      │
│                    │         │         │                         │
│                    ▼         ▼         ▼                        │
│               CI tests  CI tests  CI tests                       │
│                    │         │         │                         │
│                    ▼         ▼         ▼                        │
│                PR + proof of work on GitHub                      │
│                         │                                        │
│                    Human reviews                                 │
│                         │                                        │
│                      Merged ✓                                    │
└──────────────────────────────────────────────────────────────────┘
```

| Component | Role |
|-----------|------|
| **Linear** | Human interface — file a bug → Symphony picks it up |
| **Symphony** | Elixir/OTP orchestrator — polls Linear, claims issues, spawns agents |
| **Codex App Server** | AI coder — one isolated instance per task |
| **GitHub** | PR creation + merging (automated on success) |

---

## Symphony Deep-Dive

**Repo**: github.com/openai/symphony
**License**: Apache 2.0
**Language**: Elixir/OTP on the BEAM VM
**Released**: Early March 2026 by OpenAI (@alex_frantic)

### Why Elixir?

The BEAM VM was chosen for **concurrent, fault-tolerant agent orchestration**. Running 10 agents in parallel, each with their own git workspace and process lifecycle, is exactly what Elixir/OTP was built for. Supervisors restart failed agents automatically. No shared state between agent processes.

### Configuration: WORKFLOW.md

A single file in your repo controls everything — YAML front matter + Liquid-templated prompt:

```yaml
---
name: "Bug Fix Workflow"
issue_tracker: linear
concurrency: 10
approval_policy: on-failure
sandbox_access: workspace-write
---

You are fixing bug: {{ issue.title }}

Steps:
1. Read the reproduction steps in the issue
2. Locate the relevant code
3. Write a minimal fix with a test
4. Open a PR
```

Version-controlled, diff-able, auditable.

### 8-Component Architecture

```
1. Workflow Loader       WORKFLOW.md → typed config
2. Config Layer          Env var resolution, typed getters
3. Issue Tracker Client  Linear via GraphQL (GitHub Issues + Jira coming)
4. Orchestrator          Polling loop, state machine, concurrency (default 10)
5. Workspace Manager     Isolated git clone per task, lifecycle hooks
6. Agent Runner          Launches Codex via App-Server Protocol (line-delimited JSON)
7. Status Surface        Phoenix LiveView dashboard + HTTP API
8. Logging               Structured logs with run ID, component, severity
```

### Task State Machine

```
Unclaimed ──▶ Claimed ──▶ Running ──▶ Succeeded
                                   ├─▶ Failed
                                   ├─▶ TimedOut
                                   └─▶ Stalled
                                         │
                                    RetryQueued
                                    (exponential backoff:
                                     delay = min(10000 × 2^(attempt-1), max_ms))
                                         │
                                    Released
```

### Safety Configuration

| Policy | Behavior |
|--------|----------|
| `untrusted` | All actions require approval |
| `on-failure` | Approve only when agent reports failure |
| `on-request` | Approve when agent explicitly asks |
| `never` | Fully autonomous |

| Sandbox Level | Access |
|---------------|--------|
| `read-only` | Can read but not write |
| `workspace-write` | Can modify isolated git clone |
| `danger-full-access` | Full system access (use with caution) |

### Workspace Lifecycle Hooks

```yaml
after_create:  "npm install"           # after git clone
before_run:    "git pull origin main"  # before agent starts
after_run:     "npm test"              # after agent finishes
before_remove: "git stash"            # before workspace cleanup
```

### Best Suited For

- Bug fixes with reproduction steps
- Feature additions with detailed specs
- Test generation
- Documentation updates
- Dependency maintenance

### Limitations

- Linear-only issue tracker (GitHub Issues + Jira in development)
- Codex-only AI backend
- Struggles with complex architectural refactors
- Early-stage, breaking changes expected

---

## The "Ralph" Background

Symphony builds on the **Ralph pattern** developed by Geoffrey Huntley and popularized by Carson in late 2025:

```
┌──────────────────────────────────────────────────────────────────┐
│                    RALPH LOOP ARCHITECTURE                        │
│                                                                  │
│  prd.json ──────────▶ Planner Agent ──▶ Task selection          │
│  (user stories,              │                                   │
│  acceptance criteria,   Coordinator                              │
│  priority, status)           │                                   │
│                         Executor Agent ──▶ Code changes          │
│  progress.txt ◀──────        │                                   │
│  (learnings,            Reviewer Agent ──▶ PR + verification     │
│  accumulated across          │                                   │
│  iterations)            Commits + updates progress.txt           │
│                                                                  │
│  Fresh AI context per iteration. File-based state = no           │
│  token limits. 14-hour unattended sessions validated.            │
└──────────────────────────────────────────────────────────────────┘
```

**Cost data point:** Real-world examples show developers completing $50,000 contracts with only **$297 in API costs**. Viral thread reached **865,000+ views** by January 2026.

---

## Carson's Article Corpus

Building the context for the March 17 demo:

| Date | Article | Core Pattern |
|------|---------|--------------|
| Jan 6, 2026 | Step-by-step guide to get Ralph working | Setup, autonomous loops, task structures |
| Jan 28, 2026 | How to make your agent learn and ship while you sleep | Nightly loop, agents update own instructions |
| Feb 2, 2026 | How to setup daily testing + auto-file bugs | Daily E2E agent, auto-files actionable issues |
| Feb 9, 2026 | Team of agents in OpenClaw in one command | Multi-agent provisioning with verification |
| Feb 16, 2026 | Code Factory: auto write and review 100% of code | Risk-aware CI gates, automated review loops |
| Mar 11, 2026 | 5 agents concurrently cranking | [First Symphony tweet](https://x.com/ryancarson/status/2031755002205655511) |
| Mar 17, 2026 | Filed 6 bugs from my phone | **Proof-of-concept in the wild** |

---

## The Psychological Shift

Carson is not just showing a workflow. He's demonstrating a **role inversion**:

```
Before code factories:
  Developer time = 80% writing code + 20% thinking about what to build

After code factories:
  Developer time = 80% identifying problems + 20% reviewing agent PRs

The bottleneck moved from IMPLEMENTATION to JUDGMENT.
```

For a solo founder, this means being competitive with small engineering teams. For an enterprise, it means the highest-leverage skill is writing clear, detailed bug reports — not writing code.

---

## Software Factory Alignment

Symphony's architecture validates Software Factory's design:

| Symphony Pattern | Software Factory Equivalent |
|-----------------|---------------------------|
| `WORKFLOW.md` per repo | `CLAUDE.md` per agent type |
| Linear issue → agent trigger | Webhook event → agent dispatch |
| Isolated git clone per task | Docker sandbox per agent run |
| Codex App Server (line-delimited JSON) | OpenRouter client (`src/core/llm.ts`) |
| Exponential backoff retry | Circuit breaker (`src/core/circuit-breaker.ts`) |
| Phoenix LiveView dashboard | Planned React dashboard (Phase 3) |
| Lifecycle hooks (`after_create`, `after_run`) | Governance checks (executor gate) |
| Linear status transitions (Rework, Done) | GitHub PR states (open, merged, closed) |

**Key difference**: Symphony is general-purpose (any task with a Linear issue). Software Factory is specialized (PR review, CI debug, security patch, incident response, merge conflicts). The specialization enables deeper verification logic per agent type.

**Convergence**: Both are arriving at the same architecture — event-driven, isolated sandboxes, parallel execution, human review before merge.

---

## Sources

- [Carson tweet (March 17)](https://x.com/ryancarson/status/2033958219891028302)
- [Carson tweet (March 11) — 5 concurrent agents](https://x.com/ryancarson/status/2031755002205655511)
- [Ryan Carson articles](https://www.ryancarson.com/articles)
- [GitHub: openai/symphony](https://github.com/openai/symphony)
- [Symphony deep-dive (heyuan110)](https://www.heyuan110.com/posts/ai/2026-03-05-openai-symphony-autonomous-coding/)
- [Symphony overview (digitalapplied)](https://www.digitalapplied.com/blog/openai-symphony-autonomous-code-orchestration-framework)
- [Ralph AI coding agent (Grokipedia)](https://grokipedia.com/page/Ralph_AI_coding_agent)
- [Freeplay: Real Talk on Building Coding Agents (Carson interview)](https://freeplay.ai/blog/real-talk-on-building-coding-agents-a-conversation-with-amp-s-builder-in-residence-ryan-carson)
