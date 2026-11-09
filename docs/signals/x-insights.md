# X Insights

*Refreshed 2026-11-09*

Running log of insights those teams publish on X. Newer collection runs are prepended above older ones.

## Research Method

First-party posts from team accounts, November 2 – November 9, 2026. Reposts from unverified accounts are excluded. Each entry records the handle, date, post, a short reading of the claim, and the closest topic already in this repo.

## 2026-11-09

### @simonw (Simon Willison) — 2026-11-09

[Post](https://x.com/simonw/status/2119650353142747181)

He now hides the bulk of AI-generated PR descriptions inside a collapsed `details`/`summary` block, which GitHub Markdown supports, so agent pull requests are less exhausting to review.

**Related:** [Verification](../patterns/verification/README.md), [GitHub Ecosystem](../landscape/github-ecosystem.md)

### @addyosmani (Addy Osmani) — 2026-11-08

[Post](https://x.com/addyosmani/status/2119332146485891501)

The skills for managing coding agents are the skills for managing a team: selecting tasks, writing instructions, delegating, following up, evaluating, and deciding what ships. "Every gripe you have about bad managers is a bug report for interacting with agents." The highest-leverage habit he lists first is giving the agent a way to check its work, and his example brief states the goal, why, constraints, out-of-scope items, and a check command.

**Related:** [Context Engineering](../patterns/harness-engineering/context-engineering.md), [Verification](../patterns/verification/README.md)

### @EnoReyes (Eno Reyes, Factory) — 2026-11-06

[Post](https://x.com/EnoReyes/status/2118767454721851680)

Factory defines a software factory as the same stages for every piece of work, which standardizes the process rather than the output. Work starts from a signal (a Slack thread, Linear ticket, Sentry alert, failing CI job, tweet, or idea); a person picks it up with Droid, or a workstream triages it against a goal and has droids write the spec and open the PR, and most work still starts with a person. Every change gets the same checks regardless of author (Droid review, security review, a risk judge that cannot see who wrote it, CI, and a live-preview QA), validation hill-climbs a regret-free merge rate toward auto-merging most changes, and production breaks traced to the causing PR become new signals.

**Related:** [Factory.ai](../practitioners/factory-ai.md), [Verification](../patterns/verification/README.md), [Orchestration](../patterns/orchestration/README.md), [Self-Improvement](../patterns/self-improvement/README.md)

### @dexhorthy (Dex Horthy) — 2026-11-06

[Post](https://x.com/dexhorthy/status/2118718628627464571)

The term "software factory" is being semantically diffused, and the pre-AI NATO and DoD sense (automate more things) is still a useful model. How a team runs its stack, linters, tests, and previews is too heterogeneous for one product to solve in general, so the best products are building blocks rather than drop-in solutions.

**Related:** [Why Software Factories](../landscape/why-software-factories.md), [Harness Engineering](../patterns/harness-engineering/README.md)

### @github (GitHub) — 2026-11-06

[Post](https://x.com/github/status/2118830274431873379)

In internal testing, GitHub's new Git storage architecture supported 5,000 concurrent agents on one repo sending 7,200 pushes per second, while serving reads at consistently low latency ([engineering post](https://github.blog/engineering/architecture-optimization/building-git-infrastructure-for-agent-scale-development/)). The design minimizes coordination and decouples storage from compute. Git objects are immutable and content-addressed, so only reference updates need agreement.

**Related:** [GitHub Ecosystem](../landscape/github-ecosystem.md), [Background Agents](../patterns/background-agents/README.md)

### @hwchase17 (Harrison Chase, LangChain) — 2026-11-06

[Post](https://x.com/hwchase17/status/2118739844696277338) and [earlier post](https://x.com/hwchase17/status/2118464263497142576)

Most agents LangChain builds internally use async subagents in a meaningful way, and Deep Agents now ships async subagents so the agent keeps talking to the user while subagents work in the background. The same week, a test of seven browser-use toolsets in Managed Deep Agents picked Stagehand.

**Related:** [LangChain Deep Agents](../practitioners/langchain-deep-agents.md), [Orchestration](../patterns/orchestration/README.md)

### @amasad (Amjad Masad, Replit) — 2026-11-06

[Post](https://x.com/amasad/status/2118503241390665776)

Replit's custom kernel build lets it avoid 96% of recent Linux zero-day vulnerabilities. The post points at a write-up of the new sandbox design.

**Related:** [Replit Agent Habitat](../practitioners/replit-agent-habitat.md), [Sandbox Isolation](../patterns/background-agents/sandbox-isolation.md), [Governance and Safety](../patterns/governance-safety/README.md)

### @warpdotdev (Warp) — 2026-11-05

[Post](https://x.com/warpdotdev/status/2118412166034538775) quoting [Ben Holmes](https://x.com/BHolmesDev/status/2118411592627052937)

Three levers for the agent code-review bottleneck: run rounds of adversarial review with your own review agent before a human looks, verify user flows end to end with simulated environments and computer use, and score merge risk on every PR with a [/merge-risk skill](https://warp.dev/merge-risk) so reviewers know where to focus. Owning the reviewer lets the team set grading criteria and turn production incidents and reverts into eval cases. The post does not argue for merging without human review.

**Related:** [Warp](../practitioners/warp.md), [Verification](../patterns/verification/README.md)

### @factory (Factory) — 2026-11-04

[Post](https://x.com/factory/status/2118033889772155121)

HumanLayer is joining Factory, with @dexhorthy and @0xblacklight. HumanLayer is a multiplayer coding-agent IDE and cloud for running agents locally or in the background.

**Related:** [Factory.ai](../practitioners/factory-ai.md), [Devin + Factory.ai](../landscape/devin-factory.md)

### @AmpCode (Amp) — 2026-11-04

[Post](https://x.com/AmpCode/status/2117995287859929166)

Asked how Amp avoids slop with no PR review, one meeting, and anyone able to push to main, @sqs answers "skin in the game": "We have 21 co-founders at Amp… every single person is a public face," and anyone can challenge a change.

**Related:** [Amp](../practitioners/amp.md), [Governance and Safety](../patterns/governance-safety/README.md)

### @OpenAIDevs (OpenAI developers) — 2026-11-03

[Post](https://x.com/OpenAIDevs/status/2117408792346509663)

OpenAI built Pando, a new Git backend for its monorepo, to handle more pushes and fetches without changing how engineers and agents use Git. It cut push latency by about 80% and serves nearly a petabyte of Git data a day. Paired with GitHub's agent-scale storage test, Git itself is becoming an agent-throughput bottleneck.

**Related:** [OpenAI Codex](../practitioners/openai-codex.md), [Background Agents](../patterns/background-agents/README.md)

## 2026-11-02

### @cramforce (Malte Ubl, Vercel) — 2026-11-02

[Post](https://x.com/cramforce/status/2117267405923815913)

Vercel CI's speed comes from task caching by default (tasks unaffected by the diff never start), installing dependencies once and sharing them across tasks, and running all tasks at maximum concurrency.

**Related:** [Vercel](../practitioners/vercel.md), [Dev Tools Stack](../landscape/dev-tools-stack.md), [Verification](../patterns/verification/README.md)

### @thdxr (Dax Raad, OpenCode/SST) — 2026-11-02

[Post](https://x.com/thdxr/status/2117299716987789772)

GitHub org- and repo-level secrets can be exfiltrated by anyone whose write-access account is compromised; secrets belong in environments with protection rules.

**Related:** [Governance and Safety](../patterns/governance-safety/README.md), [GitHub Ecosystem](../landscape/github-ecosystem.md)

### @tessl_io (Tessl) — 2026-11-02

[Post](https://x.com/tessl_io/status/2117284507460018665)

Tessl repositioned from context for coding agents to a platform for building software factories, with ready-made loops for Ticket to PR and Code Review, or custom loops.

**Related:** [Orchestration](../patterns/orchestration/README.md), [Why Software Factories](../landscape/why-software-factories.md)

### @amasad (Amjad Masad, Replit) — 2026-11-01

[Post](https://x.com/amasad/status/2116998155925360965)

Replit's one-toggle feedback widget turns end users' feedback on a site into prompts for the agent to build.

**Related:** [Self-Improvement](../patterns/self-improvement/README.md), [Replit Agent Habitat](../practitioners/replit-agent-habitat.md)

### @cramforce (Malte Ubl, Vercel) — 2026-10-31

[Post](https://x.com/cramforce/status/2116323769967128620)

Vercel Labs released agent-desktop, bringing agent-browser's token-efficient computer use to the whole desktop operating system.

**Related:** [Sandbox Isolation](../patterns/background-agents/sandbox-isolation.md), [Dev Tools Stack](../landscape/dev-tools-stack.md)

### @thdxr (Dax Raad, OpenCode/SST) — 2026-10-31

[Post](https://x.com/thdxr/status/2116527005801873662)

OpenCode's token cost is double its payroll. The 25-person team says its output is similar to a 75-person pre-AI team, so software cost is not going to zero at current token prices.

**Related:** [Agent Safety & Cost Control](../patterns/governance-safety/agent-safety-cost-control.md), [Key Numbers](../reference/key-numbers.md)

### @factory (Factory) — 2026-10-30

[Post](https://x.com/factory/status/2116214422779953574)

Factory acquired Typedef, which builds a context layer that helps agents understand enterprise data, to give Droids clearer lineage and evidence for migrations, pipeline debugging, and model refactors. A same-day [post](https://x.com/matanSF/status/2116215162898436176) from @matanSF states: "People often over-index on the code generation step. Enterprise agents live or die by the data."

**Related:** [Devin + Factory.ai](../landscape/devin-factory.md), [Context Engineering](../patterns/harness-engineering/context-engineering.md)

### @AmpCode (Amp) — 2026-10-30

[Post](https://x.com/AmpCode/status/2116243991922671619)

A migration that removed a column old pods still wrote to caused 500s during rollout. Amp argues mandatory review might have caught it but would not have been worth the churn and slower pace.

**Related:** [Verification](../patterns/verification/README.md), [Post-merge review, as of 2026-05-26](../case-studies/autonomous-codebase-post-merge-review-2026-05-26.md)

### @dexhorthy (Dex Horthy) — 2026-10-30

[Post](https://x.com/dexhorthy/status/2116003536098263419)

Per-directory docs or compacted summaries for agents are only worth it if they increase speed without reducing quality, which needs codebase-specific evals; otherwise the simpler answer is to have agents read from source every time.

**Related:** [Context Engineering](../patterns/harness-engineering/context-engineering.md), [Memory and Knowledge](../patterns/memory-knowledge/README.md)

### @cursor_ai (Cursor) — 2026-10-30

[Post](https://x.com/cursor_ai/status/2116074289053175808)

Cursor disclosed a security incident: a modified, malicious Claude Code VS Code extension (not developed by Anthropic) reached at most 5,000 users through Cursor's IDE extension marketplace.

**Related:** [Agent Security Catalog](../patterns/governance-safety/agent-security-catalog.md), [Governance and Safety](../patterns/governance-safety/README.md)

## 2026-10-31

### @hwchase17 (LangChain) — 2026-10-29

[Post](https://x.com/hwchase17/status/2115854759991369840)

Many harness problems are now best solved by coupling the harness to infrastructure, including async subagents and browser use.

**Related:** [Harness Engineering (OpenAI)](../patterns/harness-engineering/harness-engineering-openai.md), [Deep Agents](../patterns/harness-engineering/deep-agents.md)

### @rauchg (Vercel) — 2026-10-29

[Post](https://x.com/rauchg/status/2115874115118834153)

"The future of software engineering is agents talking to other agents." He suggests an `AGENTS.md` line that tells agents to send vendors feedback.

**Related:** [Harness Engineering (OpenAI)](../patterns/harness-engineering/harness-engineering-openai.md), [Agent Orchestrator](../patterns/orchestration/agent-orchestrator.md)

### @AmpCode — 2026-10-29

[Post](https://x.com/AmpCode/status/2115912054964179204)

Amp's agent waits for a bug fix to deploy, emails the reporter with credits, and finds everyone else who hit the same bug: agents closing the loop with customers.

**Related:** [Software Factory Operations](../project/software-factory-operations-2026-07-16.md)

### @rauchg (Vercel) — 2026-10-28

[Post](https://x.com/rauchg/status/2115539426684408300)

The bottleneck in AI coding is CI. The fixes he names are fast, stable infrastructure, Turborepo-style caching, and "agentic CI," where agents inspect, abort, trigger, and replay CI runs from the CLI.

**Related:** [Dev Tools Stack](../landscape/dev-tools-stack.md), [GitHub Ecosystem](../landscape/github-ecosystem.md)

### @amasad (Replit) — 2026-10-28

[Post](https://x.com/amasad/status/2115485095251308740)

Replit's Agent Habitat treats agents as powerful but unpredictable and gives them a contained space whose boundaries limit the damage they can do.

**Related:** [Sandbox Isolation](../patterns/background-agents/sandbox-isolation.md), [Agent Safety & Cost Control](../patterns/governance-safety/agent-safety-cost-control.md)

### @hwchase17 (LangChain) — 2026-10-27

[Post](https://x.com/hwchase17/status/2115161782079897946)

As agents do more of the work, reviewing that work becomes the bottleneck. Hex 4.0 and the LangSmith Trajectory view are redesigned around review, with code rather than YAML as the backbone.

**Related:** [Software Factory Operations](../project/software-factory-operations-2026-07-16.md), [Harness Engineering (LangChain)](../patterns/harness-engineering/harness-engineering-langchain.md)

### @cursor_ai — 2026-10-26

[Post](https://x.com/cursor_ai/status/2114793714531102901)

The Cursor Agent SDK treats agents as code: Markdown prompts and TypeScript tools, hosted or self-hosted, with built-in evals for every change.

**Related:** [Coding Agents Landscape](../landscape/README.md), [SWE-bench Ecosystem](../patterns/verification/swe-bench-ecosystem.md)

### @bcherny (Anthropic, Claude Code) — 2026-10-22

[Post](https://x.com/bcherny/status/2113333859907747871)

Agent Skills began as a Claude Code experiment and were donated to the Agentic AI Foundation alongside MCP.

**Related:** [MCP Ecosystem](../landscape/mcp-ecosystem-deep-dive.md), [Deep Agents](../patterns/harness-engineering/deep-agents.md)

### @hwchase17 (LangChain) — 2026-10-20

[Post](https://x.com/hwchase17/status/2112650555852275951)

The simplest managed harness is a while loop. Production pushes it toward a model-agnostic design, its own observability, sandbox-as-tool, and async by default.

**Related:** [Harness Engineering (OpenAI)](../patterns/harness-engineering/harness-engineering-openai.md), [Sandbox Architecture 2026](../patterns/background-agents/sandbox-architecture-2026.md)

### @rauchg (Vercel) — 2026-10-20

[Post](https://x.com/rauchg/status/2112658577110520122)

Vercel is opening harness durability to any runtime, including Pi and OpenCode. Claude Code and Codex can be durable and observable, but they are not built to be embedded, so they need an extra sandbox.

**Related:** [Harness Engineering (OpenAI)](../patterns/harness-engineering/harness-engineering-openai.md), [Sandbox Isolation](../patterns/background-agents/sandbox-isolation.md)

## Notable launches

- [Devin Review 2.0](https://x.com/cognition/status/2118390707228745948) is up to 5x cheaper and 1.5x faster PR review. See [Cognition Devin](../practitioners/cognition-devin.md) and [Verification](../patterns/verification/README.md).
- [Cognition SWE-2 Flash](https://x.com/cognition/status/2118069614521241739) is a fast coding model. Cognition says it outperforms all American open-weight models on leading evals, and weights are shared with partners and researchers through a gated program. See [Cognition Devin](../practitioners/cognition-devin.md) and [SWE-bench Ecosystem](../patterns/verification/swe-bench-ecosystem.md).
- [CodeRabbit GPT-6 Cyber eval](https://x.com/coderabbitai/status/2118399600101093813): GPT-6 Cyber inside CodeRabbit's security scan caught 22 of 33 known vulnerabilities, against 19 for its production ensemble, with 66% more high and medium severity findings. See [CodeRabbit](../practitioners/coderabbit.md) and [Verification](../patterns/verification/README.md).
- [Vercel Security Review](https://x.com/cramforce/status/2117731626100863085) is source-code-aware security review combined with knowledge of the app's production risks on Vercel. Vercel's security team used it internally for months before release. See [Vercel](../practitioners/vercel.md) and [Verification](../patterns/verification/README.md).
- [GitHub Copilot app projects](https://x.com/github/status/2119133311465353675) give Copilot a goal across one or more repos and have it coordinate sessions and recurring automations. See [GitHub Copilot](../practitioners/github-copilot.md) and [Orchestration](../patterns/orchestration/README.md).
- [HumanLayer joins Factory](https://x.com/factory/status/2118033889772155121). HumanLayer is a multiplayer coding-agent IDE and cloud for running agents locally or in the background. See [Factory.ai](../practitioners/factory-ai.md).
- [CodeRabbit free security scans](https://x.com/coderabbitai/status/2116258631222231179) committed $1M in tokens over two weeks for free customer security scans; in one week it ran ~10k scans and identified 35,000 critical vulnerabilities. See [CodeRabbit](../practitioners/coderabbit.md) and [Verification](../patterns/verification/README.md).
- [Factory Droid 1.0](https://x.com/factory/status/2115934579446182213) claims the top of Terminal-Bench. See [Devin + Factory.ai](../landscape/devin-factory.md) and [SWE-bench Ecosystem](../patterns/verification/swe-bench-ecosystem.md).
- [Cognition](https://x.com/cognition/status/2112290148205436979) reports a Devin Fusion score of 68 on the Coding Agent Index. See [Devin + Factory.ai](../landscape/devin-factory.md) and [SWE-bench Ecosystem](../patterns/verification/swe-bench-ecosystem.md).
- [Cognition acquires Corridor](https://x.com/cognition/status/2115872968043864146). See [Devin + Factory.ai](../landscape/devin-factory.md) and [Competitive Analysis](../landscape/README.md).
- [Utah's Claude Code pilot](https://x.com/bcherny/status/2115491259381072269): 71% reported saving 20+ hours. See [Enterprise Adoption](../landscape/enterprise-adoption.md).

## Watched accounts

Handles to read for first-party posts. **Top signal** is the shorter list for a pass when time is limited. The who-note is the public role, not a summary of a post.

### Top signal

[@dcramer](https://x.com/dcramer) (David Cramer, Sentry) · [@EnoReyes](https://x.com/EnoReyes) (Eno Reyes, Factory) · [@mitchellh](https://x.com/mitchellh) (Mitchell Hashimoto) · [@GeoffreyHuntley](https://x.com/GeoffreyHuntley) (Geoffrey Huntley) · [@dexhorthy](https://x.com/dexhorthy) (Dex Horthy) · [@walden_yan](https://x.com/walden_yan) (Walden Yan, Cognition) · [@steipete](https://x.com/steipete) (Peter Steinberger) · [@gneubig](https://x.com/gneubig) (Graham Neubig, SWE-agent) · [@addyosmani](https://x.com/addyosmani) (Addy Osmani) · [@kieranklaassen](https://x.com/kieranklaassen) (Kieran Klaassen)

### Already in the October–November 2026 log

[@AnthropicAI](https://x.com/AnthropicAI) (Anthropic) · [@claudeai](https://x.com/claudeai) (Claude) · [@bcherny](https://x.com/bcherny) (Boris Cherny, Claude Code) · [@_catwu](https://x.com/_catwu) (Cat Wu, Claude Code) · [@trq212](https://x.com/trq212) (Claude Code) · [@OpenAIDevs](https://x.com/OpenAIDevs) (OpenAI developers) · [@thsottiaux](https://x.com/thsottiaux) (Thibault Sottiaux, Codex) · [@cursor_ai](https://x.com/cursor_ai) (Cursor) · [@mntruell](https://x.com/mntruell) (Michael Truell, Cursor) · [@leerob](https://x.com/leerob) (Lee Robinson) · [@eric_zakariasson](https://x.com/eric_zakariasson) (Eric Zakariasson, Cursor) · [@cognition](https://x.com/cognition) (Cognition) · [@factory](https://x.com/factory) (Factory) · [@matanSF](https://x.com/matanSF) (Factory) · [@AmpCode](https://x.com/AmpCode) (Amp) · [@sqs](https://x.com/sqs) (Quinn Slack, Sourcegraph) · [@LangChainAI](https://x.com/LangChainAI) (LangChain) · [@hwchase17](https://x.com/hwchase17) (Harrison Chase, LangChain) · [@rauchg](https://x.com/rauchg) (Guillermo Rauch, Vercel) · [@amasad](https://x.com/amasad) (Amjad Masad, Replit) · [@karpathy](https://x.com/karpathy) (Andrej Karpathy) · [@swyx](https://x.com/swyx) (Shawn Wang) · [@simonw](https://x.com/simonw) (Simon Willison) · [@cramforce](https://x.com/cramforce) (Malte Ubl, Vercel) · [@thdxr](https://x.com/thdxr) (Dax Raad, OpenCode/SST) · [@dexhorthy](https://x.com/dexhorthy) (Dex Horthy) · [@tessl_io](https://x.com/tessl_io) (Tessl) · [@coderabbitai](https://x.com/coderabbitai) (CodeRabbit) · [@EnoReyes](https://x.com/EnoReyes) (Eno Reyes, Factory) · [@github](https://x.com/github) (GitHub) · [@addyosmani](https://x.com/addyosmani) (Addy Osmani) · [@warpdotdev](https://x.com/warpdotdev) (Warp) · [@BHolmesDev](https://x.com/BHolmesDev) (Ben Holmes, Warp) · [@0xblacklight](https://x.com/0xblacklight) (HumanLayer)

### Labs and vendors

[@dcramer](https://x.com/dcramer) (David Cramer, Sentry) **top signal** · [@getsentry](https://x.com/getsentry) (Sentry) · [@FactoryAI](https://x.com/FactoryAI) (Factory) · [@EnoReyes](https://x.com/EnoReyes) (Eno Reyes, Factory) **top signal** · [@ashtom](https://x.com/ashtom) (Thomas Dohmke) · [@kdaigle](https://x.com/kdaigle) (Kyle Daigle, GitHub) · [@github](https://x.com/github) (GitHub) · [@julesagent](https://x.com/julesagent) (Google Jules) · [@augmentcode](https://x.com/augmentcode) (Augment Code) · [@Sourcegraph](https://x.com/Sourcegraph) (Sourcegraph) · [@linear](https://x.com/linear) (Linear) · [@karrisaarinen](https://x.com/karrisaarinen) (Karri Saarinen, Linear) · [@kirodotdev](https://x.com/kirodotdev) (Kiro) · [@warpdotdev](https://x.com/warpdotdev) (Warp) · [@zeddotdev](https://x.com/zeddotdev) (Zed) · [@jetbrains](https://x.com/jetbrains) (JetBrains) · [@tabnine](https://x.com/tabnine) (Tabnine) · [@harnessio](https://x.com/harnessio) (Harness) · [@MistralAI](https://x.com/MistralAI) (Mistral) · [@xai](https://x.com/xai) (xAI) · [@googledevs](https://x.com/googledevs) (Google Developers) · [@GeminiApp](https://x.com/GeminiApp) (Gemini) · [@poolsideai](https://x.com/poolsideai) (Poolside) · [@magicailabs](https://x.com/magicailabs) (Magic) · [@imbue_ai](https://x.com/imbue_ai) (Imbue) · [@v0](https://x.com/v0) (v0) · [@boltdotnew](https://x.com/boltdotnew) (Bolt.new) · [@EricSimons40](https://x.com/EricSimons40) (Eric Simons, StackBlitz) · [@Lovable](https://x.com/Lovable) (Lovable) · [@antonosika](https://x.com/antonosika) (Anton Osika, Lovable) · [@ScottWu46](https://x.com/ScottWu46) (Scott Wu, Cognition) · [@walden_yan](https://x.com/walden_yan) (Walden Yan, Cognition) **top signal** · [@kevinhou22](https://x.com/kevinhou22) (Kevin Hou) · [@alexalbert__](https://x.com/alexalbert__) (Alex Albert, Anthropic) · [@jaredpalmer](https://x.com/jaredpalmer) (Jared Palmer) · [@tobi](https://x.com/tobi) (Tobi Lütke, Shopify) · [@mitchellh](https://x.com/mitchellh) (Mitchell Hashimoto) **top signal**

### Open-source builders

[@paulgauthier](https://x.com/paulgauthier) (Paul Gauthier, Aider) · [@opencode](https://x.com/opencode) (OpenCode) · [@charmcli](https://x.com/charmcli) (Charm) · [@kilocode](https://x.com/kilocode) (Kilo Code) · [@cline](https://x.com/cline) (Cline) · [@continuedev](https://x.com/continuedev) (Continue) · [@gneubig](https://x.com/gneubig) (Graham Neubig) **top signal** · [@rbren_dev](https://x.com/rbren_dev) (Robert Brennan, Continue) · [@xingyaow_](https://x.com/xingyaow_) (Xingyao Wang, OpenHands) · [@steipete](https://x.com/steipete) (Peter Steinberger) **top signal** · [@pvncher](https://x.com/pvncher) (coding-agent builder) · [@GeoffreyHuntley](https://x.com/GeoffreyHuntley) (Geoffrey Huntley) **top signal** · [@Steve_Yegge](https://x.com/Steve_Yegge) (Steve Yegge)

### Infra

[@modal](https://x.com/modal) (Modal) · [@charles_irl](https://x.com/charles_irl) (Modal) · [@e2b](https://x.com/e2b) (E2B) · [@daytonaio](https://x.com/daytonaio) (Daytona) · [@ivanburazin](https://x.com/ivanburazin) (Ivan Burazin, Daytona) · [@RunloopAI](https://x.com/RunloopAI) (Runloop) · [@browserbase](https://x.com/browserbase) (Browserbase) · [@pk_iv](https://x.com/pk_iv) (Paul Klein, Browserbase) · [@morph_labs](https://x.com/morph_labs) (Morph) · [@relace_ai](https://x.com/relace_ai) (Relace) · [@KentonVarda](https://x.com/KentonVarda) (Kenton Varda, Cloudflare)

### Review and eval

[@coderabbitai](https://x.com/coderabbitai) (CodeRabbit) · [@greptile](https://x.com/greptile) (Greptile) · [@graphite](https://x.com/graphite) (Graphite) · [@QodoAI](https://x.com/QodoAI) (Qodo) · [@datadoghq](https://x.com/datadoghq) (Datadog) · [@OfirPress](https://x.com/OfirPress) (Ofir Press, SWE-bench) · [@jyangballin](https://x.com/jyangballin) (John Yang, SWE-bench) · [@KLieret](https://x.com/KLieret) (Kilian Lieret, SWE-agent) · [@sayashk](https://x.com/sayashk) (Sayash Kapoor) · [@HamelHusain](https://x.com/HamelHusain) (Hamel Husain)

### Practitioners and analysts

[@addyosmani](https://x.com/addyosmani) (Addy Osmani) **top signal** · [@jxnlco](https://x.com/jxnlco) (Jason Liu) · [@danshipper](https://x.com/danshipper) (Dan Shipper) · [@kieranklaassen](https://x.com/kieranklaassen) (Kieran Klaassen) **top signal** · [@mckaywrigley](https://x.com/mckaywrigley) (McKay Wrigley) · [@ryancarson](https://x.com/ryancarson) (Ryan Carson) · [@mattpocockuk](https://x.com/mattpocockuk) (Matt Pocock) · [@omarsar0](https://x.com/omarsar0) (Elvis Saravia) · [@ThePrimeagen](https://x.com/ThePrimeagen) (ThePrimeagen) · [@erikbern](https://x.com/erikbern) (Erik Bernhardsson) · [@jerryjliu0](https://x.com/jerryjliu0) (Jerry Liu, LlamaIndex) · [@lennysan](https://x.com/lennysan) (Lenny Rachitsky) · [@petergyang](https://x.com/petergyang) (Peter Yang)
