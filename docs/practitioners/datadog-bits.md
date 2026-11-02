# Datadog Bits

*Refreshed 2026-11-02*

## What they do

Datadog's docs now title the coding product Bits Code. The older path `bits_ai_dev_agent` redirects there. Bits Code is one surface under Bits AI, next to Bits Investigation, Bits Chat, Bits Agent Builder, and Bits Security Analyst. A separate March 9, 2026 blog post is about observability-driven harnesses inside Datadog, not a Bits Code benchmark.

## What they do well

- Bits Code uses Datadog observability data to diagnose and fix code. It opens a pull or merge request through a source-code integration and iterates with CI logs and developer feedback. Sessions can start from a prompt, from another Bits agent, from Slack, or from an automation tied to a product signal. The docs list handoffs from APM recommendations, error tracking, code security, flaky tests, continuous profiler, and other products.
- The harness-first post reports two internal results: redis-rust reached a production-like staging environment with comparable latency and an 87% memory reduction, and Helix sustained millions of deterministic simulation runs at about 93% of peak disk throughput while keeping Kafka semantics. Those figures are about that harness work. This profile does not assign them to Bits Code.

## Patterns shown

- [Verification](../patterns/verification/README.md) — CI logs and product signals after a proposed code change
- [Background agents](../patterns/background-agents/README.md) — sessions that open pull or merge requests from telemetry

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| 87% less memory | redis-rust staging result in the harness post | Datadog, Mar 9, 2026 |
| ~93% of peak disk | Helix simulation result in the same post | Same |

## Sources

- [Bits Code](https://docs.datadoghq.com/bits_ai/bits_code/)
- [Harness-first agents](https://www.datadoghq.com/blog/ai/harness-first-agents/)
