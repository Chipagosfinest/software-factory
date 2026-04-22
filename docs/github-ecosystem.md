# GitHub's Agent Ecosystem

*Last updated: March 16, 2026*

---

## Overview

GitHub has transformed from a code repository into a full agent platform in early 2026. With Agent HQ (multi-agent orchestration), Agentic Workflows (markdown-defined automation), Copilot Coding Agent (issue-to-PR), agentic Code Review, custom agents via `.github/agents/`, and Actions as the execution substrate, GitHub now provides an end-to-end infrastructure for autonomous software development.

This document maps each component and assesses how they relate to Software Factory -- complementary, competitive, or foundational.

---

## GitHub Agent HQ (February 2026)

Multi-agent orchestration platform that transforms GitHub into a command center for AI agents.

**Supported agents:** Anthropic (Claude), OpenAI (Codex), Google Labs (Jules), Cognition (Devin), xAI.

**Mission Control features:**
- Assign multiple agents to work in parallel across repos
- Track agent progress from GitHub.com, VS Code, mobile, CLI
- Pause, refine instructions, or restart tasks mid-run
- Enterprise control plane with audit logging, usage metrics, agent allowlists

**Relationship to Software Factory:** Complementary. Agent HQ is an orchestration dashboard; Software Factory provides the specialized agents (PR review, CI debug, security patching, incident response) that run within it. Our agents could be registered as custom agents in Agent HQ and managed through Mission Control.

Sources:
- [Welcome Home, Agents (Agent HQ Launch)](https://github.blog/news-insights/company-news/welcome-home-agents/)
- [How to Orchestrate Agents Using Mission Control](https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/)
- [Why Agent HQ Matters for Engineering Teams](https://www.eficode.com/blog/why-github-agent-hq-matters-for-engineering-teams-in-2026)

---

## Agentic Workflows (Technical Preview, February 2026)

Write automation in plain Markdown files in `.github/workflows/`. The `gh aw` CLI compiles these into GitHub Actions workflows that coding agents execute.

### How It Works

1. Define automation in `.github/workflows/WORKFLOW-NAME.md` using natural language
2. `gh aw` compiles the Markdown into Actions workflows
3. Coding agents (Copilot CLI, Claude Code, etc.) interpret and execute the instructions
4. Results appear as PRs, comments, or issue labels

### Six Continuous Patterns

| Pattern | What It Does |
|---------|-------------|
| Continuous Triage | Auto-label and route incoming issues |
| Continuous Documentation | Keep READMEs and docs aligned with code changes |
| Continuous Code Simplification | Identify improvements and open refactoring PRs |
| Continuous Test Improvement | Assess coverage gaps and add tests |
| Continuous Quality Hygiene | Investigate CI failures and propose fixes |
| Continuous Reporting | Generate repository health reports |

### Security Model

- Read-only permissions by default
- Write operations require explicit "safe outputs" (pre-approved GitHub operations)
- Sandboxed container execution
- Network isolation with configurable firewall
- User content sanitized before agent processing
- PRs never auto-merged -- human review required
- Each run costs ~2 Copilot premium requests

**Relationship to Software Factory:** Directly complementary. Agentic Workflows handles the trigger and orchestration layer; our agents handle the reasoning and execution. The "Continuous Quality Hygiene" pattern maps to our CI Debugger agent. "Continuous Code Simplification" maps to background cleanup agents (the OpenAI harness engineering pattern).

Sources:
- [Automate Repository Tasks with Agentic Workflows](https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows/)
- [Agentic Workflows Technical Preview Changelog](https://github.blog/changelog/2026-02-13-github-agentic-workflows-are-now-in-technical-preview/)
- [GitHub Agentic Workflows Docs](https://github.github.com/gh-aw/)

---

## Copilot Coding Agent (GA)

Assign a GitHub Issue to Copilot and it spins up a secure Actions environment, explores the repo, writes code, runs tests, and opens a draft PR.

### Key Capabilities (March 2026)

| Feature | Details |
|---------|---------|
| Model picker | Choose between faster models for simple work or more powerful ones for complex refactoring |
| Self-review | Runs Copilot code review on its own changes before opening the PR |
| Security scanning | Runs code scanning, secret scanning, and dependency checks automatically (code scanning free with coding agent) |
| CLI handoff | Transition between cloud and local environments without losing context |
| External task sources | Assign from GitHub Issues, Azure Boards, Jira (public preview March 2026), Raycast, or Linear |
| Self-hosted runners | Supported since October 2025 for orgs that opted out of GitHub-hosted runners |

### Pricing

Each coding agent session = 1 premium request + GitHub Actions minutes.

| Plan | Premium Requests/mo | Price |
|------|-------------------|-------|
| Pro | ~300 | $10/mo |
| Pro+ | ~1,500 | $39/mo |
| Business | Configurable | Per-seat |
| Overages | Unlimited | $0.04/request |

**Relationship to Software Factory:** Competitive for simple issue-to-PR tasks. The Coding Agent handles well-defined, low-to-medium complexity issues. Software Factory's advantage: specialized agents for PR review, CI debugging, security patching, and incident response that the Coding Agent does not do. The Coding Agent is a feature builder; Software Factory is a production maintainer.

Sources:
- [About GitHub Copilot Coding Agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)
- [What's New with Copilot Coding Agent](https://github.blog/ai-and-ml/github-copilot/whats-new-with-github-copilot-coding-agent/)
- [Copilot Coding Agent for Jira Preview](https://github.blog/changelog/2026-03-05-github-copilot-coding-agent-for-jira-is-now-in-public-preview/)

---

## Copilot Code Review (Agentic Architecture, GA March 2026)

Rebuilt on an agentic tool-calling architecture. Gathers broader repository context (relevant code, directory structure, references) to produce higher-quality findings that prioritize correctness and architectural integrity.

### What Changed

- Runs on GitHub Actions (not just inline inference)
- Agent gathers context before reviewing, not just the diff
- Produces deeper findings -- understands architectural patterns, not just syntax
- Can be requested from GitHub CLI
- 60+ million code reviews completed as of March 2026

**Relationship to Software Factory:** Competitive with our PR Reviewer agent. GitHub's agentic code review is free for Copilot subscribers and deeply integrated into the PR workflow. Our PR Reviewer's advantages: knowledge graph integration, customizable review criteria, LLM judge verification, and independence from the GitHub ecosystem.

Sources:
- [Copilot Code Review Agentic Architecture](https://github.blog/changelog/2026-03-05-copilot-code-review-now-runs-on-an-agentic-architecture/)
- [60 Million Copilot Code Reviews](https://github.blog/ai-and-ml/github-copilot/60-million-copilot-code-reviews-and-counting/)

---

## Custom Agents via `.github/agents/`

Create specialized agent profiles as Markdown files with YAML frontmatter.

### Configuration

File: `.github/agents/AGENT-NAME.md`

```yaml
---
name: "Security Reviewer"
description: "Reviews PRs for security vulnerabilities"
target: github-copilot
tools:
  - execute
  - read
  - edit
  - search
  - web
model: "claude-opus-4.6"
mcp-servers:
  sentry:
    url: "https://mcp.sentry.io"
    secrets:
      AUTH_TOKEN: ${{ secrets.SENTRY_TOKEN }}
---

# Instructions

Review pull requests for security vulnerabilities...
```

### Key Details

- Max 30,000 characters of instruction content
- Built-in MCP servers: `github` (read-only repo tools), `playwright` (browser automation, localhost only)
- Hierarchy: Repository overrides Organization overrides Enterprise
- Agents tab in repos (January 2026) provides a dedicated UI
- Tools allowlist: `execute`, `read`, `edit`, `search`, `agent`, `web`, `todo`

**Relationship to Software Factory:** This is the integration point. Software Factory agents could be defined as `.github/agents/` profiles, making them discoverable and configurable per-repo through GitHub's native UI. The agent definitions become part of the repo, version-controlled alongside code.

Sources:
- [Custom Agents Configuration Reference](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [About Custom Agents](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-custom-agents)
- [Agents Tab in Repository](https://github.blog/changelog/2026-01-26-introducing-the-agents-tab-in-your-repository/)
- [How to Write a Great agents.md](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)

---

## GitHub Actions as Agent Runtime

GitHub Actions is the chosen execution substrate for all autonomous agent work on the platform.

### Why Actions Matters for Agents

| Capability | Agent Use |
|------------|-----------|
| Ephemeral runners | Clean environment per agent session; no state leakage |
| Actions Runner Controller (ARC) | Kubernetes-based autoscaling; fresh Pod per workflow |
| Self-hosted runners | Control over hardware, network, and secrets |
| Workflow dispatch | Programmatic agent invocation via API with custom parameters |
| Artifacts + caching | Share build context between agent runs |
| Matrix strategy | Parallelize agent work across multiple configurations |

### Cost (2026)

| Runner Type | Cost |
|-------------|------|
| Linux (GitHub-hosted) | $0.008/min |
| Self-hosted | Free (your hardware) |
| Platform charge | $0.002/min (all workflows, except public repos) |
| Public repos | Free |

Prices reduced up to 39% as of January 1, 2026.

### Webhook Events for Agent Triggering

| Event | Agent Use Case |
|-------|---------------|
| `issues.opened` / `issues.labeled` | Dispatch task to coding agent |
| `pull_request.opened` / `synchronize` | Trigger code review agent |
| `check_suite.completed` (failure) | Trigger CI debugger agent |
| `push` | Trigger documentation update agent |
| `dependabot_alert.created` | Trigger security patching agent |
| `workflow_dispatch` | On-demand agent invocation |
| `issue_comment` | @mention-triggered agent commands |
| `release.published` | Trigger deployment agent |

**Relationship to Software Factory:** Foundational. Software Factory already uses GitHub webhooks as its primary event source. Actions provides the execution environment for Agentic Workflows and the Coding Agent. Our agents could run as Actions workflows or alongside them.

Sources:
- [Self-Hosted Runners](https://docs.github.com/en/actions/concepts/runners/self-hosted-runners)
- [GitHub Actions Pricing Changes 2026](https://github.com/resources/insights/2026-pricing-changes-for-github-actions)
- [Workflow Dispatch](https://oneuptime.com/blog/post/2026-01-25-github-actions-workflow-dispatch/view)

---

## GitHub MCP Server

Official MCP server at `https://api.githubcopilot.com/mcp/` with OAuth authentication.

### Capabilities

Browse repos, search files, analyze commits, create/manage issues and PRs, monitor Actions workflows, analyze build failures, manage releases, manage GitHub Projects.

### 2026 Updates

- Token usage reduced ~50% (23,000 fewer tokens per interaction)
- OAuth scope auto-filtering (hides tools you cannot use)
- HTTP server mode with per-request OAuth tokens for enterprise
- Copilot agent tools: `get_copilot_job_status`, `assign_copilot_to_issue`, `create_pull_request_with_copilot`
- Projects tools: `projects_list`, `projects_get`, `projects_write`
- 3,500+ GitHub stars

Sources:
- [GitHub MCP Server Repository](https://github.com/github/github-mcp-server)
- [Practical Guide to GitHub MCP Server](https://github.blog/ai-and-ml/generative-ai/a-practical-guide-on-how-to-use-the-github-mcp-server/)
- [GitHub MCP Server New Projects Tools](https://github.blog/changelog/2026-01-28-github-mcp-server-new-projects-tools-oauth-scope-filtering-and-new-features/)

---

## Additional GitHub Agent Products

### Copilot CLI (GA February 2026)
Terminal-native coding agent with Plan mode (oversight) and Autopilot mode (hands-off). Models: Claude Opus 4.6, Sonnet 4.6, GPT-5.3-Codex, Gemini 3 Pro. Built-in custom agents: Explore (codebase analysis), Task (running commands).
Source: [Copilot CLI GA](https://github.blog/changelog/2026-02-25-github-copilot-cli-is-now-generally-available/)

### Copilot SDK (Technical Preview, January 2026)
Embed the Copilot agentic core in any application. Node.js, Python, Go, .NET. Features: multi-model support, custom tool definitions, MCP integration, GitHub auth, real-time streaming.
Source: [Build an Agent into Any App](https://github.blog/news-insights/company-news/build-an-agent-into-any-app-with-the-github-copilot-sdk/)

### GitHub Spark
AI-powered full-stack app builder. Describe what you want in natural language, get a complete web app. Public preview for Pro+ users.
Source: [GitHub Spark](https://github.com/features/spark)

### GitHub Models Marketplace
Free access to frontier AI models (Llama, GPT-4o, Phi, Mistral). Single API key. No data shared with model providers.
Source: [GitHub Models](https://github.com/marketplace?type=models)

---

## Security Framework for Agent Operations

### GitHub's 6 Agentic Security Principles

1. **Visible Context Only** -- display files from which context is generated; remove invisible/masked information (anti-prompt-injection)
2. **Network Firewalling** -- agents operate behind a firewall limiting external access
3. **Minimal Information Access** -- CI secrets and tokens excluded; tokens revoked post-session
4. **Human-Gated Irreversible Actions** -- agents create PRs, not direct commits; CI does not auto-run on agent PRs
5. **Clear Action Attribution** -- co-authorship between user and agent; `actor_is_agent` in audit logs
6. **Authorized Context Only** -- agents operate within initiating user's permissions

### Enterprise AI Controls (GA February 2026)

- Dedicated "AI Controls" admin view
- Enterprise custom roles with fine-grained AI permissions
- Agent session activity searchable with full 24-hour history
- `actor_is_agent` + `user_id` in every audit log entry
- Agent allowlists per organization

### Rate Limits for Agent Operations

| Auth Method | Limit |
|-------------|-------|
| Personal Access Token | 5,000 req/hr |
| GitHub App Installation | 5,000-12,500 req/hr (scales with repos/users) |
| GITHUB_TOKEN (Actions) | 1,000 req/hr/repo (15,000 on Enterprise Cloud) |
| Content creation | 80/min, 500/hr |
| GraphQL | 2,000 points/min |

**Best practices:** Prefer webhooks over polling. Use conditional requests (304s are free). Use `@octokit/plugin-throttling` for automatic queue management. Prefer GraphQL to reduce request volume.

Sources:
- [GitHub Agentic Security Principles](https://github.blog/ai-and-ml/github-copilot/how-githubs-agentic-security-principles-make-our-ai-agents-as-secure-as-possible/)
- [Rate Limits for REST API](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
- [GitHub App Authentication](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app)

---

## Relationship to Software Factory

### Complementary Components

| GitHub Product | Software Factory Equivalent | Integration Strategy |
|---------------|---------------------------|---------------------|
| Agent HQ / Mission Control | Event Router + Reconciler | Register our agents in Agent HQ for dashboard visibility |
| Agentic Workflows | Cron-triggered agents | Use Agentic Workflows for lightweight continuous tasks; our agents for complex reasoning |
| Custom Agents (`.github/agents/`) | Agent configs | Define Software Factory agents as `.github/agents/` profiles for per-repo customization |
| Actions | Sandbox (Docker) | Run agent sandboxes on Actions runners; or keep Docker for deeper isolation |
| MCP Server | GitHub Client (`src/core/github.ts`) | Use MCP server for agent-to-GitHub communication instead of raw Octokit |
| Checks API | PR review comments | Use Checks API for richer feedback (annotations, images, statuses) |

### Competitive Overlaps

| GitHub Product | Our Agent | Assessment |
|---------------|-----------|------------|
| Copilot Coding Agent | (Future) Feature Builder | Competitive for simple issue-to-PR. Our advantage: specialized, customizable, self-hosted. |
| Copilot Code Review | PR Reviewer | Competitive. Their advantage: free, integrated. Our advantage: knowledge graph, LLM judge, customizable. |
| Continuous Quality Hygiene | CI Debugger | Overlapping. Consider using Agentic Workflows as the trigger and our CI Debugger as the brain. |

### What GitHub Does Not Have

| Capability | Software Factory |
|------------|-----------------|
| Incident response (PagerDuty alert to fix PR) | Incident Responder agent |
| Merge conflict resolution | Merge Resolver agent |
| Knowledge graph integration | Cron agents + competency graph |
| Per-run cost caps and budget governance | Governance layer ($2/run default) |
| LLM judge verification loops | CI Debugger with Spotify Honk pattern |

### Recommended Integration Path

1. **Now:** Use GitHub webhooks as the primary event source (already doing this). Use the GitHub MCP server for agent-to-GitHub communication.
2. **Next:** Define Software Factory agents as `.github/agents/` profiles for repo-level customization. Use Agentic Workflows for lightweight continuous tasks (triage, documentation).
3. **Later:** Register agents in Agent HQ for enterprise dashboard visibility. Use Copilot SDK to embed our agent logic into GitHub-native experiences.

---

## Sources

- [Welcome Home, Agents (Agent HQ)](https://github.blog/news-insights/company-news/welcome-home-agents/)
- [How to Orchestrate Agents Using Mission Control](https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/)
- [Automate Repository Tasks with Agentic Workflows](https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows/)
- [Agentic Workflows Technical Preview](https://github.blog/changelog/2026-02-13-github-agentic-workflows-are-now-in-technical-preview/)
- [GitHub Agentic Workflows Docs](https://github.github.com/gh-aw/)
- [About Copilot Coding Agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)
- [What's New with Copilot Coding Agent](https://github.blog/ai-and-ml/github-copilot/whats-new-with-github-copilot-coding-agent/)
- [Copilot Code Review Agentic Architecture](https://github.blog/changelog/2026-03-05-copilot-code-review-now-runs-on-an-agentic-architecture/)
- [60 Million Copilot Code Reviews](https://github.blog/ai-and-ml/github-copilot/60-million-copilot-code-reviews-and-counting/)
- [Custom Agents Configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [Agents Tab in Repository](https://github.blog/changelog/2026-01-26-introducing-the-agents-tab-in-your-repository/)
- [How to Write a Great agents.md](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)
- [GitHub MCP Server](https://github.com/github/github-mcp-server)
- [GitHub MCP Server Projects Tools](https://github.blog/changelog/2026-01-28-github-mcp-server-new-projects-tools-oauth-scope-filtering-and-new-features/)
- [Copilot CLI GA](https://github.blog/changelog/2026-02-25-github-copilot-cli-is-now-generally-available/)
- [Copilot SDK](https://github.blog/news-insights/company-news/build-an-agent-into-any-app-with-the-github-copilot-sdk/)
- [GitHub Agentic Security Principles](https://github.blog/ai-and-ml/github-copilot/how-githubs-agentic-security-principles-make-our-ai-agents-as-secure-as-possible/)
- [Rate Limits for REST API](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
- [GitHub Actions Pricing 2026](https://github.com/resources/insights/2026-pricing-changes-for-github-actions)
- [Self-Hosted Runners](https://docs.github.com/en/actions/concepts/runners/self-hosted-runners)
- [Linear GitHub Integration](https://linear.app/docs/github-integration)
- [Why Agent HQ Matters (Eficode)](https://www.eficode.com/blog/why-github-agent-hq-matters-for-engineering-teams-in-2026)
- [Premium Requests Billing](https://docs.github.com/en/billing/concepts/product-billing/github-copilot-premium-requests)
