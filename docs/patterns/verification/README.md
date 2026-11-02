# Verification

*Refreshed 2026-11-01*

Parent hub for proving an agent change is acceptable: deterministic checks, an LLM judge on the diff, bounded retries, and benchmarks that say what they do not measure.

The working shape in this corpus is a fast deterministic gate (lint, build, tests, stop hooks) and a slower judge that can veto scope creep. Retries are capped. A green test suite is not treated as merge authority by itself. Evaluation benchmarks are a separate child: useful for comparing scaffolds, weak as a production merge signal.

## Children

- [SWE-bench ecosystem](./swe-bench-ecosystem.md) — variants, contamination, and the gap to mergeable code

Related project note: [Software Factory operations](../../project/software-factory-operations-2026-07-16.md) (evidence contracts and earned autonomy).

## Practitioners

- [Spotify Honk](../../practitioners/spotify-honk.md)
- [Stripe Minions](../../practitioners/stripe-minions.md)
- [StrongDM Software Factory](../../practitioners/strongdm-software-factory.md)
- [Vercel](../../practitioners/vercel.md)
- [OpenAI Codex](../../practitioners/openai-codex.md)
- [Anthropic Claude Code](../../practitioners/anthropic-claude-code.md)
- [Cognition Devin](../../practitioners/cognition-devin.md)
- [OpenHands](../../practitioners/openhands.md)

## Sources

- [Spotify Honk, part 3](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3)
- [SWE-bench](https://www.swebench.com/)
