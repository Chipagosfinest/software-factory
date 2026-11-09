# Levi Strauss

*Refreshed 2026-11-09*

## What they do

Levi Strauss & Co. rebuilt its software delivery around 17 agents on GitHub. The account is a GitHub Universe talk by Jenny Patchen. The Back Pocket store-stylist app rebuild took about 2.5 months, compared with 9 months for the legacy app.

The goals named in the talk are faster value, higher quality via automated testing and spec-driven development, and "standards built in, not bolted on."

## What they do well

Specialist agents cover security (OWASP, CVE checks, and secret scans fixed by severity), accessibility (WCAG 2.2 AA checked in a real browser with Playwright), performance (Core Web Vitals measured with Playwright, "measured, never estimated"), observability, code review, and testing. Each pushes a labeled fix commit with a consolidated summary. A human approves and merges.

Ten repo starter kits ship CI/CD, docs, runbooks, AGENTS.md, and Copilot instructions. CI gates include dependency review, tests, coverage, and a New Relic pre-flight. [GitHub Copilot](./github-copilot.md) agentic autofix handles CI failures.

## Patterns shown

- [Verification](../patterns/verification/README.md) — automated testing, spec-driven development, and CI gates before merge
- [Orchestration](../patterns/orchestration/README.md) — specialist agents on one SDLC, each pushing a labeled fix
- [Governance and safety](../patterns/governance-safety/README.md) — security, accessibility, and secret scans, with a human approve-and-merge

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| 17 | Agents on the SDLC | GitHub Universe talk |
| ~2.5 months | Back Pocket rebuild | Same |
| 9 months | Legacy app, the comparison | Same |
| 10 | Repo starter kits | Same |

## Sources

- [17 agents, one SDLC](https://www.youtube.com/watch?v=-GpxKKgoWWg) (2026-11-08)
