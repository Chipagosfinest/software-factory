# LangChain Deep Agents

*Refreshed 2026-11-01*

## What they do

Deep Agents is LangChain's harness on LangGraph: planning (`write_todos`), a filesystem backend, sub-agents, skills as layered directories, human-in-the-loop interrupts, and automatic context summarization. The pattern notes are [Deep Agents](../patterns/harness-engineering/deep-agents.md) and [harness engineering (LangChain)](../patterns/harness-engineering/harness-engineering-langchain.md).

The harness note separates two words. Context engineering is getting the right information into the window. Harness engineering is the whole execution environment: prompts, tools, middleware, and control flow. Context engineering is a subset.

## What they do well

- On Terminal Bench 2.0, `deepagents-cli` moved from 52.8% to 66.5% (+13.7 percentage points) with the model fixed (GPT-5.2-Codex). No fine-tune. The same note records 53.9% when extra-high reasoning was left on everywhere, against 66.5% for the reasoning-sandwich harness.
- Summarization triggers at 85% of the context window and keeps a recent slice (the index records a 10% keep-recent threshold).
- October 2026 posts collected in [X insights](../signals/x-insights.md): harness problems being solved by tying the harness to infrastructure (async sub-agents, browser use); review becoming the bottleneck as agents do more of the work; the simplest managed harness described as a while loop that production pushes toward its own observability, sandbox-as-tool, and async by default.

## Patterns shown

- [Harness engineering](../patterns/harness-engineering/README.md)
- [Memory and knowledge](../patterns/memory-knowledge/README.md) — summarization and filesystem context

## Key numbers

| Figure | Meaning | Where this repo records it |
|--------|---------|----------------------------|
| 52.8% → 66.5% | Terminal Bench 2.0, model fixed | LangChain harness note |
| +13.7pp | Harness-only gain | LangChain harness note |
| 53.9% | Extra-high reasoning everywhere, same model | LangChain harness note |
| 85% | Context fill that triggers summarization | Deep Agents note; key numbers |
| 10% | Keep-recent threshold recorded in the index | Prior index key numbers |

## Sources

- [Improving Deep Agents with harness engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/)
- [Deep Agents on GitHub](https://github.com/langchain-ai/deepagents)
- [LangChain post, 2026-10-29](https://x.com/hwchase17/status/2115854759991369840)
- [LangChain post, 2026-10-20](https://x.com/hwchase17/status/2112650555852275951)
