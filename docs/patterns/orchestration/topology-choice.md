# Choosing a Topology

How to score a problem and pick a wiring. Diagrams and the longer control-flow notes also live in [Potent Combos](./potent-combos.md); this note keeps the design dimensions, pros and cons, and the decision matrix that used to sit on the landing page.

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

See [Potent Combos](./potent-combos.md) for the full combinatorial analysis.
