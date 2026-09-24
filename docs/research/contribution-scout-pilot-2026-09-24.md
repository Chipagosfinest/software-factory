# Contribution scout pilot — 2026-09-24

## Decision

Run a small, read-only daily GitHub issue scan for upstream projects Alec already uses or contributes to. Review a few candidates and choose one only after a local reproduction and overlap check. The desired outcome is a useful accepted fix, not issue or PR volume.

## Seed and evidence

- [Peter Steinberger's post](https://x.com/steipete/status/2102501642176528743) (2026-09-22) links to [libuv PR #5283](https://github.com/libuv/libuv/pull/5283). Exact post text and link were retrieved through FxTwitter on 2026-09-24 after direct X access failed.
- PR #5283 is open as of this check, with three approving reviews. It fixes ownership cleanup for macOS FSEvents path allocations. The PR reports a native test with 64 persistent watches and 8,000 rebuilds: 119.34 MiB physical-footprint growth before the fix versus 2.11 MiB after. The leak is reproduced; whether it is the sole cause of the reported ChatGPT/Codex crashes remains unproven in the PR.
- The linked [Codex crash issue #30824](https://github.com/openai/codex/issues/30824) has crash reports that make the problem concrete. It does not itself prove the leak caused every crash.
- [libuv contributing guidance](https://github.com/libuv/libuv/blob/v1.x/CONTRIBUTING.md) asks for appropriate branch choice, code style, and tests. Its [security policy](https://github.com/libuv/libuv/blob/v1.x/SECURITY.md) routes suspected active vulnerabilities privately. PR comments also show maintainers care about AI disclosure and human review.

## Coverage and search log

The root post, expanded link, PR body/reviews/comments, linked Codex issue, and libuv guidance were inspected on 2026-09-24. Direct X conversation access failed. Search for replies, quotes, and author follow-ups found no reliable additional first-party material; those parts of the thread remain unverified. The post has no attached media in the exact-post response.

Exa found the linked crash issue and source code. Parallel found libuv contribution and security guidance. Their primary-source sets were complementary; neither independently validated a causal connection between leak and crash. Secondary summaries were excluded from the decision.

## Pilot

`scripts/contribution-scout.mjs` scans the 100 most recently updated open issues in each watched repository, scores failure and reproduction signals, and caps the digest at four per repo. The scheduled workflow writes an Actions summary and downloadable Markdown artifact. It does not post, comment, open PRs, run untrusted code, or spend model tokens.

On 2026-09-24, an authenticated local scan found [CodexBar #3905](https://github.com/steipete/CodexBar/issues/3905), [CodexBar #1999](https://github.com/steipete/CodexBar/issues/1999), and [ext-apps #687](https://github.com/modelcontextprotocol/ext-apps/issues/687) among the leads. These are unvalidated candidates. The 100-issue window can miss older or less-active bugs, and keyword matches can be false positives. GitHub public API access without a token hit HTTP 403 locally; the workflow supplies its read-only token.

## Next validation

After the first scheduled run, inspect the digest for duplicates, ownership, repository policy, and practical reproduction. Pick one issue where Alec can verify the failure and produce a focused fix plus regression check. Expand sources to crash logs or social posts only if that improves the candidate quality over this baseline.
