# Uber AutoCover

*Refreshed 2026-11-02*

## What they do

AutoCover is Uber's production system for generating, validating, and repairing tests with large language models. The ACM HTML page returned a block page to a plain fetch; the abstract and an author PDF at the same citation both load and match. The Pragmatic Engineer summary's "5,000+ unit tests per month" figure is on the [Uber](./uber.md) profile, not repeated as if it were in the paper.

## What they do well

The paper's abstract says AutoCover generates about 11% of all new tests that are reviewed and added to Uber's codebase. It is a LangGraph pipeline with sub-graphs for preparation, generation, execution, and validation or repair. Quality gates and flakiness defenses sit in front of landing a test. Modes are CLI, headless merge requests, and an IDE loop. The body of the paper (via the author PDF text surfaced with the abstract) says a test is viable only if it executes and raises line coverage or scenario coverage, and that a validator rejects change-detector tests.

## Patterns shown

- [Verification](../patterns/verification/README.md) — quality gates, coverage, and mutation checks before a test lands
- [Harness engineering](../patterns/harness-engineering/README.md) — LangGraph pipeline with repository adapters

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| ~11% | Share of new tests reviewed and added to the codebase | AutoCover abstract |

## Sources

- [ICSE-SEIP 2026](https://dl.acm.org/doi/full/10.1145/3786583.3786918)
- [Author PDF](https://homes.cs.washington.edu/~rjust/publ/auto_cover_icse_2026.pdf)
