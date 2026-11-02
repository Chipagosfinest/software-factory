# Self-Improvement

*Refreshed 2026-11-02*

Parent hub for loops that keep running while a metric moves: fixed-budget experiments, a ratchet that only keeps improvements, and production monitors that open their own fixes.

The loop needs an objective signal. Without one, the same error repeats and the run should stop. With one, the human job is to set the metric, the budget, and the merge gate.

## Children

- [Autoresearch](./autoresearch.md) — overnight experiment loops with a fixed budget per trial
- [Karpathy software factory thesis](./karpathy-software-factory-thesis.md) — instruction-following limits and quality as a tradeoff
- [Ramp self-maintaining code](./ramp-self-maintaining-code.md) — generated monitors, triage, sandboxed fix, human review

## Practitioners

- [Ramp Inspect](../../practitioners/ramp-inspect.md)
- [StrongDM Software Factory](../../practitioners/strongdm-software-factory.md)
- [Amp](../../practitioners/amp.md)

## Sources

- [autoresearch](https://github.com/karpathy/autoresearch)
- [Ramp Labs on self-maintaining code](https://x.com/RampLabs)
- [StrongDM Software Factory](https://factory.strongdm.ai/)
