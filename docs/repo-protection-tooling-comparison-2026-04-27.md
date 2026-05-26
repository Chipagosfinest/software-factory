# Repo Protection Tooling Comparison

*Compiled: April 27, 2026*

## Research Question

What external tools should complement Software Factory to monitor production, review pipelines, prevent AI-generated slop, and improve code practices across Alec's repos?

This memo combines:
- ProductRank API output from `https://productrank-rho.vercel.app/api/query`
- Current Software Factory repo architecture and docs
- Primary vendor docs and product pages gathered April 27, 2026

## Executive Recommendation

Use Software Factory as the orchestration and governance layer, not as a replacement for specialized scanners and observability tools.

Recommended stack:

| Layer | Recommended Tool | Why |
|---|---|---|
| Runtime error monitoring | Sentry + Seer | Best fit for error-to-root-cause-to-fix-PR workflows; official MCP server gives agents direct access to issue context and Seer analysis. |
| Synthetic/deploy verification | Checkly | Monitoring-as-code with Playwright/API checks; can run against Vercel/GitHub deployment URLs before production. |
| PR slop review | Greptile trial, with CodeRabbit as backup | Greptile is closest to the "central validation layer" thesis: full-repo graph, PR review, custom rules, feedback learning, sandbox test agent. CodeRabbit is broader and more workflow-heavy. |
| Security and supply chain | Semgrep + Socket | Semgrep covers SAST/SCA/secrets/policy gates. Socket is sharper for malicious dependencies and PR-level supply-chain risk. |
| Incident routing | PagerDuty later, not first | Valuable once there is real on-call load. For now, Sentry alerts plus Software Factory incident agent are likely enough. |
| Autonomous feature work | Defer Devin/Factory.ai purchase | Useful for overflow coding and migrations, but they do not solve the repo-protection control plane as directly as the above stack. |

Do not migrate CI/source control to GitLab just because ProductRank recommended GitLab. This repo is GitHub-native: Octokit, GitHub webhooks, PR comments, Dependabot alerts, and docs all assume GitHub as the control plane.

## ProductRank Result

I tested the sample query:

```bash
curl -sS -X POST https://productrank-rho.vercel.app/api/query \
  -H 'Content-Type: application/json' \
  -d '{"q": "I need to build an auth system"}'
```

It returned a structured recommendation with Supabase Auth as the recommended stack, Stytch as budget-friendly, Clerk as cutting-edge, and ranked auth alternatives.

I then queried:

```json
{
  "q": "We need monitoring, code review, CI pipeline review, incident triage, security scanning, and repo quality controls for an AI software factory"
}
```

ProductRank recommended:

| Category | ProductRank pick | My assessment |
|---|---|---|
| Monitoring | Checkly | Good pick for synthetic monitoring and deployment checks. Incomplete for error telemetry. Pair with Sentry. |
| CI/CD | GitLab | Not a fit for this repo unless we are migrating source control. Prefer GitHub Actions. |
| Security | Socket | Good pick for supply-chain and malicious package PR protection. Pair with Semgrep for SAST/secrets. |
| Background jobs | Temporal for AI Agents | Worth revisiting when durable workflows outgrow BullMQ. Not needed now. |
| Hosting | Vercel | Fine for hosted apps, but not central to repo protection. |

## Current Software Factory Fit

Relevant repo facts:

- Core agents are already defined: PR reviewer, CI debugger, security patcher, incident responder, merge resolver.
- The architecture already uses GitHub webhooks, Octokit, BullMQ, Redis, SQLite audit logs, OpenRouter, and a judge gate.
- `docs/codebase-status.md` calls out "No observability" as a P2 gap: logging is currently console-only, with no metrics dashboard or alerting.
- The repo thesis is correct: AI code quality cannot be enforced with `AGENTS.md` alone. It needs deterministic checks, tests, and judge gates.

External tools should therefore fill two gaps:

1. Bring production and PR signals into the factory.
2. Add independent scanners and reviewers so Software Factory is not grading its own homework.

## Comparison Matrix

| Tool | Main Job | Strengths | Gaps / Risks | Fit |
|---|---|---|---|---|
| Sentry + Seer | Error monitoring, RCA, fix PRs, code review | Seer uses issue context, traces, logs, profiles, linked GitHub code, Autofix, PR creation, and external coding-agent delegation. Official MCP server gives agents access to issues, errors, projects, and Seer analysis. | Seer PR creation and code review are GitHub/cloud-oriented; self-hosted Sentry loses some cloud-only Seer features. | P0 |
| Checkly | Synthetic monitoring and deploy checks | Checks as code, Playwright/API checks, GitHub Actions support, Vercel/GitHub deployment URL validation, PR/deploy reporting. | Not a replacement for error telemetry or logs. | P0 |
| Greptile | AI PR validation layer | Full codebase graph, PR comments, custom English rules, learning from PR comments/reactions, GitHub/GitLab support, self-hosted enterprise option, sandbox test agent. | $30/developer/month plus overages; another reviewer can add noise if not tuned. | P0 trial |
| CodeRabbit | PR reviews, planning, autofix, merge conflict support | Broad workflow surface: PR/IDE/CLI review, Linear/Jira, SAST/linter support, MCP connections, autofix, unit-test generation, merge conflict resolution on higher plan. | Per-developer pricing and hourly rate limits; may overlap with Software Factory's own PR reviewer. | P1 / backup |
| Graphite AI Reviews | AI review plus stacked PR workflow | Strong if adopting Graphite's PR page, stacked diffs, merge queue, analytics, custom rules. | More workflow replacement than drop-in guardrail. Best if we want Graphite as review UI. | P1 |
| GitHub Copilot Code Review | Native GitHub AI review | Agentic architecture, full repo context, GitHub Actions runner integration, fix handoff to Copilot coding agent preview. Low friction if already paying for Copilot. | GitHub-only and less customizable than a dedicated validation layer. | Baseline |
| Semgrep | SAST, SCA, secrets, AppSec policy gates | High-signal static security, reachability, AI triage/fix guidance, PR checks, CI/IDE/API/webhook integrations, MCP for AI tools. | Security-focused, not general code quality or production monitoring. | P0 |
| Socket | Supply-chain PR protection | Detects malicious/risky dependencies, GitHub App, package behavior analysis, GitHub Actions risk alerts, useful against AI-agent dependency slop. | Narrower than Semgrep; npm/package ecosystem strength matters most. | P0 |
| SonarQube Cloud | Quality gates and AI code assurance | AI Code Assurance labels/gates for AI-generated code, AI CodeFix, Remediation Agent validates fixes in sandbox and opens PRs. | Overlaps with Semgrep and PR reviewers; strongest if we need formal quality gates/badges. | P1 |
| Datadog Bits AI Dev Agent | Observability-to-fix PR | Uses Datadog observability data, opens PRs, iterates with CI logs and feedback, covers errors/traces/security/profiler/test optimization. | Best if Datadog is already the observability platform; heavier and pricier than Sentry + Checkly. | P2 |
| PagerDuty SRE Agent | Incident routing and virtual responder | On-call schedules, escalation policies, incident history, runbook-driven remediation, MCP ecosystem. | Incident management layer, not repo quality layer. More valuable once on-call load exists. | P2 |
| Devin | Autonomous software engineer | Strong for migrations, recurring Sentry error fixes, feature work, API-triggered sessions, DeepWiki, review. | Buy-side task execution, not our independent governance layer. ACU/usage economics can drift. | Selective |
| Factory.ai | SDLC droids | Closest full-SDLC competitor: code, review, reliability, knowledge, Linear, PagerDuty, MCP, local/cloud. | Overlaps heavily with Software Factory. Buying it weakens the reason to build unless used as benchmark or overflow. | Watch / benchmark |
| Ellipsis | AI code review and bug fixes | Simple GitHub install, automatic reviews, style guide-as-code, no data retention claim, $20/developer/month. | GitHub-only and lighter enterprise/security story. | Budget option |

## Layered Architecture

Recommended control flow:

```text
PR opened / updated
  -> GitHub branch protection and required checks
  -> Socket dependency and workflow-risk checks
  -> Semgrep SAST/SCA/secrets gate
  -> Checkly preview deploy checks where applicable
  -> Greptile or CodeRabbit independent PR review
  -> Software Factory PR reviewer + LLM judge
  -> Human review and merge

Production issue / synthetic failure
  -> Sentry issue or Checkly alert
  -> Software Factory incident agent
  -> Sentry MCP / Seer context retrieval
  -> RCA + fix branch/PR
  -> Semgrep, Socket, tests, Checkly, AI review gates
  -> Human review and merge
```

This keeps humans on the final merge while allowing agents to do detection, diagnosis, patch drafting, and verification.

## Buy / Build Decisions

### Buy Now

1. Sentry with Seer enabled on the highest-value repos.
2. Checkly for production and preview deploy synthetic checks.
3. Socket GitHub App for dependency and workflow-risk scanning.
4. Semgrep for SAST, secrets, SCA, and policy gates.
5. Greptile trial on 1-2 repos for AI PR validation quality.

### Build in Software Factory

1. Sentry webhook ingestion into `incident` agent.
2. Checkly alert ingestion into `incident` or `ci-debugger` agent.
3. A normalized `external_signals` table for Sentry, Checkly, Semgrep, Socket, and PR-review findings.
4. A repo quality score that combines:
   - failing checks
   - severity-weighted security findings
   - PR review finding acceptance rate
   - repeated AI slop patterns
   - regressions after agent-authored PRs
5. Deterministic quality verifier:
   - typecheck
   - tests
   - lint
   - complexity
   - duplication
   - dependency delta risk

### Defer

1. PagerDuty until incidents require real on-call routing.
2. Datadog unless another project already standardizes on Datadog.
3. SonarQube unless we want formal AI Code Assurance gates in addition to Semgrep.
4. Temporal until BullMQ job orchestration becomes unreliable or workflows need durable saga semantics.
5. Devin/Factory.ai as core platform purchases. Use them for selected tasks, not as the repo-protection backbone.

## Vendor-Specific Notes

### Sentry

Sentry is the best immediate addition because it turns runtime failures into agent-readable code context. Seer offers Autofix, PR creation, external coding-agent delegation, and GitHub code review. The MCP server exposes issues, errors, projects, and Seer analysis to agents.

Best use: production error to RCA to fix PR.

### Checkly

Checkly fills the "did the app still work after deploy?" gap. Its CLI lets checks live in the repo and run in CI/CD. For Vercel preview deployments, this is a strong fit because checks can target deployment environment URLs.

Best use: preview deploy and production synthetic checks as required pipeline gates.

### Greptile vs CodeRabbit

Greptile is the cleaner fit for Software Factory's thesis. It positions itself as a validation layer, builds a codebase graph, learns team standards, and can write/run tests in a sandbox.

CodeRabbit has a broader workflow suite: planning, IDE/CLI, Linear/Jira, SAST/linter support, autofix, unit-test generation, and merge conflict resolution. If Greptile is too noisy or too expensive, CodeRabbit Pro+ is the fallback.

### Semgrep vs Socket

These are complementary:

- Semgrep: code, dependency reachability, secrets, policy gates.
- Socket: malicious/risky dependencies and package behavior at PR/install time.

For AI-generated code, Socket is especially useful because agents often add packages casually. Semgrep is the stronger formal security gate.

### Devin and Factory.ai

Devin and Factory.ai are better viewed as execution capacity and competitive benchmarks, not repo-protection foundations.

Devin is strong for repeatable migrations and delegated tasks. Factory.ai is closer to Software Factory's vision because it spans code, review, reliability, knowledge, and ticket workflows. But buying Factory.ai would duplicate much of the platform this repo is trying to build.

## 30-Day Implementation Plan

### Week 1

- Install Sentry on the most important apps/repos.
- Enable GitHub integration, Seer settings, and Sentry MCP.
- Install Socket GitHub App.
- Add Semgrep CI workflow.

### Week 2

- Add Checkly checks as code for core user flows and API health.
- Run checks against preview deployments and production.
- Add required GitHub status checks for Socket, Semgrep, unit tests, typecheck, and Checkly where relevant.

### Week 3

- Trial Greptile on two active repos.
- Compare Greptile findings against Software Factory PR reviewer and human review.
- Track signal rate: accepted findings / total comments.

### Week 4

- Wire Sentry and Checkly alerts into Software Factory's incident agent.
- Create `external_signals` storage and a first repo-quality report.
- Decide whether to keep Greptile, switch to CodeRabbit, or rely on GitHub Copilot Code Review plus Software Factory.

## Decision Criteria

Keep a tool only if it improves one of these metrics:

| Metric | Target |
|---|---|
| Accepted AI review findings | At least 20 percent of comments result in code changes or confirmed issue tracking. |
| PR noise | No more than 1-2 low-value AI comments per PR. |
| Escaped production bugs | Down month over month after Sentry + Checkly rollout. |
| Time from production error to PR | Under 30 minutes for straightforward code-caused errors. |
| Agent regression rate | Falling over time; agent-authored PRs should not repeatedly break existing tests. |
| Security gate bypasses | Zero critical Semgrep/Socket findings merged without explicit override. |

## Sources

- Sentry Seer docs: https://docs.sentry.io/product/ai-in-sentry/seer/
- Sentry MCP docs: https://docs.sentry.io/ai/mcp.md
- Factory GA announcement: https://factory.ai/news/ga
- Factory code review docs: https://docs.factory.ai/cli/features/code-review
- Factory pricing: https://factory.ai/pricing
- Devin pricing: https://devin.ai/pricing/
- CodeRabbit pricing/docs: https://docs.coderabbit.ai/management/plans
- Semgrep AppSec Platform: https://semgrep.com/products/semgrep-appsec-platform
- SonarQube AI Code Assurance: https://docs.sonarsource.com/sonarqube-cloud/ai-capabilities/ai-code-assurance
- Datadog Bits AI Dev Agent: https://docs.datadoghq.com/bits_ai/bits_ai_dev_agent/
- PagerDuty SRE Agent: https://www.pagerduty.com/platform/ai-agents/sre/
- Checkly CI/CD docs: https://www.checklyhq.com/docs/cicd/
- Socket for GitHub: https://socket.dev/features/github
- GitHub Copilot code review: https://docs.github.com/en/copilot/concepts/agents/code-review
- Greptile code review: https://www.greptile.com/code-review-bot
- Graphite AI reviews: https://graphite.dev/docs/diamond
- Ellipsis: https://www.ellipsis.dev/
