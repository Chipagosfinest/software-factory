# OpenAI Codex

*Refreshed 2026-11-16*

## What they do

Codex is OpenAI's coding agent (CLI, desktop, IDE, and ChatGPT). The harness writeup describes an internal product built by Codex agents: the engineers designed the environment, the repository map, and the checks; the agents wrote the code. The pattern note is [harness engineering (OpenAI)](../patterns/harness-engineering/harness-engineering-openai.md).

AGENTS.md in that system is a short map (about 100 lines) into a structured `docs/` tree, not a single instruction file. The earlier "one big AGENTS.md" failed because context is scarce, a pile of equal-priority rules is not guidance, the file rots, and a blob is hard to check mechanically.

Symphony is the orchestrator beside the agent: an Elixir/BEAM service that polls Linear, creates workspaces, dispatches agents, and returns pull requests. See [orchestration](../patterns/orchestration/orchestrator.md) and the [Symphony note](../patterns/orchestration/symphony-carson.md).

## What they do well

- The February 2026 harness post, as recorded here: about 1 million lines, zero lines of hand-written code, about 1,500 pull requests, team size from 3 to 7 engineers over 5 months, 3.5 pull requests per engineer per day. Throughput rose as the team grew.
- Agents held single tasks for up to 6 hours with automated validation loops (enterprise adoption note).
- The landscape pass records 57.0% on SWE-bench Pro for the Codex CLI, an Apache 2.0 CLI, and unprompted automations for triage, alerts, and CI.
- The same-model lesson stated in the enterprise note: harness quality moved a task from 42% to 78% success. The LangChain measurement of a different harness is in [LangChain Deep Agents](./langchain-deep-agents.md).
- On the [27 October 2026 video](https://www.youtube.com/watch?v=lPZQrVFcz3c), Mitchell Hashimoto describes ending the day by dispatching Codex agents for landscape research and for prototypes of features that are not fully specified, so the next session starts from that output.
- On November 3, 2026, OpenAI described Pando, a new Git backend for its monorepo, built to handle more pushes and fetches without changing how engineers and agents use Git. It cut push latency by about 80% and serves nearly a petabyte of Git data a day.
- The [November 11, 2026 DevDay talk](https://www.youtube.com/watch?v=U1IVZy9FhVQ) describes a Codex agent that watched CI for six weeks and more than 1,000 hours, from a prompt of about 200 words. After about four days the main thread handed slow debugging to sub-agents. The talk reports more than 100 pull requests a week, more than 1,000 commits, more than 600 Slack messages, more than 213 fixes the agent merged itself, just under half a million tool calls, and more than 5,800 sub-agent sessions. Cost was about $32 an hour, then about $16 an hour on a later model. When the agent was unsure about deleting a test, it started another agent to review that change first.
- The same day's [Agents API talk](https://www.youtube.com/watch?v=b7l_Dhe1h8M) presents the Codex harness as a service: the caller sets tools, data, instructions, and the environment (OpenAI's sandbox or their own), and OpenAI runs the harness, including compaction and resume when a server is replaced. A demo caps concurrent sub-agents and leaves the confirming action to a person.
- On November 13, 2026, OpenAI described how it runs persistent OpenClaw agents, over 500 of them, including agents that open pull requests from product feedback. The trusted gateway is separate from the untrusted harness. Secrets stay behind a credential broker. A second agent auto-reviews every action. Each agent has its own identity and inference credential. Turn logs are limited to a small security group.

## Patterns shown

- [Harness engineering](../patterns/harness-engineering/README.md)
- [Orchestration](../patterns/orchestration/README.md) — Symphony
- [Verification](../patterns/verification/README.md) — automated validation loops; SWE-bench Pro figure; the CI agent checks its own fixes
- [Governance and safety](../patterns/governance-safety/README.md) — sandbox, credential broker, auto-review, and a separate identity for persistent agents

## Key numbers

| Figure | Meaning | Where this repo records it |
|--------|---------|----------------------------|
| ~1M lines, 0 hand-written | Internal beta built by agents | Harness engineering (OpenAI) |
| ~1,500 PRs | Over 5 months | Harness engineering (OpenAI) |
| 3.5 PRs/engineer/day | Throughput on that product | Harness engineering (OpenAI) |
| 3 → 7 engineers | Team grew; throughput rose | Harness engineering (OpenAI) |
| up to 6 hours | Single task with validation loops | Enterprise adoption |
| 57.0% | SWE-bench Pro in the landscape pass | Landscape |
| ~80% | Push latency cut after Pando | OpenAI developers, 2026-11-03 |
| ~1 petabyte / day | Git data Pando serves | Same |
| >1,000 hours | One CI agent, six weeks | [DevDay 2026](https://www.youtube.com/watch?v=U1IVZy9FhVQ) |
| >213 | Fixes that agent merged itself | Same |
| ~$32, then ~$16 / hour | Cost of that run, then on a later model | Same |
| >500 | Persistent OpenClaw agents inside OpenAI | [OpenClaw post](https://developers.openai.com/blog/securing-persistent-agents-like-openclaw-at-openai) |

## Sources

- [Harness engineering](https://openai.com/index/harness-engineering/)
- [Introducing the Codex app](https://openai.com/index/introducing-the-codex-app/)
- [Symphony spec](https://github.com/openai/symphony/blob/main/SPEC.md)
- [Open-source Codex orchestration](https://openai.com/index/open-source-codex-orchestration-symphony/)
- [Getting a Head Start with Codex](https://www.youtube.com/watch?v=lPZQrVFcz3c) (2026-10-27)
- [Pando Git backend, 2026-11-03](https://x.com/OpenAIDevs/status/2117408792346509663)
- [Coding agents that don't quit](https://www.youtube.com/watch?v=U1IVZy9FhVQ) (2026-11-11)
- [Harness-as-a-Service](https://www.youtube.com/watch?v=b7l_Dhe1h8M) (2026-11-11)
- [Securing persistent agents like OpenClaw](https://developers.openai.com/blog/securing-persistent-agents-like-openclaw-at-openai)
- [Persistent agents, 2026-11-13](https://x.com/steipete/status/2121058770767982997)
