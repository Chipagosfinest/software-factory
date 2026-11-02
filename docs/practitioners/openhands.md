# OpenHands

*Refreshed 2026-11-01*

## What they do

OpenHands (formerly OpenDevin) is an open-source platform for cloud coding agents. The landscape pass describes a Python SDK, Docker sandboxing, event-sourced state, and LiteLLM for 100+ model providers. An agent-computer interface is the navigation layer. A cloud SDK is described as scaling to thousands of concurrent agents. The sandbox note lists it as a model-agnostic platform with built-in sandboxing.

## What they do well

- SWE-bench Verified, in the landscape pass: 77.6% with Claude 3.5 Sonnet Thinking.
- Benchmark coverage named in that pass: SWE-bench, WebArena, GAIA, GPQA, MiniWoB++, and others (15+).
- 50K+ GitHub stars and an MIT license, same pass. The open-source table in the landscape note repeats 50K+ stars and 77.6% Verified.
- The same pass lists the limits it was willing to state: Docker is required, the UX is less polished, and the learning curve is steeper than hosted products.

## Patterns shown

- [Background agents](../patterns/background-agents/README.md) — Docker sandbox per run
- [Verification](../patterns/verification/README.md) — multi-benchmark reporting, including SWE-bench

## Key numbers

| Figure | Meaning | Where this repo records it |
|--------|---------|----------------------------|
| 77.6% | SWE-bench Verified (Claude 3.5 Sonnet Thinking) | Landscape |
| 50K+ | GitHub stars | Landscape |
| 15+ | Benchmarks named | Landscape |
| 100+ | Model providers via LiteLLM | Landscape |
| MIT | License | Landscape |

## Sources

- [OpenHands](https://openhands.dev/)
- [GitHub](https://github.com/OpenHands/OpenHands)
- [Paper](https://arxiv.org/abs/2407.16741)
