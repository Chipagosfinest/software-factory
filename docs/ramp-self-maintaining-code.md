# Ramp Labs: Self-Maintaining Code

*Last updated: March 23, 2026*

Ramp Labs built an agentic system that continuously monitors production, triages alerts, and pushes fixes without human intervention. The system runs on 1,000 AI-generated monitors — one for every 75 lines of code.

---

## Source

> [@RampLabs](https://x.com/RampLabs) article: "How we made Ramp Sheets self-maintaining"
> Surfaced via [@felixrieseberg](https://x.com/felixrieseberg/status/2036193240509235452), March 23, 2026

---

## The Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│              RAMP SELF-MAINTAINING CODE (v3)                      │
│                                                                  │
│  PR Merge ──▶ Agent reads diff ──▶ Generates Datadog monitors    │
│                                         │                        │
│                              1 monitor per 75 LOC                │
│                              (1,000 total, up from 10 manual)    │
│                                         │                        │
│                              Monitor fires (anomaly detected)    │
│                                         │                        │
│                              Datadog webhook                     │
│                                         ▼                        │
│                              ┌─────────────────────┐             │
│                              │  TRIAGE AGENT        │             │
│                              │  (Opus 4.6)          │             │
│                              │                     │             │
│                              │  Real issue?         │             │
│                              │  ├─ YES → sandbox   │             │
│                              │  └─ NO  → tune/     │             │
│                              │          delete      │             │
│                              │          monitor     │             │
│                              └────────┬────────────┘             │
│                                       │                          │
│                                       ▼                          │
│                              ┌─────────────────────┐             │
│                              │  RAMP INSPECT        │             │
│                              │  (sandboxed env)     │             │
│                              │                     │             │
│                              │  - Full dev env      │             │
│                              │  - Real API calls    │             │
│                              │  - Reproduce bug     │             │
│                              │  - Run tests         │             │
│                              │  - Generate fix      │             │
│                              └────────┬────────────┘             │
│                                       │                          │
│                              ┌────────┼────────┐                 │
│                              ▼                 ▼                 │
│                         Push PR          Notify Slack             │
│                    (append PR link                                │
│                     to monitor desc                               │
│                     for dedup)                                    │
│                              │                                   │
│                         Human reviews                            │
│                              │                                   │
│                           Merged ✓                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## Evolution (3 Iterations)

### v1 — Nightly QA Agent (scheduled, unfocused)

- Ran every night: sanity-test core features, stress-test recent PRs, probe for latent bugs
- Found real production bugs daily, auto-created PRs
- **Limitation**: Walked the same paths every night — couldn't catch narrow, situational bugs
- **Limitation**: "Prioritization at production scale requires intelligence surpassing any model available today"

> An engineer shipped a feature with a bug they hadn't noticed; by morning, the agent had caught the regression and pushed a fix.

### v2 — Monitor-Driven Maintenance (event-triggered)

- On PR merge → agent reads diff → generates Datadog monitors instrumenting the new code
- Monitor fires → Datadog webhook → new agent with alert context
- Agent reproduces issue in sandbox → pushes fix → notifies Slack
- **Result**: 40 real bugs caught in first week, each within minutes of user trigger
- **Limitation**: Noisy. Auto-generated monitors have bad thresholds. Routine activity triggered false positive cascades.

> A user uploaded a spreadsheet with a unique type of embedded image that our existing logic could not handle; the resulting exception set off a monitor and moments later, the agent had alerted us with a fix ready.

### v3 — Triage + Dedup (current production)

- Added triage step before sandbox: agent assesses scope first
  - Real issue → reproduce in sandbox → push fix → post to Slack
  - Noise → tune or delete the monitor (self-improving)
- **Dedup**: when agent pushes fix, appends PR link to monitor description. Subsequent agents see the link and stand down.
- State stored ON the monitor itself (not external DB)
- Scaled from 10 hand-written monitors to **1,000 auto-generated** (1 per 75 LOC)

---

## Execution Environment: Ramp Inspect

Their internal background coding agent:
- Each session = full sandboxed dev environment
- Can make real API requests, run tests, reproduce bugs end-to-end against live code
- Key design insight: "Subtle failure modes are rarely apparent from static code review"
- Agent only pushes fix once reproduction test passes

**This is the same sandbox-first pattern we see in Devin, Factory.ai, and Codex.** The differentiator is that Ramp's sandbox is triggered by production signals (monitors), not human intent (issues/PRs).

---

## Model Selection (Production-Validated)

| Task | Model | Why |
|------|-------|-----|
| Debugging / Fix generation | GPT-5 series | "Very thorough debuggers" |
| Triage / Alert evaluation | **Opus 4.6** | "More accurate triage evaluator, specifically better at filtering noisy alerts" |

This is one of the few public disclosures of task-specific model routing in a production agent system. Most teams use one model for everything.

---

## Key Learnings (Direct Quotes)

1. **"Detect everything, notify selectively."** Watch every signal, but each alert reaching a human should mean something. Teams ignore noisy monitors, and they'll ignore noisy agents too.

2. **"Delegate to the agent."** Let it scope out the problem, judge impact, make changes, and filter noise. It's very good at this, and will get better as models improve.

3. **"Sandboxed reproduction improves results."** Agent reproduces the failure against live code and only pushes a fix once the reproduction test passes. Ensures issue is real AND fix works.

4. **"Model choice matters."** Task-specific model routing outperforms one-model-fits-all.

5. **"Tight observability breeds customer empathy."** When every slow load or bad output fires a notification, the team feels the product the same way users do.

6. **"Keep your existing stack."** Auto-generated monitors are powerful but opaque, not yet reliable enough as only defense. Keep hand-written instrumentation you trust. "As models improve, that will change."

---

## Scale Numbers

| Metric | Value |
|--------|-------|
| Auto-generated monitors | 1,000 |
| Monitor density | 1 per 75 LOC |
| Hand-written monitors replaced | 10 → 1,000 |
| Real bugs caught (week 1) | 40 |
| Time to fix | Minutes (not hours/days) |
| False positive handling | Agent self-tunes monitors |

---

## Topology Classification

This is a **Monitor-Driven Reactive Loop** — a new topology not fully covered in our existing taxonomy:

```
Code Change → Generate Monitors → Production Signal → Triage → Sandbox Reproduce → Fix → PR
                                        ↑                          │
                                        └──── tune/delete ◄────────┘
```

Key differentiators from existing topologies:
- **vs. Webhook-driven (Software Factory)**: Triggered by production telemetry, not code events
- **vs. Cron/scheduled (Carson's factory)**: Event-driven, not time-driven
- **vs. Deterministic graph (Symphony)**: No predefined task DAG — monitors generate tasks dynamically
- **Self-improving**: Triage loop prunes bad monitors, so noise decreases over time without human tuning

---

## Relevance to Software Factory

### Direct Applicability

| Ramp Pattern | Software Factory Equivalent | Gap / Opportunity |
|-------------|---------------------------|-------------------|
| Datadog monitors → agent trigger | GitHub webhooks → EventRouter | Could add: production telemetry as trigger source |
| PR merge → generate monitors | No equivalent | Could generate test assertions on PR merge |
| Sandbox reproduction before fix | Agent Runner + sandbox | Have sandbox, but no auto-reproduction flow |
| Triage step (real vs noise) | Executor Gate (binary on/off) | Could add confidence scoring before agent dispatch |
| State on monitor (dedup) | BullMQ job dedup | Similar concept, different mechanism |
| Model routing (GPT-5 debug, Opus triage) | Single model per agent type | Could benefit from task-phase-specific routing |
| Self-tuning monitors | Static webhook filters | Could add adaptive event filtering |

### The Big Insight

Ramp solved the "one agent can't prioritize everything" problem by **decomposing it into 1,000 narrow monitors** instead of building one smarter agent. Each monitor watches a small surface area and fires independently. The triage agent then evaluates per-alert.

This is the same pattern as microservices vs monolith, applied to agent attention: **narrow watchers + smart dispatcher > omniscient overseer**.

### Applicable to OpenClaw Hub

| Pattern | OpenClaw Application |
|---------|---------------------|
| Monitor-driven triggers | Watchdog could generate narrow checks per service |
| Automated triage | Replace human Telegram approval with confidence scoring |
| Self-tuning | Agents modify their own monitoring rules |
| Model routing | Route Grok for speed, Claude for judgment calls |

---

## Open Questions

1. **Cost**: How much does running 1,000 monitors + triage agents cost per day? Not disclosed.
2. **False negative rate**: How many real bugs slip through the monitor mesh?
3. **Monitor staleness**: When code changes significantly, do old monitors become harmful?
4. **Scaling limit**: Does the pattern work at 10K+ monitors, or does triage become the bottleneck?
5. **Cross-service**: Ramp Sheets is one product — does this pattern compose across multiple services?
