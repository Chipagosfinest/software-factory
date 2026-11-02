# YouTube

*Refreshed 2026-11-02*

Running log of official YouTube channels for teams in [Practitioners](../practitioners/README.md), plus the teaching videos those channels published from 2026-09-03 through 2026-11-02. Newer entries are prepended.

## Research method

Checked 2026-11-02. A channel is listed only when its about page links to the team's own site, or its description names that site. Each video below was opened and attributed with YouTube's oEmbed (`author_url` on the official channel) and a published date from the channel's Atom feed. Takeaways are from the spoken content. Name-only collisions are excluded, including `@sentryai` (a camera company at smartsentry.ai) and tutorial channels that reuse Amp, OpenCode, or Codeium in the handle. Teams with no verified channel are omitted, including Factory, Cognition, Amp, Cline, Aider, OpenHands, Roo Code, Runloop, Tessl, Magic, Tabnine, Mistral, and Paperclip.

## 2026-10-30

### Qodo — Can You Trust What Your Software Factory Ships?

[Video](https://www.youtube.com/watch?v=niH78HK0dUk) · 2026-10-30

On Qodo's show, Momentic's CEO argues that once generation is cheap the factory bottleneck is verification, and that generated tests can be written or edited to pass rather than to specify behavior.

**Related:** [Qodo](../practitioners/qodo.md), [Verification](../patterns/verification/README.md)

## 2026-10-27

### LangChain — How to Build Agents That Improve Over Time: Model, Harness, Context

[Video](https://www.youtube.com/watch?v=xy_7SzwsIjM) · 2026-10-27

An agent is a model, a harness, and context. Improvement can be manual, human-approved, or automated; fully automated improvement is described as not available. `smithtune` pulls LangSmith trajectories for supervised fine-tuning. A harness change read from traces should stay human-reviewed because it applies to every user.

**Related:** [LangChain Deep Agents](../practitioners/langchain-deep-agents.md), [Harness engineering](../patterns/harness-engineering/README.md)

### OpenAI — Getting a Head Start with Codex

[Video](https://www.youtube.com/watch?v=lPZQrVFcz3c) · 2026-10-27

Mitchell Hashimoto describes ending the day by dispatching Codex agents for landscape research and for prototypes of features that are not fully specified, so the next session starts from that output.

**Related:** [OpenAI Codex](../practitioners/openai-codex.md), [Background agents](../patterns/background-agents/README.md)

## 2026-10-26

### LangChain — Inside Managed Deep Agents

[Video](https://www.youtube.com/watch?v=Wb3hQaG_xf0) · 2026-10-26

Deep Agents is a base harness: filesystem plus sandbox, skills and memory, large tool output stored on the filesystem, sub-agents, and human approval. Managed Deep Agents runs that harness on LangSmith Deployment, including durable execution and a task queue, so the team owns the business logic rather than that runtime.

**Related:** [LangChain Deep Agents](../practitioners/langchain-deep-agents.md), [Deep Agents](../patterns/harness-engineering/deep-agents.md)

## 2026-10-23

### Sentry — Powering Warp Factories with Sentry

[Video](https://www.youtube.com/watch?v=Shqcc2aRTGY) · 2026-10-23

Warp's developer-experience lead defines a software factory as one shared cloud sandbox (agreed models, skills, and automations from a backlog or Slack) instead of a per-laptop agent setup. The line is triage, a planning step that can stop for a human, implementation, verification, and adversarial review before the pull request. Verification includes a computer-use agent that records the clicks and cuts them to a short review video. After ship, the agent is supposed to watch Sentry alerts and user-session recordings and propose the next tasks.

**Related:** [Warp](../practitioners/warp.md), [Sentry Seer](../practitioners/sentry-seer.md), [Orchestration](../patterns/orchestration/README.md)

## 2026-10-15

### Sentry — How Sentry debugs its own AI agents

[Video](https://www.youtube.com/watch?v=rUlnhU0de7A) · 2026-10-15

On an issue, Seer Autofix runs a root-cause analysis and a plan, then either edits the code itself or hands the plan to a connected harness (Claude Code, Cursor cloud agents, or GitHub Copilot). That path can run when a new issue arrives. Production traces are an input to Sentry's own evals.

**Related:** [Sentry Seer](../practitioners/sentry-seer.md), [Verification](../patterns/verification/README.md)

## 2026-10-08

### Sentry — Debugging Agents in Different Environments

[Video](https://www.youtube.com/watch?v=0NEWeW0Opfk) · 2026-10-08

Agent traces are span trees, and a failure can be a wrong answer rather than an HTTP error. The walkthroughs are a store chatbot, a Slack agent that opens pull requests, and a CI review agent. Dashboards and alerts are how those regressions, including agent spend, get caught.

**Related:** [Sentry Seer](../practitioners/sentry-seer.md), [Verification](../patterns/verification/README.md)

## 2026-10-07

### Sentry — Seer Agent: Get Answers. Take Action.

[Video](https://www.youtube.com/watch?v=DCH1sQ2S2BQ) · 2026-10-07

From Slack or inside Sentry, Seer Agent answers from deploy data: which pull requests and commits shipped in a release, and which new issues followed. It can then build a dashboard for that error rate, comment, and assign issues. It uses the caller's permissions and asks before it changes anything.

**Related:** [Sentry Seer](../practitioners/sentry-seer.md)

## 2026-09-24

### Sentry — Protecting releases, fixing bugs with Sentry and LaunchDarkly

[Video](https://www.youtube.com/watch?v=uyesTWSDllI) · 2026-09-24

LaunchDarkly's release-automation lead says agents increase the code humans are asked to review, and that review cannot absorb that volume. The session treats feature flags and telemetry as the release path when a change goes wrong. Sentry's page for the same livestream says the walkthrough wires Sentry into a guarded release, rolls back the broken feature, and deploys a Seer Autofix.

**Related:** [Sentry Seer](../practitioners/sentry-seer.md), [Verification](../patterns/verification/README.md)

## 2026-09-14

### Sourcegraph — Introducing Agentic Batch Changes

[Video](https://www.youtube.com/watch?v=kY0_rRtJ8BM) · 2026-09-14

Agentic Batch Changes is described as generally available. In the demo, one request to fix SQL injections is applied across five repositories in Python, TypeScript, Go, and Java, with tests added and a pull request per repo. Existing checks stay in place. If a build breaks, the agent continues. Nothing merges on its own.

**Related:** [Sourcegraph](../practitioners/sourcegraph.md), [Orchestration](../patterns/orchestration/README.md)

## Verified channels

Handles to open for first-party video. **Top signal** marks a channel with an entry in the log above. The who-note is the channel's public role.

### Top signal

[@Sentry-monitoring](https://www.youtube.com/@Sentry-monitoring) (Sentry) · [@warpdotdev](https://www.youtube.com/@warpdotdev) (Warp) · [@LangChain](https://www.youtube.com/@LangChain) (LangChain) · [@OpenAI](https://www.youtube.com/@OpenAI) (OpenAI) · [@Sourcegraph](https://www.youtube.com/@Sourcegraph) (Sourcegraph) · [@QodoAI](https://www.youtube.com/@QodoAI) (Qodo)

### Labs and vendors

[@Sentry-monitoring](https://www.youtube.com/@Sentry-monitoring) (Sentry) **top signal** · [@OpenAI](https://www.youtube.com/@OpenAI) (OpenAI) **top signal** · [@anthropic-ai](https://www.youtube.com/@anthropic-ai) (Anthropic) · [@LangChain](https://www.youtube.com/@LangChain) (LangChain) **top signal** · [@cursor_ai](https://www.youtube.com/@cursor_ai) (Cursor) · [@GitHub](https://www.youtube.com/@GitHub) (GitHub) · [@Sourcegraph](https://www.youtube.com/@Sourcegraph) (Sourcegraph) **top signal** · [@VercelHQ](https://www.youtube.com/@VercelHQ) (Vercel) · [@replit](https://www.youtube.com/@replit) (Replit) · [@kirodotdev](https://www.youtube.com/@kirodotdev) (Kiro) · [@warpdotdev](https://www.youtube.com/@warpdotdev) (Warp) **top signal** · [@linear](https://www.youtube.com/@linear) (Linear) · [@JetBrainsTV](https://www.youtube.com/@JetBrainsTV) (JetBrains) · [@windsurf](https://www.youtube.com/@windsurf) (Windsurf) · [@poolsideai](https://www.youtube.com/@poolsideai) (Poolside) · [@lovable](https://www.youtube.com/@lovable) (Lovable) · [@Boltdotnew](https://www.youtube.com/@Boltdotnew) (Bolt.new) · [@googlecloudtech](https://www.youtube.com/@googlecloudtech) (Google Cloud) · [@Grok](https://www.youtube.com/@Grok) (xAI; about page links to x.ai) · [@Databricks](https://www.youtube.com/@Databricks) (Databricks) · [@Composio](https://www.youtube.com/@Composio) (Composio)

### Open-source builders

[@continuedev](https://www.youtube.com/@continuedev) (Continue; the channel says it was acquired by Cursor) · [@Kilo-Code](https://www.youtube.com/@Kilo-Code) (Kilo) · [@goose-oss](https://www.youtube.com/@goose-oss) (goose; links to github.com/block/goose) · [@charmcli](https://www.youtube.com/@charmcli) (Charm) · [@nimbalyst](https://www.youtube.com/@nimbalyst) (Nimbalyst)

### Infra

[@ModalLabs](https://www.youtube.com/@ModalLabs) (Modal) · [@e2b-dev](https://www.youtube.com/@e2b-dev) (E2B) · [@daytonaio](https://www.youtube.com/@daytonaio) (Daytona) · [@browserbase](https://www.youtube.com/@browserbase) (Browserbase) · [@cloudflare](https://www.youtube.com/@cloudflare) (Cloudflare) · [@CloudflareDevelopers](https://www.youtube.com/@CloudflareDevelopers) (Cloudflare Developers) · [@Morphllm](https://www.youtube.com/@Morphllm) (Morph) · [@relace_ai](https://www.youtube.com/@relace_ai) (Relace) · [@Harnessio](https://www.youtube.com/@Harnessio) (Harness)

### Review and eval

[@CodeRabbitAI](https://www.youtube.com/@CodeRabbitAI) (CodeRabbit) · [@greptileai](https://www.youtube.com/@greptileai) (Greptile) · [@withgraphite](https://www.youtube.com/@withgraphite) (Graphite; links to graphite.com) · [@QodoAI](https://www.youtube.com/@QodoAI) (Qodo) **top signal** · [@DatadogHQ](https://www.youtube.com/@DatadogHQ) (Datadog)

### Enterprise engineering

[@StripeDev](https://www.youtube.com/@StripeDev) (Stripe Developers) · [@shopifydevs](https://www.youtube.com/@shopifydevs) (Shopify developers) · [@UberEngineering](https://www.youtube.com/@UberEngineering) (Uber Engineering) · [@strongdm](https://www.youtube.com/@strongdm) (StrongDM)
