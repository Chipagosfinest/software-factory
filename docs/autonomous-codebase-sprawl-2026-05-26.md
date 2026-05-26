# Autonomous Codebase Sprawl

*Compiled: May 26, 2026*

## Research Question

What is the current sprawl around autonomous codebases, background coding agents, and software-factory systems, especially projects like Background Agents / Open-Inspect, and what should Software Factory learn from it?

This is not a ranking. It is a current map of the category.

## Executive Read

The category has moved from "coding assistant" to "repo operating system." The important projects are no longer just wrappers around Claude Code or Codex. They are building durable work queues, sandbox pools, per-repo memory, PR lifecycle loops, CI self-healing, review gates, scheduled jobs, and human approval boundaries.

The core pattern is converging:

1. A task source: GitHub issue, Linear ticket, Slack command, cron, webhook, Sentry alert, or human prompt.
2. A durable control plane: Temporal, Cloudflare Durable Objects, LangGraph, GitHub Actions, custom SQLite/Postgres queues, or OpenAI Symphony.
3. Isolated execution: Modal, Docker, Kubernetes/gVisor, local worktrees, cloud VMs, or hosted sandboxes.
4. Agent harness: Claude Code, Codex, OpenCode, custom multi-agent loops, or model-provider-neutral SDKs.
5. Verification: tests, lint, CI, browser checks, self-review, independent AI review, human approval, or post-merge monitoring.
6. Memory and audit: run logs, learned patterns, cost records, PR history, repo manifests, and work graphs.

The sharper strategic point for Software Factory: the market is validating the repo-control-plane thesis, but the open-source sprawl is mostly thin demos or single-repo automators. The gap is a disciplined, evidence-heavy operating layer that can coordinate many repos without becoming a risky auto-merge bot.

## Current Map

| System | Current Signal | Architecture / Claim | What Matters |
|---|---:|---|---|
| [Background Agents / Open-Inspect](https://github.com/ColeMurray/background-agents/) | 1,524 stars, 232 forks, last pushed Apr 17, 2026 | Cloudflare Workers + Durable Objects control plane, Modal sandboxes, Next.js, Slack/GitHub/Linear integrations, cron/webhooks/Sentry automations, sub-task spawning | Best open-source reference for hosted background coding sessions. Single-tenant security model is explicit. |
| [backgroundagents.dev](https://backgroundagents.dev/) | Product/category site | "Open framework for background coding agents"; team members start sessions from Slack/web/VS Code and review PRs later | The user story is non-engineers producing PRs, not just engineers moving faster. |
| [background-agents.com summit recap](https://ona.com/stories/background-agents-summit) | May 22, 2026 category signal | Ona says speakers from Stripe, Uber, Monzo, Cloudflare, and others converged on production background-agent primitives | Useful category framing: the bottleneck is coordination, review queues, migrations, and repeated repo work. |
| [OpenAI Symphony](https://openai.com/index/open-source-codex-orchestration-symphony/) / [repo](https://github.com/openai/symphony) | 24,313 stars, 2,384 forks, last pushed May 20, 2026 | Linear board becomes a control plane; each task gets an isolated autonomous implementation run; agents shepherd CI, rebase, review feedback, and merge readiness | The strongest public proof that "manage work, not sessions" is the right abstraction. |
| [Agent Substrate](https://github.com/agent-substrate/substrate) | 290 stars, created May 13, last pushed May 23, 2026 | Kubernetes/gVisor actor substrate multiplexes many stateful agent workloads across fewer warm workers | Infrastructure-level answer to high-density, stateful agent runtimes. Very early, but strategically important. |
| [ACODA Factory](https://github.com/leoaicloud-source/acoda-factory) | Created May 9, 2026 | Self-hosted Temporal software factory; repo + task -> PR; warm FORGE workers; Postgres; dashboard | Strong example of the "wake up to a PR" Temporal pattern, but still young. |
| [temporal-repo-steward](https://github.com/tamara1031/temporal-repo-steward) | Created May 2, 2026 | Pull-based Temporal platform that periodically opens refactor PRs, self-heals CI, resolves conflicts, and can auto-merge behind branch protection | One of the cleaner durable PR lifecycle designs. Good model for CI wait, merge polling, non-retryable errors. |
| [claude-auto](https://github.com/cj-vana/claude-auto) | Created Mar 21, 2026 | Scheduled Claude Code jobs; picks issues or discovered work; SQLite memory; plan -> implement -> review loop; opens PRs | Useful lightweight reference for budget caps, feedback rounds, and "never commit to main" rules. |
| [Foundry](https://github.com/merlinrabens/foundry) | Created Mar 6, 2026 | GitHub issue label -> worktree -> agent -> PR -> three independent AI reviews -> fixes -> ready to merge | Good pattern for independent reviewer quorum before fix pass. Mostly shell, likely brittle but conceptually sharp. |
| [AutoCode](https://github.com/ajsai47/autocode) | Created Mar 8, 2026 | Pure Claude Code skills; seven constrained agents; cron daemon; repo manifest; budget controls; coverage gaps and GitHub issues | Interesting low-infra "skills as factory" approach. Useful if Software Factory wants portable local mode. |
| [Factory](https://github.com/ajsai47/factory) | Created Mar 18, 2026 | Linear ticket -> multi-agent pipeline -> PR; LangGraph + Claude; persistent memory; sandboxed agents | Shows the common five-agent pattern: scout, architect, builder, tester, reviewer. |
| [ACO System](https://github.com/aniketkarne/aco-system) | Created May 23, 2026 | Six agents communicate through SQLite/Postgres pipeline, no shared context window | The "database as coordination layer" pattern is worth stealing. Complexity moves to schemas, not chat transcripts. |
| [agent-forge](https://github.com/jsafouani/agent-forge) | Created May 11, 2026 | 16-phase Claude Code workflow; stable core, crowd contract, roster review, persistent work graph | More speculative, but useful for self-improvement boundaries: agents may modify roster, not stable core. |
| [github-agents](https://github.com/GabsFranke/claude-code-github-agent) | Created Feb 25, 2026 | Self-hosted GitHub webhook agent over 40+ events, YAML workflows, MCP, memory/search, sandbox worker scale-out | Practical webhook bridge for PR review, CI fix, issue triage, slash commands. |
| [bgagents](https://github.com/michael-elkabetz/bgagents) | 42 stars, last pushed Mar 13, 2026 | REST API, UI, and MCP wrapper around Claude Code / Codex background agents | Earlier thin wrapper; useful mainly as proof that "backgroundify code agents" became obvious. |
| [agentic-harness](https://github.com/codejunkie99/agentic-harness) | 77 stars, Rust-native | SDK/CLI for repo-reading agents deployable locally, CI, remote sandbox, or edge | Runtime/tooling layer, not a full factory; useful for typed provider-neutral agent apps. |
| [GenericAgent](https://github.com/lsdefine/GenericAgent) | Technical report Apr 21, 2026 | Minimal self-evolving general agent with browser, terminal, filesystem, keyboard/mouse, vision, ADB | Adjacent but important: software factories are starting to merge with general computer-control agents. |

## Research Evidence

| Study / Source | Date | Finding | Implication |
|---|---:|---|---|
| [AIDev](https://arxiv.org/html/2602.09185v1) | Feb 2026 | 932,791 agentic PRs from five agents across 116,211 repos and 72,189 developers; curated 33,596-PR subset for richer review data | Agent-authored PRs are large enough to study as a real development mode, not a novelty. |
| [Collaborator or Assistant?](https://arxiv.org/html/2605.08017v1) | May 2026 | In 29,585 PR lifecycles, collaborator tools are at least 96% agent-initiated, but agent-authorized merges are under 0.1% | Agents are operational teammates; humans still hold merge governance. Software Factory should preserve that boundary by default. |
| [How AI Coding Agents Modify Code](https://arxiv.org/html/2601.17581) | Jan 2026 | 24,014 merged agentic PRs and 5,081 human PRs show substantial differences in commit count and moderate differences in files touched and deleted lines | Review policy should adapt by agent and diff shape, not treat every PR equally. |
| [Fix-related agent PR merge study](https://ar5iv.labs.arxiv.org/html/2602.00164) | Feb 2026 | 8,106 fix-related PRs: 65.0% merged overall; OpenAI Codex 81.6% merge rate; GitHub Copilot 42.4%; Devin 42.9%; failed tests and duplicate prior fixes are common non-merge reasons | The bottleneck is validation and project-fit, not generating plausible patches. |
| [PR message-code inconsistency study](https://www.arxiv.org/pdf/2601.04886v2) | Jan 2026 | 23,247 agentic PRs; high inconsistency had 28.3% acceptance vs 80.0%, and took 55.8h vs 16.0h to merge; phantom changes were the largest category | PR-body verification should be a first-class gate. Agents often oversell or misdescribe diffs. |
| [Testing in agentic PRs](https://arxiv.org/pdf/2601.03556) | Jan 2026 | Test-file inclusion grew from 31% to 52%; test PRs are larger and take longer, but merge rates are similar | Force tests early for risky changes; expect larger review surface when agents do it correctly. |
| [AI IDEs or Autonomous Agents?](https://cmustrudel.github.io/papers/msr2026agarwal.pdf) | May 2026 | First-agent adoption repos saw +36.3% commits and +76.6% lines added, but warnings rose about 18% and cognitive complexity about 39% | Autonomous agents are accelerators with complexity debt. The control plane must price complexity, not just throughput. |
| [METR Frontier Risk Report](https://metr.org/blog/2026-05-19-frontier-risk-report/) | May 19, 2026 | Anthropic, Google, Meta, and OpenAI reported heavy internal AI-agent use; METR emphasized that agents still had worse judgment/reliability than human experts on some risk assessments | Use agents broadly, but don't delegate final judgment on high-stakes governance to one model. |
| [OpenAI Symphony](https://openai.com/index/open-source-codex-orchestration-symphony/) | 2026 | Some OpenAI teams saw landed PRs increase 500% in the first three weeks after Symphony-style orchestration | The business value is work orchestration plus merge shepherding, not "better chat." |
| [Greptile: Rise of the Overnight Agents](https://www.greptile.com/blog/rise-of-the-overnight-agents) | May 5, 2026 | Greptile observed fully AI-generated PR share rising from 0.86% in Feb 2025 to 27.6% in Apr 2026; failure patterns differ by agent | Agent provenance should feed review rules. Different agents over-index on different bug classes. |

## What Background Agents Gets Right

Background Agents / Open-Inspect is the best current open-source architecture to study for hosted autonomous codebase work because it separates responsibilities cleanly:

- Control plane: Cloudflare Workers and Durable Objects manage sessions, WebSockets, GitHub integration, auth, and durable state.
- Data plane: Modal sandboxes provide full dev environments with browser automation, terminals, port tunnels, and repo secrets.
- Collaboration surface: web, Slack, GitHub, Linear, and automation triggers all feed the same session model.
- Agent runtime: it can run OpenCode and supports multiple model providers.
- Automation: cron, Sentry alerts, inbound webhooks, auto-pause after consecutive failures, run history, and sub-task spawning.

The limitation is just as important: the repo states it is single-tenant only. Shared GitHub App credentials and trusted-org assumptions are acceptable for one company, but not for a multi-tenant SaaS without a deeper authorization model.

## What The Sprawl Means For Software Factory

Software Factory should not try to be every agent runtime. The better position is:

1. **Control layer over autonomous work**: normalize tickets, issues, alerts, cron jobs, and ad hoc prompts into one work queue.
2. **Evidence ledger**: store every run's prompt, plan, commands, changed files, tests, CI, cost, reviewer findings, and merge decision.
3. **Repo policy engine**: per-repo rules for allowed files, max diff size, required tests, risk classes, protected paths, and escalation.
4. **External runner abstraction**: support Codex, Claude Code, OpenCode, Background Agents, Symphony-like runners, Temporal runners, and local scripts as execution backends.
5. **Governance boundary**: default to PR creation and merge readiness, not autonomous merge, unless branch protection and policy gates explicitly allow it.
6. **Sprawl index**: track which agents/systems are producing code, how often their PRs are accepted, where they regress, and which review gates catch them.

## Build / Buy / Watch

### Build

- Unified `work_items` model: source, repo, requested outcome, risk class, status, owner, runner, budget.
- `agent_runs` ledger: model, runner, sandbox, commands, tool calls, files touched, tests, costs, artifacts, final verdict.
- `pr_evidence` checker: compare PR body claims to actual diff, tests, and CI evidence.
- Repo manifest: setup commands, test commands, protected paths, allowed triggers, max autonomy level.
- A background-runner adapter that can launch local Codex/Claude/OpenCode first, then grow into Temporal or Background Agents.

### Buy / Reuse

- Background Agents / Open-Inspect for hosted sandbox architecture ideas.
- Symphony for task-board-to-agent orchestration semantics.
- Temporal for durable long-running workflows if Software Factory starts owning execution durability.
- Sentry/Checkly/Semgrep/Socket as signal sources, not as the factory itself.

### Watch

- Agent Substrate: likely important if persistent agent sessions become a Kubernetes primitive.
- ACO-style database pipelines: practical alternative to chatty multi-agent coordination.
- Self-improving roster systems like agent-forge: promising, but keep stable core and policy files outside self-modification.
- Academic AIDev follow-ons: these are becoming the real measurement layer for agent PR acceptance, churn, tests, and governance.

## Near-Term Product Direction

The next useful Software Factory artifact should be a **repo autonomy dashboard**:

- Repos by autonomy level: observe-only, suggest, PR-only, CI-fix, auto-merge allowed.
- Agent-produced PRs by tool and outcome.
- Repeated failure patterns: failing tests, duplicate fixes, PR-body inconsistency, protected-file touches, complexity growth.
- "Ready for background agents" score: setup reproducibility, tests, CI speed, branch protection, secrets policy, Sentry/Checkly coverage.
- Runner comparison: Codex vs Claude Code vs OpenCode vs Background Agents vs Temporal runner on accepted PR rate and review load.

## Source Notes

- The user's X link was inaccessible through normal search, but the tweet ID decodes to May 24, 2026. It was treated as a market-signal pointer, not as evidence.
- Vendor and personal project claims are separated from academic or large-scale empirical studies above.
- GitHub star/fork/push counts are current as of the May 26, 2026 Exa search results and should be refreshed before investment or build decisions.
