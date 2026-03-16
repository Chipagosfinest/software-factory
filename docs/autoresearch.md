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

## Resources

- [karpathy/autoresearch](https://github.com/karpathy/autoresearch) — Source code
- [Karpathy's 630-line Script Ran 50 Experiments Overnight](https://thenewstack.io/karpathy-autonomous-experiment-loop/) — The New Stack analysis
- [700 Autonomous Changes in 2 Days](https://github.com/karpathy/autoresearch#results) — Production results and transferred improvements
