# Shopify Helix

*Refreshed 2026-11-02*

## What they do

Helix is Shopify's internal tool for rebuilding the Shopify app, screen by screen, from React Native into Swift and Kotlin. The September 21, 2026 engineering post is about checkpoints and gates, not a claim that the rewrite is finished.

## What they do well

An engineer points Helix at a screen. Helix proposes a sequence of small checkpoints. Each checkpoint must pass tests, match the React Native app in a visual review, pass two adversarial code reviews, and get an engineer’s approval before it is committed and the next checkpoint starts. Review feedback is kept for later checkpoints. A visual difference that can be fixed in code is a blocker by default. The post says they are applying this to the Shopify app, more than 300 screens.

## Patterns shown

- [Verification](../patterns/verification/README.md) — tests, visual diff, two adversarial reviews, then a human
- [Harness engineering](../patterns/harness-engineering/README.md) — small ordered checkpoints instead of one large rewrite

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| >300 | Screens in the Shopify app Helix is aimed at | Shopify engineering |

## Sources

- [Helix](https://shopify.engineering/helix)
