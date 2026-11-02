# StrongDM Software Factory

*Refreshed 2026-11-01*

## What they do

StrongDM describes a software factory as non-interactive development: specs and scenarios drive agents that write code, run harnesses, and converge without a human writing or reviewing the code. The public note is dated February 6, 2026.

Two rules are stated as constraints: code must not be written by humans, and code must not be reviewed by humans. A practical guideline in the same note: if the team has not spent at least $1,000 on tokens that day per human engineer, the factory still has room to spend.

"Scenario" is their word for an end-to-end user story, often stored outside the codebase so it cannot be edited to match the code the way an in-repo test can. "Satisfaction" is the fraction of observed trajectories through those scenarios that look like they satisfy the user. The check is probabilistic. Boolean "the suite is green" is treated as too rigid, and too easy for the model to reward-hack.

The Digital Twin Universe is a set of behavioral clones of third-party APIs the software depends on, named in the post as Okta, Jira, Slack, Google Docs, Google Drive, and Google Sheets. The clones are how they run scenarios at a volume and with failure modes they do not want to hit in production.

## What they do well

The source is one public essay, not an audited production dashboard. What it specifies clearly:

- The success signal sits outside the repository, which is the same reason an in-repo test can be rewritten to pass.
- Validation is a harness plus a judge over trajectories, not a single green build.
- The spend guideline makes token throughput a managed input. This corpus's other cost notes cap spend from above. StrongDM's line is a floor.

No merge rate, repository size, or headcount is stated in the source used here, so none is invented.

## Patterns shown

- [Verification](../patterns/verification/README.md) — scenarios, satisfaction, holdout-style stories
- [Harness engineering](../patterns/harness-engineering/README.md) — agents run harnesses until the scenarios converge
- [Self-improvement](../patterns/self-improvement/README.md) — non-interactive loop with an explicit spend floor

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| ≥ $1,000 / engineer / day | Token spend below this is treated as unused factory capacity | [factory.strongdm.ai](https://factory.strongdm.ai/) |
| February 6, 2026 | Date of the public note | Same |

## Sources

- [StrongDM Software Factory](https://factory.strongdm.ai/)
