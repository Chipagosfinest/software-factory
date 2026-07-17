# Software Factory Operations: Review Backpressure, Evidence Contracts, and Earned Autonomy

*Compiled July 16, 2026 from matched Exa and Parallel searches, followed by primary-source fetches from both providers.*

## Executive Summary

The factory's scarce resource is no longer code generation. It is **trusted review capacity**.

A July 2026 longitudinal study of 802 developers and 196,212 pull requests found that per-developer throughput reached 2.09x its pre-mandate baseline, while the reviewer pool grew only 1.5x and per-reviewer load doubled. The organization absorbed the gap by shifting review toward automation and thinner human approval. Microsoft's public .NET experiment independently found that useful agent output still consumed substantial review and intervention.

Software Factory therefore needs an operating loop, not just an execution loop:

```text
admit task -> issue scoped authority -> execute -> produce evidence
     ^                                             |
     |                                             v
demote/pause <- observe production <- merge <- risk-tiered review
```

The practical conclusions are:

1. Put backpressure at task admission. Do not let agent arrival rate exceed review capacity.
2. Require an evidence contract for every change. Passing tests alone is insufficient.
3. Grant autonomy per repo and task class, based on observed outcomes, not globally per agent.
4. Give every agent a stable identity but short-lived, task-scoped permissions.
5. Score trajectories and maintainability in addition to final correctness.
6. Feed reverts, incidents, and post-deploy behavior back into promotion and demotion.

## Research Question and Method

**Question:** What should Software Factory add beyond topology, sandboxing, and PR gates to operate coding agents safely at increasing throughput?

Three matched search objectives were sent to both Exa and Parallel:

- production evidence on review capacity, rework, merge, and revert outcomes
- staged autonomy, identity, least privilege, provenance, and approval controls
- production evaluation beyond benchmark pass rates

The strongest primary sources were then fetched through both providers. Commercial reports without reproducible methods and secondary summaries were excluded from quantitative conclusions.

### Provider comparison

| Topic | Exa added | Parallel added | Synthesis |
|---|---|---|---|
| Review economics | Stronger academic discovery, including the July 2026 longitudinal enterprise study and empirical agent-PR papers | Weaker initial precision, but found operational review/backpressure writing; a targeted follow-up found the official .NET retrospective | Both support review as the binding constraint; the paper and .NET post provide the usable measurements |
| Autonomy and identity | Stronger standards/spec discovery: CSA, IETF drafts, AI-SDLC | Stronger official enterprise IAM coverage, especially Microsoft identity, RBAC, and tool binding | Use mature IAM primitives now; treat new agent-specific protocols as watch items, not dependencies |
| Production evaluation | RAMP, Needle in the Repo, and related long-horizon research | ProdCodeBench, WildClawBench, and AgentLens; substantial overlap with Exa on primary papers | Final-state tests, trajectory review, structural oracles, and runtime behavior are complementary layers |

There was no material factual disagreement between the providers. Their source sets were complementary. Exa had better recall for papers and emerging specifications; Parallel was stronger at surfacing current official implementation guidance. Claims below use the underlying primary sources, not either provider's synthesis.

## What the New Evidence Changes

### 1. Throughput without review capacity creates hidden debt

The July 2026 enterprise study observed:

- 802 developers and 196,212 PRs from January 2024 through April 2026
- per-capita PR throughput reaching 2.09x the pre-mandate baseline
- raw PR volume growing 3.1x while the reviewer pool grew 1.5x
- per-reviewer load growing 2.0x
- PRs with human review falling from 89% to 68%
- PRs with automated review rising from about 19% to about 84%
- PRs with substantive human-written review comments falling from about 39% to about 21%
- AI-authored PRs taking about 20% longer from first human review to merge and 22% longer end to end

Merge and revert rates remained roughly steady, but the authors explicitly treat those as coarse, short-horizon proxies. The study is observational, and AI adoption was not randomly assigned. The defensible conclusion is not "quality stayed constant." It is that throughput increased faster than human review supply and the organization changed how review was performed.

**Factory implication:** Measure queue depth, pickup delay, review depth, and downstream incidents alongside merged PR count. A throughput dashboard without these counter-metrics rewards congestion.

### 2. Task selection and repo readiness dominate agent brand

Microsoft's ten-month `dotnet/runtime` experiment reported 878 Copilot Coding Agent PRs, 535 merged, and a 67.9% success rate. Across seven repositories, 1,885 of 2,963 agent PRs merged (68.6%). In the detailed `dotnet/runtime` analysis:

- 29.9% of analyzed merged PRs required no post-feedback iteration
- merged agent PRs averaged 16.5 comments versus 12.4 for human PRs
- the measured human-intervention rate was 45.1% in the mature brownfield runtime repo

The team warns that these numbers are directional, not a model benchmark. The work was explicitly assigned by humans, task populations differed, and compute/CI costs were not included.

**Factory implication:** Autonomy history must be indexed by `(repo, task class, risk tier)`. A strong cleanup record does not authorize performance work, schema changes, or security-sensitive changes.

### 3. Passing tests does not prove maintainability

Needle in the Repo evaluates behavior and structural maintainability together. Across 23 coding configurations:

- the average solve rate was 36.2%; the best was 57.1%
- performance fell from 53.5% on micro cases to 20.6% on multi-step cases
- 64 of 483 outcomes (13.3%) passed functional tests but failed a structural oracle
- dependency control (4.3%) and responsibility decomposition (15.2%) were the hardest dimensions

ProdCodeBench adds production-derived prompts, committed diffs, and stable fail-to-pass tests across seven languages. Its curation removes solution leakage, validates test relevance, and reruns tests to filter flakes. Reported solve rates ranged from 53.2% to 72.2% across four foundation models.

**Factory implication:** The evidence contract needs both behavioral proof and structural proof. Architecture boundaries, dependency direction, public API compatibility, schema compatibility, and observability should be machine-checked where possible.

### 4. The trajectory is part of the product

AgentLens evaluates instruction following, tool use, self-verification, recovery, and communication across the whole run, then combines formal verification with written trajectory reviews and side-by-side comparisons. RAMP similarly argues for persistent runtime state, controlled intermediate-state injection, multidimensional metrics, and preserved process evidence rather than isolated pass/fail tasks.

**Factory implication:** Store a compact run ledger. A merged diff without its authority, tool calls, verification, retries, denials, and human interventions is incomplete evidence.

### 5. Agent identity and task authority are separate controls

Microsoft's July 16, 2026 guidance recommends:

- a unique, dedicated agent principal with a named owner and explicit purpose
- task-scoped roles and approved tool manifests
- just-in-time, time-limited elevation rather than standing privilege
- separate read/evidence roles from write/remediation roles
- step-up approval for high-impact actions
- end-to-end logs joining orchestrator, tool call, and downstream authorization decisions

The CSA autonomy framework and draft AI-SDLC specification reinforce least autonomy and explicit promotion/demotion. Their exact levels and thresholds are useful design inputs, not proven industry benchmarks.

**Factory implication:** Keep agent identity stable for accountability; mint authority per task. The task token should expire on completion, cancellation, timeout, or demotion.

## Proposed Factory Operating Loop

### Stage 1: Admission control

Before an agent starts, classify:

- repo readiness: reproducible setup, known tests, branch protection, protected paths
- task class: docs, cleanup, tests, bug fix, refactor, feature, performance, security, migration
- blast radius: files, services, schemas, customers, money, credentials
- reversibility: trivial revert, coordinated rollback, or irreversible action
- review demand: expected specialist, estimated review minutes, current queue
- evidence availability: tests, structural checks, runtime checks, ownership metadata

Reject, defer, or downgrade the task when evidence is unavailable or the relevant review queue is saturated.

### Stage 2: Scoped authority

Issue a task capability containing at least:

```yaml
agent_id: reviewer-bot-7
owner: platform-eng
repo: org/service
task_id: ISSUE-123
task_class: bug-fix
allowed_tools: [repo-read, branch-write, ci-read]
allowed_paths: [src/payments/**, tests/payments/**]
denied_actions: [merge, deploy, secrets-read, schema-write]
expires_at: 2026-07-16T22:00:00Z
max_cost_usd: 8
max_runtime_minutes: 30
required_evidence: [targeted-tests, full-build, diff-summary, risk-notes]
```

Authorization must be enforced outside the model at every tool boundary.

### Stage 3: Evidence-producing execution

The runner records:

- prompt/spec version and context manifest
- agent/model/harness version
- effective identity, scope, and tool manifest
- commands and tool calls, including denials
- changed files and protected-boundary touches
- deterministic checks, tests, structural oracles, and runtime probes
- retry count, repeated-failure signature, and cost
- human interventions and their reason

### Stage 4: Risk-tiered review

| Risk tier | Typical work | Required review path |
|---|---|---|
| Low | docs, generated files, narrow cleanup | deterministic evidence; optional auto-merge only after earned history |
| Medium | localized bug fix, tests, bounded refactor | automated review plus human owner approval |
| High | public API, auth, money, security, performance | specialist human review; no automated merge |
| Critical | production data, irreversible migration, privilege changes | human-led execution with explicit step-up approvals |

Automated review should reduce human search cost, not silently replace ownership. Route each PR to the minimum qualified reviewer and expose the highest-risk evidence first.

### Stage 5: Outcome feedback

Track at least 7- and 30-day outcomes:

- revert or rollback
- incident or alert attribution
- follow-up fix PRs
- escaped test failures
- code churn and deletion of the new work
- maintainability/architecture regression
- reviewer correction categories

Feed those outcomes back into task routing and autonomy. Successful merge is an intermediate event, not the terminal reward.

## Evidence Contract

Every agent-authored change should attach a machine-readable proof bundle:

| Evidence | Minimum contents | Gate type |
|---|---|---|
| Intent | issue/spec, acceptance criteria, task class, risk tier | deterministic |
| Authority | agent identity, owner, scopes, expiry, approved tools/paths | deterministic |
| Change | diff summary, files, APIs/schemas touched, generated-code disclosure | deterministic + semantic |
| Behavior | targeted tests, full required suite, build, relevant runtime probe | deterministic |
| Structure | dependency rules, API compatibility, schema compatibility, complexity/duplication policy | deterministic where possible |
| Trajectory | tool calls, retries, denials, recovery, human interventions | audit + semantic |
| Operations | rollback plan, observability change, deploy verification, post-merge window | deterministic + human |
| Attestation | commit identity, harness/model version, evidence hashes | deterministic |

The PR should be blocked when required evidence is missing, stale, flaky, or produced outside the authorized environment.

## Earned Autonomy Ladder

Retain the repo's existing five levels, but make them evidence-backed and task-specific:

| Level | Allowed behavior | Promotion evidence | Automatic demotion examples |
|---|---|---|---|
| Observe | read/index/summarize | correct inventory; zero unauthorized access | scope or data-boundary violation |
| Propose | produce plan; no writes | accepted plans; accurate risk/evidence forecast | omitted critical dependency or unsafe plan |
| Patch | branch + PR; no merge | merge rate, low correction load, full evidence coverage | missing evidence, repeated CI failure, protected-path touch |
| Repair | respond to CI/review on its own PR | bounded convergence, low human takeover, no scope growth | repeated failure signature, cost/runtime breach |
| Merge | merge only pre-approved low-risk classes | sustained low rollback/incident rate in that repo and class | any attributable incident, rollback threshold breach, policy violation |

Promotion must be scoped to `(repo, task class, risk tier, harness version)`. A model or harness upgrade should trigger partial requalification. Critical work remains human-led regardless of aggregate success rate.

## Operating Scorecard

### Measured outcomes

| Dimension | Metrics |
|---|---|
| Throughput | admitted tasks, completed PRs, merged PRs, useful changes per engineer |
| Review pressure | queue depth, pickup delay, review minutes, PRs/reviewer, substantive-comment rate |
| Correctness | first-pass CI, merge rate, revert rate, incidents, escaped failures |
| Maintainability | structural-oracle pass rate, architecture violations, follow-up churn, dependency growth |
| Human load | intervention rate, review rounds, takeover rate, specialist-review minutes |
| Efficiency | wall time, tokens/cost, CI minutes, retries, abandoned work |
| Governance | scope denials, expired-token use, missing evidence, approval overrides |

### Proposed starting guardrails

These are product defaults to validate, not externally proven thresholds:

- 100% required-evidence coverage before review
- zero standing write/merge credentials for task agents
- pause admission for a risk tier when its review pickup p90 exceeds 2x the rolling four-week baseline
- no autonomy promotion with an attributable security or production incident in the evaluation window
- immediate demotion on scope violation, unauthorized tool use, or missing attestation
- cap retries by repeated-failure signature, not only a raw retry count
- require at least 30 completed tasks in the exact repo/task/risk cell before considering automated merge

## Smallest Useful Implementation Slice

1. Add an admission record with repo, task class, risk tier, expected reviewer, and required evidence.
2. Add an immutable task-authority record with identity, scopes, paths, tools, expiry, spend, and runtime.
3. Emit a proof bundle for every PR and surface missing fields as a required check.
4. Add review-pressure metrics: queue depth, pickup p50/p90, review duration, substantive-comment rate.
5. Add a 7/30-day outcome job for reverts, incidents, and follow-up fixes.
6. Compute autonomy recommendations from repo/task/risk cells; keep promotion human-approved and demotion automatic.

This is the next layer above the current executor gate, judge, cost tracking, and PR workflow. It turns governance from static configuration into a measurable control loop.

## Open Questions

- Which structural oracles provide enough signal without hard-coding one architecture style?
- How should review minutes be estimated before a task is admitted?
- Should auto-merge qualification decay over time or only on harness/model changes?
- How should incident attribution handle multi-PR failures?
- When automated review coverage rises, what minimum human sampling rate detects reviewer-model drift?
- Does trajectory scoring predict 30-day maintenance outcomes better than final-state tests?

## Sources

Primary sources used for claims:

- [AI Writes Faster Than Humans Can Review: A Longitudinal Study of an Enterprise “2x” Mandate](https://arxiv.org/abs/2607.01904) — July 2026; 802 developers and 196,212 PRs; observational study with explicit causal and quality-proxy caveats.
- [.NET Blog: Ten Months with Copilot Coding Agent in dotnet/runtime](https://devblogs.microsoft.com/dotnet/ten-months-with-cca-in-dotnet-runtime/) — March 23, 2026; first-party Microsoft production retrospective.
- [Microsoft Security: Least privilege for AI agents](https://www.microsoft.com/en-us/security/blog/2026/07/16/least-privilege-for-ai-agents-identity-access-and-tool-binding/) — July 16, 2026; identity, RBAC, tool binding, and audit guidance.
- [Cloud Security Alliance: Agentic AI Autonomy Levels and Control Framework v2](https://labs.cloudsecurityalliance.org/wp-content/uploads/2026/03/agentic-ai-autonomy-levels-control-framework-v2-csa-styled.pdf) — March 2026; general autonomy/control framework, not coding-agent outcome evidence.
- [AI-SDLC Progressive Autonomy Specification](https://github.com/ai-sdlc-framework/ai-sdlc/blob/main/spec/autonomy.md) — draft specification; useful promotion/demotion design, thresholds not treated as validated benchmarks.
- [ProdCodeBench](https://arxiv.org/abs/2604.01527) — April 2, 2026; production-derived prompts/diffs and stable executable tests.
- [RAMP: Runtime Assessing of Agentic Models in Production Systems](https://arxiv.org/abs/2605.27492) — May 26, 2026; persistent, multi-stage runtime assessment.
- [Needle in the Repo](https://arxiv.org/abs/2603.27745) — March 29, 2026; functional plus structural maintainability evaluation.
- [AgentLens](https://arxiv.org/abs/2607.06624) — submitted July 7, revised July 14, 2026; formal verification plus trajectory review.

Emerging agent-identity protocols found during the Exa pass—Agent Passport System, Agent Authorization Profile, PEDIGREE, and related IETF drafts—were not made implementation dependencies because they remain Internet-Drafts.
