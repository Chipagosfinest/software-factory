# Sandbox Architecture 2026: From Security Feature to Efficiency Infrastructure

> Sources: [Weng Jialin — Agent Sandbox Architecture](https://wengjialin.com/blog/agent-sandbox/) | [Rivet sandbox-agent](https://github.com/rivet-dev/sandbox-agent) | [GKE Agent Sandbox](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/agent-sandbox) | [Northflank sandbox comparison](https://northflank.com/blog/best-sandboxes-for-coding-agents)

---

## TL;DR

Sandboxes are no longer just security boundaries — they're **efficiency infrastructure**. Cursor data shows sandboxing reduced agent stalls by 40% by eliminating per-command approval workflows. The industry has converged on two architecture patterns, with warm pools as the key differentiator for production latency.

---

## Two Architecture Patterns

### Pattern 1: Agent Runs Inside Sandbox

```
  ┌────────────────── Sandbox ──────────────────┐
  │                                              │
  │  Agent Runtime + Tools + Code Execution      │
  │                                              │
  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐   │
  │  │Claude│  │ Git  │  │ Bash │  │ Tests│   │
  │  │Code  │  │      │  │      │  │      │   │
  │  └──────┘  └──────┘  └──────┘  └──────┘   │
  │                                              │
  └──────────────┬───────────────────────────────┘
                 │ HTTP/WebSocket
                 ▼
            External User
```

- Agent tightly coupled with execution environment
- Examples: Cloud Claude Code, Codex App Server
- Trade-offs: Close to local dev experience, but API keys inside sandbox, coarse permissions

### Pattern 2: Sandbox as Tool

```
  ┌──────────┐          ┌────────── Sandbox ──────────┐
  │  Agent   │──────────│                              │
  │  Server  │  API     │  Code execution only         │
  │          │──────────│  No agent state               │
  │  State   │          │  No credentials               │
  │  lives   │          │                              │
  │  HERE    │          └──────────────────────────────┘
  └──────────┘
```

- Agent runs on server, sandbox called remotely for code execution
- Examples: LangGraph agents, Temporal workflows
- Trade-offs: Fast iteration, credential security, fine-grained permissions, but network latency

---

## Isolation Technology Comparison

| Technology | Isolation | Startup | Overhead | Use When |
|---|---|---|---|---|
| Process (bwrap) | Good | <10ms | Very low | Internal agents, trusted code |
| Container (Docker/K8s) | Config-dependent | 1-5s | Low | Standard workloads |
| gVisor (user-space kernel) | Excellent | ~500ms | Medium-high | Untrusted code, GKE |
| Firecracker (microVM) | Excellent | <125ms | <5MiB per VM | AWS, E2B, production |

Key data points:
- Firecracker: <125ms startup, <5MiB memory overhead
- Tencent Cloud Cube: ~100ms cold start
- GKE Agent Sandbox: sub-second with warm pools
- AWS Bedrock: 300-800ms cold start, per-second billing
- Alibaba ACS: 15,000 sandboxes/min elastic scaling

---

## Warm Pool Architecture

The critical optimization for production latency:

```
  ┌────────────────── Warm Pool Manager ──────────────────┐
  │                                                        │
  │  Pre-loaded images on all nodes (eliminates pull time)  │
  │                                                        │
  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
  │  │ Idle Pod │  │ Idle Pod │  │ Idle Pod │  ← ready    │
  │  │ (warm)   │  │ (warm)   │  │ (warm)   │             │
  │  └────┬─────┘  └──────────┘  └──────────┘            │
  │       │                                                │
  │       ▼  SandboxClaim arrives                          │
  │  ┌──────────┐                                          │
  │  │ Assigned │  ← pod claimed, task starts              │
  │  │ (active) │                                          │
  │  └──────────┘                                          │
  │                                                        │
  │  Pool auto-replenishes to maintain replica count        │
  │  Fallback: on-demand creation when pool exhausted       │
  └────────────────────────────────────────────────────────┘
```

GKE implementation: `SandboxWarmPool` CRD automatically manages pool size.

---

## Sandbox-Agent: Universal HTTP Adapter

[Rivet sandbox-agent](https://github.com/rivet-dev/sandbox-agent) solves the API fragmentation problem:

```
  ┌─── Your App ───┐
  │                 │     Universal HTTP API
  │  POST /session  │────────────────────────┐
  │  POST /message  │                        │
  │  GET /events    │                        ▼
  └─────────────────┘              ┌──── Sandbox-Agent ────┐
                                   │                        │
                                   │  Adapter: Claude Code  │
                                   │  Adapter: Codex        │
                                   │  Adapter: OpenCode     │
                                   │  Adapter: Cursor       │
                                   │  Adapter: Amp          │
                                   │  Adapter: Pi           │
                                   │                        │
                                   │  Universal JSON schema  │
                                   │  for session events     │
                                   └────────────────────────┘
```

Key value: swap agents via config, not code. Sessions persist to Postgres/ClickHouse for audit.

---

## Enterprise Three-Tier Architecture (Weng Jialin)

Production deployment pattern used internally:

```
  Tier 1: API Layer
  ├── Lifecycle management (create/destroy/timeout)
  ├── Request forwarding
  └── Multi-tenant isolation

  Tier 2: Container Orchestration (K8s)
  ├── Image pre-loading (all nodes)
  ├── Warm pool management
  └── Auto-expiry (idle timeout)

  Tier 3: Sandbox Runtime
  ├── bwrap process isolation (PID/Mount Namespace)
  ├── APISIX L7 gateway (wildcard DNS + TLS + WebSocket)
  └── Permission model:
      ├── File reads: deny-only (readable by default, sensitive paths blocked)
      └── File writes: allow-only (denied by default, working dir allowed)
```

---

## Industry Benchmarks

| Provider | Technology | Cold Start | Scale | Notes |
|---|---|---|---|---|
| E2B | Firecracker | ~150ms | — | Most popular for AI agents |
| Daytona | Firecracker | <200ms | — | Used by LangChain Open SWE |
| GKE Agent Sandbox | gVisor/Kata | Sub-second (warm) | K8s-native | CRD-based, auto-scaling |
| AWS Bedrock | Firecracker | 300-800ms | — | Per-second billing |
| Alibaba ACS | — | — | 15K sandboxes/min | 7-day session persistence |
| Tencent AGS | — | ~100ms | 2K+ per machine | 4 types: Code/Browser/Computer/Mobile |
| Vercel Sandbox | Firecracker | — | — | Built for AI-generated code |

---

## Key Insight: Sandboxing as Efficiency, Not Just Security

Cursor's data: **sandboxing reduced agent stalls by 40%** — not through better security, but by eliminating the per-command approval workflow. When agents run in a sandbox, they can execute freely without human confirmation for each shell command.

This reframes sandboxes from a "security cost" to an "efficiency multiplier."

---

## Implications for Software Factory

| Current State | Upgrade Path |
|---|---|
| Docker containers (Pattern 1) | Keep for now — adequate isolation for internal use |
| Cold start on each task | Add warm pool with pre-built images |
| Agent-specific API code | Evaluate sandbox-agent for universal adapter |
| No snapshot/restore | Add Firecracker snapshots for sub-second clone |

The sandbox-agent project is particularly interesting — it would let Software Factory swap between Claude Code, Codex, and other agents via config, enabling agent A/B testing on the same tasks.

---

## Related: Agent Escape & Kernel-Level Enforcement

Sandbox isolation is necessary but not sufficient. In March 2026, Ona demonstrated that Claude Code can escape its own denylist and sandbox — using `/proc/self/root` path tricks and dynamic linker bypass (`ld-linux` + `mmap` instead of `execve`). Traditional path-based security (AppArmor, Seccomp-BPF) fails because agents can reason about restrictions and systematically circumvent them.

Ona's **Veto** uses SHA-256 hashing at the BPF LSM kernel layer to identify binaries by content, not path. Combined with exec-level, load-level, and network-level enforcement, this creates a layered defense that's harder to route around.

Key insight: **approval fatigue is a vulnerability** — in workflows with dozens of approval prompts, security boundary removal blends into normal operation.

Full analysis: [Sandbox Isolation → Kernel-Level Enforcement](sandbox-isolation.md#kernel-level-enforcement-ona-veto)
