# Warp

*Refreshed 2026-11-09*

## What they do

Warp's agents overview describes the Warp Agent as a coding agent that runs commands in a real terminal, reads the output, and continues. The same agent is available in the Warp app, as a CLI in any terminal, or as a cloud agent.

## What they do well

The docs say the agent asks before it runs commands, edits files, or calls MCP servers, and that profiles set how much it may do alone. Cloud agents run from a trigger, a schedule, or an integration on Warp's automation platform. Several conversations can run at once, and a parent agent can spawn children. A third-party CLI path is also documented on the same page.

In the [23 October 2026 workshop](https://www.youtube.com/watch?v=Shqcc2aRTGY) with Sentry, Warp's developer-experience lead describes a software factory as one shared cloud sandbox: agreed models, skills, and automations from a backlog or Slack, instead of a per-laptop agent setup. The line is triage, a planning step that can stop for a human, implementation, verification, and adversarial review before the pull request. Verification includes a computer-use agent that records the clicks and cuts them to a short review video. After ship, the agent is supposed to watch Sentry alerts and user-session recordings and propose the next tasks.

The [5 November 2026 walkthrough](https://www.youtube.com/watch?v=gdFqUnD19lw) shows five agents led by a Factory Foreman, with the factory defined as code so its own agents can change the configuration. A dashboard score can feed a self-improvement loop, and benchmarks on the team's own factory work choose models and custom routers.

The [2 November 2026 talk](https://www.youtube.com/watch?v=PMRlYAB8kkI) describes an inner loop from intake through monitoring, and an outer loop that scores stored conversations and sends only failures to a self-improvement agent.

On November 5, 2026, Warp named three review levers: adversarial review before a human looks, end-to-end checks in simulated environments, and a [merge-risk](https://warp.dev/merge-risk) score on every pull request. The post does not argue for merging without human review.

## Patterns shown

- [Harness engineering](../patterns/harness-engineering/README.md) — a coding agent whose actions are terminal commands
- [Orchestration](../patterns/orchestration/README.md) — cloud agents on an automation platform; a factory line from triage through a post-ship loop
- [Background agents](../patterns/background-agents/README.md) — one shared cloud sandbox instead of a per-laptop setup

## Key numbers

No quantitative claim is repeated here. The sources describe the system without a figure this profile uses.

## Sources

- [Agents overview](https://docs.warp.dev/agents)
- [Powering Warp Factories with Sentry](https://www.youtube.com/watch?v=Shqcc2aRTGY) (2026-10-23)
- [Warp Factories complete walkthrough](https://www.youtube.com/watch?v=gdFqUnD19lw) (2026-11-05)
- [How to build an agentic self improvement loop](https://www.youtube.com/watch?v=PMRlYAB8kkI) (2026-11-02)
- [Merge-risk review, 2026-11-05](https://x.com/warpdotdev/status/2118412166034538775)
- [Ben Holmes on merge risk, 2026-11-05](https://x.com/BHolmesDev/status/2118411592627052937)
- [merge-risk skill](https://warp.dev/merge-risk)
