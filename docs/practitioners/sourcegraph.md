# Sourcegraph

*Refreshed 2026-11-02*

## What they do

Sourcegraph's docs home describes code search plus newer agent features. Agentic Batch Changes are how agents make, review, and ship changes across repositories. Deep Search answers questions against the indexed code. Cody remains a documented product in the same docs.

## What they do well

The batch-change surface is the part that matches a factory: one change applied across repos, with review still in the loop. No customer count is taken from this page.

The [14 September 2026 video](https://www.youtube.com/watch?v=kY0_rRtJ8BM) calls Agentic Batch Changes generally available. In the demo, one request to fix SQL injections is applied across five repositories in Python, TypeScript, Go, and Java, with tests added and a pull request per repo. Existing checks stay in place. If a build breaks, the agent continues. Nothing merges on its own.

## Patterns shown

- [Orchestration](../patterns/orchestration/README.md) — agentic batch changes across repositories
- [Harness engineering](../patterns/harness-engineering/README.md) — code search as the context layer

## Key numbers

No quantitative claim is repeated here. The sources describe the system without a figure this profile uses.

## Sources

- [Docs](https://sourcegraph.com/docs)
- [Introducing Agentic Batch Changes](https://www.youtube.com/watch?v=kY0_rRtJ8BM) (2026-09-14)
