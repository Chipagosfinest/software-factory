# DoorDash

*Refreshed 2026-11-02*

## What they do

DoorDash's July 6, 2026 post is about measuring an internal code reviewer, not about declaring a winner model. The careers URL blocked a plain curl; the article text was retrieved from that URL. The production reviewer is a scout plus deep reviewers. DashBench replays frozen historical pull requests.

## What they do well

On the 105-case report, the production system (Claude Sonnet 4.6 high scout and Claude Opus 4.8 high reviewer) found 504 real findings at 53.6% weighted recall. A no-scout GPT-5.5 high baseline found 164 real findings at 30.7% weighted recall. Weights are critical 4, high 2, medium 1, low 0.5. DoorDash's argument is that author acceptance cannot see false negatives and is product telemetry, not ground truth. Other model mixes led recall or precision; the post does not treat one mix as best on every axis.

## Patterns shown

- [Verification](../patterns/verification/README.md) — replayed pull requests scored on weighted precision, recall, and cost

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| 105 | Replay cases in the reported set | DoorDash |
| 504 / 53.6% | Real findings and weighted recall, production scout plus reviewer | DoorDash |
| 164 / 30.7% | Same, no-scout baseline | DoorDash |

## Sources

- [DashBench](https://careersatdoordash.com/blog/how-we-learned-to-trust-our-ai-code-reviewer-at-doordash/)
