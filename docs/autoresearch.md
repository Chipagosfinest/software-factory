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

## Resources

- [karpathy/autoresearch](https://github.com/karpathy/autoresearch) — Source code
