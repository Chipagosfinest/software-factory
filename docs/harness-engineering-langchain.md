# Harness Engineering: LangChain Deep Agents

> Source: [Improving Deep Agents with Harness Engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/) (March 2026)
> Source: [Harrison Chase @ Sequoia — Context Engineering Long-Horizon Agents](https://sequoiacap.com/podcast/context-engineering-our-way-to-long-horizon-agents-langchains-harrison-chase/)
> Source: [Deep Agents GitHub](https://github.com/langchain-ai/deepagents)

---

## TL;DR

LangChain's coding agent (`deepagents-cli`) jumped **52.8% → 66.5%** on Terminal Bench 2.0 — a **13.7pp gain** — by modifying only the harness while keeping the model (GPT-5.2-Codex) fixed. No model changes. No fine-tuning. Pure harness engineering.

---

## Harness Engineering vs Context Engineering

Harrison Chase draws an important distinction:

```
Context Engineering    = delivering the right information to agents
Harness Engineering    = the entire execution environment around a model
                         (system prompts, tools, middleware, flow control)

Context engineering is a SUBSET of harness engineering.
```

A **framework** (LangGraph) is unopinionated abstractions. A **harness** (Deep Agents) is batteries-included scaffolding: built-in planning, context compaction, file system tools, hundreds of lines of specialized prompting.

Key insight: "The goal of a harness is to mold the inherently spiky intelligence of a model for tasks we care about."

---

## Deep Agents Architecture

Deep Agents = an agent harness built with LangChain + LangGraph, equipped with:

1. **Planning tool** (`write_todos`) — forces explicit to-do list, visible throughout execution
2. **Filesystem backend** — real file system access for context management
3. **Subagent spawning** — delegate subtasks to isolated child agents
4. **Sandbox isolation** (v0.4) — fully isolated sandbox execution environments
5. **LangGraph runtime** — durable execution, streaming, human-in-the-loop

### The `write_todos` Planning Tool

By forcing the model to call a "no-op" planning tool, Deep Agents keep an explicit to-do list visible at all times. This dramatically improves long-term coherence for complex tasks.

```
Without write_todos:  Agent drifts, forgets subtasks, loses coherence over 20+ steps
With write_todos:     Agent maintains explicit plan, tracks progress, adapts as new info emerges
```

---

## Five Harness Engineering Techniques

### 1. Self-Verification Loop

Models need explicit guidance on a four-stage workflow:

```
  Planning & Discovery
         │
         ▼
    Build (+ tests)
         │
         ▼
  Verify (against spec)
         │
    ┌────┴────┐
    │ PASS    │ FAIL
    │         │
    ▼         ▼
  Done     Fix → re-verify
```

`PreCompletionChecklistMiddleware` intercepts agent output before exit to enforce verification passes. The agent cannot terminate without proving its work.

### 2. Trace Analysis Skill

An automated agent skill that:
- Fetches experiment traces from LangSmith
- Spawns parallel error-analysis agents per failure
- Synthesizes findings and suggests harness improvements

This mirrors **boosting methodology** — systematically focusing on failure patterns to iteratively improve the harness.

### 3. Loop Detection Middleware

`LoopDetectionMiddleware` tracks per-file edit counts and injects context after N edits:

```
Edit count for parser.ts: 1  → normal
Edit count for parser.ts: 2  → normal
Edit count for parser.ts: 3  → ⚠️ inject: "You've edited this file 3 times.
                                Consider stepping back and trying a different approach."
```

Addresses "doom loops" where agents repeatedly apply variations to a broken solution.

### 4. Context Injection Middleware

`LocalContextMiddleware` runs at agent initialization to:
- Map working directory structure
- Discover available tools (Python installations, etc.)
- Pre-populate environment context

Reduces early-stage context search errors — agents struggle most with unfamiliar environments.

### 5. Reasoning Budget Optimization

The "reasoning sandwich" approach:

```
Phase          │ Reasoning Level │ Why
───────────────┼─────────────────┼──────────────────────────
Planning       │ HIGH            │ Complex problem decomposition
Implementation │ MEDIUM/LOW      │ Execution speed, cost efficiency
Verification   │ HIGH            │ Critical judgment on correctness
```

Results on Terminal Bench 2.0:
- `xhigh` reasoning only: **53.9%** (timeouts kill it)
- `high` baseline: **63.6%**
- Optimized sandwich: **66.5%**

---

## Terminal Bench 2.0 Results

```
Rank  │ Score  │ What Changed
──────┼────────┼──────────────────────────────
  ~30 │ 52.8%  │ Starting harness (no middleware)
  ~15 │ ~58%   │ + Self-verification loop
  ~10 │ ~62%   │ + Loop detection + context injection
  Top5│ 66.5%  │ + Reasoning sandwich + trace analysis
```

Benchmark: 89 tasks across machine learning, debugging, and biology domains.

Infrastructure stack: Terminal Bench 2.0 (benchmark) + Harbor (orchestration) + Daytona (sandboxes) + LangSmith (traces)

---

## Harrison Chase: Key Insights on Long-Horizon Agents

### Three Eras of Agent Development

1. **Early**: Raw text models, no tool calling
2. **Middle**: Models trained on tool calling and planning
3. **Current**: LLMs running reliably in loops with sophisticated context management

The inflection point was June-July 2024, when Claude Code, Deep Research, and similar systems demonstrated that "running the LLM in a loop" works through improved context engineering, not just better base models.

### Everything is Context Engineering

- **Planning tools** built into harnesses by default
- **Compaction strategies** for managing growing context windows
- **File system integration** for context management
- **Instruction refinement** through traces and feedback loops

### Why Coding Agents Lead

- File system provides natural context management
- Code execution gives verifiable feedback loops
- Models trained heavily on code patterns
- Scripts solve problems that virtual file systems cannot

Open question: "Is coding just the first use case, or are all general agents inherently coding agents?"

### Traces Replace Code as Source of Truth

In traditional software: inspect code → understand behavior.
In agent systems: inspect **traces** → understand behavior.

Teams now say "send us a trace" instead of "show me the code."

### Memory as Future Moat

- Persistent instruction modification based on trace analysis
- "Sleep time compute" — reviewing daily traces to update agent behavior
- Self-improvement loops with human oversight
- Works best in specific workflows (dedicated email agents) vs general chat

### Model Family Matters

Harnesses must be tailored per vendor:
- OpenAI emphasizes Bash tools
- Anthropic provides explicit file editing tools
- Claude Opus 4.6 scored 59.6% with earlier harness versions (before optimization)

---

## State of Agent Engineering 2026

From LangChain's survey of 1,300+ professionals:

| Metric | Value |
|--------|-------|
| Agents in production | 57.3% of respondents |
| Actively developing agents | 30.4% |
| Quality cited as top barrier | 32% |
| Implemented observability | 89% |
| Adopted evals | 52% |
| Fine-tuning models | Only 43% (majority use base models + RAG) |

---

## Implications for Software Factory

### What to Adopt

1. **Middleware pattern** — `PreCompletionChecklistMiddleware` maps directly to our governance layer. Agent cannot exit without verification.
2. **Loop detection** — per-file edit counting with context injection. Simple to implement, prevents doom loops.
3. **Reasoning sandwich** — use high reasoning for planning/verification, lower for implementation. Saves tokens and time.
4. **Trace-based debugging** — store structured traces, analyze failure patterns, systematically improve harnesses.
5. **Planning tool** — explicit to-do tracking within agent context. The `write_todos` pattern is trivial to implement.

### What We Already Have

- Governance layer = their middleware pattern
- LLM Judge = their PreCompletionChecklistMiddleware
- Convergence detection = their LoopDetectionMiddleware
- Max 2 CI retries = their bounded retry pattern

### What We're Missing

- Reasoning budget optimization (variable reasoning levels per phase)
- Trace analysis skill (automated failure pattern extraction)
- Planning tool (explicit to-do tracking during agent runs)
- Context injection at init (environment mapping before agent starts working)

---

## Open SWE: LangChain's Production Coding Agent

Harrison Chase's tweet (March 17, 2026) revealed how LangChain's OSS coding agent compares to Ramp, Stripe, and Coinbase's internal agents, referencing @kishan_dahya's component analysis.

**Open SWE** = the open-source equivalent of what Stripe (Minions), Ramp (Inspect), and Coinbase (Cloudbot) built internally.

### Architecture: Sequential Multi-Agent System

```
  ┌──────────┐     ┌──────────┐     ┌──────────────────────┐
  │ MANAGER  │────▶│ PLANNER  │────▶│ PROGRAMMER + REVIEWER│
  │          │     │          │     │                      │
  │ Entry    │     │ Codebase │     │ Code in sandbox      │
  │ point    │     │ research │     │ Review loop until    │
  │ Route    │     │ Step-by- │     │ quality approved     │
  │ tasks    │     │ step plan│     │                      │
  └──────────┘     └──────────┘     └──────────────────────┘
                        │                      │
                   Human review           Daytona sandbox
                   (mandatory)            (isolated env)
```

### Key Components

| Component | Purpose | Comparable To |
|-----------|---------|---------------|
| **Manager** | Entry point, task routing, state init | Dispatcher (our router.ts) |
| **Planner** | Codebase research, execution plan | codex-planr's `$planr-plan` |
| **Programmer** | Code execution in sandbox | Our agent runner.ts |
| **Reviewer** | Quality/correctness/completeness check | Our LLM Judge |
| **Daytona Sandbox** | Isolated shell execution per task | Our Docker containers |
| **LangGraph Platform** | Long-running agent hosting, autoscaling | BullMQ + worker |
| **LangSmith** | Debugging, trace analysis | Our SQLite audit log |

### How It Compares to Enterprise Agents

Harrison's tweet maps components against Stripe/Ramp/Coinbase:

- **Harness**: Deep Agents under the hood (same framework that scored 66.5% on Terminal Bench)
- **Sandboxes**: Bring-your-own (Daytona default, but swappable)
- **Invocation**: Slack, Linear, GitHub Issues → automatic PR
- **Subagents**: Multi-agent orchestration via LangGraph

### What Makes Open SWE Interesting for Software Factory

1. **Plan approval gate** — human reviews plan before execution starts (we do this post-execution)
2. **Double texting** — accept mid-session feedback without restart (we'd need websocket support)
3. **Autoscaling** — LangGraph Platform handles hundreds of concurrent runs (we use BullMQ workers)
4. **Self-dogfooding** — Open SWE is a top contributor to its own repo (proof it works)

### LangChain Tweet (March 17, 2026)

The @LangChain tweet linked an X article (ID: 2033954694733979649) — likely the Open SWE or harness engineering announcement post. The article requires JavaScript rendering and couldn't be fully extracted.

---

## References

- [Improving Deep Agents with Harness Engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/)
- [Harrison Chase @ Sequoia: Context Engineering Long-Horizon Agents](https://sequoiacap.com/podcast/context-engineering-our-way-to-long-horizon-agents-langchains-harrison-chase/)
- [Deep Agents GitHub](https://github.com/langchain-ai/deepagents)
- [Deep Agents Docs](https://docs.langchain.com/oss/python/deepagents/overview)
- [State of Agent Engineering 2026](https://www.langchain.com/state-of-agent-engineering)
- [Interrupt 2026](https://interrupt.langchain.com/) (May 13-14, San Francisco)
- [LangChain February 2026 Newsletter](https://blog.langchain.com/febraury-2026-langchain-newsletter/)
- [VentureBeat: Better models alone won't get your AI agent to production](https://venturebeat.com/orchestration/langchains-ceo-argues-that-better-models-alone-wont-get-your-ai-agent-to)
