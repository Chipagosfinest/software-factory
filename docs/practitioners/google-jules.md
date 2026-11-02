# Google Jules

*Refreshed 2026-11-02*

## What they do

Jules is Google's asynchronous coding agent. The product page and the Google Labs post agree on the loop: pick a GitHub repository, clone it to a Google Cloud VM, plan, edit, and open a pull request. A `jules` label on an issue assigns the task from GitHub. The Labs post is the public-beta announcement. A 140,000-improvement figure that appears elsewhere in this repo is not on either page fetched for this profile, so it is not repeated.

## What they do well

The product page's plan table lists 15 tasks per day and 3 concurrent tasks on the entry plan, 100 tasks per day and 15 concurrent on the next, and 300 tasks per day and 60 concurrent on the highest, with Gemini models named on the page. Those are plan limits, not measured customer throughput.

## Patterns shown

- [Background agents](../patterns/background-agents/README.md) — one cloud VM per task, then a pull request

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| 15 / 3 | Entry plan: tasks per day / concurrent tasks | jules.google |
| 100 / 15 | Middle plan | jules.google |
| 300 / 60 | Highest plan listed | jules.google |

## Sources

- [Jules](https://jules.google)
- [Launch post](https://blog.google/technology/google-labs/jules)
