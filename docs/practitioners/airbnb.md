# Airbnb

*Refreshed 2026-11-02*

## What they do

Airbnb's engineering post describes one migration: Enzyme tests to React Testing Library. The harness is a per-file pipeline, not a general coding agent.

## What they do well

They broke the migration into discrete per-file steps that could run in parallel, with configurable retry loops. The flow is a state machine: a file moves on only after validation of the previous state passes, and a failed check brings the model back to fix it. The post names the steps as Enzyme refactor, Jest fixes, lint and `tsc`, then complete. Nearly 3.5K files moved in six weeks. The first bulk run migrated 75% of target files in four hours. Further prompt work took that to 97%, leaving nearly 900 files after the 75% pass.

## Patterns shown

- [Orchestration](../patterns/orchestration/README.md) — per-file state machine with parallel steps
- [Verification](../patterns/verification/README.md) — a file advances only after the previous check passes
- [Harness engineering](../patterns/harness-engineering/README.md) — retry loops and prompt tuning for the long tail

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| ~3.5K files | Enzyme to React Testing Library, six weeks | Airbnb engineering |
| 75% | Target files migrated in the first four-hour bulk run | Same |
| 97% | After systematic prompt improvement | Same |

## Sources

- [Test migration](https://airbnb.tech/infrastructure/accelerating-large-scale-test-migration-with-llms/)
