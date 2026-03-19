# Background Agents (Open-Inspect)

*Last updated: March 19, 2026 | Source: [ColeMurray/background-agents](https://github.com/ColeMurray/background-agents) | 1,111 stars | MIT*

An open-source background coding agent system inspired by [Ramp's Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent). Decouples developer presence from code execution — users submit prompts and retrieve results asynchronously.

---

## Key Data

| Metric | Value |
|--------|-------|
| Stars | 1,111 (as of Mar 2026) |
| Language | TypeScript (78.6%), Python (18.0%), HCL (2.0%) |
| License | MIT |
| Topology | Mesh (multiplayer sessions with shared sandbox state) |
| Homepage | [backgroundagents.dev](https://backgroundagents.dev) |
| Agent Runtime | OpenCode |
| Control Plane | Cloudflare Workers + Durable Objects |
| Data Plane | Modal (containerized sandboxes) |
| Client | Next.js web, Slack bot, Chrome extension |

---

## Architecture

Three-tier architecture separating session management from execution:

```
  ┌──────────────────── CONTROL PLANE (Cloudflare) ────────────────────┐
  │                                                                     │
  │  Durable Objects (per-session isolation)                           │
  │  ├── SQLite databases (session persistence)                        │
  │  ├── WebSocket hub (real-time streaming to all clients)            │
  │  ├── D1 database (repository-scoped secrets)                       │
  │  └── GitHub integration handlers (OAuth, PR creation)              │
  │                                                                     │
  └─────────────────────────────┬───────────────────────────────────────┘
                                │ WebSocket bridge
  ┌─────────────────── DATA PLANE (Modal) ─────────────────────────────┐
  │                                                                     │
  │  Containerized Sandbox per session                                 │
  │  ├── Debian Linux + Node.js 22 + Python 3.12 + git + Playwright   │
  │  ├── OpenCode agent runtime                                        │
  │  ├── Supervisor process managing execution                         │
  │  ├── Filesystem snapshots (near-instant restore)                   │
  │  └── Bridge component for control plane communication              │
  │                                                                     │
  └────────────────────────────────────────────────────────────────────┘
                                │
  ┌─────────────────── CLIENTS ────────────────────────────────────────┐
  │  Next.js web | Slack bot | GitHub bot | Linear bot | Chrome ext   │
  └────────────────────────────────────────────────────────────────────┘
```

### Package Structure

| Package | Purpose |
|---------|---------|
| `@open-inspect/shared` | Shared TypeScript types and utilities |
| `control-plane` | Cloudflare Workers + Durable Objects session management |
| `web` | Next.js dashboard client |
| `modal-infra` | Python sandbox infrastructure |
| `slack-bot` | Slack integration (Cloudflare Worker + Hono) |
| `github-bot` | GitHub PR review and mention handling |
| `linear-bot` | Linear webhook integration |

---

## Key Patterns

### 1. Near-Instant Startup via Snapshots

The cold-start problem (1-5+ min for fresh containers) is solved with Modal filesystem snapshots:

```
  Fresh session:     Clone → Install → Setup → Start → Agent → Ready  (minutes)
  Snapshot restore:  Restore → Quick Sync → Start → Agent → Ready     (seconds)
```

- Images rebuild every 30 minutes with latest code
- Dependencies cached and pre-installed
- Proactive sandbox warming triggered as users type prompts

### 2. Multiplayer Sessions

Multiple users participate simultaneously:
- Active presence indicators
- Per-user prompt attribution in git commits
- Real-time event streaming to all connected clients
- Sequential prompt processing (queue-based, FIFO)

```typescript
// Commit attribution per prompt author
await configureGitIdentity({
  name: author.scmName,
  email: author.scmEmail,
});
```

### 3. Automations (Scheduled Agents)

Cron-driven background sessions with reliability safeguards:
- Preset schedules (hourly, daily, weekly, monthly) + custom cron
- Minimum interval: 15 minutes
- **Auto-pause after 3 consecutive failures** — prevents cascading cost
- No concurrent runs — overlapping executions skipped
- 90-minute session timeout

### 4. Repository Lifecycle Scripts

Repos can define `.openinspect/setup.sh` and `.openinspect/start.sh`:
- `setup.sh` — provisioning (runs during image builds and fresh sessions)
- `start.sh` — runtime init (runs on every non-build startup, failures are strict)
- Receives `OPENINSPECT_BOOT_MODE` env var

### 5. Multi-Model Support

| Provider | Models |
|----------|--------|
| Anthropic | Claude Haiku, Sonnet, Opus |
| OpenAI | GPT 5.2, GPT 5.2 Codex, GPT 5.3 Codex |

OpenAI models integrate with ChatGPT subscriptions (no separate API keys).

---

## Security Model

**Single-tenant only.** All users are trusted organization members with shared repo access.

| Token Type | Scope | Purpose |
|------------|-------|---------|
| GitHub App Token | All installed repos | Clone, push |
| User OAuth Token | User-accessible repos | PR creation with attribution |
| Sandbox Auth | Per-session | Sandbox ↔ control plane |
| WebSocket Token | Single session | Client auth |

Shared GitHub App credentials mean no per-user repository access validation at session creation. Must deploy behind SSO/VPN. Limit GitHub App to specific repos (not "all repositories").

---

## Topology Classification

**Primary: Mesh** (same as Ramp Inspect)

```
    [User A] ←→ [User B]          ┌──────────────┐
        ↕    ╲╱    ↕              │  OpenCode    │
      shared sandbox state         │  Agent       │
        ↕    ╱╲    ↕              │  (sandbox)   │
    [User C] ←→ [Slack Bot]       └──────────────┘
         ↕                              ↕
    [Control Plane]              [Git → PR → Review]
```

- Multiplayer: multiple humans + bots share session state
- Shared workspace via Modal filesystem snapshots
- No central coordinator between participants — agents discover work via shared state
- Cron automations add a **One-Shot** dispatch layer

**Secondary patterns:**
- **One-Shot Tree** — automations dispatch independent sessions per schedule
- **Pipeline** — agent internally follows parse → reason → code → verify flow

---

## Comparison with Ramp Inspect

Open-Inspect is explicitly modeled on Ramp's internal system. Key differences:

| Dimension | Ramp Inspect | Open-Inspect |
|-----------|-------------|--------------|
| Source | Proprietary (Ramp internal) | Open source (MIT) |
| Sandbox | Modal | Modal (same) |
| Control Plane | Custom (undisclosed) | Cloudflare Workers + Durable Objects |
| Agent Runtime | Custom | OpenCode |
| Multi-model | Unknown | Anthropic + OpenAI |
| Automations | Not public | Cron scheduling with auto-pause |
| Integrations | Slack | Slack + GitHub + Linear + Chrome extension |
| Security | Enterprise SSO | Single-tenant (SSO recommended) |
| Deploy | SaaS | Self-hosted (Terraform + Vercel + Modal) |

---

## Software Factory Fit

**Infrastructure pattern, not coordination topology.** Open-Inspect provides the managed runtime layer that other topologies execute on. It answers "where do agents run?" not "how do agents coordinate?"

Relevant patterns for Software Factory:
1. **Snapshot warm pools** — reduces cold start from minutes to seconds
2. **Durable Objects for session state** — per-session SQLite, survives crashes
3. **Auto-pause on consecutive failures** — prevents cost spirals (aligns with our circuit breaker pattern)
4. **Prompt queuing** — sequential processing prevents context conflicts
5. **Git identity per prompt author** — attribution in multi-user scenarios
6. **Repository lifecycle scripts** — standardized setup/teardown

---

## References

- **Repository:** [ColeMurray/background-agents](https://github.com/ColeMurray/background-agents)
- **Website:** [backgroundagents.dev](https://backgroundagents.dev)
- **Inspired by:** [Ramp Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent)
- **Key docs:** [HOW_IT_WORKS.md](https://github.com/ColeMurray/background-agents/blob/main/docs/HOW_IT_WORKS.md) | [AUTOMATIONS.md](https://github.com/ColeMurray/background-agents/blob/main/docs/AUTOMATIONS.md) | [SETUP_GUIDE.md](https://github.com/ColeMurray/background-agents/blob/main/docs/SETUP_GUIDE.md)
