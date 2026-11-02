# Sentry Seer

*Refreshed 2026-11-02*

## What they do

Seer is Sentry's agent surface. Two first-party posts describe different loops: Autofix, and a reviewer that uses production data.

## What they do well

The Autofix post says that when an error occurs, the system analyzes it, generates a fix, and opens a pull request. The review post describes a code review system that uses production data to predict bugs, with the agent forming hypotheses from repository and production context. Neither post, in the text used here, publishes a fix rate or a precision number, so none is added.

## Patterns shown

- [Verification](../patterns/verification/README.md) — production errors and review-time bug prediction
- [Background agents](../patterns/background-agents/README.md) — Autofix opens a pull request from an error

## Key numbers

No quantitative claim is repeated here. The sources describe the system without a figure this profile uses.

## Sources

- [Autofix](https://blog.sentry.io/ai-powered-autofix-debugs-and-fixes-your-code-in-minutes/)
- [Prod-data review](https://blog.sentry.io/building-a-code-review-system-that-uses-prod-data-to-predict-bugs/)
