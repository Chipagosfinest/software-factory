# Warp

*Refreshed 2026-11-16*

## What they do

Warp's agents overview describes the Warp Agent as a coding agent that runs commands in a real terminal, reads the output, and continues. The same agent is available in the Warp app, as a CLI in any terminal, or as a cloud agent.

## What they do well

The docs say the agent asks before it runs commands, edits files, or calls MCP servers, and that profiles set how much it may do alone. Cloud agents run from a trigger, a schedule, or an integration on Warp's automation platform. Several conversations can run at once, and a parent agent can spawn children. A third-party CLI path is also documented on the same page.

In the [23 October 2026 workshop](https://www.youtube.com/watch?v=Shqcc2aRTGY) with Sentry, Warp's developer-experience lead describes a software factory as one shared cloud sandbox: agreed models, skills, and automations from a backlog or Slack, instead of a per-laptop agent setup. The line is triage, a planning step that can stop for a human, implementation, verification, and adversarial review before the pull request. Verification includes a computer-use agent that records the clicks and cuts them to a short review video. After ship, the agent is supposed to watch Sentry alerts and user-session recordings and propose the next tasks.

The [5 November 2026 walkthrough](https://www.youtube.com/watch?v=gdFqUnD19lw) shows five agents led by a Factory Foreman, with the factory defined as code so its own agents can change the configuration. A dashboard score can feed a self-improvement loop, and benchmarks on the team's own factory work choose models and custom routers.

The [2 November 2026 talk](https://www.youtube.com/watch?v=PMRlYAB8kkI) describes an inner loop from intake through monitoring, and an outer loop that scores stored conversations and sends only failures to a self-improvement agent.

On November 5, 2026, Warp named three review levers: adversarial review before a human looks, end-to-end checks in simulated environments, and a [merge-risk](https://warp.dev/merge-risk) score on every pull request. The post does not argue for merging without human review.

The [November 12, 2026 walkthrough](https://www.youtube.com/watch?v=uPCH2axUpbc) says the same thing about auto-merge. Review runs in a separate context window, findings stay inside the pipeline, and the loop is capped at about three to five rounds, with a way to stop and ask a person. On Warp's own task, adding that loop cost 3x and raised accuracy, so the factory lets the agent skip it when the change looks low risk. The merge-risk checklist is alignment with the request, blast radius and sensitive paths, whether the change was verified, rollback cost, and how an incident would be detected. Computer use runs in a sandbox the team controls, and the recording is what the reviewer sees.

## Patterns shown

- [Harness engineering](../patterns/harness-engineering/README.md) — a coding agent whose actions are terminal commands
- [Orchestration](../patterns/orchestration/README.md) — cloud agents on an automation platform; a factory line from triage through a post-ship loop
- [Background agents](../patterns/background-agents/README.md) — one shared cloud sandbox instead of a per-laptop setup
- [Verification](../patterns/verification/README.md) — a separate review window, a capped loop, and a five-part merge-risk check

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| 3x | Cost of adding the review loop, on Warp's own task, with higher accuracy | [2026-11-12 walkthrough](https://www.youtube.com/watch?v=uPCH2axUpbc) |
| 3 to 5 | Suggested cap on review rounds | Same |

## Sources

- [Agents overview](https://docs.warp.dev/agents)
- [Powering Warp Factories with Sentry](https://www.youtube.com/watch?v=Shqcc2aRTGY) (2026-10-23)
- [Warp Factories complete walkthrough](https://www.youtube.com/watch?v=gdFqUnD19lw) (2026-11-05)
- [How to build an agentic self improvement loop](https://www.youtube.com/watch?v=PMRlYAB8kkI) (2026-11-02)
- [Merge-risk review, 2026-11-05](https://x.com/warpdotdev/status/2118412166034538775)
- [Ben Holmes on merge risk, 2026-11-05](https://x.com/BHolmesDev/status/2118411592627052937)
- [merge-risk skill](https://warp.dev/merge-risk)
- [How to fix the code review bottleneck](https://www.youtube.com/watch?v=uPCH2axUpbc) (2026-11-12)
