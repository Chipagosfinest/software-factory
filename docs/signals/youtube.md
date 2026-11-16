# YouTube

*Refreshed 2026-11-16*

Running log of official YouTube channels for teams in [Practitioners](../practitioners/README.md), plus the teaching videos those channels published from 2026-09-03 through 2026-11-16. Newer entries are prepended.

## Research method

Checked 2026-11-16. A channel is listed only when its about page links to the team's own site, or its description names that site. Each video below was opened and attributed with YouTube's oEmbed (`author_url` on the official channel) and a published date from the channel's Atom feed. Takeaways are from the spoken content. The 2026-11-04 Sentry entry uses the livestream description only. Name-only collisions are excluded, including `@sentryai` (a camera company at smartsentry.ai) and tutorial channels that reuse Amp, OpenCode, or Codeium in the handle. Teams with no verified channel are omitted, including Factory, Cognition, Amp, Cline, Aider, OpenHands, Roo Code, Runloop, Tessl, Magic, Tabnine, Mistral, and Paperclip.

## 2026-11-16

### LangChain — Building Jarvis: JPMC's Agent Building Assembly Line

[Video](https://www.youtube.com/watch?v=VpHYPfvfy0o) · 2026-11-16

David Odomirok, Tony Wu, and Jane Xue describe Jarvis at JPMorgan Chase as an assembly line for agents, not a single agent. The one agent that took months last year now takes minutes. Skills on the line are replaceable across software, agent, and production work, including the harness, the sandbox, and where it is deployed. A new agent starts able to do about 20–30% of the job. Offline evals pair a good case with a boundary the agent must not cross. Online checks look for numbers and claims that are not in the input, and for answers that miss the question. People sample the output and take judge escalations, and that feedback is stored as business skills. The subject-matter expert leads the agent team.

**Related:** [JPMorgan Chase Jarvis](../practitioners/jpmc-jarvis.md), [Harness engineering](../patterns/harness-engineering/README.md), [Verification](../patterns/verification/README.md), [Orchestration](../patterns/orchestration/README.md)

### Warp — How to fix the code review bottleneck (full walkthrough)

[Video](https://www.youtube.com/watch?v=uPCH2axUpbc) · 2026-11-12

The walkthrough is explicit that the goal is not auto-merge. Review runs in a separate context window and sends findings back inside the pipeline, with a cap of about three to five rounds and a way to stop and ask a person, rather than posting every pass on GitHub. On Warp's own benchmark, that loop raised accuracy and cost. On their task the cost was 3x, so the factory lets the agent skip the loop when the change looks low risk. The merge-risk skill checks five things: alignment with the request, blast radius and sensitive paths, whether the change was verified, what a rollback would cost, and how an incident would be detected. Computer use runs in a sandbox the team controls, and the recording is what the reviewer is shown.

**Related:** [Warp](../practitioners/warp.md), [Verification](../patterns/verification/README.md)

### OpenAI — Harness-as-a-Service: Building with the Agents API | DevDay 2026

[Video](https://www.youtube.com/watch?v=b7l_Dhe1h8M) · 2026-11-11

The Agents API is the Codex harness run as a service. The caller sets the tools, the data, the instructions, and the environment, either an OpenAI sandbox or their own, and OpenAI runs the harness. The three problems they walk through are keeping the harness off the machine that executes commands, showing turns for a path the product cannot predict, and resuming after a server is replaced, including not replaying a command whose result was lost. The rebooking demo loads a skill, caps concurrent sub-agents at two, and leaves a ticket hold for a person to confirm. Notion, Rakuten, and Bain are named as users. Bedrock managed agents use the same core inside AWS.

**Related:** [OpenAI Codex](../practitioners/openai-codex.md), [Harness engineering](../patterns/harness-engineering/README.md)

### OpenAI — What Will You Build With Coding Agents That Don't Quit? | DevDay 2026

[Video](https://www.youtube.com/watch?v=U1IVZy9FhVQ) · 2026-11-11

An OpenAI engineer on engineering acceleration describes a Codex agent that watched CI for six weeks, more than 1,000 hours, from a starting prompt of about 200 words that stated the goal and the tradeoffs. After about four days he had the main thread hand the slow debugging to sub-agents. The talk reports more than 100 pull requests a week, more than 1,000 commits, more than 600 Slack messages, and more than 213 fixes the agent merged itself, with just under half a million tool calls and more than 5,800 sub-agent sessions. The cost worked out to about $32 an hour, then about $16 an hour on a later model. It was most productive across a five-day stretch when he sent no messages. When it was unsure about deleting a test, it started another agent to review that change before asking a person.

**Related:** [OpenAI Codex](../practitioners/openai-codex.md), [Verification](../patterns/verification/README.md), [Orchestration](../patterns/orchestration/README.md)

### GitHub — Inside the Microsoft Copilot Harness: Customizing AI Agents

[Video](https://www.youtube.com/watch?v=STVHfSaSw7o) · 2026-11-10

Patrick Nikoletich says the Copilot SDK is used more for non-coding work than for coding, and that a team can replace the default harness, including its identity, prompt sections, tools, permissions, and skills. The demo is a pool of workers in their own containers on a local Docker host. An inference gateway holds the credentials, so the agent does not, and a sandbox can mask credentials and limit the network. Agent Host Protocol tunnels a CLI into that environment. A direct-to-Azure mode does not pass through GitHub. A session is a workspace, not one repository, so the agent can clone more than one repo. Harness 2.0 is described as a Rust rewrite, with the protocol included in the SDK.

**Related:** [GitHub Copilot](../practitioners/github-copilot.md), [Harness engineering](../patterns/harness-engineering/README.md), [Governance and safety](../patterns/governance-safety/README.md)

### Replit — Replit Monitoring Agent | Your On-Call Engineer

[Video](https://www.youtube.com/watch?v=9kd0qQfRwTA) · 2026-11-09

Replit's monitoring agent is turned on with one switch in a project's publishing settings. It reads usage traffic, error messages, publishing logs, and page-load times together, investigates the way an on-call engineer would, and can publish a fix. The person chooses whether to review that change or to turn on auto-publish, which deploys a validated fix to production.

**Related:** [Replit Agent Habitat](../practitioners/replit-agent-habitat.md), [Verification](../patterns/verification/README.md), [Self-improvement](../patterns/self-improvement/README.md)

## 2026-11-09

### Qodo — Qodo Hackathon — Day 5: A Factory That Improves

[Video](https://www.youtube.com/watch?v=sc-Dnzl_VUw) · 2026-11-09

Week one of Qodo's software-factory hackathon covered setup, verification of factory output, and a first self-improvement step that suggests rules. The framing is that a factory needs a mechanism to improve, with a human deciding what counts as improvement. Week two shifts review capabilities left into earlier stages.

**Related:** [Qodo](../practitioners/qodo.md), [Self-improvement](../patterns/self-improvement/README.md)

## 2026-11-08

### GitHub — 17 agents, one SDLC: How Levi Strauss reimagined development on GitHub

[Video](https://www.youtube.com/watch?v=-GpxKKgoWWg) · 2026-11-08

Jenny Patchen (Levi Strauss & Co.) describes rebuilding the SDLC around 17 agents on GitHub. The Back Pocket store-stylist app rebuild took about 2.5 months, compared with 9 months for the legacy app. Specialist agents each push a labeled fix commit with a consolidated summary, and a human approves and merges.

**Related:** [Levi Strauss](../practitioners/levi-strauss.md), [GitHub Copilot](../practitioners/github-copilot.md), [Verification](../patterns/verification/README.md), [Governance and safety](../patterns/governance-safety/README.md)

## 2026-11-06

### Sentry — Agent Trace Investigation with Seer

[Video](https://www.youtube.com/watch?v=Ks51wPYmM3c) · 2026-11-06

Agent tracing in Sentry shows tool and model calls, agent handoffs, and full input and output transcripts. From a checkout failure, Seer follows the user journey to an inventory root cause. Autofix then forms a plan, pushes code changes to the connected repo, and drafts a pull request for team review.

**Related:** [Sentry Seer](../practitioners/sentry-seer.md), [Verification](../patterns/verification/README.md)

## 2026-11-05

### Warp — Warp Factories complete walkthrough

[Video](https://www.youtube.com/watch?v=gdFqUnD19lw) · 2026-11-05

Five out-of-the-box agents are led by a Factory Foreman that orchestrates a task and delegates to sub-agents. Each agent picks harness, model (including bring-your-own inference), host, runner, MCPs, and secrets, and the whole factory is defined as code so its own agents can change that configuration. Automations trigger from Slack, GitHub pull request reviews, schedules, and custom webhooks, and one task is reachable from Slack, Jira, and GitHub with a timeline of artifacts and screen captures. A dashboard score can feed a self-improvement loop that proposes config changes, and benchmarks on the team's own factory work choose models and custom routers.

**Related:** [Warp](../practitioners/warp.md), [Orchestration](../patterns/orchestration/README.md), [Self-improvement](../patterns/self-improvement/README.md)

## 2026-11-04

### Sentry — Where Did My Tokens Go? Tracing Claude Agents with OpenTelemetry and Sentry

[Video](https://www.youtube.com/watch?v=p8kpOePCsAM) · 2026-11-04

The livestream description says agent cost is more than the model call: when a tool call hits a slow or broken backend, the agent retries, and every retry costs tokens, so one connected trace is needed to see spend that starts in an API or database. Anthropic's CJ Avilla sent Claude Platform OpenTelemetry data to Sentry and found an old project still burning tokens.

**Related:** [Sentry Seer](../practitioners/sentry-seer.md), [Agent safety and cost control](../patterns/governance-safety/agent-safety-cost-control.md)

## 2026-11-03

### OpenAI — Qodo brings company context into Codex code review

[Video](https://www.youtube.com/watch?v=yC72iQx6rM0) · 2026-11-03

Qodo positions itself as context and review for Codex across the whole software, including across two Git providers, so review catches P0 bugs. Developers in the video want bug resolution to run as an automatic loop instead of manually invoking agent skills.

**Related:** [Qodo](../practitioners/qodo.md), [OpenAI Codex](../practitioners/openai-codex.md), [Verification](../patterns/verification/README.md)

## 2026-11-02

### Warp — How to build an agentic self improvement loop

[Video](https://www.youtube.com/watch?v=PMRlYAB8kkI) · 2026-11-02

Ben, Warp's DevEx engineering lead, describes an inner factory loop: intake from Slack, GitHub, or Linear, triage (research and dedupe), an optional spec with a human, implementation, verification (computer use or Playwright end to end), adversarial review, ship, and monitoring such as Sentry that files new issues. The outer loop stores factory conversations, scores them (or a sample) with separate agents on 0-to-1 rubrics, and on a cron passes only failures to a self-improvement agent that looks for common failure patterns.

**Related:** [Warp](../practitioners/warp.md), [Self-improvement](../patterns/self-improvement/README.md), [Verification](../patterns/verification/README.md)

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

[@Sentry-monitoring](https://www.youtube.com/@Sentry-monitoring) (Sentry) · [@warpdotdev](https://www.youtube.com/@warpdotdev) (Warp) · [@LangChain](https://www.youtube.com/@LangChain) (LangChain) · [@OpenAI](https://www.youtube.com/@OpenAI) (OpenAI) · [@Sourcegraph](https://www.youtube.com/@Sourcegraph) (Sourcegraph) · [@QodoAI](https://www.youtube.com/@QodoAI) (Qodo) · [@GitHub](https://www.youtube.com/@GitHub) (GitHub) · [@replit](https://www.youtube.com/@replit) (Replit)

### Labs and vendors

[@Sentry-monitoring](https://www.youtube.com/@Sentry-monitoring) (Sentry) **top signal** · [@OpenAI](https://www.youtube.com/@OpenAI) (OpenAI) **top signal** · [@anthropic-ai](https://www.youtube.com/@anthropic-ai) (Anthropic) · [@LangChain](https://www.youtube.com/@LangChain) (LangChain) **top signal** · [@cursor_ai](https://www.youtube.com/@cursor_ai) (Cursor) · [@GitHub](https://www.youtube.com/@GitHub) (GitHub) **top signal** · [@Sourcegraph](https://www.youtube.com/@Sourcegraph) (Sourcegraph) **top signal** · [@VercelHQ](https://www.youtube.com/@VercelHQ) (Vercel) · [@replit](https://www.youtube.com/@replit) (Replit) **top signal** · [@kirodotdev](https://www.youtube.com/@kirodotdev) (Kiro) · [@warpdotdev](https://www.youtube.com/@warpdotdev) (Warp) **top signal** · [@linear](https://www.youtube.com/@linear) (Linear) · [@JetBrainsTV](https://www.youtube.com/@JetBrainsTV) (JetBrains) · [@windsurf](https://www.youtube.com/@windsurf) (Windsurf) · [@poolsideai](https://www.youtube.com/@poolsideai) (Poolside) · [@lovable](https://www.youtube.com/@lovable) (Lovable) · [@Boltdotnew](https://www.youtube.com/@Boltdotnew) (Bolt.new) · [@googlecloudtech](https://www.youtube.com/@googlecloudtech) (Google Cloud) · [@Grok](https://www.youtube.com/@Grok) (xAI; about page links to x.ai) · [@Databricks](https://www.youtube.com/@Databricks) (Databricks) · [@Composio](https://www.youtube.com/@Composio) (Composio)

### Open-source builders

[@continuedev](https://www.youtube.com/@continuedev) (Continue; the channel says it was acquired by Cursor) · [@Kilo-Code](https://www.youtube.com/@Kilo-Code) (Kilo) · [@goose-oss](https://www.youtube.com/@goose-oss) (goose; links to github.com/block/goose) · [@charmcli](https://www.youtube.com/@charmcli) (Charm) · [@nimbalyst](https://www.youtube.com/@nimbalyst) (Nimbalyst)

### Infra

[@ModalLabs](https://www.youtube.com/@ModalLabs) (Modal) · [@e2b-dev](https://www.youtube.com/@e2b-dev) (E2B) · [@daytonaio](https://www.youtube.com/@daytonaio) (Daytona) · [@browserbase](https://www.youtube.com/@browserbase) (Browserbase) · [@cloudflare](https://www.youtube.com/@cloudflare) (Cloudflare) · [@CloudflareDevelopers](https://www.youtube.com/@CloudflareDevelopers) (Cloudflare Developers) · [@Morphllm](https://www.youtube.com/@Morphllm) (Morph) · [@relace_ai](https://www.youtube.com/@relace_ai) (Relace) · [@Harnessio](https://www.youtube.com/@Harnessio) (Harness)

### Review and eval

[@CodeRabbitAI](https://www.youtube.com/@CodeRabbitAI) (CodeRabbit) · [@greptileai](https://www.youtube.com/@greptileai) (Greptile) · [@withgraphite](https://www.youtube.com/@withgraphite) (Graphite; links to graphite.com) · [@QodoAI](https://www.youtube.com/@QodoAI) (Qodo) **top signal** · [@DatadogHQ](https://www.youtube.com/@DatadogHQ) (Datadog)

### Enterprise engineering

[@StripeDev](https://www.youtube.com/@StripeDev) (Stripe Developers) · [@shopifydevs](https://www.youtube.com/@shopifydevs) (Shopify developers) · [@UberEngineering](https://www.youtube.com/@UberEngineering) (Uber Engineering) · [@strongdm](https://www.youtube.com/@strongdm) (StrongDM)
