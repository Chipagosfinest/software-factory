# Google internal migrations

*Refreshed 2026-11-02*

## What they do

Google's research blog describes an internal migration pipeline. Static analysis, including Kythe and Code Search, finds the locations and dependencies to change. A Gemini model fine-tuned on internal code proposes the edits. The arXiv HTML for the same line of work describes Kythe indexing the repository and finding references; the 80% figure below is from the blog, which is where that sentence appears.

## What they do well

The blog says they generate several candidate edits, validate them, and choose what lands. The two most common validations are compiling the changed files and running their unit tests. Failed validations can call an ML repair prompt that sees the files, the error, and a request to fix them. For the workstream they report, 80% of the code modifications in the landed changelists were AI-authored. Engineers doing the migration reported about a 50% reduction in time spent.

## Patterns shown

- [Harness engineering](../patterns/harness-engineering/README.md) — Kythe to locate sites, a fine-tuned Gemini to edit
- [Verification](../patterns/verification/README.md) — compile and unit tests, then an optional repair pass

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| 80% | Code modifications in landed changelists that were AI-authored | Google research blog |
| ~50% | Time reduction reported by the engineers on that migration | Same |

## Sources

- [Research blog](https://research.google/blog/accelerating-code-migrations-with-ai/)
- [arXiv HTML](https://arxiv.org/html/2504.09691)
