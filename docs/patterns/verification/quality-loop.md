# Quality Loop

Deterministic checks, a test gate, and an LLM judge. The corpus thesis — agents ship working but low-quality code, and instruction files do not enforce quality — is stated in [Why software factories](../../landscape/why-software-factories.md).

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

**The Tiered Gate pattern.** Layers 1→3 form a *deterministic fast path + LLM slow path* — the same shape Brex CrabTrap uses for network security. Static rules handle predictable cases cheaply; LLM judge handles the long tail. This is a verification pattern, not a topology: it composes inside any of the nine topologies in [Choosing a topology](../orchestration/topology-choice.md).

**Benchmark warning (July 2026):** Public leaderboards are only one signal. OpenAI's [coding-evaluation audit](https://openai.com/index/separating-signal-from-noise-coding-evaluations) says SWE-bench Verified is no longer meaningful and estimates roughly 30% of SWE-Bench Pro tasks are broken, retracting its earlier recommendation to switch to Pro. Prefer repo-specific replay sets, independent human adjudication, repeated runs, and production outcome metrics.

### Operating the Review Constraint

Verification is necessary but not sufficient once agents create changes faster than humans can review them. A July 2026 longitudinal study of 802 developers and 196,212 PRs observed 2.09x per-capita throughput, 2.0x per-reviewer load, and a shift from substantive human review toward automated review. Microsoft's ten-month .NET retrospective shows the same constraint at repository scale.

The operating response is **admission backpressure + scoped authority + proof bundles + risk-tiered review + earned autonomy**. See [Software Factory operations (archived snapshot as of 2026-07-16)](../../project/software-factory-operations-2026-07-16.md) for the full evidence, scorecard, and implementation slice.
