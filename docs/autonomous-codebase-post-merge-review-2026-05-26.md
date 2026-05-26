# Autonomous Codebase Post-Merge Review

*Compiled: May 26, 2026 after merging PR #5*

## Purpose

Review the merged Software Factory research docs against a focused Exa refresh and identify what still needs to be added or split into follow-up work.

Reviewed local docs:

- `docs/autonomous-codebase-sprawl-2026-05-26.md`
- `docs/background-agents-open-inspect.md`
- `docs/repo-protection-tooling-comparison-2026-04-27.md`

## Verdict

Yes, the merged research is directionally right. It captured the core shift from coding assistants to repo operating systems. The next useful update is not another broad product list. It should add a **multi-repo orchestration** layer and a **cloud-provider reference architecture** layer.

## Material New / Underweighted Signals

| Signal | Date | What It Adds | Action |
|---|---:|---|---|
| [RepoOrch](https://github.com/architonixlabs/RepoOrch) | May 24, 2026 | Claude Code plugin for multi-repo microservice planning. It uses Agent Teams, per-repo specialists, mailboxes for peer-to-peer deliberation, read-only tool permissions, pre-tool write blocking, repo knowledge summaries, and a propose-only safety model. | Add to sprawl map as a distinct "multi-repo propose-only planner" category. |
| [RepoOrch walkthrough](https://dev.to/ramcsamal/multi-repo-microservice-changes-are-a-coordination-problem-i-solved-it-with-ai-agent-teams-34mf) | May 25, 2026 | The important claim is not that agents can code. It is that multi-repo work is a coordination problem, and Agent Teams mailboxes let repo specialists validate contracts directly. | Add a new doc or section: `multi-repo-agent-orchestration`. |
| [orch](https://github.com/gabrielkoerich/orch) | 2026 | Rust background service for multi-project GitHub Issues orchestration. Routes tasks to Claude, Codex, OpenCode, Kimi, or MiniMax; uses isolated worktrees; streams sessions; creates PRs; keeps per-task artifacts and memory. | Add as another multi-project orchestrator reference. |
| [Relay](https://github.com/jcast90/relay) | 2026 | Local-first cross-repo harness with one ticket board, dependency DAG, crosslink MCP messaging between live repo agents, JSONL event feed, and planned cost guardrails. | Track under cross-repo DAG / agent messaging. |
| [linear-agents](https://github.com/7oRR3s97/linear-agents) | 2026 | Symphony fork for multi-repo dependency-aware Linear orchestration, stacked PRs, repo labels, autonomy labels, Langfuse tracing, and human-only merges. | Add as "Symphony derivative" evidence. |
| [Hands-Off Coding on GCP](https://hackernoon.com/hands-off-coding-on-gcp-building-autonomous-agents-with-guardrails) | May 26, 2026 | Cloud-provider reference architecture: Cloud Workflows, Cloud Tasks, Pub/Sub, Cloud Run Jobs, GKE Autopilot, Secret Manager, Cloud Logging, deterministic admission, context hydration, isolated workspace, PR evidence. | Add provider-neutral implementation checklist. |
| [AWS sample autonomous cloud coding agents](https://github.com/aws-samples/sample-autonomous-cloud-coding-agents) | Mar 31, 2026 | AWS CDK sample with input gateway, durable orchestrator, isolated MicroVMs, tiered memory, PR review feedback loop, pre-flight checks, observability, governance. | Add as AWS counterpart to Background Agents / GCP pattern. |
| [temporal-repo-steward](https://github.com/tamara1031/temporal-repo-steward) | May 2026 | More detail than captured: advisor model on second self-heal/no-diff, heartbeating CI wait activity, non-retryable error taxonomy, workflow determinism, and explicit branch-protection caveat. | Expand Temporal notes with exact lifecycle primitives. |

## What The Merge Already Covers Well

- Background Agents / Open-Inspect as the best open-source hosted-session reference.
- OpenAI Symphony as the clearest "manage work, not sessions" proof.
- AIDev and follow-on studies as the empirical measurement layer.
- Governance boundary: PR creation and merge-readiness by default, not blind autonomous merge.
- Evidence ledger, repo policy engine, and runner abstraction as Software Factory's likely product shape.

## What It Misses

### 1. Multi-Repo Is Becoming Its Own Category

The merged memo treats multi-repo coordination as one item inside sprawl. The newer Exa pass shows it deserves a top-level architecture category:

- repo registry and routing
- per-repo ownership/context files
- dependency DAGs
- stacked PRs
- cross-repo contract checks
- agent-to-agent messaging
- propose-only planning before execution
- human-owned merge governance

This matters because Software Factory's opportunity is not only "run background tasks." The stronger business wedge is "coordinate changes across the repos and tools Alec already owns."

### 2. Read-Only / Propose-Only Is A Serious Safety Pattern

RepoOrch's hard rule is useful: first run should modify nothing. It generates an ordered change plan with risks and validation hints, and enforces read-only operation through tool inventory plus pre-tool hooks.

Software Factory should support autonomy levels:

| Level | Behavior |
|---|---|
| Observe | Index repo, summarize state, no plans |
| Propose | Produce cross-repo plan, no file writes |
| Patch | Create branch and PR, no merge |
| Repair | Respond to CI/review feedback |
| Merge | Only when branch protection and policy allow |

### 3. Cloud Reference Architectures Are Converging

The GCP and AWS samples line up with Background Agents and Temporal:

- input gateway
- admission checks
- durable workflow
- queue / backpressure
- isolated task runtime
- secret manager
- task state store
- log/artifact store
- model runtime
- PR finalization with evidence
- review feedback loop

This should become a Software Factory implementation checklist, independent of whether the chosen runner is Modal, Cloud Run Jobs, Temporal, GitHub Actions, or Kubernetes.

## Recommended Follow-Up Docs

1. `docs/multi-repo-agent-orchestration-2026.md`
   - RepoOrch, Relay, orch, linear-agents, Symphony stacked PRs.
   - Focus on DAGs, repo ownership metadata, propose-only mode, and agent mailboxes.

2. `docs/background-agent-cloud-reference-architectures-2026.md`
   - Background Agents, GCP guardrails, AWS autonomous cloud coding agents, Temporal repo steward, Agent Substrate.
   - Focus on reusable infrastructure primitives, not vendors.

3. `docs/software-factory-autonomy-levels.md`
   - The five autonomy levels above.
   - Repo manifest fields: allowed triggers, protected paths, allowed commands, required evidence, approval owner, max spend, max runtime.

## Immediate Product Implication

Build the first Software Factory dashboard around **repo readiness and autonomy level**, not around "spawn an agent."

Minimum fields:

- repo
- owner
- current autonomy level
- setup reproducibility
- test command known
- protected paths configured
- branch protection detected
- CI health
- recent agent PR outcomes
- current recommended next action

This gives the repo a durable product thesis: Software Factory is the governance and coordination layer for autonomous codebases, not just another coding-agent wrapper.

## Sources

- RepoOrch: https://github.com/architonixlabs/RepoOrch
- RepoOrch article: https://dev.to/ramcsamal/multi-repo-microservice-changes-are-a-coordination-problem-i-solved-it-with-ai-agent-teams-34mf
- orch: https://github.com/gabrielkoerich/orch
- Relay: https://github.com/jcast90/relay
- linear-agents: https://github.com/7oRR3s97/linear-agents
- Hands-Off Coding on GCP: https://hackernoon.com/hands-off-coding-on-gcp-building-autonomous-agents-with-guardrails
- AWS autonomous cloud coding agents sample: https://github.com/aws-samples/sample-autonomous-cloud-coding-agents
- temporal-repo-steward: https://github.com/tamara1031/temporal-repo-steward
