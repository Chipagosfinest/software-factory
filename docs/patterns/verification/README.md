# Verification

Parent hub for proving an agent change is acceptable: deterministic checks, an LLM judge on the diff, bounded retries, and benchmarks that say what they do not measure.

The working shape in this corpus is a fast deterministic gate (lint, build, tests, stop hooks) and a slower judge that can veto scope creep. Retries are capped. A green test suite is not treated as merge authority by itself. Evaluation benchmarks are a separate child: useful for comparing scaffolds, weak as a production merge signal.

October 2026 workshops add checks that are not a green suite. [Sentry](../../practitioners/sentry-seer.md) feeds production traces into its own evals, and treats a wrong agent answer as a failure even when no HTTP error fired ([own agents](https://www.youtube.com/watch?v=rUlnhU0de7A), [different environments](https://www.youtube.com/watch?v=0NEWeW0Opfk)). [Warp](../../practitioners/warp.md) puts a computer-use video and an adversarial review before the pull request, then listens to Sentry alerts after ship ([Powering Warp Factories](https://www.youtube.com/watch?v=Shqcc2aRTGY)). On [Qodo's channel](https://www.youtube.com/watch?v=niH78HK0dUk), a guest argues the factory bottleneck is that verification, not generation. The log is [YouTube](../../signals/youtube.md).

## Children

- [SWE-bench ecosystem](./swe-bench-ecosystem.md) — variants, contamination, and the gap to mergeable code
- [Quality loop](./quality-loop.md) — deterministic checks, test gate, LLM judge

Related project note: [Software Factory operations (archived snapshot as of 2026-07-16)](../../project/software-factory-operations-2026-07-16.md) (evidence contracts and earned autonomy).

## Practitioners

- [Spotify Honk](../../practitioners/spotify-honk.md)
- [Stripe Minions](../../practitioners/stripe-minions.md)
- [StrongDM Software Factory](../../practitioners/strongdm-software-factory.md)
- [Vercel](../../practitioners/vercel.md)
- [OpenAI Codex](../../practitioners/openai-codex.md)
- [Anthropic Claude Code](../../practitioners/anthropic-claude-code.md)
- [Cognition Devin](../../practitioners/cognition-devin.md)
- [OpenHands](../../practitioners/openhands.md)
- [Uber](../../practitioners/uber.md)
- [Uber AutoCover](../../practitioners/uber-autocover.md)
- [Airbnb](../../practitioners/airbnb.md)
- [Google internal migrations](../../practitioners/google-internal-migrations.md)
- [Shopify Helix](../../practitioners/shopify-helix.md)
- [Datadog Bits](../../practitioners/datadog-bits.md)
- [DoorDash](../../practitioners/doordash.md)
- [Pinterest](../../practitioners/pinterest.md)
- [Databricks Genie Code](../../practitioners/databricks-genie-code.md)
- [Sentry Seer](../../practitioners/sentry-seer.md)
- [Cursor](../../practitioners/cursor.md)
- [Kiro](../../practitioners/kiro.md)
- [JetBrains Junie](../../practitioners/jetbrains-junie.md)
- [Harness AI](../../practitioners/harness-ai.md)
- [Imbue Sculptor](../../practitioners/imbue-sculptor.md)
- [Tessl](../../practitioners/tessl.md)
- [SWE-agent](../../practitioners/swe-agent.md)
- [Browserbase](../../practitioners/browserbase.md)
- [CodeRabbit](../../practitioners/coderabbit.md)
- [Greptile](../../practitioners/greptile.md)
- [Graphite](../../practitioners/graphite.md)
- [Qodo](../../practitioners/qodo.md)
- [SWE-bench](../../practitioners/swe-bench.md)
- [Levi Strauss](../../practitioners/levi-strauss.md)

## Sources

- [Spotify Honk, part 3](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3)
- [SWE-bench](https://www.swebench.com/)
- [How Sentry debugs its own AI agents](https://www.youtube.com/watch?v=rUlnhU0de7A) (2026-10-15)
- [Powering Warp Factories with Sentry](https://www.youtube.com/watch?v=Shqcc2aRTGY) (2026-10-23)
