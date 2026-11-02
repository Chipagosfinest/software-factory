# Anthropic Claude Code

*Refreshed 2026-11-01*

## What they do

Claude Code is Anthropic's terminal coding agent. In this corpus it shows up as the runtime under other teams' harnesses (Honk is built on it) and as a product with its own benchmark and revenue figures. The landscape matrix is the market comparison. This profile only restates figures that corpus already records.

Agent Skills started as a Claude Code experiment and were donated to the Agentic AI Foundation together with MCP ([X insights](../signals/x-insights.md)). The same foundation announcement, recorded in [context engineering](../patterns/harness-engineering/context-engineering.md), lists three founding projects: MCP, Block's Goose, and OpenAI's AGENTS.md (December 9, 2025).

## What they do well

- The landscape pass records 80.9% on SWE-bench Verified (Opus 4.5) and $2.5B ARR. [Key numbers](../reference/key-numbers.md) adds the later caveat from the July 2026 case studies: OpenAI's audit treats Verified as no longer meaningful, and estimates about 30% of SWE-bench Pro tasks are broken. The 80.9% figure stays as a historical published score.
- README table, from Anthropic's code-review post: 200% growth in output per engineer, substantive reviews from 16% to 54%, and 84% of pull requests over 1,000 lines receiving findings. The same table quotes the harness line "decouple brain from hands."
- Pricing recorded in the landscape pass before the profile was split out: $20/month (Pro), $100/month (Max 5x), $200/month (Max 20x).
- Utah pilot, from X insights: 71% reported saving 20+ hours.
- [Context engineering](../patterns/harness-engineering/context-engineering.md) records an 89% acceptance rate with diff summaries versus 62% without, and a 40% error reduction attributed to context engineering in Anthropic's 2026 report.

## Patterns shown

- [Harness engineering](../patterns/harness-engineering/README.md) — skills, AGENTS.md, the runtime other harnesses wrap
- [Verification](../patterns/verification/README.md) — published benchmark score, with the later audit caveat

## Key numbers

| Figure | Meaning | Where this repo records it |
|--------|---------|----------------------------|
| 80.9% | Historical SWE-bench Verified score | Landscape; key numbers |
| $2.5B | ARR in the landscape pass | Landscape |
| 16% → 54% | Substantive reviews | README, Anthropic code-review post |
| 71% | Utah pilot, saved 20+ hours | X insights |
| 89% vs 62% | Acceptance with vs without diff summaries | Context engineering |

## Sources

- [Claude Code](https://claude.ai/code)
- [Anthropic code review](https://www.claude.com/blog/code-review)
- [Agentic AI Foundation announcement](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)
- [Skills post](https://x.com/bcherny/status/2113333859907747871)
- [Utah pilot post](https://x.com/bcherny/status/2115491259381072269)
