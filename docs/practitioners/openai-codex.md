# OpenAI Codex

*Refreshed 2026-11-01*

## What they do

Codex is OpenAI's coding agent (CLI, desktop, IDE, and ChatGPT). The harness writeup describes an internal product built by Codex agents: the engineers designed the environment, the repository map, and the checks; the agents wrote the code. The pattern note is [harness engineering (OpenAI)](../patterns/harness-engineering/harness-engineering-openai.md).

AGENTS.md in that system is a short map (about 100 lines) into a structured `docs/` tree, not a single instruction file. The earlier "one big AGENTS.md" failed because context is scarce, a pile of equal-priority rules is not guidance, the file rots, and a blob is hard to check mechanically.

Symphony is the orchestrator beside the agent: an Elixir/BEAM service that polls Linear, creates workspaces, dispatches agents, and returns pull requests. See [orchestration](../patterns/orchestration/orchestrator.md) and the [Symphony note](../patterns/orchestration/symphony-carson.md).

## What they do well

- The February 2026 harness post, as recorded here: about 1 million lines, zero lines of hand-written code, about 1,500 pull requests, team size from 3 to 7 engineers over 5 months, 3.5 pull requests per engineer per day. Throughput rose as the team grew.
- Agents held single tasks for up to 6 hours with automated validation loops (enterprise adoption note).
- The landscape pass records 57.0% on SWE-bench Pro for the Codex CLI, an Apache 2.0 CLI, and unprompted automations for triage, alerts, and CI.
- The same-model lesson stated in the enterprise note: harness quality moved a task from 42% to 78% success. The LangChain measurement of a different harness is in [LangChain Deep Agents](./langchain-deep-agents.md).

## Patterns shown

- [Harness engineering](../patterns/harness-engineering/README.md)
- [Orchestration](../patterns/orchestration/README.md) — Symphony
- [Verification](../patterns/verification/README.md) — automated validation loops; SWE-bench Pro figure

## Key numbers

| Figure | Meaning | Where this repo records it |
|--------|---------|----------------------------|
| ~1M lines, 0 hand-written | Internal beta built by agents | Harness engineering (OpenAI) |
| ~1,500 PRs | Over 5 months | Harness engineering (OpenAI) |
| 3.5 PRs/engineer/day | Throughput on that product | Harness engineering (OpenAI) |
| 3 → 7 engineers | Team grew; throughput rose | Harness engineering (OpenAI) |
| up to 6 hours | Single task with validation loops | Enterprise adoption |
| 57.0% | SWE-bench Pro in the landscape pass | Landscape |

## Sources

- [Harness engineering](https://openai.com/index/harness-engineering/)
- [Introducing the Codex app](https://openai.com/index/introducing-the-codex-app/)
- [Symphony spec](https://github.com/openai/symphony/blob/main/SPEC.md)
- [Open-source Codex orchestration](https://openai.com/index/open-source-codex-orchestration-symphony/)
