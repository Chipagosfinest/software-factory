# Cognition Devin

*Refreshed 2026-11-09*

## What they do

Devin is Cognition's cloud coding agent. Each instance gets a sandbox with a shell, editor, and browser. It plans, edits, tests, and opens pull requests. Several sandboxes can run at once. The product note in this repo is [Devin and Factory.ai](../landscape/devin-factory.md). Factory.ai is a different product and stays in that landscape note.

Devin 2.0 (April 2025, as recorded in that note) added an agent-native IDE, editable plans, codebase search, an auto-generated wiki, and a review surface. A REST API is how other systems start a Devin task.

## What they do well

Figures below are the ones already written down in this repo. Several are vendor-reported and are marked that way in the source notes.

- Nubank migration case, recorded in the Devin note and in [enterprise adoption](../landscape/enterprise-adoption.md): an 8-year ETL monolith, 6M+ lines, about 100,000 data-class implementations. The pre-Devin plan was 1,000+ engineers over 18 months. Reported results: 12x engineering efficiency and 20x cost savings on the scope given to Devin. After examples were added, task completion doubled and a sub-task moved from 40 minutes to 10 (4x). The README labels the 12x claim vendor-reported.
- 2025 performance review, as tabulated in the Devin note: 67% pull-request merge rate (up from 34%), hundreds of thousands of merged pull requests, vulnerability fixes at 20x (1.5 minutes versus 30), migrations 10–14x faster than the human baseline they cite.
- Devin 2.0 pricing in that note: entry moved from $500/month to $20/month, with an ACU (agent compute unit) around $2.25 and about 15 minutes of active work. The note also says real consumption often runs 2–3x the vendor estimate, and failed tasks still consume ACUs.
- October 2026 signal: Cognition reports a Devin Fusion score of 68 on the Coding Agent Index ([X insights](../signals/x-insights.md)).
- Devin Review 2.0 is up to 5x cheaper and 1.5x faster pull-request review.
- SWE-2 Flash is a fast coding model. Cognition says it outperforms all American open-weight models on leading evals. Weights are shared with partners and researchers through a gated program.

## Patterns shown

- [Verification](../patterns/verification/README.md) — benchmark and merge-rate claims; treat vendor figures as claims
- [Background agents](../patterns/background-agents/README.md) — cloud VM per task, parallel sandboxes

## Key numbers

| Figure | Meaning | Where this repo records it |
|--------|---------|----------------------------|
| 67% | PR merge rate in the 2025 review (from 34%) | Devin note |
| 12x / 20x | Nubank efficiency and cost claims (vendor-reported) | Devin note; README |
| 4x | Sub-task time, 40 min to 10 min, after examples | Devin note |
| $2.25/ACU | About 15 minutes of active work | Devin note |
| 68 | Devin Fusion score on the Coding Agent Index | X insights |
| up to 5x / 1.5x | Devin Review 2.0, cheaper and faster PR review | Cognition |

## Sources

- [devin.ai](https://devin.ai)
- [Nubank case study](https://devin.ai/customers/nubank/)
- [Building Nubank](https://building.nubank.com/enhancing-engineering-workflows-with-ai-a-real-world-experience/)
- [2025 performance review](https://cognition.ai/blog/devin-annual-performance-review-2025)
- [Coding Agent Index post](https://x.com/cognition/status/2112290148205436979)
- [Devin Review 2.0](https://x.com/cognition/status/2118390707228745948)
- [SWE-2 Flash](https://x.com/cognition/status/2118069614521241739)
