# Production Coding-Agent Case Studies: State of Play

*Refreshed July 16, 2026 with matched Exa and Parallel searches plus direct verification of primary sources.*

## Verdict

The corpus had the right early examples, but several material follow-ups were missing.

The category has moved from “agents can open PRs” to four harder operating questions:

1. How do you prevent generated work from overwhelming review?
2. What proof must accompany an asynchronous change?
3. How do you evaluate the harness, skills, and reviewer rather than only the model?
4. What shared substrate lets many agent products reuse identity, sandboxes, state, and observability?

The strongest new case studies are Spotify, Shopify, Block, DoorDash, GitHub, Datadog, Pinterest, Cognition, and OpenAI’s evaluation audit. They reinforce the repo’s harness thesis while weakening any argument based on headline benchmark scores alone.

## Research Method

Four company cohorts were searched through both Exa and Parallel:

- model/platform builders: OpenAI, Anthropic, GitHub, Microsoft
- internal factories: Stripe, Spotify, Ramp, Coinbase
- large engineering organizations: Uber, Cloudflare, Meta, LinkedIn, Block, DoorDash
- migration/evaluation teams: Airbnb, Pinterest, Datadog, Shopify, Cognition

The strongest URLs were fetched through both providers. Direct web search was then used to verify dates, exact wording, and current first-party pages.

### Provider comparison

| Provider | Best contribution | Weakness in this pass |
|---|---|---|
| Exa | Found newer first-party engineering posts with high semantic relevance, especially Spotify, Shopify, Block, Datadog, GitHub, and OpenAI | Also returned secondary summaries that had to be excluded |
| Parallel | Strong extraction from exact primary URLs and good overlap on Airbnb, Cloudflare, Microsoft, and production evaluation | Broad company queries sometimes returned product guides or third-party recaps instead of engineering posts |
| Direct web verification | Confirmed current official pages, dates, and exact metrics | Search recall was narrower than Exa |

No material factual disagreement remained after checking primary sources. Commercial or third-party summaries are not used for quantitative claims below.

## Material Updates

### Spotify: from Honk experiment to company operating model

**Latest source:** [Coding Is No Longer the Constraint](https://engineering.atspotify.com/2026/6/code-with-claude-coding-is-no-longer-the-constraint), June 2026.

Spotify now reports:

- more than 99% of engineers use AI coding tools weekly
- 94% say the tools make them more productive
- pull-request frequency is up 76%
- Fleet Management has merged more than 2.5 million automated maintenance PRs over its lifetime, mostly through deterministic automation
- a recent Honk-powered Java migration completed in three days

This is not evidence that Honk authored 2.5 million PRs. The important architecture is the combination: deterministic Fleetshift orchestration identifies and schedules targets; Honk handles code modifications that scripts cannot.

**Follow-up case study:** [Honk Part 4](https://engineering.atspotify.com/2026/4/background-coding-agents-dataset-migrations-honk-part-4), April 22, 2026.

- problem: roughly 1,800 direct downstream pipelines across three frameworks
- result: 240 automated migration PRs for the two more standardized frameworks
- estimated manual effort avoided: 10 engineering weeks
- explicit failure boundary: Spotify stopped automating the less standardized Scio path
- verification gap: target repositories often lacked build-time unit tests, forcing owner teams to test manually

**What changed:** Spotify’s case is now strongest as evidence for admission control. Standardization and executable verification determine which task classes agents should receive.

### Shopify: River is the surface; Aquifer is the factory

**Source:** [Under the River](https://shopify.engineering/under-the-river), May 28, 2026.

Shopify reports:

- River coauthored one in eight merged PRs
- 59,918 River sessions in 5,170 Slack channels during a recent 30-day period
- 3,536 River-coauthored PRs merged in that period
- more than 7,000 people touched by those sessions
- median session length of 19 minutes and 50 tool calls

The more reusable finding is Aquifer:

- durable, Postgres-backed session and append-only event log
- disposable harness
- disposable sandbox
- credentials proxy and gateway
- centralized observability
- agent “profiles” as data bundles containing prompts, skills, extensions, sandbox policy, and model defaults
- interactive, automation, and batch modes on the same substrate

**What changed:** Shopify is now the clearest first-party example of durable session identity separated from disposable execution.

### Block: Builderbot reached material production share

**Source:** [Block rolls out Builderbot](https://block.xyz/inside/block-rolls-out-builderbot-a-new-suite-of-ai-native-tools-that-changes-the-way-we-ship), June 17, 2026.

Block reports:

- more than 200,000 operations per day
- approximately 1,500 merged PRs per week
- about 15% of production code changes
- ticket intake from Linear and Jira
- branch creation, coding, PR creation, CI watching, and feedback iteration

These are first-party, vendor-style claims without a published independent audit or detailed denominator methodology.

**What changed:** The older “95% adoption” story should be supplemented with an actual factory throughput claim.

### DoorDash: code-review acceptance is not ground truth

**Source:** [How we learned to trust our AI code reviewer](https://careersatdoordash.com/blog/how-we-learned-to-trust-our-ai-code-reviewer-at-doordash/), July 6, 2026.

DashBench replays frozen historical PRs and triangulates human labels, production behavior, and agentic judgment. On its 105-case report:

- the production scout-plus-reviewer system found 504 real findings
- weighted recall was 53.6%
- a no-scout GPT-5.5-high baseline found 164 real findings with 30.7% weighted recall

DoorDash explicitly argues that acceptance telemetry cannot observe false negatives and that human acceptance is product telemetry, not benchmark ground truth. It tracks weighted precision, recall, F1, high/critical recall, latency, and cost separately.

**What changed:** This is the strongest current production example for multi-signal review evaluation and repeated runs under model variance.

### GitHub: evaluate the harness with the model held fixed

**Source:** [Evaluating performance and efficiency of the GitHub Copilot agentic harness](https://github.blog/ai-and-ml/github-copilot/evaluating-performance-and-efficiency-of-the-github-copilot-agentic-harness-across-models-and-tasks/), June 25, 2026.

GitHub compares Copilot CLI against model-vendor harnesses while holding the model, task, context window, reasoning effort, and tool settings as constant as practical. It evaluates task resolution, token consumption, cost, and run-to-run variance across public and internal benchmarks.

Important caveat: for benchmarks with fewer than 100 instances, GitHub reports the best of five runs after infrastructure normalization. These results are useful harness evidence, not a neutral public leaderboard.

**What changed:** “Harness matters” now has a current controlled-comparison methodology from a platform vendor.

### OpenAI: Symphony shipped; benchmark confidence fell

**Sources:**

- [Open-source Codex orchestration: Symphony](https://openai.com/index/open-source-codex-orchestration-symphony/), April 27, 2026
- [Separating signal from noise in coding evaluations](https://openai.com/index/separating-signal-from-noise-coding-evaluations), July 8, 2026

Symphony reports:

- most people could comfortably manage only three to five interactive sessions
- a project-management board became the agent control plane
- some OpenAI teams saw a 500% increase in landed PRs over the first three weeks
- review packets include working-product walkthroughs
- the orchestrator handles CI, rebases, conflicts, flaky checks, and retries

The newer evaluation audit is more consequential:

- OpenAI estimates roughly 30% of SWE-Bench Pro tasks are broken
- it retracts its February recommendation to use SWE-Bench Pro
- the audit used an automated flagging pipeline, multiple investigator-agent passes, and independent review by five experienced software engineers

**What changed:** The corpus must stop presenting SWE-Bench Pro as the safe replacement for Verified. Production-derived, internally replayable evals are now more credible than a single public leaderboard.

### Pinterest: skills require their own eval harness

**Source:** [An Engineer’s Guide to Better AI Skills](https://medium.com/pinterest-engineering/an-engineers-guide-to-better-ai-skills-implementing-a-testing-process-to-optimize-agent-a000c9c9abcd), May 12, 2026.

Pinterest tested an internal iOS architecture skill across 100 runs:

- vanilla overall accuracy: 73% for its Codex-based agent and 62% for Claude Code
- test set: five repetitions of 15 positive and five negative prompts
- explicit “load this skill” prompts succeeded consistently
- terse or ambiguous prompts exposed routing failures

**What changed:** Skill invocation is an observable behavior to regression-test, not an assumption. A skill file existing in the repo does not prove it was selected.

### Datadog: harness-first verification and self-improving evals

**Sources:**

- [Observability-driven harnesses](https://www.datadoghq.com/blog/ai/harness-first-agents/), March 9, 2026
- [SQL optimization via autoresearch](https://www.datadoghq.com/blog/llm-experimentation-autoresearch/), May 20, 2026

Datadog reports:

- redis-rust reached production-like staging with comparable latency and 87% lower memory use
- Helix sustained millions of deterministic simulation runs and reached about 93% of peak disk throughput while preserving Kafka semantics
- a SQL optimization agent improved accuracy 59% using a 100-case dataset, experiment tracking, self-verification, and cross-session handoffs

These are first-party results from Datadog systems and should remain labeled as such.

**What changed:** The verification loop now includes production telemetry, simulation, property tests, experiment history, and structured handoffs—not only CI and an LLM judge.

### Cognition: asynchronous work needs replayable proof

**Source:** [Verifying Agentic Development at Scale](https://cognition.com/blog/testing-development), May 29, 2026.

Cognition reports that more Devin sessions are now initiated asynchronously than interactively. Its test mode:

- writes a source-grounded test plan before acting
- labels assertions as passed, failed, or untested
- uses deterministic skills for repetitive setup such as login
- returns labeled screenshots and chaptered test video
- offers reusable environment blueprints for later sessions

Approved test runs per day more than doubled over the preceding months, but Cognition does not publish the base count.

**What changed:** A screen recording alone is weak proof. The useful artifact binds intent, assertions, actions, and visible results.

## Revalidated, Still Current

### Cloudflare

[The internal AI engineering stack](https://blog.cloudflare.com/internal-ai-engineering-stack/), April 20, 2026, remains current:

- 3,683 active internal users
- 93% R&D adoption
- 20.18 million monthly AI Gateway requests
- 241.37 billion tokens routed in the reported 30-day period
- merge requests rose from roughly 5,600 to more than 8,700 per week on a four-week rolling average

Its next stated phase was cloud background agents on Durable Objects plus sandbox containers. No later first-party production results for that phase surfaced in this pass.

### Microsoft .NET

[Ten Months with Copilot Coding Agent in dotnet/runtime](https://devblogs.microsoft.com/dotnet/ten-months-with-cca-in-dotnet-runtime/), March 23, 2026, remains the best public repo-level production study:

- 878 agent PRs in `dotnet/runtime`; 535 merged
- 2,963 agent PRs across seven repositories; 1,885 merged
- substantial review and human intervention persisted

The case is integrated in [Software Factory Operations](software-factory-operations-2026-07-16.md).

## No Material New First-Party Follow-up Found

As of July 16, 2026, this pass did not surface a newer first-party deep case study for:

- Stripe Minions beyond Parts 1 and 2
- Ramp Inspect beyond the January/February first-party and Modal write-ups
- Coinbase Forge beyond the existing Coinbase developer-productivity account
- Uber’s internal coding stack beyond the March deep dive; a newer identity post is security architecture, not a factory outcome study
- LinkedIn CAPT beyond the existing contextual-playbooks post
- Airbnb’s LLM migration beyond the existing test-migration and data-mocking case studies
- Meta beyond the April engineering posts already tracked

This is a search result, not proof that no internal or unindexed update exists. These entries should remain in the corpus with their existing dates rather than be presented as newly refreshed evidence.

## Updated Evidence Ladder

| Tier | Meaning | Examples |
|---|---|---|
| A | First-party measured production outcomes with methods and caveats | Microsoft .NET, Spotify Honk Part 4, DoorDash DashBench |
| B | First-party production outcomes with limited independent validation | Shopify River, Block Builderbot, Cloudflare stack, Datadog harness results, OpenAI Symphony |
| C | Controlled vendor evaluation or reproducible harness methodology | GitHub harness comparison, Pinterest skill harness, OpenAI benchmark audit |
| D | Architecture description without strong outcome measurements | many product announcements and framework posts |
| E | Third-party summary, vendor customer story, or prediction report | discovery only; do not use as primary quantitative evidence |

## What This Means for Software Factory

1. **Add review admission and WIP limits.** Spotify, DoorDash, .NET, and the enterprise longitudinal study all point at verification/review as the binding constraint.
2. **Make proof a product surface.** Return test plans, assertions, screenshots/videos when relevant, deterministic results, and a compact trajectory.
3. **Evaluate skills and harnesses separately.** Track whether a skill fired, whether it helped, token/cost changes, and run variance.
4. **Separate durable session state from disposable execution.** Shopify Aquifer is the clearest reference architecture.
5. **Use task-class allowlists.** Spotify’s standardized dbt/BigQuery success and Scio stop condition show why autonomy cannot be global.
6. **Retire leaderboard-led claims.** OpenAI’s SWE-Bench Pro audit invalidates the repo’s earlier “switch to Pro” confidence.
7. **Close the production loop.** Datadog’s simulation/telemetry and DoorDash’s replay benchmark are stronger targets than an LLM judge alone.

## Next Check-in

Run the next refresh when one of these happens:

- a tracked company publishes a new first-party engineering post
- a major public benchmark changes methodology or is retracted
- one of the “no newer follow-up” companies publishes new scale or quality data
- Software Factory implements proof bundles, admission control, or autonomy promotion and needs updated comparables
