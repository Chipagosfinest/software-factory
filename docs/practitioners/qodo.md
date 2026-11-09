# Qodo

*Refreshed 2026-11-09*

## What they do

Qodo's docs describe an AI codebase quality and governance platform: git code review, an agentic toolbox, and an on-premises deployment. The overview that loaded does not document a test-generation agent as a separate product, so this profile does not claim one.

## What they do well

Review and governance are the documented surface, including the option to run inside the customer's infrastructure.

On the [30 October 2026 episode](https://www.youtube.com/watch?v=niH78HK0dUk) of Qodo's show, Momentic's CEO argues that once generation is cheap the factory bottleneck is verification, and that generated tests can be written or edited to pass rather than to specify behavior. That is a guest argument on the channel, not a Qodo product claim.

The [9 November 2026 hackathon video](https://www.youtube.com/watch?v=sc-Dnzl_VUw) covers week one: setup, verification of factory output, and a first self-improvement step that suggests rules. The framing is that a factory needs a mechanism to improve, with a human deciding what counts, and week two shifts review earlier in the line.

The [3 November 2026 OpenAI video](https://www.youtube.com/watch?v=yC72iQx6rM0) has Qodo position itself as context and review for Codex across the whole software, including across two Git providers. Developers in the video want bug resolution to run as an automatic loop.

## Patterns shown

- [Verification](../patterns/verification/README.md) — git code review plus an on-prem option

## Key numbers

No quantitative claim is repeated here. The sources describe the system without a figure this profile uses.

## Sources

- [Docs](https://docs.qodo.ai)
- [Can You Trust What Your Software Factory Ships?](https://www.youtube.com/watch?v=niH78HK0dUk) (2026-10-30)
- [Qodo Hackathon, Day 5](https://www.youtube.com/watch?v=sc-Dnzl_VUw) (2026-11-09)
- [Qodo brings company context into Codex code review](https://www.youtube.com/watch?v=yC72iQx6rM0) (2026-11-03)
