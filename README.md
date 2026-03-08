# Software Factory

An agent-native software development platform that autonomously handles PR review, CI debugging, security patching, and incident response. Agents work in the background — developers stay "on the loop" instead of "in the loop."

## What It Does

| Agent | Trigger | Output |
|-------|---------|--------|
| **PR Reviewer** | `pull_request.opened/synchronize` | Review comments + approval/request changes |
| **CI Debugger** | `check_suite.completed` (failure) | Diagnosis comment + fix PR |
| **Security Patcher** | `dependabot_alert.created` / CVE feed | Patch PR within hours |
| **Incident Responder** | PagerDuty/alert webhook | Root cause analysis + fix PR |
| **Merge Resolver** | `pull_request.labeled` (conflict) | Conflict resolution commit |

## Architecture

```
GitHub Webhooks / Cron / Alerts
        |
   Event Router (src/router.ts)
        |
   +---------+---------+---------+
   |         |         |         |
 PR Review  CI Debug  Security  Incident
  Agent      Agent    Agent     Agent
   |         |         |         |
   +----+----+----+----+----+----+
        |              |
   Sandbox Runner    GitHub API
   (isolated env)    (PR/comments)
        |
   Human Review Gate
   (all output = PRs)
```

### Three Infrastructure Pillars

1. **Isolated Compute** — Each agent runs in a sandboxed environment. No shared state, automatic teardown. A single agent failure can't cascade.

2. **Event Router** — Webhooks, cron schedules, and alert feeds are normalized into typed events, then dispatched to the right agent with full context.

3. **Governance Layer** — Permissions, audit trails, blast-radius controls. All agent output goes through PRs — humans review before merge.

## Quick Start

```bash
npm install
cp .env.example .env
# Add GitHub App credentials, API keys
npm run dev
```

## Project Structure

```
src/
  index.ts          # Webhook server entry point
  router.ts         # Event normalization + agent dispatch
  agents/
    pr-reviewer.ts  # PR review agent
    ci-debugger.ts  # CI failure investigation agent
    security.ts     # CVE/dependency patching agent
    incident.ts     # Production incident response agent
    merge.ts        # Merge conflict resolution agent
  core/
    sandbox.ts      # Isolated execution environments
    github.ts       # GitHub API client (PRs, comments, checks)
    context.ts      # Repo context builder (file tree, recent changes)
    governance.ts   # Permissions, audit logging, blast radius
  types.ts          # Shared type definitions
```

## Design Principles

- **Constraints over instructions** — Tell agents what NOT to do. "No TODOs, no partial implementations" works better than step-by-step guides.
- **PRs are the review gate** — Every agent action produces a PR or comment. Nothing merges without human approval.
- **Bounded blast radius** — Each agent operates on a scoped set of files. A security agent can't refactor your auth system.
- **Reason, don't script** — Agents read context, reason about problems, and generate solutions. Not predefined flowcharts.

## Competitive Landscape

| Company | Approach | Our Advantage |
|---------|----------|---------------|
| [Factory.ai](https://factory.ai) | Enterprise Droids, $$$$ | Open, self-hosted, integrate with your own LLM |
| [Qodo](https://qodo.ai) | Code review focus | We cover the full lifecycle, not just review |
| GitHub Copilot Agent | Tied to GitHub ecosystem | Model-agnostic, works with any Git host |
| [Zencoder](https://zencoder.ai) | CI/CD agents | Deeper integration, incident response included |

## License

Private — not yet open source.
