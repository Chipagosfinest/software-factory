# Amp

*Refreshed 2026-11-09*

## What they do

Amp is a coding agent. The evidence used here is posts from the Amp account, also logged in [X insights](../signals/x-insights.md).

A user reports a bug. Amp waits until the fix has rolled out, then emails that person: the fix is live, with $10 in free credits. It then finds other people who hit the same bug and emails them too.

On October 30, 2026, Amp described a migration that removed a column old pods still wrote to and caused 500s during rollout. Amp argues mandatory review might have caught it but would not have been worth the churn and slower pace.

On November 4, 2026, asked how Amp avoids slop with no PR review, one meeting, and anyone able to push to main, Quinn Slack answered "skin in the game": "We have 21 co-founders at Amp… every single person is a public face," and anyone can challenge a change.

## What they do well

The post is a product behavior, not a benchmark. What it demonstrates is a closed loop past the merge: deploy, confirm, notify the reporter, and notify the rest of the affected users. The coding-agent writeups elsewhere in this corpus stop at the pull request. This one continues to the customer.

The October 29 post states no throughput, cost, or quality number. The October 30 post names 500s during the rollout.

## Patterns shown

- [Self-improvement](../patterns/self-improvement/README.md) — the fix is not done until the people who hit the bug are told
- [Verification](../patterns/verification/README.md) — the agent waits for the rollout before it claims the fix

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| $10 | Credits included in the email to the reporter | [Amp post](https://x.com/AmpCode/status/2115912054964179204) |
| 2026-10-29 | Post date | Same |
| 500s | Errors during rollout after a column was removed while old pods still wrote to it | [2026-10-30 post](https://x.com/AmpCode/status/2116243991922671619) |
| 21 | Co-founders, each a public face who can challenge a change | [2026-11-04 post](https://x.com/AmpCode/status/2117995287859929166) |

## Sources

- [Amp, 2026-10-29](https://x.com/AmpCode/status/2115912054964179204)
- [Mandatory review, 2026-10-30](https://x.com/AmpCode/status/2116243991922671619)
- [Skin in the game, 2026-11-04](https://x.com/AmpCode/status/2117995287859929166)
