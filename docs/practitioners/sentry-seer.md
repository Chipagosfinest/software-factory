# Sentry Seer

*Refreshed 2026-11-09*

## What they do

Seer is Sentry's agent surface. Two first-party posts describe different loops: Autofix, and a reviewer that uses production data. October 2026 workshops on the [Sentry channel](https://www.youtube.com/@Sentry-monitoring) add Seer Agent, which answers questions about the running application and can take action inside Sentry. The log is [YouTube](../signals/youtube.md).

## What they do well

The Autofix post says that when an error occurs, the system analyzes it, generates a fix, and opens a pull request. The review post describes a code review system that uses production data to predict bugs, with the agent forming hypotheses from repository and production context. Neither post, in the text used here, publishes a fix rate or a precision number, so none is added.

The [15 October 2026 workshop](https://www.youtube.com/watch?v=rUlnhU0de7A) states the Autofix path in more detail. On an issue, Seer runs a root-cause analysis and a plan, then either edits the code itself or hands the plan to a connected harness (Claude Code, Cursor cloud agents, or GitHub Copilot). That path can run when a new issue arrives. The same workshop says production traces are an input to Sentry's own evals.

The [7 October 2026 video](https://www.youtube.com/watch?v=DCH1sQ2S2BQ) shows Seer Agent, from Slack or inside Sentry, answering from deploy data: which pull requests and commits shipped in a release, and which new issues followed. It can then build a dashboard for that error rate, comment, and assign issues. It uses the caller's permissions and asks before it changes anything.

The [8 October 2026 workshop](https://www.youtube.com/watch?v=0NEWeW0Opfk) treats an agent failure as a wrong answer as well as an HTTP error, and walks traces for a store chatbot, a Slack agent that opens pull requests, and a CI review agent. The [24 September 2026 session](https://www.youtube.com/watch?v=uyesTWSDllI) with LaunchDarkly says review cannot absorb the volume of agent-written code; Sentry's [page for that livestream](https://sentry.io/resources/launchdarkly-workshop/) says the walkthrough wires Sentry into a guarded release, rolls back the broken feature, and deploys a Seer Autofix.

The [6 November 2026 video](https://www.youtube.com/watch?v=Ks51wPYmM3c) shows agent traces with tool and model calls, handoffs, and full input and output transcripts. From a checkout failure, Seer follows the user journey to an inventory root cause, then Autofix plans, pushes code, and drafts a pull request for review.

The [4 November 2026 livestream](https://www.youtube.com/watch?v=p8kpOePCsAM) description says agent cost is more than the model call: a slow or broken backend makes the agent retry, and every retry costs tokens, so one connected trace is needed to see spend that starts in an API or database. Anthropic's CJ Avilla sent Claude Platform OpenTelemetry data to Sentry and found an old project still burning tokens.

## Patterns shown

- [Verification](../patterns/verification/README.md) — production errors and review-time bug prediction
- [Background agents](../patterns/background-agents/README.md) — Autofix opens a pull request from an error

## Key numbers

No quantitative claim is repeated here. The sources describe the system without a figure this profile uses.

## Sources

- [Autofix](https://blog.sentry.io/ai-powered-autofix-debugs-and-fixes-your-code-in-minutes/)
- [Prod-data review](https://blog.sentry.io/building-a-code-review-system-that-uses-prod-data-to-predict-bugs/)
- [How Sentry debugs its own AI agents](https://www.youtube.com/watch?v=rUlnhU0de7A) (2026-10-15)
- [Seer Agent: Get Answers. Take Action.](https://www.youtube.com/watch?v=DCH1sQ2S2BQ) (2026-10-07)
- [Debugging Agents in Different Environments](https://www.youtube.com/watch?v=0NEWeW0Opfk) (2026-10-08)
- [Protecting releases, fixing bugs with Sentry and LaunchDarkly](https://www.youtube.com/watch?v=uyesTWSDllI) (2026-09-24)
- [LaunchDarkly workshop page](https://sentry.io/resources/launchdarkly-workshop/)
- [Agent Trace Investigation with Seer](https://www.youtube.com/watch?v=Ks51wPYmM3c) (2026-11-06)
- [Where Did My Tokens Go?](https://www.youtube.com/watch?v=p8kpOePCsAM) (2026-11-04)
