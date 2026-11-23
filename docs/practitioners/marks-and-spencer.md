# Marks & Spencer

*Refreshed 2026-11-23*

## What they do

Marks & Spencer runs GitHub Agentic Workflows through an agentic control plane, described by principal engineer Tim Mason. A pilot on one repository found 123 issues in a day, solved 77 the same day, and raised test coverage above 90%. The control plane is how that rollout reaches about 5,000 repositories.

The product underneath is [GitHub Copilot](./github-copilot.md)'s agentic workflows: markdown compiled into GitHub Actions.

## What they do well

The control plane keeps a curated catalog of approved workflows. Deploy is one click, shipped as a pull request, with version tracking, OpenTelemetry routing, and per-repository config. A token-exchange endpoint issues repository-scoped tokens in place of personal access tokens.

A CI doctor diagnoses failed pipelines. The finisher prioritizes that diagnosis. The workflows do not build or run the tests themselves.

Mason's reported results: 200+ repositories, 1,000+ deployments, about 4,000 issues raised and 2,000+ addressed, 2,000+ pull requests, and 1,087 review comments, of which 700+ were high or critical.

## Patterns shown

- [Orchestration](../patterns/orchestration/README.md) — one control plane and a catalog across thousands of repositories
- [Governance and safety](../patterns/governance-safety/README.md) — approved workflows only, and repository-scoped tokens
- [Verification](../patterns/verification/README.md) — a CI doctor, issues addressed, and review comments by severity
- [Background agents](../patterns/background-agents/README.md) — workflows run in GitHub Actions

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| 123 / 77 | Issues found and solved the same day, in the one-repo pilot | [GitHub talk](https://www.youtube.com/watch?v=TYhsC-S-Fx0) |
| above 90% | Test coverage after that pilot | Same |
| about 5,000 | Repositories in the rollout | Same |
| 200+ | Repositories on the control plane | Same |
| 1,000+ | Deployments | Same |
| about 4,000 / 2,000+ | Issues raised and addressed | Same |
| 2,000+ | Pull requests | Same |
| 1,087 | Review comments, 700+ high or critical | Same |

## Sources

- [The factory mindset: Agentic workflows in production](https://www.youtube.com/watch?v=TYhsC-S-Fx0) (2026-11-23)
