# codex-planr: Repository-Local Planning for AI Agents

> Source: [regenrek/codex-planr](https://github.com/regenrek/codex-planr)
> License: MIT | Language: Python 98.6%, Shell 1.4%

---

## TL;DR

codex-planr is a portable, repo-local planning system that replaces chat-state memory with explicit, version-controlled plans and evidence-based reviews. It forces agents to plan before executing, track honest status, and review against actual Git diffs — not memory-based checklists.

---

## Core Philosophy

Three anti-patterns it solves:

```
Problem 1: "Agent forgot what it was doing"
  → Solution: Explicit plan files in .planr/, not chat memory

Problem 2: "Agent says it's done but it isn't"
  → Solution: current.json tracks honest status, not optimistic checklists

Problem 3: "Review is based on what the agent claims"
  → Solution: Review uses Git diffs and test evidence, not agent self-report
```

Design bias: "no compact shims, quiet fallbacks, or unnecessary guards" — explicit and transparent over clever and implicit.

---

## Three-Step Workflow

```
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │  $planr-plan │────▶│  $planr-fix  │────▶│$planr-review │
  │              │     │              │     │              │
  │ Define scope │     │ Execute work │     │ Audit results│
  │ Ownership    │     │ Update status│     │ vs plan      │
  │ Phases       │     │ Track blocks │     │ vs diffs     │
  │ Verification │     │              │     │ vs tests     │
  │ Acceptance   │     │ current.json │     │              │
  └──────────────┘     └──────────────┘     └──────────────┘
                                                    │
                                            ┌───────┴───────┐
                                            │ $planr-status │
                                            │ $planr-summary│
                                            └───────────────┘
```

### Phase 1: `$planr-plan`
- Define scope boundaries
- Establish ownership structure
- Break into phases
- Set verification criteria
- Define acceptance standards

### Phase 2: `$planr-fix`
- Execute implementation work
- Continuously update `.planr/status/current.json`
- Record honest progress and blockers
- No optimistic reporting

### Phase 3: `$planr-review`
- Audit deliverables against original plan
- Examine actual code changes (Git diffs)
- Check test evidence
- Path-scoped Git evidence > memory or optimistic checklists

### Optional Skills
- `$planr-status` — smallest honest assessment of current scope
- `$planr-summary` — recap changes, working components, remaining blockers

---

## File Structure

```
.planr/
├── project/
│   ├── product.md          # What the system builds
│   ├── ownership.md        # Boundaries and architectural layers
│   ├── flows.md            # Primary execution and request paths
│   ├── state-ssot.md       # Sources of truth for system state
│   ├── constraints.md      # Domain limitations and guardrails
│   └── quality-gates.md    # Verification and acceptance standards
│
└── status/
    └── current.json        # Honest real-time status tracking

.codex/skills/
├── planr-plan.md           # Planning skill definition
├── planr-fix.md            # Execution skill definition
├── planr-review.md         # Review skill definition
├── planr-status.md         # Status check skill
├── planr-summary.md        # Summary skill
└── planr-shared.md         # Shared utilities across skills
```

---

## Key Design Decisions

### 1. Plans Live in the Repo
Plans are version-controlled alongside code. They survive context resets, session changes, and model swaps. Git history shows plan evolution.

### 2. Honest Status Over Optimism
`current.json` is the ground truth. The agent must update it with actual progress, not what it hopes to accomplish. This prevents the "90% done for weeks" failure mode.

### 3. Evidence-Based Review
Reviews depend on path-scoped Git evidence — actual diffs and test results — not on what the agent remembers or claims. This is more reliable than memory or checklist state.

### 4. Framework-Agnostic
Works with any Codex-style agent. Skills are loaded as markdown files, not code. Portable across model families and agent frameworks.

### 5. No Automatic Inference
The system does NOT automatically infer project structure. You must deliberately map your codebase to the six project files. This forces understanding before execution.

---

## Installation

```bash
# From your repo root
mkdir -p .codex/skills
cp -R /path/to/codex-planr/.planr .
cp -R /path/to/codex-planr/.codex/skills/planr-* .codex/skills/
cp /path/to/codex-planr/.codex/skills/planr-shared.md .codex/skills/

# Then ask Codex to customize .planr/project/*.md for your codebase
```

---

## Comparison with GSD Framework

codex-planr and GSD solve the same problem (agent planning discipline) with different approaches:

| Aspect | codex-planr | GSD Framework |
|--------|-------------|---------------|
| Plan storage | `.planr/` in repo | `.planning/` in repo |
| Status tracking | `current.json` | `PLAN.md` checkboxes + state files |
| Verification | Git diff-based review | Goal-backward verification agents |
| Complexity | Simple 3-step cycle | Rich multi-phase with sub-agents |
| Model dependency | None (markdown skills) | Claude Code agents |
| Subagent support | No | Yes (researcher, planner, executor, verifier) |
| Honest status | Explicit `current.json` | Phase completion status |
| Review mechanism | Path-scoped Git evidence | Dedicated verifier agent |

### What codex-planr Does Better
- Simpler mental model (3 steps vs many phases)
- Forced honesty via `current.json`
- Review anchored to Git diffs, not agent claims
- Zero dependency — pure markdown skills

### What GSD Does Better
- Multi-agent orchestration for complex projects
- Research phases before planning
- Verification agents that check goal achievement
- Rich codebase mapping tools

---

## Implications for Software Factory

### Patterns Worth Adopting

1. **`current.json` honest status** — our agents should maintain explicit progress tracking, not rely on context window memory
2. **Git-diff-based review** — our LLM Judge should review actual diffs against the original plan, not agent self-reports
3. **Separation of plan/fix/review** — matches our existing pipeline (reason → fix → verify) but adds the explicit planning phase
4. **Project context files** — the six `.planr/project/*.md` files are a good template for repo-level agent context

### What We Already Do
- Verification loops (our LLM Judge ≈ their `$planr-review`)
- Sandbox isolation (their agents run in codex sandboxes, ours in Docker)
- Audit logging (our SQLite audit ≈ their Git-based evidence)

### What We Could Add
- Explicit pre-execution planning step before agent runs
- Honest status tracking file per agent run
- Review against original plan, not just diff quality

---

## References

- [regenrek/codex-planr](https://github.com/regenrek/codex-planr)
- [LobeHub: codex-sandbox skills](https://lobehub.com/skills/regenrek-agent-skills-codex-sandbox)
- [Codex Plan Mode Guide](https://smartscope.blog/en/generative-ai/chatgpt/codex-plan-mode-complete-guide/)
