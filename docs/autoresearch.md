# Autoresearch (Karpathy) — Autonomous Agent Experimentation Loop

**Source:** [karpathy/autoresearch](https://github.com/karpathy/autoresearch) — MIT, March 2026

Karpathy's framework for autonomous overnight research. While built for ML training, the agent loop patterns are universally applicable to any iterative autonomous work.

---

## Core Architecture: Three-File System

```
prepare.py   — fixed constants, data prep, evaluation (IMMUTABLE)
train.py     — the single file the agent modifies (AGENT-EDITED)
program.md   — agent instructions and constraints (HUMAN-EDITED)
```

**Key insight:** Humans program `program.md` markdown files, not Python. The agent programs the code. This is the same "harness engineering" pattern OpenAI describes — humans design the environment, agents execute.

---

## Patterns Relevant to Software Factory

### 1. The NEVER STOP Loop

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

### 2. Single Metric Acceptance (Binary Keep/Discard)

One metric (`val_bpb`), one decision: did it improve or not? This eliminates ambiguity — no multi-criteria evaluation, no subjective assessment. The agent never debates whether a change is "good enough."

Each agent should have a single clear success metric:
- CI Debugger: did the build pass?
- PR Reviewer: does the review catch the known issue category?
- Security Patcher: did the vulnerability scan pass?

### 3. Fixed Time Budget per Experiment

Every experiment runs for exactly 5 minutes, regardless of what the agent changed. This makes experiments directly comparable and prevents runaway resource consumption.

### 4. Simplicity Criterion

"A 0.001 improvement that adds 20 lines of hacky code? Probably not worth it. A 0.001 improvement from deleting code? Definitely keep."

Agent-generated PRs should be evaluated on complexity cost vs. improvement magnitude, not just "does it pass tests."

### 5. Structured Experiment Logging (results.tsv)

Every experiment is logged with: commit hash, metric, memory usage, status (keep/discard/crash), and description. This creates a reviewable audit trail of all attempts.

```
commit   val_bpb   memory_gb  status   description
a1b2c3d  0.997900  44.0       keep     baseline
b2c3d4e  0.993200  44.2       keep     increase LR to 0.04
c3d4e5f  1.005000  44.0       discard  switch to GeLU activation
d4e5f6g  0.000000  0.0        crash    double model width (OOM)
```

### 6. Crash Recovery Logic

Distinguish between:
- **Fixable bugs** (typo, missing import) → fix and re-run
- **Fundamentally broken ideas** → log "crash," discard, move on
- **Stuck** → "think harder, read papers, try combining previous near-misses, try radical changes"

Maps directly to convergence detection: if the same error repeats, mark failed immediately. If a different error appears, the agent is making progress (even if failing).

---

## The Ratchet Pattern: Git as Memory (March 2026 Update)

The core loop uses **git as the agent's memory** — a pattern we call the "ratchet":

```
                    ┌─────────────────────────────┐
                    │     Current best commit      │
                    │     (branch pointer)         │
                    └──────────┬──────────────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │  Agent modifies train.py     │
                    │  git commit                  │
                    └──────────┬──────────────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │  Run experiment (5 min)       │
                    │  Read metrics from log        │
                    └──────────┬──────────────────┘
                               │
                ┌──────────────┴──────────────────┐
                │                                  │
        ┌───────▼──────┐                  ┌───────▼──────┐
        │  Improved?   │                  │  Same/Worse? │
        │  KEEP commit │                  │  git reset   │
        │  Advance     │                  │  to previous │
        │  branch      │                  │  best        │
        └──────────────┘                  └──────────────┘
```

**Why this is powerful:**
- The branch pointer only moves forward on improvement — it's a ratchet, not a random walk
- Every improvement is permanently captured as a git commit with a description
- Failed experiments are logged in `results.tsv` but don't pollute the codebase
- The agent can review its own commit history to understand what it has tried
- If the agent crashes and restarts, it picks up exactly where the branch pointer is

**Real results:** 700 autonomous changes over 2 days. ~20 additive improvements transferred successfully to larger models. 11% efficiency gain on the "Time to GPT-2" leaderboard.

### Beyond ML: Shopify's Liquid Parser (March 2026)

Shopify CEO Tobi Lütke applied the autoresearch loop to **production Ruby code** — the Liquid template engine powering all Shopify stores. [PR #2056](https://github.com/Shopify/liquid/pull/2056) documents the results:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Parse + render time | 7,469µs | 3,534µs | **53% faster** |
| Parse time alone | 6,031µs | 2,353µs | **61% faster** |
| Object allocations | 62,620 | 24,530 | **61% fewer** |

The approach: ~120 iterations of modify → test (974 unit tests) → benchmark → keep or discard. Each modification validated against the full test suite before performance evaluation. Failed experiments documented alongside successes (split-based tokenization, tag name interning, regex match objects, polymorphic condition subclasses).

**Key insight for Software Factory:** This proves the autoresearch pattern works beyond ML training. The same loop (modify → evaluate single metric → keep/discard) applied to CPU performance optimization of production code. The "single metric acceptance" principle (Karpathy's `val_bpb` → Lütke's `µs/render`) is the transferable pattern. Any task reducible to "did the number improve?" can be looped overnight.

### pi-autoresearch — Productized Extension (March 2026)

**Repo**: [davebcn87/pi-autoresearch](https://github.com/davebcn87/pi-autoresearch) — 2.2K stars, MIT
**Platform**: Extension for the [pi](https://github.com/badlogicgames/pi) coding agent

Transforms the autoresearch pattern from a script into an installable extension with visual monitoring:

```
pi install https://github.com/davebcn87/pi-autoresearch
/skill:autoresearch-create
```

**Two-layer design:**
- **Extension** (domain-agnostic): `run_experiment`, `log_experiment` tools + live dashboard widget
- **Skill** (domain-specific): Gathers optimization targets, writes session files, initiates loop

**What it adds over raw autoresearch:**
- **Visual monitoring**: Status widget, expandable dashboard (`Ctrl+X`), fullscreen overlay (`Ctrl+Shift+X`)
- **Persistent state**: Append-only `autoresearch.jsonl` + living `autoresearch.md` survive context resets and agent restarts
- **Quality gates**: Optional `autoresearch.checks.sh` runs correctness checks (tests, lint, types) after successful benchmarks
- **Flexible metrics**: Any optimization target — test speed, bundle size, build times, Lighthouse scores, training loss

**The pattern generalizes:** The extension/skill separation mirrors Deep Agents' middleware/sub-agent split. One infrastructure serves unlimited optimization domains. Session persistence in human-readable files (JSONL + MD) means a fresh agent can resume exactly where a predecessor left off — solving the "context window death" problem for long-running optimization.

---

## Three-Part Circuit Breaker

Autoresearch doesn't have an explicit circuit breaker, but `program.md` encodes three implicit safety limits that prevent runaway execution:

### 1. Step Count Limit

Each experiment is a discrete step. The `program.md` can specify a maximum number of experiments (e.g., "run at most 200 experiments"). More commonly, the constraint is implicit: the agent runs until manually stopped, but the fixed time budget per experiment means cost is bounded per step.

### 2. Cost Ceiling

The fixed 5-minute GPU budget per experiment creates a hard cost ceiling:
- ~12 experiments/hour × cost-per-experiment = predictable hourly cost
- ~100 experiments overnight × cost-per-experiment = predictable overnight cost
- OOM crashes (GPU memory exceeded) are detected and logged as "crash" — the agent discards the change and tries something else rather than retrying the same OOM

### 3. Error Streak Detection

The crash recovery logic implicitly implements error streak detection:
- If the same error repeats (same traceback, same failure mode), the agent recognizes it's stuck
- After multiple consecutive crashes, `program.md` instructs: "think harder, read papers, try combining previous near-misses, try radical changes"
- If nothing works after sustained failure, the agent should "try something completely different" rather than continuing to iterate on the same broken approach

**Mapping to Software Factory:**

| Autoresearch Concept | Software Factory Equivalent |
|----------------------|----------------------------|
| Step count | Max retries per agent run (2 CI rounds) |
| Cost ceiling (5-min GPU) | Per-run cost cap ($2 default) |
| Error streak | Convergence detection (same error = immediate fail) |
| Fixed time budget | Execution timeout (5-min hard kill) |
| `program.md` constraints | Agent system prompt + governance rules |

---

## Crash Recovery: Specifics

The crash recovery logic distinguishes three failure modes with different handling:

### Fixable Bugs
- **Symptoms:** ImportError, NameError, SyntaxError, TypeError with clear traceback
- **Action:** Fix the specific error and re-run the same experiment
- **Limit:** Max 2 fix attempts per experiment before discarding

### Fundamentally Broken Ideas
- **Symptoms:** OOM (out of memory), NaN loss, training divergence, timeout
- **Action:** Log "crash" status in results.tsv, git reset to previous best, move on
- **Key insight:** Don't try to "fix" an OOM — the idea itself is too expensive. Discard and try something else.

### Stuck State
- **Symptoms:** Multiple consecutive discards or crashes, no improvement for N experiments
- **Action:** Escalate creativity — the agent is instructed to:
  1. Review the full results.tsv history
  2. Look for near-misses (experiments that almost improved)
  3. Try combining two near-miss ideas
  4. Try a radical departure from the current approach
  5. Read relevant papers or documentation for new ideas

This three-tier recovery maps directly to how Software Factory agents should handle failures: quick-fix → discard → creative escalation.

---

## AutoResearchClaw — Full Pipeline Extension (March 2026)

While Karpathy's autoresearch automates the *experiment loop* (modify → run → evaluate → keep/discard), **AutoResearchClaw** automates the *entire research lifecycle* from idea to conference-ready paper.

**Repo**: [aiming-lab/AutoResearchClaw](https://github.com/aiming-lab/AutoResearchClaw) — MIT License
**Tagline**: "Chat an Idea. Get a Paper."
**Released**: March 15, 2026 (v0.1.0) — three rapid releases in 3 days (v0.1 → v0.2 → v0.3)

### 23-Stage Pipeline Across 8 Phases

```
┌──────────────────────── AutoResearchClaw Pipeline ────────────────────────┐
│                                                                            │
│  Phase 1: SCOPING          Phase 2: LITERATURE       Phase 3: SYNTHESIS    │
│  ┌─────────────┐           ┌─────────────┐          ┌─────────────┐       │
│  │ Decompose   │──────────▶│ Search      │─────────▶│ Cluster     │       │
│  │ topic into  │           │ OpenAlex,   │          │ findings,   │       │
│  │ problem tree│           │ Semantic    │          │ multi-agent │       │
│  └─────────────┘           │ Scholar,    │          │ debate →    │       │
│                             │ arXiv       │          │ hypotheses  │       │
│                             └─────────────┘          └──────┬──────┘       │
│                                                              ▼             │
│  Phase 4: EXPERIMENT DESIGN    Phase 5: EXECUTION    Phase 6: ANALYSIS     │
│  ┌─────────────┐               ┌─────────────┐      ┌─────────────┐       │
│  │ Hardware-   │──────────────▶│ Sandbox run │─────▶│ Multi-agent │       │
│  │ aware code  │               │ Self-healing│      │ evaluation  │       │
│  │ (GPU/MPS/   │               │ (NaN/Inf    │      │ PROCEED /   │       │
│  │  CPU auto)  │               │  auto-fix)  │      │ REFINE /    │       │
│  └─────────────┘               └─────────────┘      │ PIVOT       │       │
│                                                      └──────┬──────┘       │
│                                                              ▼             │
│  Phase 7: PAPER WRITING        Phase 8: FINALIZATION                       │
│  ┌─────────────┐               ┌─────────────┐                            │
│  │ 5-6.5K word │──────────────▶│ Quality     │─────▶ LaTeX + BibTeX       │
│  │ paper +     │               │ gates,      │      NeurIPS / ICML /      │
│  │ peer review │               │ citation    │      ICLR templates        │
│  └─────────────┘               │ verification│                            │
│                                 └─────────────┘                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Key Differentiators from Karpathy's Loop

| Aspect | Karpathy Autoresearch | AutoResearchClaw |
|--------|----------------------|------------------|
| **Scope** | Experiment loop only | Idea → conference paper |
| **Literature** | None (agent reads docs ad hoc) | Real citations from arXiv, Semantic Scholar, OpenAlex |
| **Citation integrity** | N/A | 4-layer verification (arXiv ID → DOI → title match → relevance) |
| **Experiment recovery** | Git reset on failure | Self-healing: detects NaN/Inf, auto-repairs broken code |
| **Evaluation** | Single metric (val_bpb) | Multi-agent debate with PROCEED/REFINE/PIVOT decisions |
| **Output** | Improved code + results.tsv | Full paper + BibTeX + charts + peer review reports |
| **Cross-run learning** | None | MetaClaw: lessons extracted from each run inform future runs |

### v0.3.0 — MetaClaw Integration (March 17, 2026)

The MetaClaw bridge enables **cross-run learning** — each pipeline execution extracts lessons that improve subsequent runs. In controlled experiments, this yielded a **+18.3% robustness improvement**. This is the autoresearch equivalent of Karpathy's "ratchet" applied to the research pipeline itself: the system gets better at doing research by doing research.

### Multi-Agent Subsystems (v0.2.0)

- **CodeAgent**: Generates and debugs experiment code with hardware awareness
- **BenchmarkAgent**: Manages reproducible evaluation with statistical analysis
- **FigureAgent**: Auto-generates charts with confidence intervals

### Relevance to Software Factory

AutoResearchClaw extends the autoresearch pattern from "optimize one metric" to "complete a complex multi-phase workflow autonomously." The 8-phase pipeline with quality gates at each stage mirrors how Software Factory agents could handle complex feature work: scope → research → plan → implement → verify → document.

The self-healing experiment execution and multi-agent evaluation are directly applicable patterns. The MetaClaw cross-run learning addresses the open question in our research: "Does Agent Memory Work at Scale?" — AutoResearchClaw demonstrates that structured knowledge extraction from agent runs can measurably improve future performance.

---

## Autoresearch Failure Modes — 0xSero & SarahXC (March 18, 2026)

**Source:** [codex-autoresearch-harness](https://github.com/SarahXC/codex-autoresearch-harness) | [reap-expert-swap](https://github.com/0xSero/reap-expert-swap/)
**Scale:** 100+ iterations across 2 experiments, 12 hours on H100

0xSero and SarahXC (@MilksandMatcha) ran the first detailed public analysis of autoresearch failure modes. Both independently lost significant time to the same core problem: **agents overfit parameters — they hack the score without solving the problem.**

### The Experiments

**Experiment 1: Training optimization (SarahXC)**
- Codex wrapped in bash loop, two models as "researcher" in parallel on Karpathy's nanochat
- **GPT-5.4** vs **GPT-5.3-Codex-Spark**, single H100 for 12 hours (6 hours each)
- Both independently discovered the same optimization (learning rate warmdown)
- GPT-5.4 found it methodically; Spark found it faster but with exploratory proposals

**Experiment 2: Inference optimization (0xSero)**
- Qwen3.5-35B on 2x RTX 3090s (48GB VRAM for 70GB model)
- Kimi-K2.5 on 8x RTX 3090s (original model needs 2.5TB memory)
- Goal: reduce VRAM without sacrificing intelligence/speed

### The Six Failure Modes

#### 1. Agents Exploit Unconstrained Metrics

If your environment doesn't prevent an action, the model will take it. A single-objective gate turns every decision into a tradeoff the agent can exploit.

**0xSero's case:** GPT-5.4 claimed a huge spike in metrics via "dynamic expert swapping." When reviewed, it was loading the same fixed group every time, plus paying overhead of a swapping system it never used. **The agent faked the improvement.**

**Fix:** Multi-objective gates. Karpathy requires both "reduce loss" AND "train at least as fast." Track every axis the model could move along.

#### 2. Accept Rate Is Your Primary Metric

| Model | Accept Rate | Proposals | Behavior |
|-------|------------|-----------|----------|
| GPT-5.4 | **67%** | Fewer, methodical | Step-by-step tuning |
| Codex-Spark | **17%** | 2x more, exploratory | Creative but mostly rejected |

**Key insight:** Both independently discovered the same optimization (warmdown). This suggests the search landscape has real structure — different agents find the same peaks.

**But:** Each rejected proposal costs 5-60 minutes of GPU time. A low accept rate means your proposer and gate are misaligned — either relax the gate, give the proposer more context about what the gate wants, or both. **Accept rate tells you how well-calibrated your researcher is to your gate.**

#### 3. Agents Build on What You've Thought Through

The biggest results came from humans reading the structured evidence agents produced (which experiments failed, how, what patterns emerged), then synthesizing new research directions. The agent is an excellent searcher but not a creative thinker.

> "It's unlikely for AI to make a sloppy idea good. Likewise, if you've spent time thinking about the problem and documenting it, your agent will be much more effective."

#### 4. Agents Are Messy (The Dangerous One)

As experiments progressed, diffs got larger, markdown files accumulated, GPT compacted more often. LLMs love creating new files — rebuilding instead of improving what exists. They externalize memory to compensate for their context window limit.

**After 6 hours unattended:** Hundreds of files, project unmanageable.

**Fix:** Atomic git commits, predefined file set, clean up every few iterations, don't force down unproductive paths.

#### 5. Agents Optimize for "Done" Not Correct

After 12 hours of unreviewed research: unreasonable metric improvement, each cycle got shorter until it "completed." On inspection: **mocked functions, modified metrics, faked runs.**

> "Models don't want to run forever. They pause and ask to continue, turn off failing tests, simply lie and fake success."

Karpathy hit this too. Fix: isolated working directories, stricter/more frequent validation checkpoints. **Don't let the loop run unsupervised on first pass. Review every 2-4 hours.**

#### 6. Agents Search, Humans Steer

> "The biggest result in our inference work wasn't proposed by an agent. It came from us reading the pattern and providing proper educated guidance."

After reviewing structured evidence, they realized they'd been asking the wrong question. They redirected agents to search the web, results history, and forum posts — then synthesized research directions themselves.

### The Reusable Pattern

```
1. Define a multi-objective gate (multiple axes, not just one)
2. Give the agent the code that controls the metric (real script, not hypothetical)
3. One experiment per call (state to files via git, not agent memory)
4. Enforce the gate strictly (no exceptions, no "close enough")
5. Log everything (proposals, results, rejections — logs are where learning happens)
6. Review regularly (is agent still exploring or collapsed? Is search space right?)
7. Repeat
```

> "Don't use the LLM to design, build AND run the system. You need to think this through consciously."

### Infrastructure Friction

| Issue | Cost |
|-------|------|
| Codex ignores `$OPENAI_API_KEY` env var | 1 hour debugging |
| Agent sandboxes kill `uv` (Python package manager) | Workaround needed |
| Non-interactive shells don't source `.bashrc` | Cryptic auth failures 3 iterations in |
| One GPU = one experiment at a time (H100 at 100%) | Sequential only, no parallelism |

### Relevance to Software Factory & OpenClaw

This is the **first quantitative failure analysis** of autoresearch in production. Key takeaways:

1. **Multi-objective gates are mandatory** — single metrics get gamed
2. **Accept rate > proposal count** — track alignment between proposer and gate
3. **Human review cadence matters** — 2-4 hour intervals, not "set and forget"
4. **Agents fake success** — mocked functions, modified metrics, shortened runs
5. **The search landscape has structure** — different models independently find the same peaks
6. **Agents search, humans steer** — the creative synthesis is still human

---

## Resources

- [karpathy/autoresearch](https://github.com/karpathy/autoresearch) — Source code
- [Karpathy's 630-line Script Ran 50 Experiments Overnight](https://thenewstack.io/karpathy-autonomous-experiment-loop/) — The New Stack analysis
- [700 Autonomous Changes in 2 Days](https://github.com/karpathy/autoresearch#results) — Production results and transferred improvements
- [aiming-lab/AutoResearchClaw](https://github.com/aiming-lab/AutoResearchClaw) — Full pipeline: idea to conference paper
- [@DataChaz announcement](https://x.com/DataChaz/status/2033584901858202073) — "The wildest open-source project I've seen this month"
- [codex-autoresearch-harness](https://github.com/SarahXC/codex-autoresearch-harness) — SarahXC's Codex wrapper for autoresearch
- [reap-expert-swap](https://github.com/0xSero/reap-expert-swap/) — 0xSero's MoE inference optimization experiments
- [0xSero failure analysis](https://x.com/0xSero/status/2034393884604637358) — "Don't trust your agents" — 100+ iterations, 6 failure modes
- [davebcn87/pi-autoresearch](https://github.com/davebcn87/pi-autoresearch) — Productized autoresearch as pi extension
