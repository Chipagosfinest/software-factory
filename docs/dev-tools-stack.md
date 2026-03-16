# Developer Tools Stack

*Last updated: March 16, 2026*

---

## Overview

This document catalogs the developer tools that complement the Software Factory agent platform. Each tool is evaluated on its agent-friendliness (API quality, webhook support, MCP servers) and its role in the autonomous workflow: trigger agents, execute in sandboxes, communicate results, verify quality.

---

## Linear -- Project Management for Agents

Linear is the clear leader for agent-first project management. Its Agent API (Developer Preview, March 2026) treats agents as first-class workspace members.

### Agent API Architecture

| Feature | Details |
|---------|---------|
| Authentication | OAuth2 with `actor=app` parameter; workspace admin required |
| Agent Identity | Agents get their own workspace identity; can be @mentioned, assigned issues, added to projects |
| Session Model | Sessions auto-created on mention or delegation; `created` AgentSessionEvent fires; agents must emit a `thought` activity within 10 seconds |
| Accountability | Human assignee preserved as primary; agent acts as contributor/delegate |
| Cost | **Agents do not count as billable users**; no per-API-call charges |

### API Capabilities

| Capability | Status |
|-----------|--------|
| Create/update/close issues | Available |
| Create/reply to comments | Available |
| Manage projects and cycles | Available |
| Manage documents | Available |
| Triage Intelligence (auto-assign, auto-label) | Business+ plan |
| Agent session lifecycle | Developer Preview |
| Real-time mutation sync | Available |

### Rate Limits

| Auth Method | Request Limit | Complexity Limit |
|------------|--------------|-----------------|
| API Key | 5,000/hr per user | 250,000 pts/hr |
| OAuth App | 5,000/hr per user | 2,000,000 pts/hr |
| Single query max | N/A | 10,000 pts |

Use OAuth (not API keys) for 8x higher complexity limits. Use webhooks instead of polling.

### Webhook Events

Issues, Comments, Issue attachments, Documents, Emoji reactions, Projects, Project updates, Cycles, Labels, Users, Issue SLAs, Agent session events. Full data payload with previous values for changed properties.

### Linear + GitHub Integration

- Bidirectional sync: Linear issues to/from GitHub PRs/branches
- Auto-create branches from issues
- PR status reflected in Linear issue state
- Deep links from Linear issues to coding tools (Cursor, Claude Code) with prefilled context

### MCP Server

Official MCP server (1,800+ GitHub stars). Enables Claude Code, Cursor, Windsurf to search/create/update Linear issues, projects, and comments. Authentication via `/mcp` command in Claude Code.

### Case Study: Cyrus (Linear + Claude Code Agent)

[Cyrus](https://www.atcyrus.com/) is a production agent that monitors Linear for assigned issues, creates isolated Git worktrees, runs Claude Code sessions, streams progress to Linear comments, creates PRs, self-verifies against acceptance criteria (up to 3 retry loops), and supports orchestrator mode for breaking epics into sub-issues.

### Pricing

| Plan | Price | Key Features |
|------|-------|-------------|
| Free | $0 | 250 issues, basic integrations |
| Basic | $10/user/mo | Unlimited issues, API, webhooks |
| Business | $16/user/mo | AI automation, Triage Intelligence, analytics |
| Enterprise | Custom | SAML SSO, SCIM, HIPAA, audit logs |

### Limitations

- GraphQL only (no REST)
- Agent API still in Developer Preview
- No self-hosted option
- 5,000 req/hr may bottleneck high-frequency agents (use OAuth for 2M complexity points)
- No WebSocket/SSE for real-time streaming (webhook-based only)

Sources:
- [Linear Agents Platform](https://linear.app/agents)
- [Linear Agent API Docs](https://linear.app/developers/agents)
- [Linear Rate Limiting](https://linear.app/developers/rate-limiting)
- [Linear MCP Server](https://linear.app/docs/mcp)
- [Cyrus](https://www.atcyrus.com/)

---

## PagerDuty -- Incident Triggering for Agents

PagerDuty is building the most advanced agent-to-agent incident response capabilities in 2026.

### SRE Agent (Q2 2026 Early Access)

| Feature | Details |
|---------|---------|
| Virtual Responder | Added to on-call schedules and escalation policies alongside humans |
| Anomaly Detection | AIOps-based detection across integrated monitoring tools |
| Deep Diagnostics | Assesses tech stack, performs diagnostics before waking humans |
| Memory Function | Recalls past incidents, diagnostics, and knowledge base information |
| Agent-to-Agent | MCP-based interaction with AWS DevOps Agent, Azure AI SRE, and custom agents |

### Autonomous Responder (H2 2026 Early Access)

Fully autonomous incident resolution -- detect, diagnose, remediate, and verify without human intervention for known issue patterns.

### Claude Code Plugin

Risk scoring that analyzes uncommitted changes against 90 days of incident history. Catches "this code change looks similar to what caused incident X" before the PR is opened.

### Pricing

Starts at $21/user/mo. Enterprise custom pricing.

### Integration with Software Factory

PagerDuty webhook fires on incident creation. Software Factory's Incident Responder agent receives the alert, fetches error context via Sentry MCP, performs root cause analysis, creates a fix PR, and updates the PagerDuty incident with results.

Sources:
- [PagerDuty Spring 2026 Release](https://www.pagerduty.com/blog/product/the-path-to-autonomous-operations-pagerduty-spring-26-release/)
- [PagerDuty AI Agent Ecosystem](https://www.pagerduty.com/newsroom/pagerduty-expands-ai-ecosystem-to-supercharge-ai-agents/)

---

## Sentry -- Error Monitoring to Agent Fix Pipeline

### Seer AI Agent

Root cause analysis, solution suggestions, automated coding + PR creation. The error-to-fix-PR pipeline Software Factory needs.

### MCP Server (GA)

Official remote server with OAuth. Gives agents direct access to issues, errors, projects, and Seer analysis. Zero installation -- hosted by Sentry.

### Integration Pattern

```
Production Error  -->  Sentry Alert  -->  Webhook  -->  Software Factory
    -->  Agent fetches error context via Sentry MCP
    -->  Root cause analysis
    -->  Fix PR created
    -->  Linear issue updated
```

### Pricing

| Plan | Price |
|------|-------|
| Developer | Free (5K errors/mo) |
| Team | $26/mo (50K errors) |
| Business | $80/mo (100K errors) |

Sources:
- [Sentry AI Docs](https://docs.sentry.io/ai/)
- [Sentry MCP Server](https://docs.sentry.io/ai/mcp/)

---

## Communication Layer

### Slack vs Telegram vs Discord

| Feature | Slack | Telegram | Discord |
|---------|-------|----------|---------|
| Approval gates | Workflow DevKit (suspend/resume, zero compute during wait) | Inline keyboard buttons (Approve/Reject/Defer) | Button interactions |
| Rate limits | Tier 1-4: 1-100+ msg/min | 30 msg/sec | 50 req/sec |
| Integrations | 2,600+ | Bot API + n8n/Zapier | 50+ |
| Cost | Free (90-day history), Pro $8.75/user/mo | Free, unlimited | Free |
| Best for | Teams needing rich interactive agent UX | Solo/small team, free | Open-source communities |

**Recommendation:** Continue with Telegram for current operations. Add Slack only when scaling to a team that needs richer workflow suspend/resume.

Sources:
- [Slack Agentic Workflows Guide](https://slack.com/blog/transformation/agentic-workflows-a-guide-to-understanding-what-they-are-benefits-and-uses)
- [Telegram Bot API](https://core.telegram.org/bots/api)

---

## Redis + BullMQ -- Our Queue

Software Factory uses BullMQ (backed by Redis) for event processing.

### Why BullMQ

| Feature | Details |
|---------|---------|
| Job prioritization | Priority queues for different event types (security alerts > documentation updates) |
| Retry with backoff | Configurable retry strategies for transient failures |
| Rate limiting | Built-in per-queue rate limits to respect API quotas |
| Job progress | Track long-running agent sessions with progress updates |
| Delayed jobs | Schedule agent work (e.g., nightly security scans) |
| Stalled job recovery | Detect and retry agents that crash mid-execution |
| Dashboard | Bull Board for visual queue monitoring |
| Cost | Free (self-hosted Redis) |

### Alternatives Considered

| Queue | Why Not |
|-------|---------|
| RabbitMQ | More complex, better for cross-service messaging than job queues |
| SQS | AWS lock-in, no priority queues, no job progress tracking |
| Temporal | Overkill for current scale; consider when agent workflows need durable execution and saga patterns |

---

## Docker -- Our Sandbox

Each agent run gets a fresh container with a cloned repo, language runtime, 5-minute timeout, and no network access by default.

### Security Isolation Ranking

| Isolation Level | Technology | Trade-off |
|----------------|-----------|-----------|
| Strongest (hardware) | Firecracker microVMs (E2B, Fly.io Sprites) | Dedicated kernel per session |
| Strong (kernel) | gVisor (Modal, Northflank) | Syscall interception layer |
| Moderate (container) | **Docker (our current choice)** | Shared kernel; namespace isolation |
| Lightest | Linux namespaces (Quilt) | Fastest but least isolated |

### When to Upgrade from Docker

| Signal | Upgrade To | Cost |
|--------|-----------|------|
| Running untrusted code from external contributors | E2B (Firecracker microVMs) | ~$0.05/hr/vCPU |
| Need persistent sessions that survive restarts | Fly.io Sprites (checkpoint/restore in 300ms) | $0.07/CPU-hr |
| Need GPU workloads for embeddings/inference | Modal (H100 autoscaling) | $3.95/hr H100 |
| Need fastest cold start | Daytona (90ms Docker-based) | Varies |
| Need cheapest per-hour | Northflank | $0.017/vCPU-hr |

Sources:
- [Best Code Execution Sandbox for AI Agents (Northflank)](https://northflank.com/blog/best-code-execution-sandbox-for-ai-agents)
- [AI Agent Sandboxes Compared](https://rywalker.com/research/ai-agent-sandboxes)
- [E2B](https://e2b.dev/)
- [Fly.io Sprites](https://fly.io/ai)

---

## Evaluation Frameworks

### SWE-bench

Industry standard for autonomous coding agents. 2,294 real GitHub issues from 12 Python repos.

| Agent | SWE-bench Verified |
|-------|--------------------|
| Blitzy | 86.8% |
| Claude Code (Opus 4.5) | 80.9% |
| Augment Code | ~78-82% |
| Google Antigravity | 76.2% |
| Codex CLI (GPT-5.3) | 75.2% |
| Cursor | 72.8% |
| Aider (Claude backend) | ~72% |
| Devin | ~67% merge rate |

**Key finding:** Same model scores 17 problems apart in different agent scaffolding. Architecture matters as much as model capability.

### HumanEval

OpenAI's 164-problem function-completion benchmark. Now a baseline -- most frontier models score 90%+. Useful for model selection, not agent evaluation.

### Aider Leaderboard

Tests code editing ability across 133 Exercism problems. Useful for comparing model + scaffolding combinations.

| Model | Aider Score |
|-------|------------|
| Claude Opus 4.5 | ~92% |
| GPT-5.3 | ~90% |
| DeepSeek V4 | ~88% |
| Claude Sonnet 4.6 | ~87% |

### Using Benchmarks for Software Factory

| Benchmark | What It Tests | Our Use |
|-----------|--------------|---------|
| SWE-bench | Full issue-to-PR | Evaluate CI Debugger and Feature Builder |
| HumanEval | Raw model coding ability | Model selection for cost/quality trade-offs |
| Aider Leaderboard | Code editing quality | Compare models for PR review tasks |
| Custom eval suite | Our specific agents | Build targeted evals per agent type |

**Recommendation:** Build a custom evaluation harness using the Karpathy Autoresearch pattern -- single objective metric per agent, fixed time budget per evaluation, binary keep/discard decisions.

Sources:
- [SWE-bench](https://www.swebench.com/)
- [SWE-bench February 2026 (Simon Willison)](https://simonwillison.net/2026/Feb/19/swe-bench/)
- [Aider Leaderboard](https://aider.chat/docs/leaderboards/)
- [We Tested 15 AI Coding Agents (MorphLLM)](https://www.morphllm.com/ai-coding-agent)

---

## Recommended Stack

### Tier 1: Core (Implement Now)

| Layer | Tool | Monthly Cost | Why |
|-------|------|-------------|-----|
| Issue Tracking | **Linear** (Business) | $16 (agents free) | Purpose-built Agent API, Triage Intelligence, fastest API (<50ms), MCP server |
| Source Control + CI/CD | **GitHub Actions** + Agentic Workflows | ~$0 (2,000 free min) | Native agent execution, Markdown-defined automation, sandboxed |
| Communication | **Telegram** | $0 | Free, inline approval buttons, forum mode. Already in use. |
| Error Monitoring | **Sentry** (Team) | $26 | MCP server, Seer AI root cause analysis, webhook triggers |
| Queue | **BullMQ + Redis** | $0 (self-hosted) | Priority queues, retry, rate limiting, job progress |
| Sandbox | **Docker** | $0 (self-hosted) | Sufficient isolation for current threat model |
| Agent Runtime | **Claude Code** | Variable (API) | Highest SWE-bench score, best reasoning on hard problems |

**Total fixed cost: ~$42/mo** + Claude API usage

### Tier 2: Force Multipliers (Add When Needed)

| Layer | Tool | When | Cost |
|-------|------|------|------|
| Workflow Automation | **n8n** (self-hosted) | When multi-tool orchestration outgrows bash scripts | Free |
| Incident Management | **PagerDuty** | When running production services needing autonomous response | $21+/user/mo |
| Uptime Monitoring | **BetterStack** | When you have public-facing services | Free tier, $25+/mo |
| Agent Bridge | **Cyrus** or custom | When Linear-to-Claude-Code pipeline needs production polish | Free (open source) |
| Documentation | **Mintlify** | When you need public API docs with auto-update | $300/mo (Pro with agent) |

### Tier 3: Scale (Future)

| Layer | Tool | When | Cost |
|-------|------|------|------|
| Sandbox Upgrade | **E2B** | When running untrusted code from external contributors | ~$0.05/hr/vCPU |
| Developer Portal | **Backstage** | When managing 10+ services with 5+ engineers | Free (OSS) |
| Durable Workflows | **Temporal** | When agent workflows need saga patterns | Free (OSS) |
| Enterprise PM | **Jira** (Rovo Agents) | Only if enterprise governance demands it | $17.65+/user/mo |
| Team Communication | **Slack** | When scaling to a team needing workflow suspend/resume | $8.75+/user/mo |

### Key Architecture Patterns

**1. Linear to Agent to PR**
```
Linear webhook (issue assigned)  -->  Event Router  -->  Agent creates worktree
    -->  Claude Code session  -->  Fix PR created  -->  Linear issue updated
```

**2. CI Failure to Auto-Fix**
```
GitHub Actions failure  -->  Webhook  -->  CI Debugger agent  -->  Fetch logs via GH API
    -->  Diagnose  -->  Fix PR  -->  Post to Linear
```

**3. Production Error to Auto-Fix**
```
Sentry error  -->  Webhook  -->  Incident Responder  -->  Fetch context via Sentry MCP
    -->  Root cause analysis  -->  Fix PR  -->  Update Linear + PagerDuty
```

**4. Approval Gate**
```
Agent creates PR  -->  Posts to Telegram with Approve/Reject buttons
    -->  Human reviews  -->  Agent merges or iterates
```

**5. Knowledge Auto-Update**
```
Code merged to main  -->  GitHub Actions triggers documentation agent
    -->  Obsidian vault updated  -->  Embeddings refreshed
```

---

## Sources

### Linear
- [Linear Agents Platform](https://linear.app/agents)
- [Linear Agent API Docs](https://linear.app/developers/agents)
- [Linear AI Features](https://linear.app/docs/agents-in-linear)
- [Linear Rate Limiting](https://linear.app/developers/rate-limiting)
- [Linear Webhooks](https://linear.app/developers/webhooks)
- [Linear MCP Server](https://linear.app/docs/mcp)
- [Linear Pricing](https://linear.app/pricing)
- [Cyrus -- Claude Code + Linear Agent](https://www.atcyrus.com/)

### PagerDuty
- [PagerDuty Spring 2026 Release](https://www.pagerduty.com/blog/product/the-path-to-autonomous-operations-pagerduty-spring-26-release/)
- [PagerDuty AI Agent Ecosystem](https://www.pagerduty.com/newsroom/pagerduty-expands-ai-ecosystem-to-supercharge-ai-agents/)

### Sentry
- [Sentry AI Docs](https://docs.sentry.io/ai/)
- [Sentry MCP Server](https://docs.sentry.io/ai/mcp/)

### Communication
- [Slack Agentic Workflows](https://slack.com/blog/transformation/agentic-workflows-a-guide-to-understanding-what-they-are-benefits-and-uses)
- [Telegram Bot API](https://core.telegram.org/bots/api)

### Sandboxes
- [Best Code Execution Sandbox for AI Agents (Northflank)](https://northflank.com/blog/best-code-execution-sandbox-for-ai-agents)
- [AI Agent Sandboxes Compared](https://rywalker.com/research/ai-agent-sandboxes)
- [E2B](https://e2b.dev/)
- [Fly.io Sprites](https://fly.io/ai)

### Evaluation
- [SWE-bench](https://www.swebench.com/)
- [SWE-bench February 2026 (Simon Willison)](https://simonwillison.net/2026/Feb/19/swe-bench/)
- [Aider Leaderboard](https://aider.chat/docs/leaderboards/)
- [We Tested 15 AI Coding Agents (MorphLLM)](https://www.morphllm.com/ai-coding-agent)

### Glue Tools
- [Agent Harness (LangChain)](https://blog.langchain.com/the-anatomy-of-an-agent-harness/)
- [Anthropic 2026 Agentic Coding Trends](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf)
- [MCP Ecosystem (FastMCP)](https://fastmcp.me/blog/most-popular-mcp-tools-2026)
- [n8n](https://n8n.io/)
