# Potent Combos & Agent Topology Patterns

*Last updated: March 19, 2026*

High-synergy system combinations and topology patterns for autonomous coding agents. Maps how eleven research sources compose into architectures greater than the sum of their parts.

---

## 1. Agent Topology Types

Nine topology types observed across production and research agent systems. ASCII diagrams inspired by Manu Cornet's org chart comic — because how you wire agents matters more than how smart they are.

---

### One-Shot Tree (Stripe Minions)

```
                    ┌─────────┐
                    │ Dispatch │
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

**Data flow:** Dispatch fans out issues to independent agents. Each agent receives full context (pre-hydrated MCP tools), produces one PR, and dies.

**Control flow:** Fire-and-forget. No iteration, no feedback between siblings. Dispatcher is the only coordinator.

**Failure mode:** An agent fails silently — max 2 CI retries then discard. Siblings are unaffected. Partial success is the norm (Stripe reports ~70% first-pass success on CI repair).

**Best use case:** High-volume, independent tasks where partial success is acceptable. Stripe processes 1,300 PRs/week this way (zero human-written code). Each task must be completable in a single attempt with no inter-agent dependencies.

**Software Factory fit:** Current CI Debugger and Security Patcher agents already operate this way. One event, one agent, one PR.

**Update (Mar 2026):** Stripe's Minions are now a heavily modified fork of Block's open-source [Goose](https://github.com/block/goose) agent. Each Minion runs on a "devbox" — a standardized AWS EC2 instance from a warm pool provisioned in <10s, pre-loaded with Stripe's full source tree, warmed Bazel and type-checking caches. ByteByteGo published a [detailed architecture breakdown](https://blog.bytebytego.com/p/how-stripes-minions-ship-1300-prs). SitePoint's [deconstruction](https://www.sitepoint.com/stripe-minions-architecture-explained/) confirms the fully unattended model: engineer sends Slack message → agent delivers finished PR.

---

### Pipeline (Spotify Honk)

```
  ┌───────┐    ┌────────┐    ┌───────┐    ┌────────┐    ┌───────┐
  │ Parse │───▶│ Reason │───▶│  Fix  │───▶│ Verify │───▶│ Judge │
  │  logs │    │  about  │    │  code │    │ (tests)│    │(LLM)  │
  └───────┘    └────────┘    └───────┘    └────────┘    └───────┘
                                               │              │
                                               │   ✗ veto     │
                                               ◀──────────────┘
                                          (max 2 retries)
```

**Data flow:** Linear. Each stage transforms output and passes it forward. Parse extracts structured errors from raw logs. Reason identifies root cause. Fix generates code. Verify runs tests. Judge validates the diff against original intent.

**Control flow:** Sequential with one feedback loop: Judge can veto back to Fix (max 2 iterations). Convergence detection stops the loop if the same error repeats.

**Failure mode:** Pipeline stalls if any stage produces garbage. The Judge is the safety valve — Spotify reports ~25% veto rate, catching scope creep and phantom fixes.

**Best use case:** Tasks requiring multi-step reasoning with quality gates. CI failure diagnosis, PR review with iterative improvement, incident root cause analysis.

**Software Factory fit:** Our CI Debugger already follows this pattern: parse failure logs, local verification, agent reasoning, sandbox fix, LLM judge validation.

**Update (Mar 2026):** At [QCon London 2026](https://www.infoq.com/news/2026/03/spotify-honk-rewrite/), Spotify revealed Honk's velocity jumped from 1,000 merged PRs per 3 months → **1,000 PRs every 10 days**. Key architecture change: runtime separation — agent runtime is decoupled from verification runtime. Honk pushes branches to GitHub, triggers builds via a verification service that abstracts CI, and only creates PRs after full validation. Spotify also found LLM-as-judge was too restrictive early on; as models improved, verification steps in prompts proved sufficient without explicit judging. The new bottleneck is **PR review capacity**, not code generation. Spotify CEO confirmed best developers "have not written a single line of code since December" (TechCrunch, Feb 2026). Slack integration enables "code from anywhere" — engineers fix bugs from their phone.

---

### Org Chart (Paperclip)

```
                 ┌──────────────┐
                 │     CEO      │
                 │ (Orchestrator)│
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
                           │
                      ┌────┴────┐
                      │ APPROVE │ ◀── Approval gate
                      │ / DENY  │     (human or policy)
                      └─────────┘
```

**Data flow:** Hierarchical delegation. Parent assigns tasks to children, children report results upward. Budget flows down — each level gets a sub-allocation.

**Control flow:** Top-down delegation with bottom-up reporting. Approval gates at configurable levels (e.g., any PR touching auth requires human approval). Heartbeat protocol monitors agent health — missing heartbeats trigger task requeue.

**Failure mode:** Coordination overhead. Messages must traverse the hierarchy. A dead manager blocks its entire subtree until the heartbeat timeout triggers failover.

**Best use case:** Large-scale operations requiring governance, cost control, and audit trails. Multi-team organizations where different agents have different permission levels and budget limits.

**Software Factory fit:** Phase 3 target. Our orchestrator dispatches agents flat today; Paperclip's org chart model adds the governance layer needed for multi-repo, multi-team deployment.

**Update (Mar 2026):** Paperclip hit [14.2K GitHub stars in its first week](https://paperclip.ing/). Now positioned as "open-source orchestration for zero-human companies." Upcoming Clipmart marketplace will offer pre-built company templates (content agencies, trading desks, dev shops) downloadable with one click. Task checkout and budget enforcement are now atomic operations.

---

### Mesh (Ramp Inspect + Open-Inspect)

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
              ▲
              │ multiplayer session
              │ (human joins live)
              ▼
         ┌─────────┐
         │  Human  │
         └─────────┘
```

**Data flow:** Peer-to-peer. Agents share state through a common workspace (Modal snapshot). Any agent can read another agent's work-in-progress. Humans can join live sessions and co-edit.

**Control flow:** No central coordinator. Agents discover work via shared state (filesystem changes, test results). Warm pools mean agents spin up in <2 seconds from snapshots.

**Failure mode:** State conflicts. Two agents editing the same file create merge conflicts. Requires careful workspace partitioning or optimistic concurrency.

**Best use case:** Collaborative tasks where multiple perspectives improve quality simultaneously. Code review + implementation happening in parallel. Human-in-the-loop sessions where context must be shared in real-time.

**Software Factory fit:** Future pattern for complex incident response — SRE agent, log analysis agent, and fix agent working on the same live issue concurrently. Requires shared workspace infrastructure we don't have yet (Phase 3).

**Open-source implementation:** [Open-Inspect](https://github.com/ColeMurray/background-agents) (1.1K stars, MIT) is an open-source clone of Ramp's Inspect architecture. Uses Cloudflare Durable Objects as the control plane and Modal containers as the data plane. Adds cron-driven automations with auto-pause after 3 consecutive failures, per-user git attribution in multiplayer sessions, and filesystem snapshots for near-instant (<2s) sandbox startup. See [full doc →](background-agents-open-inspect.md).

---

### Ratchet (Karpathy Autoresearch)

```
       ┌──────────────────────────────────────────┐
       │            NEVER STOP LOOP                │
       │                                           │
       │  ┌──────┐    ┌──────┐    ┌───────┐       │
       │  │ Read │───▶│Modify│───▶│Commit │       │
       │  │state │    │ code │    │(git)  │       │
       │  └──────┘    └──────┘    └───┬───┘       │
       │                              ▼           │
       │                        ┌──────────┐      │
       │                        │   Run    │      │
       │                        │experiment│      │
       │                        └────┬─────┘      │
       │                             ▼            │
       │                      ┌────────────┐      │
       │               ┌──yes─┤ Improved?  ├─no─┐ │
       │               ▼      └────────────┘    ▼ │
       │          ┌─────────┐            ┌────────┐│
       │          │  KEEP   │            │ RESET  ││
       │          │(advance │            │(git    ││
       │          │ branch) │            │ reset) ││
       │          └────┬────┘            └───┬────┘│
       │               └────────┬────────────┘    │
       │                        ▼                  │
       │                   LOOP BACK               │
       └──────────────────────────────────────────┘
            │
            │  ~12 experiments/hour
            │  ~100 experiments overnight
            │  git history = full audit trail
```

**Data flow:** Circular. Agent reads state, modifies code, commits, runs experiment, evaluates a single metric, keeps or discards. Git is the checkpoint mechanism — every attempt is a commit, failures are `git reset`.

**Control flow:** Self-directed with no external coordinator. The agent decides what to try next. One binary metric (improved / not improved) eliminates ambiguity. Fixed time budget per experiment prevents runaway cost.

**Failure mode:** Getting stuck. If the agent exhausts obvious ideas, it enters a "think harder" phase — trying radical changes, combining near-misses, reading documentation. Risk of infinite loop if metric never improves and no termination condition exists.

**Best use case:** Optimization problems with a clear, measurable objective. Performance tuning, prompt optimization, configuration search, ML training. Any problem where "did the number go up?" is the entire evaluation.

**Software Factory fit:** Applicable to prompt engineering for our agents (optimize verification accuracy), configuration tuning (find optimal retry/timeout settings), and autonomous codebase improvement (does test coverage increase? does build time decrease?).

**Update (Mar 2026):** Karpathy's autoresearch completed [700 experiments in 2 days](https://fortune.com/2026/03/17/andrej-karpathy-loop-autonomous-ai-agents-future/), discovering 20 optimizations that yielded 11% training speedup on a larger model. Shopify CEO Tobias Lütke ran it overnight: 37 experiments, **19% performance gain**. Karpathy's next vision: "asynchronously massively collaborative agents" (SETI@home-style) — not emulating one PhD student, but an entire research community. Says the remaining scaling work is "just engineering."

---

### Sequential Multi-Agent (LangChain Open SWE)

```
  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │ MANAGER  │────▶│ PLANNER  │────▶│PROGRAMMER│────▶│ REVIEWER │
  │          │     │          │     │          │     │          │
  │ Route    │     │ Research │     │ Code in  │     │ Quality  │
  │ task     │     │ codebase │     │ sandbox  │     │ check    │
  │ Init     │     │ Make plan│     │ Run tests│     │          │
  │ state    │     │          │     │          │     │          │
  └──────────┘     └──────────┘     └──────────┘     └──────────┘
                        │                                  │
                   Human reviews              ┌────────────┘
                   plan (mandatory)            │ FAIL
                                               ▼
                                          Back to Programmer
                                          (iterate until pass)
```

**Data flow:** Sequential hand-off between specialized agents. Each agent has a distinct role and sees only its predecessor's output. The Manager initializes, the Planner researches and creates an execution plan, the Programmer implements in a sandbox, and the Reviewer validates quality.

**Control flow:** Linear with one feedback loop: Reviewer can reject back to Programmer. Human-in-the-loop at the plan stage (mandatory by default). "Double texting" allows mid-session feedback without restart.

**Failure mode:** Plan quality bottleneck — if the Planner creates a poor plan, the Programmer builds the wrong thing. The mandatory human plan review catches this but adds latency.

**How it differs from Pipeline:** The Pipeline (Spotify) uses the *same agent* through sequential stages (parse → reason → fix → verify). Sequential Multi-Agent uses *different specialized agents* with distinct system prompts, tools, and reasoning modes. The Planner never writes code; the Programmer never reviews.

**Best use case:** Complex feature implementation requiring codebase research before coding. Tasks where plan quality determines success (architectural changes, large refactors, cross-module features). LangChain's Open SWE is a top contributor to its own repo using this pattern.

**Key data points:**
- LangChain: deepagents-cli scored 66.5% on Terminal Bench 2.0 (Top 5) using this architecture
- Harness-only changes produced a 13.7pp gain without changing the model
- Daytona sandboxes provide isolated execution per run
- LangGraph Platform handles autoscaling across hundreds of concurrent runs

**Source:** [Open SWE](https://github.com/langchain-ai/open-swe) | [Harness Engineering Blog](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/)

**Update (Mar 2026):** Open SWE officially released Mar 17, 2026 ([announcement](https://blog.langchain.com/open-swe-an-open-source-framework-for-internal-coding-agents/)). Ships with ~15 curated tools (shell, web, Git, Linear, Slack). Defaults to Claude Opus 4 but supports any LLM. Captures patterns from Stripe Minions, Ramp Inspect, and Coinbase Cloudbot. Deep Agents [formally released](https://www.marktechpost.com/2026/03/15/langchain-releases-deep-agents-a-structured-runtime-for-planning-memory-and-context-isolation-in-multi-step-ai-agents/) as a structured runtime with planning, memory, and context isolation for multi-step agents.

---

### Emerging: Dynamic Topology Evolution (AgentConductor)

```
       ┌────────────────── TOPOLOGY GENERATOR ──────────────────┐
       │                                                         │
       │  ┌───────────────┐     ┌────────────────────────────┐  │
       │  │  Orchestrator │────▶│   YAML Topology (DAG)      │  │
       │  │  (RL-trained, │     │                            │  │
       │  │   3B params)  │     │  step 1: [analyzer,planner]│  │
       │  └───────────────┘     │  step 2: [coder]           │  │
       │         ▲              │  step 3: [tester]          │  │
       │         │              └─────────────┬──────────────┘  │
       │    execution                         ▼                  │
       │    feedback             ┌────────────────────┐         │
       │         │               │  Execute topology  │         │
       │         └───────────────│  (parallel layers)  │         │
       │                         └────────────────────┘         │
       │                                                         │
       │  Density scales with difficulty:                        │
       │    Easy:   ≤4 nodes/turn (sparse)                      │
       │    Medium: ≤7 nodes/turn                               │
       │    Hard:   ≤10 nodes/turn (dense)                      │
       └─────────────────────────────────────────────────────────┘
```

**Data flow:** An RL-trained orchestrator generates task-specific agent topologies as structured YAML. The topology is a layered DAG — agents within a layer execute in parallel, cross-layer dependencies enable information flow. After execution, results feed back to the orchestrator, which evolves the topology over multiple turns.

**Control flow:** Fully dynamic. Unlike all other topologies which are statically defined, AgentConductor generates a new topology per task based on inferred difficulty. Easy problems get sparse graphs; hard problems get dense multi-agent networks. GRPO reinforcement learning trains the orchestrator to balance accuracy vs. cost.

**Performance:** State-of-the-art on competition-level code generation. 58.8% on APPS (+14.6% over MetaGPT), 46.3% on LiveCodeBench. **68% token cost reduction** vs strongest baseline through difficulty-aware density control. Uses only a 3B parameter orchestrator model.

**Best use case:** Complex code generation requiring variable levels of collaboration. The key insight is that *one topology doesn't fit all tasks* — simple tasks waste resources with complex agent networks, while hard tasks need dense coordination.

**Software Factory fit:** Future research direction. Our current topologies are static (pipeline, one-shot tree). AgentConductor's approach could dynamically select between them based on task difficulty — simple CI fixes get one-shot, complex feature work gets sequential multi-agent.

**Source:** [AgentConductor (arXiv 2602.17100)](https://huggingface.co/papers/2602.17100)

---

### Deterministic Workflow Graph (Fabro)

```
       ┌────────────────── HUMAN-DEFINED GRAPH ──────────────────┐
       │                                                          │
       │   graph workflow {                                       │
       │     lint -> test -> implement -> review -> merge         │
       │     implement -> {sandbox, typecheck} [parallel]         │
       │     review -> implement [loop, max: 2]                   │
       │     review -> HUMAN_GATE [approval]                      │
       │   }                                                      │
       │                                                          │
       │   styles {                                               │
       │     implement { model: opus; sandbox: daytona }          │
       │     review    { model: sonnet; readonly: true }          │
       │     lint      { model: haiku; timeout: 30s }             │
       │   }                                                      │
       │                                                          │
       │   ┌────┐  ┌────┐  ┌───────────┐  ┌──────┐  ┌─────┐    │
       │   │lint│─▶│test│─▶│implement  │─▶│review│─▶│merge│    │
       │   └────┘  └────┘  │  ┌─────┐  │  └──┬───┘  └─────┘    │
       │                    │  │sand-│  │     │ fail              │
       │                    │  │box  │  │◀────┘ (max 2)          │
       │                    │  └─────┘  │                         │
       │                    └───────────┘                         │
       │                                                          │
       │   Git checkpoint at every node ──▶ full audit trail     │
       └──────────────────────────────────────────────────────────┘
```

**Data flow:** Human defines a Graphviz DOT graph with branching, loops, parallelism, and approval gates. Agents execute each node. CSS-like "stylesheets" route steps to appropriate models (Opus for implementation, Haiku for linting). Git commits at every stage create checkpoints.

**Control flow:** Prescriptive — the graph is the spec. Unlike every other topology where agents have execution autonomy, Fabro agents follow the exact path defined by the human. Loop-back is bounded (e.g., `max: 2` retries on review rejection). Human gates pause execution for approval at configured steps.

**Failure mode:** Graph rigidity. If a task requires a step not in the graph, it can't be handled. The human must update the graph definition. Trades flexibility for reproducibility.

**How it differs from other topologies:**
- vs **Pipeline** (Spotify): Pipeline is the same agent through sequential stages. Fabro is different models per node, human-defined branching, and loops.
- vs **Sequential Multi-Agent** (Open SWE): Open SWE agents have autonomy within their role. Fabro agents execute exactly what the graph says.
- vs **AgentConductor**: AgentConductor generates topologies dynamically via RL. Fabro graphs are static, human-authored artifacts. The bet: for known workflows, human-defined beats AI-generated.

**Best use case:** Teams with well-understood, repeatable processes (CI/CD pipelines, migration playbooks, security audit checklists). The workflow graph encodes tribal knowledge as version-controlled code.

**Software Factory fit:** Could replace our static agent dispatch with graph-defined workflows. Instead of a single agent type per webhook event, define `ci-failure.dot` and `security-patch.dot` workflow graphs with multi-step execution, model routing, and approval gates.

**Source:** [Fabro (GitHub)](https://github.com/fabro-sh/fabro) | [@brynary announcement](https://x.com/brynary/status/2033901199603241012)

---

### Spec-Driven Session Controller (GSD 2)

```
       ┌──────────────── .gsd/ STATE MACHINE ────────────────┐
       │                                                       │
       │   Milestone (shippable version, 4-10 slices)         │
       │   └─ Slice (demoable capability, 1-7 tasks)          │
       │      └─ Task (single context-window unit)            │
       │                                                       │
       │   Per slice:                                          │
       │   Research → Plan → Execute → Complete → Reassess    │
       │                                    │                  │
       │                                    └─▶ Next slice     │
       │                                                       │
       │   ┌───────────┐  ┌────────┐  ┌─────────┐            │
       │   │ Research  │─▶│  Plan  │─▶│ Execute │──▶ ...      │
       │   │(read-only)│  │(spec)  │  │(sandbox)│             │
       │   └───────────┘  └────────┘  └─────────┘            │
       │                                                       │
       │   Fresh 200K-token context per task                   │
       │   Git worktree isolation per slice                    │
       │   Sequential commits → squash merge                   │
       └───────────────────────────────────────────────────────┘
```

**Data flow:** A deterministic state machine reads `.gsd/` files to control agent sessions programmatically — not prompt injection, not LLM self-loops. Each task gets a fresh 200K-token context window with fully assembled context (the same insight as Stripe's one-shot tree: deterministic dispatch over pre-hydrated context). Milestones decompose into Slices, Slices into Tasks. Cost tracking rolls up from task → slice → milestone with projections.

**Control flow:** The CLI is the controller, not the LLM. The state machine drives Research → Plan → Execute → Complete → Reassess per slice. Crash recovery uses session forensics + exponential backoff. Stuck loop detection triggers diagnostic recovery. Verification commands (lint, test) run with auto-fix retries. This is the transition from "prompt frameworks" to "agent session controllers."

**Failure mode:** Rigid decomposition — if a task exceeds one context window, it fails. Crash recovery mitigates transient failures, but the fundamental unit (single context window per task) is a hard constraint. Parallel multi-worker orchestration helps throughput but not individual task complexity.

**How it differs from other topologies:**
- vs **Fabro**: Both are deterministic, but Fabro defines arbitrary workflow graphs (DOT files) while GSD 2 enforces a fixed hierarchy (Milestone → Slice → Task) with a fixed lifecycle per slice. Fabro is "define any process"; GSD 2 is "one process, deeply optimized."
- vs **Pipeline** (Spotify): Pipeline is a single agent through sequential stages. GSD 2 spins up fresh context per task — no context degradation across the lifecycle.
- vs **Ratchet** (Karpathy): Ratchet loops forever on one metric. GSD 2 progresses through a spec — each slice is demoable, each milestone is shippable.

**Best use case:** Solo developers or small teams building features against a spec. The Milestone → Slice → Task hierarchy maps naturally to product roadmaps. 20+ LLM provider support (Anthropic, OpenAI, Google, OpenRouter, GitHub Copilot) makes it model-agnostic.

**Software Factory fit:** GSD 2's session controller pattern could inform how we structure multi-step agent runs — instead of a single context window per webhook event, decompose complex tasks (e.g., large security patches, multi-file refactors) into task-sized units with fresh context each.

**Stats:** 2.1K stars, 1,393 commits, v2.29. TypeScript, Node.js 24 LTS. Built on Pi SDK. Headless CI/cron support with JSON queries. Self-contained HTML reports with DAG visualizations.

**Source:** [GSD 2 (GitHub)](https://github.com/gsd-build/gsd-2)

---

### Topology Comparison Matrix

| Topology | Control | Agents | Who Decides Execution Path | Best Metric |
|----------|---------|--------|---------------------------|-------------|
| **One-Shot Tree** | Static | Independent | Dispatcher (fire-and-forget) | 1,300 PRs/week (Stripe) |
| **Pipeline** | Sequential | Same agent, stages | Hardcoded pipeline order | ~25% veto catch rate (Spotify) |
| **Org Chart** | Hierarchical | Specialized teams | Parent delegates to children | $50 budget enforcement (Paperclip) |
| **Mesh** | Peer-to-peer | Shared state | Agents discover work independently | <2s startup (Ramp, Open-Inspect) |
| **Ratchet** | Self-directed | Solo | Agent picks what to try next | ~100 experiments/night (Karpathy) |
| **Sequential Multi-Agent** | Hand-off | Specialized per stage | Fixed role sequence | +13.7pp harness-only (LangChain) |
| **Dynamic DAG** | RL-generated | Variable per task | RL orchestrator creates topology | +14.6% on APPS (AgentConductor) |
| **Deterministic Graph** | Prescriptive | Per-node routing | Human-authored DOT graph | Reproducible, auditable (Fabro) |
| **Spec-Driven Session** | Prescriptive | Fresh context per task | CLI state machine reads `.gsd/` files | 2.1K stars, 1,393 commits (GSD 2) |

**The autonomy spectrum:**

```
  Prescriptive ◄──────────────────────────────────────────────► Autonomous

  GSD 2   Fabro    Pipeline    Org Chart   Mesh   Seq. Multi    One-Shot    Ratchet
  (spec    (human   (fixed      (delegated  (shared  (role-based   (dispatch   (agent
   hier.)   graph)   stages)     hierarchy)  state)   autonomy)     + forget)   decides)
                                                                                  │
                                                                      Dynamic DAG ┘
                                                                      (RL picks topology)
```

---

## 2. Potent Combos

Six high-synergy combinations. Each creates emergent capability that neither system has alone.

---

### Combo 1: Deep Agents + Paperclip — Smart Agents in a Managed Fleet

**What combines:** Deep Agents' internal composition (middleware, sub-agents, context summarization) with Paperclip's external orchestration (budgets, task locks, heartbeats, dashboard).

**What emerges:** A fleet of *individually sophisticated* agents, each with middleware pipelines and sub-agent delegation, coordinated by an *organizationally aware* platform with budget enforcement and observability. Neither system alone achieves this — Deep Agents builds one smart agent, Paperclip manages many dumb ones.

```
┌──────────────────────── Paperclip Layer ────────────────────────┐
│  Budget: $50/day    Tasks: checkout locks    Health: heartbeats  │
│                                                                  │
│  ┌──────────────────────────── Deep Agent ─────────────────────┐ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │ │
│  │  │Governance│─▶│   Cost   │─▶│  Audit   │─▶│Summarize  │  │ │
│  │  │Middleware│  │ Tracking │  │Middleware│  │Middleware │  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────┬─────┘  │ │
│  │                                                    ▼        │ │
│  │                                             ┌───────────┐   │ │
│  │                                             │ Sub-Agent │   │ │
│  │                                             │ (parse)   │   │ │
│  │                                             └───────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Deep Agent ─┐  ┌─ Deep Agent ─┐  ┌─ Deep Agent ─┐          │
│  │  PR Review   │  │  CI Debug    │  │  Security    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  Dashboard ──▶ [Live transcripts] [Budget burn] [Agent health]   │
└──────────────────────────────────────────────────────────────────┘
```

**Software Factory example:** The CI Debugger uses middleware for governance + cost tracking + summarization, and spawns a cheap sub-agent for log parsing. Meanwhile, Paperclip's orchestration layer enforces the $5/day budget across all five agents, monitors heartbeats, and streams transcripts to the React dashboard. An engineer wakes up and reviews overnight work in one UI.

**Phase:** This is the Phase 2 → Phase 3 bridge. Deep Agents middleware refactor (Phase 2), then Paperclip fleet orchestration on top (Phase 3).

---

### Combo 2: Spotify Verification + Karpathy Ratchet — Verify-Then-Advance Autonomous Loop

**What combines:** Spotify Honk's verification pipeline (LLM judge, sandbox tests, convergence detection) with Autoresearch's NEVER STOP loop (git checkpoints, single-metric acceptance, crash recovery).

**What emerges:** An autonomous loop that *runs forever and only advances when verification proves improvement*. Spotify alone stops after bounded retries. Karpathy alone uses simplistic pass/fail metrics. Combined: the LLM judge provides nuanced verification, and the ratchet mechanism provides unbounded iteration.

```
       ┌────────────────── VERIFIED RATCHET ──────────────────┐
       │                                                       │
       │  ┌──────┐    ┌──────────────────────────────────┐    │
       │  │ Read │───▶│      Spotify Pipeline            │    │
       │  │state │    │  Parse → Reason → Fix → Verify   │    │
       │  └──────┘    │                      ↓           │    │
       │              │                 ┌─────────┐      │    │
       │              │                 │LLM Judge│      │    │
       │              │                 └────┬────┘      │    │
       │              └──────────────────────┼───────────┘    │
       │                                     ▼                │
       │                              ┌────────────┐          │
       │                       ┌──yes─┤  Passed?   ├─no──┐   │
       │                       ▼      └────────────┘     ▼   │
       │                  ┌─────────┐              ┌────────┐ │
       │                  │git keep │              │git     │ │
       │                  │(advance)│              │reset   │ │
       │                  └────┬────┘              └───┬────┘ │
       │                       └──────────┬────────────┘      │
       │                                  ▼                    │
       │                        convergence check              │
       │                    (same error 3x = escalate)         │
       │                                  ▼                    │
       │                             LOOP BACK                 │
       └───────────────────────────────────────────────────────┘
```

**Software Factory example:** Overnight prompt optimization for the PR Reviewer agent. The loop runs experiments changing system prompts, evaluates each against a benchmark suite using the LLM judge, keeps improvements (git commit), discards regressions (git reset). By morning: 50+ experiments attempted, measurably better prompts, full audit trail in git history.

**Key safety:** Convergence detection (Stripe pattern) prevents the loop from retrying identical failures. If the judge rejects the same fix pattern 3 times, escalate to human review instead of burning tokens.

---

### Combo 3: QMD Knowledge + OpenAI Harness — Structured Environment with Intelligent Retrieval

**What combines:** QMD's hybrid search (BM25 + vector + LLM reranking) with OpenAI's harness engineering patterns (AGENTS.md as map, layered docs, progressive disclosure, linter-as-teacher).

**What emerges:** Agents that can *find the right context at the right time* within a *well-structured knowledge base*. OpenAI's docs/ structure creates organized knowledge, but agents must still locate the right doc. QMD's retrieval ensures agents surface relevant context even when they don't know exactly where to look.

```
┌────────── OpenAI Harness Layer ──────────┐
│                                           │
│  AGENTS.md (~100 lines, table of contents)│
│       │                                   │
│       ▼                                   │
│  docs/                                    │
│  ├── design-docs/   ◀──┐                 │
│  ├── exec-plans/    ◀──┤                 │
│  ├── product-specs/ ◀──┤                 │
│  ├── references/    ◀──┤   ┌───────────┐ │
│  ├── DESIGN.md      ◀──┼───│    QMD    │ │
│  ├── SECURITY.md    ◀──┤   │  Search   │ │
│  └── QUALITY.md     ◀──┘   │           │ │
│                             │ BM25      │ │
│  Linters enforce layers:    │ + Vector  │ │
│  Types→Config→Service→UI    │ + Rerank  │ │
│                             └───────────┘ │
│                                           │
│  Agent asks: "How do we handle auth?"     │
│  QMD returns: SECURITY.md + auth design   │
│  doc + relevant code references           │
└───────────────────────────────────────────┘
```

**Software Factory example:** An incident response agent receives a PagerDuty alert about a payment processing failure. Instead of dumping the entire codebase context, QMD retrieves the relevant design doc (`docs/design-docs/payment-flow.md`), the security constraints (`SECURITY.md`), and recent related PRs — all within a structured environment where layered architecture constraints prevent the agent from accidentally breaking other modules.

**Phase:** Phase 2 — the harness structure already partially exists (we have `docs/` and agent prompts). Adding QMD search transforms it from "agent must know where to look" to "agent asks a question and gets the right context."

---

### Combo 4: Stripe Tools + Ramp Speed — ~500 MCP Tools with Warm Pool Execution

**What combines:** Stripe's ~500 MCP tool ecosystem (per-dir rules, devbox isolation, deterministic pre-fetch) with Ramp's warm pool execution (pre-built snapshots, <2s startup, multiplayer sessions).

**What emerges:** A *broad-capability agent* (~500 tools) that *starts instantly* (warm pools) without the cold-start penalty. Stripe's tools are powerful but each agent boots fresh. Ramp's pools are fast but with limited tools. Combined: agents start in seconds with the full tool suite pre-loaded.

```
┌──────── Warm Pool (Ramp) ────────────────────────────────────┐
│                                                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │Snapshot 1│  │Snapshot 2│  │Snapshot 3│  │Snapshot 4│        │
│  │(ready)   │  │(ready)   │  │(ready)   │  │(ready)   │        │
│  └────┬─────┘  └─────────┘  └─────────┘  └─────────┘        │
│       │                                                       │
│       ▼  <2s startup                                          │
│  ┌────────────── Stripe Tool Ecosystem ──────────────────┐   │
│  │                                                        │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │   │
│  │  │GitHub│ │Slack │ │ Jira │ │Sentry│ │ DB   │  ...   │   │
│  │  │MCP   │ │MCP   │ │MCP   │ │MCP   │ │MCP   │ (400+) │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘       │   │
│  │                                                        │   │
│  │  Per-dir rules: .minions.toml configures which tools   │   │
│  │  Deterministic pre-fetch: tools hydrated before LLM    │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  Pool refreshed every 30 min with latest tools + deps         │
└───────────────────────────────────────────────────────────────┘
```

**Software Factory example:** An incident fires at 3 AM. The agent starts in <2s from a warm snapshot (not 30s cold boot), already has PagerDuty MCP, GitHub MCP, Datadog MCP, and Slack MCP pre-loaded. It reads the alert, queries metrics, identifies the failing deploy, rolls back, posts to Slack, and opens a fix PR — all without tool initialization latency. The per-dir rules ensure the agent only sees tools relevant to the affected service.

**Key caveat:** Microsoft Research found 85% performance degradation with large tool spaces. The per-dir rules from Stripe are essential — don't give an agent ~500 tools at once. Scope to ~20 per task via `.minions.toml` equivalent.

---

### Combo 5: GitHub Copilot Agent + Software Factory — GitHub-Native Triggers Feeding Background Agents

**What combines:** GitHub Copilot's native issue-to-PR agent (GitHub-native triggers, CI repair, security scanning, custom `.github/agents/`) with Software Factory's specialized background agents (incident response, merge resolution, knowledge graph, governance).

**What emerges:** A *two-tier agent system* where GitHub handles simple, well-scoped tasks natively (issue → PR, CI repair) and Software Factory handles complex tasks requiring domain knowledge, multi-step reasoning, or cross-system integration. GitHub is the trigger layer and simple-task handler; Software Factory is the deep-reasoning layer.

```
┌────────────── GitHub Layer ──────────────────────────────────┐
│                                                               │
│  Issue opened ──▶ Copilot Agent ──▶ PR (simple fix)          │
│                       │                                       │
│  CI failed ─────▶ Repair Agent ──▶ Fix commit                │
│                       │                                       │
│  Dependabot ────▶ Security scan ──▶ Alert                    │
│                       │                                       │
│  Complex / failed ────┼──────────────────────────────────────│
│                       ▼                                       │
└───────────────────────┼───────────────────────────────────────┘
                        │ webhook
                        ▼
┌────────────── Software Factory Layer ────────────────────────┐
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Incident │  │  Merge   │  │ Deep CI  │  │ Security │    │
│  │ Response │  │ Resolver │  │ Debugger │  │ Patcher  │    │
│  │(PagerDuty│  │(conflict │  │(multi-   │  │(CVE auto │    │
│  │ + RCA)   │  │ resolve) │  │ step fix)│  │ patch)   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                       │                                       │
│              Knowledge Graph (domain intelligence)                     │
│              Governance Layer ($2/run caps)                    │
└───────────────────────────────────────────────────────────────┘
```

**Software Factory example:** A developer opens a GitHub issue tagged `factory:auto`. Copilot Agent takes first crack — if it produces a passing PR, done. If the CI fails twice or the issue involves incident response / merge conflict / security CVE, GitHub fires a webhook to Software Factory, which dispatches the appropriate specialized agent with full knowledge graph context and governance controls. The developer sees one unified PR flow regardless of which layer handled it.

**Strategic value:** GitHub Copilot Agent is free for Pro subscribers and handles the easy 70%. Software Factory handles the hard 30% that requires domain intelligence, multi-system integration, and production-grade governance. This is a complement strategy, not a compete strategy.

---

### Combo 6: Linear + Paperclip + Software Factory — Full Autonomous SDLC

**What combines:** Linear (project management, issue tracking, sprint planning) with Paperclip (fleet orchestration, budgets, dashboards) and Software Factory (agent implementation, governance, verification).

**What emerges:** A *fully autonomous software delivery lifecycle*: ticket creation → agent assignment → implementation → verification → PR → review → merge. Humans create tickets and review PRs; everything in between is automated.

```
┌─── Linear ───┐     ┌──── Paperclip ────┐     ┌── Software Factory ──┐
│               │     │                    │     │                      │
│  Issue        │     │  Task Checkout     │     │  Agent Execution     │
│  created      │────▶│  (atomic lock)     │────▶│                      │
│  [factory:    │     │                    │     │  ┌──────────────┐    │
│   auto]       │     │  Budget Check      │     │  │  Sandbox     │    │
│               │     │  ($20 remaining?)  │     │  │  (isolated)  │    │
│               │     │                    │     │  └──────┬───────┘    │
│               │     │  Agent Assignment  │     │         │            │
│               │     │  (label → type)    │     │         ▼            │
│               │     │                    │     │  ┌──────────────┐    │
│               │     │  Heartbeat Monitor │◀────│  │  Verify +    │    │
│               │     │  (agent alive?)    │     │  │  LLM Judge   │    │
│               │     │                    │     │  └──────┬───────┘    │
│               │     │  Transcript Store  │◀────│         │            │
│               │     │                    │     │         ▼            │
│  Issue        │◀────│  Status Update     │◀────│  PR Created         │
│  auto-closed  │     │                    │     │  (GitHub API)        │
│  + PR link    │     │  Dashboard         │     │                      │
│               │     │  [live view]       │     │                      │
└───────────────┘     └────────────────────┘     └──────────────────────┘

Timeline:
  t=0s     Issue tagged factory:auto in Linear
  t=2s     Orchestrator polls, Paperclip checks out task
  t=5s     Agent starts in sandbox (warm pool)
  t=30s    Local lint + fix attempt
  t=90s    Verification loop + LLM judge
  t=120s   PR opened, Linear issue updated
  t=???    Human reviews and merges
```

**Software Factory example:** A product manager files "Add rate limiting to /api/search endpoint" in Linear with the `factory:auto` label. Within 2 seconds, the orchestrator claims it. Paperclip verifies budget ($20 remaining this month for the feature-builder agent). Software Factory's agent reads the codebase context, implements rate limiting with tests, verifies locally, passes the LLM judge, and opens a PR — all in under 3 minutes. The Linear issue auto-updates with a link to the PR. The PM reviews and merges.

**This is the endgame.** It requires all three phases of Software Factory complete, plus Paperclip integration, plus a Feature Builder agent (our P0 competitive gap). Target: Phase 3.

---

## 3. The Software Factory Mega-Topology

How all eight research sources compose into the full architecture.

```
╔══════════════════════════════════════════════════════════════════════════╗
║                        SOFTWARE FACTORY                                 ║
║                                                                          ║
║  TRIGGERS                                                                ║
║  ────────                                                                ║
║  GitHub Webhooks ─┐                                                      ║
║  Linear Issues ───┤    ┌─────────────────────────────────────────────┐   ║
║  PagerDuty ───────┼───▶│           EVENT ROUTER                      │   ║
║  Cron ────────────┤    │    (Stripe pre-fetch + Spotify context)     │   ║
║  Copilot fallback─┘    └────────────────────┬────────────────────────┘   ║
║                                              │                            ║
║  ORCHESTRATION (Paperclip)                   │                            ║
║  ─────────────────────────                   │                            ║
║  ┌───────────────────────────────────────────┼──────────────────────┐    ║
║  │  ┌────────────┐ ┌──────────┐ ┌──────────┐│┌──────────┐         │    ║
║  │  │Budget Guard│ │Task Lock │ │Heartbeat ││ │Dashboard │         │    ║
║  │  │(monthly +  │ │(checkout)│ │(health)  ││ │(React +  │         │    ║
║  │  │ per-run)   │ │          │ │          ││ │WebSocket)│         │    ║
║  │  └────────────┘ └──────────┘ └──────────┘│└──────────┘         │    ║
║  └───────────────────────────────────────────┼─────────────────────┘    ║
║                                              │                            ║
║  AGENT LAYER (Deep Agents middleware)        ▼                            ║
║  ────────────────────────────────   ┌─────────────────┐                  ║
║                                     │   Reconciler    │                  ║
║  Shared Middleware Stack:           │  (Symphony +    │                  ║
║  ┌──────────────────────┐           │   Autoresearch) │                  ║
║  │ GovernanceMiddleware │           └────────┬────────┘                  ║
║  │ CostTrackingMW       │                    │                            ║
║  │ AuditMiddleware      │         ┌──────────┼──────────┬────────┐      ║
║  │ SummarizationMW      │         ▼          ▼          ▼        ▼      ║
║  │ LoopDetectionMW  [+] │    ┌────────┐ ┌────────┐ ┌────────┐ ┌────┐   ║
║  │ PreCompletionMW  [+] │    │   PR   │ │   CI   │ │Security│ │Feat│   ║
║  └──────────────────────┘    │ Review │ │ Debug  │ │ Patch  │ │Build│  ║
║                              │        │ │        │ │        │ │    │   ║
║  Per-Agent Middleware:       │Pipeline│ │Pipeline│ │One-Shot│ │Seq. │   ║
║  ┌──────────────────────┐    │topology│ │topology│ │Tree    │ │Multi│   ║
║  │ + GitHubReviewMW     │    │        │ │        │ │        │ │Agent│   ║
║  │ + CILogParserMW      │    └───┬────┘ └───┬────┘ └───┬────┘ └──┬─┘   ║
║  │ + CVEFeedMW          │        │          │          │         │      ║
║  │ + LocalContextMW [+] │        │          │          │         │      ║
║  └──────────────────────┘        │          │          │         │      ║
║                                  │          │          │         │      ║
║  EXECUTION (Spotify + Ramp + Stripe)        │          │         │      ║
║  ───────────────────────────────────────────┼──────────┼─────────┘      ║
║  ┌───────────────────────────────────────────┼──────────┼───────────┐    ║
║  │  ┌───────────┐ ┌───────────┐ ┌───────────┘──────────┘          │    ║
║  │  │Warm Pools │ │ Sandbox   │ │     Verification Loop            │    ║
║  │  │(Ramp:     │ │(Spotify:  │ │  ┌──────┐  ┌──────┐  ┌──────┐  │    ║
║  │  │ snapshots │ │ K8s/Docker│ │  │Local │─▶│Agent │─▶│ LLM  │  │    ║
║  │  │ <2s start)│ │ per run)  │ │  │verify│  │fix   │  │Judge │  │    ║
║  │  └───────────┘ └───────────┘ │  └──────┘  └──────┘  └──┬───┘  │    ║
║  │                              │              ▲           │      │    ║
║  │  ┌───────────┐               │              └───────────┘      │    ║
║  │  │MCP Tools  │               │           max 2 retries         │    ║
║  │  │(Stripe:   │               │                                  │    ║
║  │  │ per-dir   │               │  Convergence detection           │    ║
║  │  │ scoped)   │               │  (same error = immediate fail)   │    ║
║  │  └───────────┘               └──────────────────────────────────┘    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                                                          ║
║  KNOWLEDGE (QMD + OpenAI Harness)                                        ║
║  ────────────────────────────────                                        ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │  AGENTS.md (map) ──▶ docs/ (structured knowledge base)          │    ║
║  │                         ▲                                        │    ║
║  │                    QMD Search (BM25 + vector + rerank)           │    ║
║  │                                                                  │    ║
║  │  Domain Knowledge Graph (product intelligence)                   │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                                                          ║
║  OUTPUT                                                                  ║
║  ──────                                                                  ║
║  Every agent action ──▶ Pull Request ──▶ Human Review ──▶ Merge         ║
║                    ──▶ Audit Log (SQLite)                                ║
║                    ──▶ Run Transcript (persistent)                       ║
║                    ──▶ Linear Issue Update                               ║
╚══════════════════════════════════════════════════════════════════════════╝

Legend:
  Spotify Honk ───── Sandbox isolation, verification loops, LLM judge
  Stripe Minions ─── MCP tools, per-dir rules, bounded retries
  Ramp Inspect ───── Warm pools, snapshots, multiplayer sessions
  Karpathy Auto ──── NEVER STOP loop, git checkpoints, convergence
  OpenAI Harness ─── AGENTS.md, layered docs, linter-as-teacher
  Deep Agents ────── Middleware pipelines, sub-agents, summarization
  Open SWE ───────── Manager→Planner→Programmer→Reviewer pipeline
  QMD ────────────── Hybrid search, knowledge retrieval
  Paperclip ──────── Budgets, task locks, heartbeats, dashboard
  Open-Inspect ───── Multiplayer sessions, CF Durable Objects + Modal, cron automations
  Composio ───────── Plugin architecture, LLM task decomposition
  AgentConductor ── RL-trained dynamic topology generation (arXiv)
  Fabro ────────── Deterministic workflow graphs, Daytona sandboxes
  GSD 2 ────────── Spec-driven session controller, Milestone→Slice→Task
  Slate/RLM ────── Swarm-native code-environment orchestration
  Executor ─────── Code-as-tool-calling MCP bridge
  AutoResClaw ──── Full research pipeline (extends autoresearch)
  [+] = added from LangChain harness engineering research (Mar 2026)
```

---

## 4. Anti-Patterns

Topologies and practices that empirically degrade agent performance.

---

### Anti-Pattern 1: More Agents != Better (Google / MIT)

**Finding:** Google DeepMind and MIT researchers found that adding agents to a multi-agent system where any single agent already achieves >45% accuracy on the task *hurts* overall performance. The coordination overhead and conflicting outputs degrade the result.

**Why it happens:** Agents generate plausible but contradictory solutions. A "majority vote" or "debate" mechanism doesn't resolve deep disagreements — it averages toward mediocrity. The communication overhead grows quadratically with agent count.

**Rule for Software Factory:** Don't spawn multiple agents for a task one agent can handle. Use sub-agents (Deep Agents pattern) for *context isolation*, not for *quality improvement through redundancy*. One agent with middleware > three agents debating.

**Source:** [More Agents Is All You Need (Google/MIT, 2024)](https://arxiv.org/abs/2402.05120) — accuracy improvements only when base agent accuracy is below 45%.

---

### Anti-Pattern 2: Tool Space Explosion (Microsoft Research)

**Finding:** Microsoft Research observed 85% performance degradation when agents were given access to large tool spaces (100+ tools). The agent spends more tokens reasoning about which tool to use than actually solving the problem.

**Why it happens:** Each tool adds to the system prompt length, increases decision complexity, and creates more opportunities for tool hallucination (calling tools with wrong parameters or calling nonexistent tools).

**Rule for Software Factory:** Never give an agent more than ~20 tools per task. Use Stripe's per-dir rules pattern (`.minions.toml`) to scope tools to what's relevant. Pre-fetch deterministically instead of letting the agent discover tools at runtime.

**Source:** [Microsoft Research — Gorilla: Large Language Model Connected with Massive APIs (2023)](https://arxiv.org/abs/2305.15334) — performance degrades sharply beyond ~20 concurrent tool definitions. Also corroborated by Stripe's decision to use per-directory tool scoping despite having 400+ available.

---

### Anti-Pattern 3: LLM-as-Judge Without Grounding (Spotify Caveat)

**Finding:** Spotify found that using an LLM as the sole judge of code correctness produces a 79% false positive rate — the judge says the code is correct when it isn't. The judge hallucinates passing tests, imagines that edge cases are handled, and confirms its own biases.

**Why it happens:** The LLM judge has no access to runtime behavior. It reads the diff and *reasons about* correctness rather than *observing* correctness. It's especially bad at catching off-by-one errors, race conditions, and state mutation bugs — the exact class of bugs agents tend to introduce.

**Rule for Software Factory:** Never use LLM judge as the only verification. Always pair with deterministic verification (tests, linting, type checking) that runs in a sandbox. The LLM judge's job is *scope creep detection* and *intent alignment*, not *correctness verification*. The pipeline should be: deterministic verify first (fast, reliable) → LLM judge second (catches intent drift).

**Source:** [Spotify Honk Part 3 — Feedback Loops](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3) — 25% veto rate in production, but initial experiments without grounding showed 79% false positive rate for correctness claims.

---

### Anti-Pattern 4: Unbounded Retry Loops

**Finding:** Karpathy's autoresearch hit convergence bugs where the agent retried the same failing approach indefinitely, burning tokens without progress. Stripe independently capped retries at 2 after observing diminishing returns.

**Why it happens:** Without convergence detection, agents interpret "try harder" as "try the same thing again." After the second retry, the probability of success drops below 5% (Stripe data), but cost continues linearly.

**Rule for Software Factory:** Max 2 CI retries (Stripe pattern). Implement convergence detection: if `lastError === currentError`, mark failed immediately. Different error = progress; same error = stuck. Exponential backoff on retries (30s → 2m → 8m → 30m → 2h cap).

**Source:** [Stripe Minions Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) — max 2 CI retries. [Karpathy Autoresearch](https://github.com/karpathy/autoresearch) — crash recovery logic distinguishes fixable vs. fundamentally broken.

---

### Anti-Pattern 5: Shared Mutable State Between Agents

**Finding:** Ramp's multiplayer sessions work because they are carefully partitioned. Naive shared state — two agents editing the same file — produces merge conflicts, lost writes, and non-deterministic behavior that is nearly impossible to debug.

**Why it happens:** LLMs don't understand concurrency. They read a file, plan a change, and write it — without locks. If another agent modified the file between read and write, the first agent's change silently overwrites it.

**Rule for Software Factory:** Git worktree isolation (one worktree per task). Agents never share a workspace. If two agents must coordinate, use message passing (task checkout + result reporting) not shared filesystem. The Paperclip task checkout lock pattern prevents double-work.

**Source:** [Ramp Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) — multiplayer sessions require explicit workspace partitioning. Software Factory Design Principle #6: "Cattle, not pets — every sandbox identical and disposable."

---

## 5. Build Profile → Topology Selector

Which combo fits which type of project? Use this matrix to pick your architecture.

---

### Build Profiles

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                        BUILD PROFILES                                   │
  │                                                                         │
  │  SOLO HACKER          STARTUP (5-20)       GROWTH (20-100)             │
  │  ────────────         ──────────────       ──────────────              │
  │  1 dev, many repos    Small team, fast     Multi-team, process        │
  │  Max autonomy         Ship > governance    Governance > speed          │
  │  Budget: $50/mo       Budget: $500/mo      Budget: $5K/mo             │
  │                                                                         │
  │  ENTERPRISE (100+)    RESEARCH/ML          OPEN SOURCE                 │
  │  ────────────────     ──────────────       ──────────────              │
  │  Compliance-first     Experiment-heavy     Community PRs              │
  │  Audit everything     Optimize metrics     Contributor safety         │
  │  Budget: $50K/mo      Budget: variable     Budget: $0-200/mo          │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

### Profile → Combo Match Matrix

```
                     │Solo  │Start │Growth│Enter │Rsrch │OSS
                     │Hacker│up    │      │prise │/ML   │
  ───────────────────┼──────┼──────┼──────┼──────┼──────┼─────
  Combo 1            │      │      │      │      │      │
  Deep Agents +      │  ░░  │  ██  │  ████│  ████│  ██  │  ░░
  Paperclip Fleet    │      │      │      │      │      │
  ───────────────────┼──────┼──────┼──────┼──────┼──────┼─────
  Combo 2            │      │      │      │      │      │
  Spotify Verify +   │  ██  │  ██  │  ███ │  ███ │  ████│  ██
  Karpathy Ratchet   │      │      │      │      │      │
  ───────────────────┼──────┼──────┼──────┼──────┼──────┼─────
  Combo 3            │      │      │      │      │      │
  QMD Knowledge +    │  ░░  │  ██  │  ████│  ████│  ██  │  ███
  OpenAI Harness     │      │      │      │      │      │
  ───────────────────┼──────┼──────┼──────┼──────┼──────┼─────
  Combo 4            │      │      │      │      │      │
  Stripe Tools +     │  ░░  │  ░░  │  ██  │  ████│  ░░  │  ░░
  Ramp Warm Pools    │      │      │      │      │      │
  ───────────────────┼──────┼──────┼──────┼──────┼──────┼─────
  Combo 5            │      │      │      │      │      │
  Copilot Native +   │  ████│  ████│  ████│  ███ │  ░░  │  ████
  Background Agents  │      │      │      │      │      │
  ───────────────────┼──────┼──────┼──────┼──────┼──────┼─────
  Combo 6            │      │      │      │      │      │
  Linear + Paperclip │  ░░  │  ██  │  ████│  ████│  ░░  │  ░░
  + Full SDLC        │      │      │      │      │      │

  Scale: ████ ideal fit  ███ strong  ██ partial  ░░ overkill or insufficient
```

---

### Recommended Stack Per Profile

#### Solo Hacker

```
  You need: Maximum output, minimal setup, cost under $50/mo

  ┌───────────────────────────────────────────────────┐
  │  PRIMARY: Combo 5 — Copilot Native + Background   │
  │                                                     │
  │  GitHub Issues ──▶ Copilot Agent ──▶ PR             │
  │       │                                             │
  │       └──(complex)──▶ Claude Code / Codex ──▶ PR   │
  │                                                     │
  │  ADD: Combo 2 (Ratchet) for prompt optimization    │
  │  SKIP: Fleet management, dashboards, warm pools    │
  └───────────────────────────────────────────────────┘

  Topology: One-Shot Tree (simple) + Ratchet (optimization)
  Why: No coordination overhead. Each task = one agent = one PR.
  Cost: Copilot Pro ($19) + API calls (~$30/mo)
```

#### Startup (5-20 engineers)

```
  You need: Speed + basic governance, CI debug, PR review

  ┌───────────────────────────────────────────────────┐
  │  PRIMARY: Combo 5 — Copilot + Background Agents   │
  │  ADD: Combo 3 — Knowledge + Harness               │
  │                                                     │
  │  GitHub Issues ──▶ Copilot ──▶ PR (simple)         │
  │       │                                             │
  │       └──▶ CI Debugger (Pipeline topology)          │
  │       └──▶ PR Reviewer (Pipeline topology)          │
  │       └──▶ Security Patcher (One-Shot Tree)         │
  │                                                     │
  │  AGENTS.md + QMD search = agents find context       │
  │  SKIP: Fleet dashboards, warm pools, org chart      │
  └───────────────────────────────────────────────────┘

  Topology: Pipeline (CI/review) + One-Shot Tree (patches)
  Why: Pipeline catches quality issues. Tree handles volume.
  Cost: ~$200-500/mo in API calls
```

#### Growth (20-100 engineers)

```
  You need: Governance, cost control, multi-repo, observability

  ┌───────────────────────────────────────────────────┐
  │  PRIMARY: Combo 1 — Deep Agents + Paperclip       │
  │  ADD: Combo 3 — Knowledge + Harness               │
  │  ADD: Combo 5 — Copilot as first tier              │
  │  ADD: Combo 6 — Linear integration for full SDLC   │
  │                                                     │
  │  Linear ──▶ Paperclip (budget + locks) ──▶ Agents  │
  │                    │                                │
  │        ┌───────────┼───────────┐                    │
  │        ▼           ▼           ▼                    │
  │    CI Debug    PR Review   Feature Build            │
  │   (Pipeline)  (Pipeline)  (Org Chart)               │
  │        │           │           │                    │
  │        └───────────┼───────────┘                    │
  │                    ▼                                │
  │              Dashboard (React)                      │
  │              Audit trail (SQLite)                   │
  │              Budget reports ($X/team/month)          │
  └───────────────────────────────────────────────────┘

  Topology: Org Chart (governance) + Pipeline (quality)
  Why: Budget controls prevent runaway. Dashboard = visibility.
  Cost: ~$2-5K/mo
```

#### Enterprise (100+ engineers)

```
  You need: Compliance, audit, blast radius isolation, SSO

  ┌───────────────────────────────────────────────────┐
  │  ALL COMBOS — Full Mega-Topology                   │
  │                                                     │
  │  Combo 4: Stripe Tools + Warm Pools (latency)      │
  │  Combo 1: Deep Agents + Fleet (orchestration)      │
  │  Combo 3: Knowledge + Harness (context)            │
  │  Combo 6: Full SDLC pipeline                       │
  │  Combo 5: Copilot as simple-task tier               │
  │                                                     │
  │  ADDITIONAL REQUIREMENTS:                           │
  │  • Per-team budget allocation (Org Chart topology)  │
  │  • SOC2 audit trail on every agent action           │
  │  • Approval gates for sensitive repos               │
  │  • Role-based tool access (per-dir .minions.toml)   │
  │  • Incident response SLA integration                │
  └───────────────────────────────────────────────────┘

  Topology: Full Mega-Topology (see § 3)
  Why: Compliance requires every layer.
  Cost: $20-50K/mo
```

#### Research / ML

```
  You need: Run experiments forever, single-metric optimization

  ┌───────────────────────────────────────────────────┐
  │  PRIMARY: Combo 2 — Verified Ratchet               │
  │                                                     │
  │  ┌──────────────── RATCHET LOOP ──────────────┐    │
  │  │  Read → Modify → Commit → Run → Evaluate   │    │
  │  │       ↑                          │          │    │
  │  │       │    ┌─────────────────────┘          │    │
  │  │       │    ▼                                │    │
  │  │       │  Improved? ──yes──▶ KEEP (advance)  │    │
  │  │       │      │                              │    │
  │  │       └──────┘ no ──▶ RESET (git revert)    │    │
  │  └─────────────────────────────────────────────┘    │
  │                                                     │
  │  + Spotify verification for quality gates            │
  │  + QMD for paper/doc retrieval                       │
  │  SKIP: Fleet management, SDLC, warm pools           │
  └───────────────────────────────────────────────────┘

  Topology: Ratchet (primary) + Pipeline (verification)
  Why: Clear metric + infinite patience = overnight results.
  Cost: Variable — set hard budget cap per experiment
```

#### Open Source Maintainer

```
  You need: Triage PRs, auto-fix CI, security patches, be nice

  ┌───────────────────────────────────────────────────┐
  │  PRIMARY: Combo 5 — Copilot + Background           │
  │  ADD: Combo 3 — Knowledge retrieval                 │
  │                                                     │
  │  External PR ──▶ Copilot Review ──▶ Comment         │
  │  Dependabot ───▶ Security Patcher ──▶ Auto-PR       │
  │  CI Failure ───▶ CI Debugger ──▶ Fix commit         │
  │                                                     │
  │  CRITICAL CONSTRAINTS:                              │
  │  • Read-only by default (never push to contributor  │
  │    branches without permission)                      │
  │  • Friendly tone in all comments                    │
  │  • Label-based opt-in (contributors choose)         │
  │  SKIP: Fleet management, budgets, warm pools        │
  └───────────────────────────────────────────────────┘

  Topology: One-Shot Tree (triage) + Pipeline (review)
  Why: Volume handling + safety. Never break contributor trust.
  Cost: Copilot Pro + ~$50/mo API
```

---

### Decision Flowchart

```
  START: What's your primary constraint?
    │
    ├── "Budget" ──▶ Solo Hacker stack (Combo 5 + Ratchet)
    │
    ├── "Speed" ──▶ Startup stack (Combo 5 + 3)
    │
    ├── "Governance" ──▶ How many engineers?
    │       │
    │       ├── <100 ──▶ Growth stack (Combo 1 + 3 + 5 + 6)
    │       │
    │       └── >100 ──▶ Enterprise stack (Full Mega-Topology)
    │
    ├── "Optimization" ──▶ Research stack (Combo 2 + QMD)
    │
    └── "Community" ──▶ OSS stack (Combo 5 + 3, read-only defaults)
```

---

## Sources

### Original Sources (Core Research)

- [Stripe Minions Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) — One-shot agents, 1,300 PRs/week, max 2 retries
- [Stripe Minions Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2) — ~500 MCP tools (Toolshed), per-dir rules, devbox isolation
- [Spotify Honk Part 1](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) — K8s containers, verification loops
- [Spotify Honk Part 2](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2) — Context engineering
- [Spotify Honk Part 3](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3) — LLM judge, 25% veto rate, false positive findings
- [Ramp Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent) — Warm pools, Modal sandboxes, multiplayer sessions
- [OpenAI Harness Engineering](https://openai.com/index/harness-engineering/) — AGENTS.md, layered architecture, background GC agents
- [OpenAI Unlocking the Codex Harness](https://openai.com/index/unlocking-the-codex-harness/) — App server, per-worktree observability
- [OpenAI Unrolling the Codex Agent Loop](https://openai.com/index/unrolling-the-codex-agent-loop/) — Agent loop internals
- [Deep Agents (LangChain)](https://github.com/langchain-ai/deepagents) — Middleware pipelines, sub-agents, context summarization
- [Open SWE (LangChain)](https://github.com/langchain-ai/open-swe) — Open-source framework for internal coding agents
- [LangChain Harness Engineering Blog](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/) — 52.8→66.5% Terminal Bench, harness-only gains
- [Harrison Chase @ Sequoia](https://sequoiacap.com/podcast/context-engineering-our-way-to-long-horizon-agents-langchains-harrison-chase/) — Context vs harness engineering distinction
- [Karpathy Autoresearch](https://github.com/karpathy/autoresearch) — NEVER STOP loop, git checkpoints, convergence
- [QMD (Tobi Lutke)](https://github.com/tobi/qmd) — BM25 + vector + LLM reranking, MCP server
- [Paperclip AI](https://github.com/paperclipai/paperclip) — Fleet orchestration, budgets, task locks, heartbeats, React dashboard
- [GitHub Copilot Coding Agent](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/) — Issue-to-PR, CI repair, custom agents
- [Copilot Agentic Code Review](https://github.blog/changelog/2026-03-05-copilot-code-review-now-runs-on-an-agentic-architecture/) — March 2026 GA
- [Anthropic 2026 Agentic Coding Trends Report](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf)

### Research Papers

- [AgentConductor: Topology Evolution for Multi-Agent Code Generation (arXiv 2602.17100)](https://huggingface.co/papers/2602.17100) — RL-optimized dynamic DAG topologies, +14.6% on APPS, 68% token cost reduction
- [More Agents Is All You Need (Google/MIT, arXiv 2402.05120)](https://arxiv.org/abs/2402.05120) — Multi-agent scaling limits, accuracy threshold at 45%
- [Gorilla: LLM Connected with Massive APIs (Microsoft, arXiv 2305.15334)](https://arxiv.org/abs/2305.15334) — Tool space performance degradation beyond ~20 tools
- [Agent-as-a-Judge Survey (arXiv 2601.05111)](https://arxiv.org/pdf/2601.05111) — Agentic evaluation landscape. LLM-as-Judge alone detects ~45% of errors; combined with deterministic tools reaches 94%
- [LLM-as-a-Judge for Software Engineering (arXiv 2510.24367)](https://arxiv.org/pdf/2510.24367) — Code-specific evaluation patterns

### New Sources (March 2026 Update)

- [Spotify Honk at QCon London 2026 (InfoQ)](https://www.infoq.com/news/2026/03/spotify-honk-rewrite/) — 1,000 PRs/10 days, runtime separation, Slack integration, standardization strategy
- [Spotify Devs Haven't Written Code Since December (TechCrunch)](https://techcrunch.com/2026/02/12/spotify-says-its-best-developers-havent-written-a-line-of-code-since-december-thanks-to-ai/) — CEO confirmation
- [Stripe Minions Architecture (ByteByteGo)](https://blog.bytebytego.com/p/how-stripes-minions-ship-1300-prs) — Detailed architecture breakdown
- [Stripe Minions Architecture (SitePoint)](https://www.sitepoint.com/stripe-minions-architecture-explained/) — Devbox warm pool, Goose fork
- [OpenAI Symphony Framework (GitHub)](https://github.com/openai/symphony) — Elixir-based agent orchestration, open-sourced Mar 2026
- [Martin Fowler / Birgitta Böckeler: Harness Engineering](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html) — Three categories: context engineering, architectural constraints, garbage collection. 5 months of serious work, not quick fixes
- [Open SWE Launch (LangChain Blog, Mar 17)](https://blog.langchain.com/open-swe-an-open-source-framework-for-internal-coding-agents/) — ~15 curated tools, Claude Opus 4 default
- [Deep Agents Formal Release (MarkTechPost, Mar 15)](https://www.marktechpost.com/2026/03/15/langchain-releases-deep-agents-a-structured-runtime-for-planning-memory-and-context-isolation-in-multi-step-ai-agents/) — Structured runtime for multi-step agents
- [Karpathy Autoresearch: Massively Collaborative Vision (Fortune, Mar 17)](https://fortune.com/2026/03/17/andrej-karpathy-loop-autonomous-ai-agents-future/) — 700 experiments/2 days, SETI@home-style agent swarms
- [Ryan Carson: Code Factory + $2M Seed (Freeplay Blog)](https://freeplay.ai/blog/real-talk-on-building-coding-agents-a-conversation-with-amp-s-builder-in-residence-ryan-carson) — Untangle built solo with agents, Amp Builder-in-Residence
- [Paperclip: Zero-Human Companies (paperclip.ing)](https://paperclip.ing/) — 14.2K stars in first week, Clipmart marketplace coming
- [VS Code Multi-Agent Orchestration (Visual Studio Magazine)](https://visualstudiomagazine.com/articles/2026/02/09/hands-on-with-new-multi-agent-orchestration-in-vs-code.aspx) — VS Code 1.109 multi-agent features
- [The Emerging Harness Engineering Playbook (Ignorance.ai)](https://www.ignorance.ai/p/the-emerging-harness-engineering) — Third-party analysis
- [Agentic Coding Trends Implementation Guide (Hugging Face)](https://huggingface.co/blog/Svngoku/agentic-coding-trends-2026) — Technical patterns reference
- [Azure AI Agent Design Patterns (Microsoft Learn)](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns) — Enterprise orchestration patterns
- [Fabro: Dark Software Factory (GitHub)](https://github.com/fabro-sh/fabro) — Deterministic workflow graphs, CSS-like model routing, Daytona sandboxes
- [GSD 2: Spec-Driven Session Controller (GitHub)](https://github.com/gsd-build/gsd-2) — Milestone→Slice→Task hierarchy, deterministic state machine, fresh 200K context per task, crash recovery, 20+ LLM providers
- [Slate/RLM: Swarm-Native Agents (@realmcore_)](https://x.com/realmcore_/status/2032146316730778004) — Code-environment orchestration, hive mind subagent threads, auto model selection
- [Executor: Code-as-Tool-Calling (GitHub)](https://github.com/RhysSullivan/executor) — Agents write TypeScript to discover tools, MCP bridge, QuickJS/SES/Deno sandboxes
- [AutoResearchClaw: Full Research Pipeline (GitHub)](https://github.com/aiming-lab/AutoResearchClaw) — 23-stage idea-to-paper pipeline, MetaClaw cross-run learning (+18.3%)
- [pi-autoresearch: Productized Extension (GitHub)](https://github.com/davebcn87/pi-autoresearch) — Visual dashboard, persistent JSONL state, quality gates
- [Shopify Liquid PR #2056 (Lütke autoresearch loop)](https://github.com/Shopify/liquid/pull/2056) — 53% faster parsing via ~120 autonomous iterations
