# Linear agents

*Refreshed 2026-11-16*

## What they do

Linear documents agents as participants in the issue tracker. A person delegates an issue by assigning it to an agent, which is what starts the agent.

Linear's own cloud coding agent, shown on November 12, 2026, starts a cloud sandbox, clones the repo, and uses the context already on the issue. It runs the app before it returns a draft pull request, with a description and a screenshot. Comments in Linear steer it, and the pull request updates as it edits. The same day, the agent accepts a bring-your-own key for OpenAI, Anthropic, or a compatible gateway, so the team uses its own credits and negotiated rates. Karri Saarinen says it can be started from Slack, from an assigned issue, or as a triage and bug-fixing factory with Loops.

## What they do well

The tracker is the control plane: the issue, its assignment, and the agent's granted scopes. The page describes that handoff. It does not publish how many agents are installed or how often their work merges.

Saarinen says one customer building a bug-fixing factory on Linear has seen fix times fall, basically to zero. That is his claim about an unnamed customer. Linear Reviews, the same day, can show a team's own risk scores, risk areas, and explanations on each pull request.

## Patterns shown

- [Orchestration](../patterns/orchestration/README.md) — the issue is the assignment that starts an agent
- [Verification](../patterns/verification/README.md) — the agent runs the app before the draft, and a team can attach its own risk scores

## Key numbers

No quantitative claim is repeated here beyond Saarinen's statement that one customer's fix time is basically down to zero. The sources do not name the customer or the previous time.

## Sources

- [Agents in Linear](https://linear.app/docs/agents-in-linear)
- [Feature overview: Linear cloud coding agent](https://www.youtube.com/watch?v=MBqlLGilgpo) (2026-11-12)
- [Bring your own key, 2026-11-12](https://x.com/linear/status/2120925693177696366)
- [Bug-fixing factory, 2026-11-12](https://x.com/karrisaarinen/status/2120928839882936621)
- [Bring your own risk scores, 2026-11-12](https://x.com/linear/status/2120984092699496619)
