# Software Factory

**A research corpus on agent-native software delivery.** Nine topology patterns, 50+ curated references, production systems analysis (Stripe, Spotify, Ramp, Coinbase, Brex), and a working reference implementation.

> **Core thesis:** Agents produce working but low-quality code, and instruction-based constraints (CLAUDE.md, AGENTS.md) don't enforce quality. The solution is programmatic verification — deterministic checks + LLM judge + bounded retries. How you wire the agents together matters more than how smart they are.

---

## Table of Contents

1. [Why Software Factories](#why-software-factories)
2. [Design Dimensions](#design-dimensions-not-a-single-spectrum)
3. [Topology Walkthroughs](#topology-walkthroughs) — 9 patterns, side by side
4. [Choosing a Topology](#choosing-a-topology) — decision matrix by problem shape
6. [What Doesn't Work (Failure Modes)](#what-doesnt-work-failure-modes)
7. [Reference Implementation](#reference-implementation) — architecture, agents, safety layers
8. [Verification & Quality](#verification--quality)
9. [Context Engineering](#context-engineering)
10. [Agent Security](#agent-security) — emerging category (CrabTrap, OpenShell, etc.)
11. [Research Corpus](#research-corpus) — production systems, papers, platforms
12. [License](#license)

---

## Why Software Factories

A dozen companies have proven the pattern at scale and published the receipts. All converged on the same primitives: isolated sandboxes, PRs as review gates, humans review before merge.

| Company | System | Scale | Key Insight |
|---------|--------|-------|-------------|
| **Uber** | [Minion / uReview / Autocover / Shepherd](https://newsletter.pragmaticengineer.com/p/how-uber-uses-ai-for-development) | 92% monthly eng adoption, 11% of PRs opened by agents, uReview analyzes 90% of ~65K weekly diffs, Autocover saved 21K dev-hours | Four-layer agent stack with specialized internal products |
| **Cloudflare** | [Internal AI eng stack (self-hosted on their own products)](https://blog.cloudflare.com/internal-ai-engineering-stack/) | 93% R&D adoption, MRs grew 5,600 → 8,700/wk in 11 months, 51B+ tokens/mo | Dogfooding AI Gateway + Workers + Sandboxes as the platform |
| **Meta** | [Capacity Efficiency AI](https://engineering.fb.com/2026/04/16/developer-tools/capacity-efficiency-at-meta-how-unified-ai-agents-optimize-performance-at-hyperscale/) + [MetaMateCR paper](https://arxiv.org/pdf/2507.13499) | Capacity AI compressed ~10hr investigations to ~30min, recovered hundreds of megawatts; separate MetaMateCR paper reports ~68% exact-match patches | Unified agent marketplace with MCP-layer tools shared across defense/offense agents |
| **Anthropic** | [Claude Code dogfooding + Managed Agents](https://www.claude.com/blog/code-review) | 200% growth in output per engineer, substantive reviews 16% → 54%, 84% of 1000+ line PRs get findings | "Decouple brain from hands" harness thesis |
| **LinkedIn** | [CAPT (Contextual Agent Playbooks & Tools)](https://www.linkedin.com/blog/engineering/ai/contextual-agent-playbooks-and-tools-how-linkedin-gave-ai-coding-agents-organizational-context) | 1,000+ engineers, 500+ playbooks, 70% triage time drop, 3x data workflows | Organizational context as the agent primitive |
| **Stripe** | [Minions](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) | 1,300 PRs/week | Goose fork + devboxes (10s spin-up) + 400 MCP tools |
| **Spotify** | [Honk](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) | 1,500+ AI-generated PRs from Honk; separately, their Fleet Management org reports automating ~50% of internal PRs across all tooling | Containerized K8s + verification loops + LLM judge |
| **Ramp** | [Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) | ~50% of merged PRs | Modal snapshot warm pools + multiplayer sessions |
| **Coinbase** | [Forge](https://www.coinbase.com/blog/Tools-for-Developer-Productivity-at-Coinbase) *(née Cloudbot)* | 5% of merged PRs, 150h → 15h cycle time | Cloud sandboxes + Slack-first + agent councils |
| **Block** | [AI-Assisted Development at Block](https://engineering.block.xyz/blog/ai-assisted-development-at-block) | 95% eng adoption, Champions program (50 devs × 30% time) | AI-readiness architecture for 40K-file monorepo |
| **DoorDash** | [Collaborative AI Ecosystem](https://careersatdoordash.com/blog/beyond-single-agents-doordash-building-collaborative-ai-ecosystem/) | 25K hrs saved via Alteryx automation alone | 4-stage progression: workflows → single agents → deep agents → swarms |
| **Cognition** | [How Cognition Uses Devin to Build Devin](https://www.cognition-labs.com/blog/how-cognition-uses-devin-to-build-devin) | Hundreds of Devin PRs merged per week internally *(vendor-reported)* | Agent-to-agent REST API triggers |
| **Nubank** | [Devin deployment](https://building.nubank.com/enhancing-engineering-workflows-with-ai-a-real-world-experience/) | 100K data class migrations; 12x efficiency claimed *(vendor-reported via Cognition case study)* | Fine-tuned Devin on the Nubank codebase |
| **OpenAI** | [Harness Engineering](https://openai.com/index/harness-engineering/) | 1M lines, 1,500 PRs | Environment-first, 3.5 PRs/engineer/day |
| **Airbnb** | [Large-scale test migration with LLMs](https://airbnb.tech/infrastructure/accelerating-large-scale-test-migration-with-llms/) | 3.5K files Enzyme → RTL in 6 weeks, 75% auto in 4 hrs, 97% after 4 days | Canonical batch migration harness pattern |
| **Google** | [Jules — async coding agent](https://blog.google/technology/google-labs/jules) | 140K code improvements during beta | Ephemeral VM per task, GitHub-issue driven |
| **Pinterest** | [MCP Ecosystem + Tricorder](https://medium.com/pinterest-engineering/building-an-mcp-ecosystem-at-pinterest-d881eb4c16f1) | 66K MCP invocations/mo, 844 MAUs | Central MCP registry + observability agent |
| **Datadog** | [Bits AI SRE + Dev Agent](https://www.datadoghq.com/blog/engineering/bits-ai-eval-platform) | Observability-driven auto-PR | Eval platform for trusting autonomous agents at scale |
| **Shopify** | [Roast framework](https://shopifyengineering.myshopify.com/blogs/engineering/introducing-roast) | Open-sourced Ruby DSL | Claude Code as a "CodingAgent" cog in structured workflows |
| **Databricks** | [Genie Code](https://www.databricks.com/blog/introducing-genie-code) | 2x a leading coding agent on internal benchmarks | Data-specific coding agent with proactive prod monitoring |
| **Vercel** | [AEO tracking for agents](https://vercel.com/blog/how-we-built-aeo-tracking-for-coding-agents) | — | Coding agents run in ephemeral Firecracker microVMs as probe fleet |

**The convergent primitives:** isolated sandboxes, queue-based dispatch, PRs as review gates, verification loops, bounded retries, cost governance, MCP tool layer, organizational context injection.

**Cross-company survey:** Ry Walker's [In-House Coding Agents: Build vs Buy](http://rywalker.com/research/in-house-coding-agents) (Feb 2026) aggregates many of these systems in one place — useful as a starting overview.

---

## Design Dimensions (Not a Single Spectrum)

Earlier versions of this doc collapsed these into one axis labeled "prescriptive ↔ autonomous." That framing is wrong — it conflates at least four independent dimensions. When picking a topology, score your problem on each:

| Dimension | Low | High |
|-----------|-----|------|
| **Workflow determinism** | Agent decides path (Ratchet, One-Shot Tree) | Path is a hardcoded graph (Deterministic Graph, Pipeline) |
| **Delegation structure** | Flat / peer (Mesh, One-Shot Tree) | Hierarchical (Org Chart, Hierarchical Mesh) |
| **State coupling** | Isolated per-agent (One-Shot Tree) | Shared workspace (Mesh) |
| **Search / retry freedom** | Single-shot (One-Shot Tree) | Unbounded loops (Ratchet) |

A system can be high on determinism but flat on delegation (Deterministic Graph), or flat on delegation but high on state coupling (Mesh). Org Chart and One-Shot Tree both have low search freedom but sit at opposite poles on delegation structure. There is no clean linear ordering — pick the topology whose dimensional profile matches your problem.

**Heuristic for scoring your problem:**
- **Task well-defined?** → higher workflow determinism wins
- **Failures expensive?** → lower search freedom, higher determinism
- **Verification cheap?** → higher search freedom is affordable
- **Multi-disciplinary work?** → hierarchical delegation helps
- **Humans join mid-flight?** → shared state coupling is required

---

## Topology Walkthroughs

Nine topology patterns observed across production and research systems, each with tradeoffs, pros/cons, and suitability guidance. A tenth pattern — the *Tiered Gate* (deterministic fast path + LLM slow path) — is orthogonal to topology (it's a decision/verification pattern that composes inside any topology), so it's covered in [Verification & Quality](#verification--quality) and [Agent Security](#agent-security).

---

### 1. One-Shot Tree (Stripe Minions)

```
                    ┌─────────┐
                    │ Dispatch│
                    └────┬────┘
               ┌─────────┼─────────┐
               ▼         ▼         ▼
          ┌────────┐ ┌────────┐ ┌────────┐
          │Agent A │ │Agent B │ │Agent C │
          │(fix)   │ │(fix)   │ │(fix)   │
          └───┬────┘ └───┬────┘ └───┬────┘
              ▼          ▼          ▼
           [PR #1]    [PR #2]    [PR #3]
```

**How it works:** Fire-and-forget. Dispatcher fans out issues to independent agents. Each agent receives full context, produces one PR, and dies. No iteration, no feedback between siblings.

| Pros | Cons |
|------|------|
| Massively parallel — scales horizontally | No cross-agent learning |
| Simple failure model (each agent is independent) | Partial success is the norm — expect first-pass failures |
| Easy to cost-cap per agent | Wasted work on failures — agent re-does context |
| No coordination overhead | Can't handle tasks requiring iteration |

- **When to use:** Large batches of independent, well-scoped tasks (CI failures, dependency bumps, formatter passes)
- **When NOT to use:** Tasks requiring refinement, cross-file reasoning, or multi-step negotiation
- **Production example:** Stripe Minions — 1,300 PRs/week
- **Key metric:** Throughput (PRs/hour)

---

### 2. Pipeline (Spotify Honk)

```
  ┌───────┐    ┌────────┐    ┌───────┐    ┌────────┐    ┌───────┐
  │ Parse │───▶│ Reason │───▶│  Fix  │───▶│ Verify │───▶│ Judge │
  │  logs │    │ about  │    │  code │    │ (tests)│    │(LLM)  │
  └───────┘    └────────┘    └───────┘    └────────┘    └───────┘
                                               │              │
                                               │   ✗ veto     │
                                               ◀──────────────┘
                                          (max 2 retries)
```

**How it works:** Linear with one feedback loop. Each stage transforms output and passes it forward. Judge can veto back to Fix (max 2 iterations). Convergence detection stops the loop if the same error repeats.

| Pros | Cons |
|------|------|
| Deterministic stages — easy to debug | Sequential → throughput limited |
| LLM judge catches scope creep and phantom fixes (Spotify Honk reports a meaningful veto rate) | Judge can become Goodhart's law target |
| Bounded retries prevent runaway cost | Rigid — can't skip stages |
| Each stage can be optimized independently | Single point of failure at judge |

- **When to use:** Well-understood task types with a clear success signal (CI debug, security patches, incident response)
- **When NOT to use:** Novel problem shapes, greenfield feature building, tasks with ambiguous "done" criteria
- **Production example:** Spotify Honk (Part 3 reports judge catching a meaningful share of scope-creep / phantom-fix attempts)
- **Key metric:** First-pass merge rate + veto catch rate

---

### 3. Org Chart (Paperclip)

```
                 ┌──────────────┐
                 │     CEO      │
                 │(Orchestrator)│
                 │  Budget: $50 │
                 └──────┬───────┘
              ┌─────────┼─────────────┐
              ▼         ▼             ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Eng Lead │ │ QA Lead  │ │ Ops Lead │
        │ $20 budg │ │ $15 budg │ │ $15 budg │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
          ┌──┴──┐      ┌──┴──┐      ┌──┴──┐
          ▼     ▼      ▼     ▼      ▼     ▼
        [dev] [dev]  [qa]  [qa]  [sre] [sre]
```

**How it works:** Hierarchical delegation. Parent assigns tasks to children, children report upward. Budget flows down — each level gets a sub-allocation enforced by the orchestrator.

| Pros | Cons |
|------|------|
| Natural cost governance (budget per branch) | Coordination overhead (messages traverse hierarchy) |
| Clear accountability chain | Bottlenecks at parent nodes |
| Maps to existing org structures | Slow to adapt (requires re-delegation) |
| Easy to add new "departments" | Parent becomes context window bottleneck |

- **When to use:** Complex multi-disciplinary projects where goal decomposition is natural and budget control matters
- **When NOT to use:** Fast-moving iterative work, highly parallel independent tasks
- **Production example:** Paperclip (57K+ stars as of April 2026)
- **Key metric:** Budget adherence + mission→task traceability

---

### 4. Mesh (Ramp Inspect)

```
        ┌────────┐       ┌────────┐
        │Agent A │◀─────▶│Agent B │
        │(review)│       │(fix)   │
        └───┬────┘       └───┬────┘
            │    ╲       ╱   │
            │     ╲     ╱    │
            │   shared state │
            │     ╱     ╲    │
            │    ╱       ╲   │
        ┌───┴────┐       ┌───┴────┐
        │Agent C │◀─────▶│Agent D │
        │(test)  │       │(deploy)│
        └────────┘       └────────┘
```

**How it works:** Peer-to-peer. Agents share state through a common workspace (filesystem snapshots, shared memory). No central coordinator. Warm pools mean agents spin up in <2s from snapshots. Humans can join live sessions and co-edit.

| Pros | Cons |
|------|------|
| No orchestrator bottleneck | Race conditions on shared state |
| Warm pools → fast spin-up (seconds, not minutes) | Hard to reason about global behavior |
| Humans join mid-session | Debugging requires distributed tracing |
| Good fit for interactive workflows | Requires robust snapshot/merge primitives |

- **When to use:** Interactive multi-agent collaboration, fast experimentation, sessions that humans join mid-flight
- **When NOT to use:** Strict audit requirements, regulated domains, fully-batched workloads
- **Production example:** Ramp Inspect — ~50% of merged PRs
- **Key metric:** Session latency + shared-state conflict rate

---

### 5. Ratchet (Karpathy Autoresearch)

```
       ┌──────────────────────────────────────────┐
       │            NEVER STOP LOOP               │
       │                                          │
       │  ┌──────┐    ┌──────┐    ┌───────┐      │
       │  │ Read │───▶│Modify│───▶│Commit │      │
       │  │state │    │ code │    │(git)  │      │
       │  └──────┘    └──────┘    └───┬───┘      │
       │                              ▼          │
       │                        ┌──────────┐     │
       │                        │   Run    │     │
       │                        │experiment│     │
       │                        └────┬─────┘     │
       │                             ▼           │
       │                      ┌────────────┐     │
       │               ┌──yes─┤ Improved?  ├─no─┐│
       │               ▼      └────────────┘    ▼│
       │          ┌─────────┐            ┌───────┐│
       │          │  KEEP   │            │ RESET ││
       │          │(advance │            │(git   ││
       │          │ branch) │            │ reset)││
       │          └────┬────┘            └───┬───┘│
       │               └────────┬────────────┘    │
       │                        ▼                 │
       │                   LOOP BACK              │
       └──────────────────────────────────────────┘
            ~12 experiments/hour, ~100 overnight
            git history = full audit trail
```

**How it works:** Self-directed with no external coordinator. One binary metric (improved / not improved) eliminates ambiguity. Accepts or rejects via git — history becomes the audit trail.

| Pros | Cons |
|------|------|
| Runs unattended overnight | Only works when metric is clean/binary |
| Git history = built-in audit | Goodhart's law if metric is gameable |
| Captures tacit optimization knowledge | Requires cheap evaluation loop |
| No coordination cost | No multi-objective reasoning |

- **When to use:** Single-objective optimization with cheap evaluation (performance tuning, hyperparameter search, self-improving code)
- **When NOT to use:** Multi-objective work, tasks where "better" is subjective, expensive-to-evaluate metrics
- **Production example:** Karpathy — 700 experiments in 2 days, 11% training speedup; Shopify — 19% gain overnight
- **Key metric:** Improvement rate × experiment throughput

---

### 6. Sequential Multi-Agent (LangChain Open SWE)

```
  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │ MANAGER  │────▶│ PLANNER  │────▶│PROGRAMMER│────▶│ REVIEWER │
  │          │     │          │     │          │     │          │
  │ Route    │     │ Research │     │ Code in  │     │ Quality  │
  │ task     │     │ codebase │     │ sandbox  │     │ check    │
  └──────────┘     └──────────┘     └──────────┘     └──────────┘
```

**How it works:** Different specialized agents with distinct roles. Unlike Pipeline (same agent through stages), each agent has its own system prompt, tools, and reasoning mode. The Planner never writes code; the Programmer never reviews.

| Pros | Cons |
|------|------|
| Role specialization → higher quality | Context loss at handoffs |
| Each agent gets scoped system prompt | Fixed sequence = slow for simple tasks |
| Easier to swap out one role | Debugging requires role-level tracing |
| +13.7pp measured harness gain (LangChain) | Handoff format is a contract — rigid |

- **When to use:** Complex feature building where planning, coding, and reviewing require different mindsets
- **When NOT to use:** Simple bug fixes (role overhead isn't worth it), highly-parallel batch work
- **Production example:** LangChain Open SWE (March 2026) — distills Stripe Minions + Ramp Inspect + Coinbase Forge patterns
- **Key metric:** End-to-end PR quality + handoff success rate

---

### 7. Dynamic DAG (AgentConductor)

```
   Input ─▶ ┌──────────────┐
            │ RL Orchestrator│  generates topology per task
            └──────┬───────┘
                   ▼
        Topology varies by task:
        ┌────┐     ┌─────────────┐     ┌──────────┐
        │ T1 │ vs  │    T2       │ vs  │    T3    │
        │A─▶B│     │   A─┐       │     │   A──┐   │
        │    │     │   B─┤─▶D    │     │   │  │   │
        │    │     │   C─┘       │     │   ▼  ▼   │
        └────┘     └─────────────┘     │   B  C   │
                                       │   └──┬───┘
                                       │      ▼   │
                                       │      D   │
                                       └──────────┘
```

**How it works:** Reinforcement-learning-trained orchestrator generates an optimal topology per task. Different tasks produce different agent graphs. Learns from outcomes to improve routing.

| Pros | Cons |
|------|------|
| Adapts topology to task shape | Training data required |
| +14.6% on APPS, 68% cost reduction | Hard to audit ("why this graph?") |
| Emergent efficiency gains | RL training is expensive |
| Handles heterogeneous task mix | Behavior can drift over time |

- **When to use:** Heterogeneous task mix at scale where a static topology would over/under-provision most tasks
- **When NOT to use:** Small task volume, regulated domains needing deterministic behavior
- **Production example:** AgentConductor research — +14.6% APPS benchmark gain
- **Key metric:** Task-type weighted quality × cost

---

### 8. Deterministic Workflow Graph (Fabro)

```
   graph workflow {
     lint -> test -> implement -> review -> merge
     implement -> {sandbox, typecheck} [parallel]
     review -> implement [loop, max: 2]
     review -> HUMAN_GATE [approval]
   }
```

**How it works:** Human defines a DOT graph with branching, loops, parallelism, and approval gates. CSS-like stylesheets route steps to appropriate models (Opus for implementation, smaller models for linting). Git commits at every stage create checkpoints.

| Pros | Cons |
|------|------|
| Fully reproducible + auditable | Rigid — can't adapt to novel inputs |
| Easy to reason about (graph is the spec) | Requires manual graph authoring |
| Trivial to add approval gates | Changes require graph edits + deploy |
| Great for regulated domains | Doesn't capture tacit knowledge |

- **When to use:** Regulated workflows (finance, healthcare), compliance-driven builds, reproducible research
- **When NOT to use:** Rapidly-evolving product requirements, exploratory work
- **Production example:** Fabro, deterministic graph engines
- **Key metric:** Audit completeness + reproducibility rate

---

### 9. Hierarchical Mesh (OpenAI Symphony-style / Cloudflare Mesh)

```
                    ┌──────────────┐
                    │ Orchestrator │  (reconciliation loop)
                    │ (state machine)│
                    └──────┬───────┘
                           │ polls
              ┌────────────┴────────────┐
              ▼                         ▼
     ┌──────────────┐           ┌──────────────┐
     │Task Cluster A│◀─mesh────▶│Task Cluster B│
     │  ┌──┐  ┌──┐ │           │  ┌──┐  ┌──┐  │
     │  │A1│  │A2│ │           │  │B1│  │B2│  │
     │  └──┘  └──┘ │           │  └──┘  └──┘  │
     └──────────────┘           └──────────────┘
                           ▲
                           │
                    ┌──────┴───────┐
                    │ Convergence  │
                    │  detection   │
                    └──────────────┘
```

**How it works:** Orchestrator reconciles desired state against observed state. Within each cluster, agents mesh. Clusters mesh with each other. Exponential backoff + convergence detection prevent runaway retries.

| Pros | Cons |
|------|------|
| Handles partial failure gracefully | Orchestrator is high-stakes single point |
| State machine is auditable | Complex to implement correctly |
| Scales across clusters | Debugging cross-cluster failures is hard |
| Cloudflare Mesh-style — federated deploys | Requires robust convergence logic |

- **When to use:** Long-running multi-agent deployments, federated compute across regions, distributed state reconciliation
- **When NOT to use:** Simple batch work, small teams
- **Production example:** OpenAI Symphony, Cloudflare Mesh (April 2026), internal orchestrators at scale
- **Key metric:** Convergence rate + partial-failure recovery

---

## Choosing a Topology

Match the topology to the problem shape. Three key questions: **(1) is the task well-defined?** **(2) how expensive are failures?** **(3) how cheap is verification?**

### Decision Matrix

| If you have... | Use | Why |
|---------------|-----|-----|
| A large queue of well-scoped, independent tasks | **One-Shot Tree** | Maximum parallelism, no coordination cost |
| A repeatable task type with clear success signal | **Pipeline** | Deterministic stages, LLM judge catches drift |
| Complex multi-disciplinary work with budget constraints | **Org Chart** | Natural cost governance + accountability |
| Interactive collaboration with humans joining mid-flight | **Mesh** | Shared state, warm pools, low latency |
| Single-objective optimization with cheap eval | **Ratchet** | Self-directed, git-audited, runs overnight |
| Feature building requiring planning + coding + review | **Sequential Multi-Agent** | Role specialization, scoped prompts |
| Heterogeneous task mix at scale | **Dynamic DAG** | Topology adapts per task |
| Regulated/compliance-critical workflows | **Deterministic Graph** | Full audit + reproducibility |
| Long-running distributed deployments | **Hierarchical Mesh** | State reconciliation + convergence |

### Anti-Patterns

| Don't do this | Because |
|---------------|---------|
| One-Shot Tree for tasks requiring iteration | Agents can't refine — they burn context on failure |
| Pipeline for greenfield feature building | Rigid stages don't fit ambiguous "done" criteria |
| Org Chart for fast iteration | Coordination overhead dominates |
| Mesh for audited workflows | Shared state is hard to reconstruct post-hoc |
| Ratchet with multi-objective metrics | No binary accept/reject → no ratcheting |
| Dynamic DAG at small task volume | Training cost exceeds savings |

### Combining Topologies

Production systems rarely use one topology — they compose. Common combos:

- **One-Shot Tree + Pipeline**: Dispatcher fans out to agents, each agent runs a pipeline internally *(Stripe Minions does this)*
- **Mesh + Ratchet**: Agents mesh during the day, individual agents ratchet overnight *(Shopify autoresearch pattern)*
- **Deterministic Graph + Sequential Multi-Agent**: Graph defines the sequence, agents specialize within each node *(common in enterprise SDLC)*
- **Hierarchical Mesh + Pipeline**: Orchestrator reconciles, each agent runs a pipeline *(OpenAI Symphony-style)*
- **Pipeline + Tiered Gate verification**: Pipeline at each stage uses a deterministic-first / LLM-fallback verifier *(Spotify Honk's verification, this repo's 3-layer quality loop)*
- **One-Shot Tree + Tiered Gate security**: Fan-out agents, each request they emit passes through a deterministic-first / LLM-fallback security gate *(Brex CrabTrap in front of a fleet)*

See [`docs/potent-combos.md`](docs/potent-combos.md) for the full combinatorial analysis.

---

## What Doesn't Work (Failure Modes)

The corpus above over-indexes on successes because companies only publish wins. Honest failure patterns to know about:

- **Devin critique (Answer.AI, 2025)** — [Analysis of Devin's actual completion rate](https://www.answer.ai/posts/2025-01-08-devin.html) on real tasks (well below marketing claims). Key lesson: vendor-reported agent benchmarks routinely don't reproduce.
- **Alibaba SWE-CI benchmark** — 75% of agents break working code across consecutive PRs. Quality regresses over agent-turns.
- **Klarna's AI customer service walkback (2024)** — Klarna reversed its "AI replaces 700 agents" story quietly by rehiring humans; widely cited as a cautionary tale for over-optimistic agent deployment.
- **CodeRabbit analysis of 470 AI PRs** — AI PRs have 1.7x more issues than human PRs; visible quality lag.
- **LLM judge gaming / Goodhart's law** — Agents optimized to satisfy an LLM judge will game readability without substance; why tests must remain the hard gate.
- **Context rot** — [Chroma Research](https://research.trychroma.com/context-rot) shows context quality degrades over agent turns; long-horizon agents need active summarization or reset.
- **Ona escape / veto bypass patterns** — Agents finding ways around verification gates (commit bypassing, ignoring lint with comments, etc.); covered in [`docs/`](docs/) corpus notes.

If your topology choice has no theory of failure, it's not a real design — it's optimism.

The codebase in this repo implements a **Pipeline topology with One-Shot Tree dispatch** — GitHub webhooks fan out to independent agents, each runs through parse → reason → fix → verify → judge.

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
       (all output = PRs)
```

**Two execution paths:**

1. **Webhook-driven (reactive)** — `GitHub Webhook → EventRouter → BullMQ → Worker → Agent → GitHub API`. Triggers: PR opened/updated, CI failure, Dependabot alert.
2. **Orchestrator-driven (proactive)** — `Linear Issue → Orchestrator Poll → Reconciler → Workspace → BullMQ → Agent → GitHub API`. Symphony-style, disabled by default.

Both paths converge at the BullMQ queue and share the same Agent Runner.

### Agents

| Agent | Trigger | Output | Constraints |
|-------|---------|--------|-------------|
| **PR Reviewer** | `pull_request.opened` / `synchronize` | Review comments + approve/request changes | Cannot create PRs |
| **CI Debugger** | `check_suite.completed` (failure) | Diagnosis comment + fix PR | Max 10 files, 200 lines |
| **Security Patcher** | `dependabot_alert.created` | Patch PR | Lockfiles only |
| **Incident Responder** | PagerDuty / custom alert | RCA + fix PR | Max 10 files, 200 lines |
| **Merge Resolver** | PR with conflict label | Conflict resolution commit | Max 20 files, 500 lines |

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

### Quick Start

```bash
git clone https://github.com/Chipagosfinest/software-factory.git
cd software-factory
npm install
cp .env.example .env
# Configure: GitHub App credentials, OpenRouter API key, Redis URL
npm run dev
```

---

## Verification & Quality

The quality problem is industry-wide. Alibaba's SWE-CI benchmark shows 75% of agents break working code. AI PRs have 1.7x more issues than human PRs (CodeRabbit, 470 PRs). Three layers address this:

```
  Agent generates code
         │
  ┌──────▼──────────────────────────────────────────┐
  │  Layer 1: Deterministic Checks (free, fast)     │
  │  AST complexity, duplication, linting, types    │
  └──────┬──────────────────────────────────────────┘
         │ all pass
  ┌──────▼──────────────────────────────────────────┐
  │  Layer 2: Test Execution (hard gate)            │
  │  Build succeeds? Unit tests pass?               │
  └──────┬──────────────────────────────────────────┘
         │ all pass
  ┌──────▼──────────────────────────────────────────┐
  │  Layer 3: LLM-as-Judge (soft signal)            │
  │  Scope check, readability, architecture         │
  └──────┬──────────────────────────────────────────┘
         │
    pass ├──────▶ Open PR for human review
         │
    veto ├──▶ retry (max 2) ──▶ flag for human
```

- **Layer 1** is the cheap filter — static analysis catches a large class of issues without any LLM call
- **Layer 2** is the hard gate — if it doesn't build/test, it doesn't ship
- **Layer 3** catches subtle quality issues (scope creep, readability)
- **Goodhart's Law risk:** agents optimized for LLM judge approval will game the metric — hard constraints are the real gate

**The Tiered Gate pattern.** Layers 1→3 form a *deterministic fast path + LLM slow path* — the same shape Brex CrabTrap uses for network security. Static rules handle predictable cases cheaply; LLM judge handles the long tail. This is a verification pattern, not a topology: it composes inside any of the 9 topologies above.

**Leaderboard:** See the [official SWE-bench leaderboard](https://www.swebench.com/) for current rankings. As of April 2026, the Verified split is dominated by Claude Opus 4.7, GPT-5.3-Codex, and Gemini 3.1 Pro (verify exact numbers at the official source — third-party aggregators often lag).

---

## Context Engineering

From Spotify Honk's Part 2 — context engineering is the single biggest lever for agent quality.

**Prompt design:**
- Describe the end state, not step-by-step instructions
- State preconditions — tell the agent when NOT to act
- Use concrete examples — code snippets heavily influence output quality
- One change at a time — combining changes exhausts context and produces partial results
- Define success as tests — "make this code better" fails; "these tests should pass" succeeds

**Tool strategy:**
- **Spotify:** minimal tools (verify MCP, Git, restricted Bash). Context goes in the prompt.
- **Stripe:** 400+ MCP tools via Toolshed, pre-hydrated before agent starts.
- Start constrained, add tools only when prompts aren't enough.

**Conditional rules (Stripe pattern):**
- Global agent rules don't work in large codebases — they conflict across domains
- Apply rules conditionally by subdirectory
- Use scoped config files (CLAUDE.md, AGENTS.md) per directory

**The context files debate (2026):** Princeton study found [AGENTS.md](https://agents.md/) adoption reduces runtime 28.6%, saves 16.6% tokens. ETH Zurich/LogicStar counter-study (Gloaguen et al. 2026) found verbose context files *hurt* performance. The truth is probably: concise, scoped, hierarchical context wins; bloated global rules lose.

---

## Agent Security

An emerging category. As agents gain real credentials and make real API calls, the security surface expands beyond traditional guardrails. **April 2026 saw an explosion of entrants** — Brex CrabTrap, Permiso SandyClaw, Capsule Security ($7M seed), iron-proxy, agentcage, ToolMesh.

### Comparison Matrix

| System | Layer | Approach | Best For |
|--------|-------|----------|----------|
| [CrabTrap (Brex)](https://github.com/brexhq/CrabTrap) | Transport (HTTP/S proxy) | LLM-as-a-judge + static rules | Framework-agnostic egress control |
| [NVIDIA OpenShell](https://github.com/NVIDIA/OpenShell) | Kernel (Landlock, seccomp) | Docker sandbox + YAML policies | Kernel-level isolation |
| [Deconvolute](https://github.com/nichochar/deconvolute) | Protocol (MCP) | MCP session firewall | MCP-heavy architectures |
| [ClawShield](https://github.com/nichochar/ClawShield) | Application | 5 specialized AI agents + YAML policy | PII redaction, prompt injection scanning |
| [Permiso SandyClaw](https://permiso.io) | Skill (dynamic detonation) | Detonates agent skills in sandbox | Cross-framework skill safety |
| [Capsule Security](https://capsulesecurity.ai) | Runtime | Behavior control at runtime | Enterprise runtime governance |
| [iron-proxy](https://github.com/iron-proxy/iron-proxy) | Transport + credential | MITM egress + proxy tokens | Real secrets never enter sandbox |
| [ToolMesh](https://toolmesh.io) | Protocol (MCP) | Self-hosted MCP gateway | Enterprise MCP control plane |
| [Superserve](https://superserve.io) | Transport (credential) | Injects API keys at network level | Credential isolation (not request filtering) |

### CrabTrap Deep Dive

CrabTrap (Brex, open-sourced April 21, 2026) sits between AI agents and external APIs. Two-tier evaluation:

1. **Static rules** — Deterministic URL pattern matching (prefix, exact, glob). Deny rules always win. Microsecond execution.
2. **LLM-as-a-judge** — When no static rule matches, full request context goes to an LLM with a natural-language security policy. Returns structured ALLOW/DENY with reasoning.

**Production findings from Brex:**
- Policies derived from observed traffic beat hand-written rules
- LLM judge fires on <3% of requests (static rules catch the rest)
- Audit trail became a discovery tool for tightening agents themselves
- Prompt injection defense: JSON-encoded payloads, 4KB header cap, 16KB body truncation

**Architecture:** Go + TypeScript, MIT license, PostgreSQL audit trail, AWS Bedrock with Anthropic models, React admin dashboard.

**Limitations:** Outbound only (not a WAF), no approval queue, doesn't filter responses, fundamentally probabilistic on the LLM layer.

Sources: [GitHub](https://github.com/brexhq/CrabTrap) · [Brex Blog](https://www.brex.com/journal/building-crabtrap-open-source) · [HN Discussion](https://news.ycombinator.com/item?id=47850212)

---

## Research Corpus

### Internal Engineering Deployments (recruiting-tool eng blogs)

These are the first-person accounts from company engineering teams — the richest source of real numbers and architecture details. Tech companies publish these as recruiting signals, so the bylines are real engineers.

**Tier 1 — Deep case studies with numbers:**

- [Uber: uReview](https://blog.uber.com/blog/ureview/) — Multi-stage Commenter GenAI reviews 90% of ~65K weekly Phabricator diffs (Sonal Mahajan byline)
- [Pragmatic Engineer: How Uber uses AI for development](https://newsletter.pragmaticengineer.com/p/how-uber-uses-ai-for-development) — Deep dive on Uber's 4-layer stack (Minion, Shepherd, uReview, Autocover)
- [Cloudflare: The AI engineering stack we built internally](https://blog.cloudflare.com/internal-ai-engineering-stack/) — 93% R&D adoption, running on their own Workers/AI Gateway
- [Meta: Capacity Efficiency at Meta — Unified AI Agents](https://engineering.fb.com/2026/04/16/developer-tools/capacity-efficiency-at-meta-how-unified-ai-agents-optimize-performance-at-hyperscale/) — Agent marketplace + FBDetect regression auto-fix
- [Meta: MetaMateCR (IEEE TSE paper)](https://arxiv.org/pdf/2507.13499) — LargeLSFT generates exact-match patches 68% of the time
- [Anthropic: Bringing Code Review to Claude Code](https://www.claude.com/blog/code-review) — Multi-agent parallel review; 16% → 54% of PRs get substantive comments
- [Anthropic: Scaling Managed Agents — Decoupling brain from hands](https://www.anthropic.com/engineering/managed-agents) — Meta-harness thesis for long-horizon agents
- [LinkedIn: CAPT — Contextual Agent Playbooks](https://www.linkedin.com/blog/engineering/ai/contextual-agent-playbooks-and-tools-how-linkedin-gave-ai-coding-agents-organizational-context) — 1,000+ engineers, 70% triage time drop (Ajay Prakash byline)
- [Block: AI-Assisted Development at Block](https://engineering.block.xyz/blog/ai-assisted-development-at-block) — 95% eng adoption, Champions program (Angie Jones byline)

**Tier 2 — Strong patterns + production numbers:**

- [Airbnb: Accelerating Large-Scale Test Migration with LLMs](https://airbnb.tech/infrastructure/accelerating-large-scale-test-migration-with-llms/) — 3.5K files Enzyme → RTL in 6 weeks (the canonical batch migration harness post)
- [Airbnb: GraphQL Data Mocking at Scale with LLMs](https://airbnb.tech/uncategorized/graphql-data-mocking-at-scale-with-llms-and-generatemock/) — Type-safe mock data inside the dev loop
- [DoorDash: Beyond Single Agents — Collaborative AI Ecosystem](https://careersatdoordash.com/blog/beyond-single-agents-doordash-building-collaborative-ai-ecosystem/) — 4-stage progression: workflows → agents → deep agents → swarms
- [Pinterest: Building an MCP Ecosystem](https://medium.com/pinterest-engineering/building-an-mcp-ecosystem-at-pinterest-d881eb4c16f1) — Central MCP registry + IDE/chat integrations
- [Datadog: Bits AI Dev Agent](https://datadoghq.com/blog/bits-ai-dev-agent) — Observability-driven auto-PR agent
- [Datadog: Real-world evaluation platform for SRE agents](https://www.datadoghq.com/blog/engineering/bits-ai-eval-platform) — The "how do we trust it" post
- [Shopify: Introducing Roast](https://shopifyengineering.myshopify.com/blogs/engineering/introducing-roast) — Structured AI workflows in Ruby, open-sourced
- [Databricks: Introducing Genie Code](https://www.databricks.com/blog/introducing-genie-code) — Data-specific coding agent
- [Cognition: How Cognition Uses Devin to Build Devin](https://www.cognition-labs.com/blog/how-cognition-uses-devin-to-build-devin) — 659 Devin PRs merged in one week
- [Google: Jules async coding agent](https://blog.google/technology/google-labs/jules) — Ephemeral VM per task, GitHub-issue driven
- [Vercel: AEO tracking for coding agents](https://vercel.com/blog/how-we-built-aeo-tracking-for-coding-agents) — Agents in ephemeral Firecracker microVMs
- [Figma: Agents Meet the Figma Canvas](https://www.figma.com/blog/the-figma-canvas-is-now-open-to-agents) — Design canvas as a tool for coding agents
- [GitHub: Mission Control](https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/) — Fleet-orchestration UI for Copilot cloud agent
- [Ry Walker: In-House Coding Agents — Build vs Buy](http://rywalker.com/research/in-house-coding-agents) — Cross-company survey aggregating many of the above

### Production Systems (agent frameworks + case studies)

| System | Scale | Key Insight |
|--------|-------|-------------|
| [Stripe Minions Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) | 1,300 PRs/week | One-shot tree, 400+ MCP tools, warm EC2 |
| [Stripe Minions Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2) | Zero human-written code | Devboxes, conditional rules, max 2 CI retries |
| [Spotify Honk Part 1](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) | 650+ PRs/month | Containerized K8s fleet management |
| [Spotify Honk Part 2](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2) | 60-90% time savings | Context engineering, Claude Code as top agent |
| [Spotify Honk Part 3](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3) | Judge catches scope-creep / phantom fixes | Verification loops, LLM judge |
| [Spotify x Anthropic (April 2026)](https://engineering.atspotify.com/2026/4/anthropic-agentic-development/) | Slack-@mention-driven | Backstage evolving to agent-first MCP platform |
| [Ramp Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) | ~50% of merged PRs | Modal snapshot-based warm pools |
| [Ramp on Modal](https://modal.com/blog/how-ramp-built-a-full-context-background-coding-agent-on-modal) | 1,000 Datadog monitors | Self-maintaining code, auto-generated monitoring |
| [OpenAI Harness Engineering](https://openai.com/index/harness-engineering/) | 1M lines, 1,500 PRs | Environment-first, 3.5 PRs/engineer/day |
| [OpenAI Codex follow-up posts](https://openai.com/research/) *(Feb–Mar 2026)* | — | Codex harness evolution: standalone app server + Responses API with computer environment (verify exact URLs on openai.com) |
| [Nubank + Devin](https://building.nubank.com/enhancing-engineering-workflows-with-ai-a-real-world-experience/) | 100K migrations | 12x efficiency, 20x cost savings |
| [Nubank Agent Infra](http://nubank.dev/) *(Mar 2026)* | 131M customers | Clojure-based internal agent infrastructure |
| [Coinbase Forge (née Cloudbot)](https://www.coinbase.com/blog/Tools-for-Developer-Productivity-at-Coinbase) | 5% of merged PRs | 150h → 15h cycle time, agent councils |
| [LangChain Open SWE](https://blog.langchain.com/open-swe-an-open-source-framework-for-internal-coding-agents/) *(Mar 2026)* | — | Open-source framework distilling Minions + Inspect + Forge |

### Architecture & Patterns

- [LangChain Harness Engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/) — Harness-only improvements: 52.8% → 66.5% on Terminal Bench 2.0
- [LangChain Deep Agents](https://github.com/langchain-ai/deepagents) — 21K stars, v0.5.3 (April 2026) with AGENTS.md integration, subagent structured output
- [Context Engineering (Martin Fowler)](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html) — Dynamic context assembly vs static prompts
- [Context Rot (Chroma Research)](https://research.trychroma.com/context-rot) — How context degrades over agent turns
- [Cloudflare Agents Week 2026](https://blog.cloudflare.com/agents-week-in-review/) — Dynamic Workers GA, Artifacts (Git-versioned agent storage), Cloudflare Mesh, Project Think
- [Cloudflare Dynamic Workers](https://blog.cloudflare.com/dynamic-workers/) — V8 isolates, $0.002/Worker/day, 100x faster/cheaper than containers
- [Sandbox Architecture (Weng Jialin)](https://wengjialin.com/blog/agent-sandbox/) — Agent-inside vs sandbox-as-tool patterns
- [Sandbox Comparison (Northflank)](https://northflank.com/blog/best-sandboxes-for-coding-agents) — Side-by-side agent sandbox platforms
- [Agent Filesystems (Arize)](https://arize.com/blog/agent-interfaces-in-2026-filesystem-vs-api-vs-database-what-actually-works/) — Filesystem vs API vs database interfaces
- [Composio Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator) — Fleet management with plugin-based architecture (4.5K stars)
- [Paperclip](https://github.com/paperclipai/paperclip) — Org-chart orchestration, **57.4K stars** (April 2026), v2026.416.0

### Research Foundations

The papers that shaped how technical audiences think about coding agents. Missing any of these is a red flag.

- [ReAct (Yao et al., 2022)](https://arxiv.org/abs/2210.03629) — Reasoning + acting interleaved; foundation of most modern agent loops
- [Toolformer (Schick et al., 2023)](https://arxiv.org/abs/2302.04761) — LLMs self-teaching tool use
- [SWE-agent (Yang et al., NeurIPS 2024)](https://arxiv.org/abs/2405.15793) — Agent-computer interface design; one of the first strong coding-agent harnesses
- [OpenHands / CodeAct (Wang et al., 2024)](https://arxiv.org/abs/2407.16741) — Executable code as unified action space; open-source agent framework with 30K+ stars
- [SWE-bench (ICLR 2024)](https://arxiv.org/abs/2310.06770) — 2,294 real GitHub issues, baseline eval standard
- [SWE-bench Official Leaderboard](https://www.swebench.com/) — Canonical source for current rankings
- [SWE-bench Pro (Scale AI, 2025)](https://arxiv.org/abs/2509.16941) — 1,865 long-horizon tasks across Python, Go, TypeScript, JavaScript
- [SWE-bench Multimodal](https://arxiv.org/abs/2410.03859) — 617 visual UI tasks, only ~12% solved by top systems
- [Alibaba SWE-CI (2025)](https://arxiv.org/abs/2504.08057) — 75% of agents break working code across consecutive PRs
- [Answer.AI Devin Critique (Jan 2025)](https://www.answer.ai/posts/2025-01-08-devin.html) — Independent teardown of Devin's actual completion rate on real tasks
- [Anthropic 2026 Agentic Coding Trends](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf) — Context engineering, tool use, error reduction metrics

### IDE / Pair-Programming Agents

These sit on a different axis from background agents — human-in-loop editors. Covered here because they shape how developers expect coding agents to feel.

- [Cursor](https://cursor.com) — AI-native IDE, dominant category incumbent
- [Windsurf](https://codeium.com/windsurf) — Cascade agent mode, Codeium successor IDE
- [Cline](https://github.com/cline/cline) — Open-source VS Code autonomous assistant, Plan+Act modes
- [Continue.dev](https://continue.dev) — Open-source IDE extensions (VS Code, JetBrains)
- [JetBrains Junie + Air](https://www.jetbrains.com/junie/) — Standalone coding agent + structural code awareness
- [Cognition Devin](https://devin.ai) — Cloud IDE with autonomous agent
- [Factory.ai](https://factory.ai) — Droids across 6+ surfaces
- [Replit Agent](https://replit.com) — Browser-based autonomous agent

### Platforms & Ecosystems

- [Model Context Protocol](https://github.com/modelcontextprotocol/specification) — Open standard, 7.5K+ stars
- [MCP 2026 Roadmap](https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/) *(March 2026)* — Next spec tentatively June 2026
- [JFrog MCP Registry](https://jfrog.com/blog/announcing-general-availability-of-the-jfrog-mcp-registry/) *(March 2026)* — Enterprise MCP control plane, GA
- [AGENTS.md Standard](https://agents.md/) — 60K+ repos adoption, Linux Foundation stewardship
- [GitHub Agent HQ](https://github.blog/news-insights/company-news/welcome-home-agents/) — Claude + Codex now live in Agent HQ (Pro+/Enterprise)
- [GitHub Agent Sessions in Issues/Projects](https://github.blog/changelog/2026-03-26-agent-activity-in-github-issues-and-projects) *(March 2026)*
- [Linear Agent](https://linear.app/changelog/2026-03-24-introducing-linear-agent) *(March 2026)* — Public beta, 75% of Linear enterprise workspaces have a coding agent
- [Open-Inspect](https://github.com/ColeMurray/background-agents) — OSS reimplementation of Ramp Inspect on Cloudflare + Modal (~1K stars)
- [background-agents.com](https://background-agents.com) — Industry overview

### Agent Memory & Knowledge

- [Karpathy Autoresearch](https://github.com/karpathy/autoresearch) — Overnight research loop: prepare → train → evaluate → accept/reject
- [Karpathy LLM Wiki Pattern](https://x.com/karpathy) *(April 2026)* — 18M views, spawned memory-layer discourse
- [QMD (Tobi Lutke)](https://github.com/tobi/qmd) — v2.1.0 (April 2026), 21K+ stars, 96% token reduction on agentic retrieval
- [Napkin](https://github.com/Michaelliv/napkin) — Progressive disclosure memory, BM25, sql.js, 99.8% recall on HotpotQA
- [TigerFS](https://tigerfs.io) — Mount databases as POSIX directories
- [AgentFS (Turso)](https://github.com/tursodatabase/agentfs) — Database-as-directory for agent workspaces

### Strategy & Cost

- [Karpathy Software Factory Thesis](docs/karpathy-software-factory-thesis.md) — Code quality findings, instruction compliance crisis
- [Agent Pricing Analysis (Cosine)](https://cosine.sh/blog/ai-coding-agent-pricing-task-vs-token) — Per-run vs token-based vs task-based pricing
- [FinOps for Agentic AI](https://analyticsweek.com/finops-for-agentic-ai-cloud-cost-2026/) — $400M collective cloud leak estimate
- [Stripe Walls > Models](https://www.anup.io/stripes-coding-agents-the-walls-matter-more-than-the-model/) — Why governance matters more than model capability

### Full Research Corpus

The `docs/` directory contains 34+ research documents covering sandbox architectures, agent memory systems, harness engineering, context engineering, agent topologies, competitive landscape, and more. See [AGENTS.md](AGENTS.md) for a navigable index.

---

## License

MIT
