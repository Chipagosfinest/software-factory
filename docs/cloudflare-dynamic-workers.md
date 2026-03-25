# Cloudflare Dynamic Workers: Isolate-Based Agent Sandboxing

*Last updated: March 24, 2026*

Cloudflare's Dynamic Workers use V8 isolates instead of containers for AI agent code execution. Millisecond startup, megabytes of memory, and a "Code Mode" pattern that replaces sequential tool calls with single generated functions. The Cloudflare API has 2,500+ endpoints; Code Mode collapses them to 2 tools and ~1,000 tokens (99.9% reduction from 1.17M tokens).

---

## Source

> [Cloudflare Blog: Dynamic Workers](https://blog.cloudflare.com/dynamic-workers/), March 2026
> Open beta for all paid Workers users

---

## The Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│              DYNAMIC WORKERS (Isolate-Based Sandbox)              │
│                                                                  │
│  Agent LLM ──▶ Generates TypeScript code                        │
│                       │                                          │
│                       ▼                                          │
│              @cloudflare/codemode                                │
│              (wraps with DynamicWorkerExecutor,                  │
│               normalizes formatting,                             │
│               controls outbound fetch)                           │
│                       │                                          │
│                       ▼                                          │
│              @cloudflare/worker-bundler                          │
│              (resolves npm deps via esbuild)                     │
│                       │                                          │
│                       ▼                                          │
│              ┌─────────────────────┐                             │
│              │  V8 ISOLATE         │  ← NOT a container          │
│              │                     │                             │
│              │  - ms startup       │  vs 100s of ms (container)  │
│              │  - few MB memory    │  vs 100s of MB (container)  │
│              │  - no concurrency   │                             │
│              │    limits           │                             │
│              │  - 100s of edge     │                             │
│              │    locations        │                             │
│              │                     │                             │
│              │  Security layers:   │                             │
│              │  1. V8 sandbox      │                             │
│              │  2. Custom 2nd      │                             │
│              │     layer sandbox   │                             │
│              │  3. Memory Protect  │                             │
│              │     Keys (HW)      │                             │
│              │  4. Malicious code  │                             │
│              │     scanning        │                             │
│              └────────┬────────────┘                             │
│                       │                                          │
│              Credential injection via callback                   │
│              (agent never sees raw secrets)                      │
│                       │                                          │
│              Results returned to agent                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## Performance: Isolates vs Containers

| Metric | V8 Isolate (Dynamic Worker) | Container (Docker/Firecracker) |
|--------|----------------------------|-------------------------------|
| Startup | Few milliseconds | Hundreds of milliseconds |
| Memory | Few megabytes | Hundreds of megabytes |
| Concurrency | No global limits, 1M+ RPS | Limited by host resources |
| Geographic | 100s of edge locations | Single region (typically) |
| Cold storage | Yes (between invocations) | Volume mounts |
| Cost (beta) | Waived; standard: $0.002/unique worker/day + CPU | ~$0.01-0.10/container-hour |

**100x faster startup, 100x less memory.** For agent sandboxes that spin up per-task and die after execution, this changes the economics fundamentally. A system like Ramp's (1000 monitors, each potentially triggering an agent) becomes dramatically cheaper with isolates.

---

## Code Mode: The Key Pattern

*Source: [Cloudflare Blog: Code Mode MCP](https://blog.cloudflare.com/code-mode-mcp/)*

### The Problem

The Cloudflare API has **2,500+ endpoints**. A traditional MCP implementation exposing each as a tool would require **1.17 million tokens** — more than the entire context window of any foundation model. Even with dynamic tool search (like Claude Code uses), each matched tool still consumes tokens.

### The Solution: Two Tools, ~1,000 Tokens

The entire API surface is collapsed to two functions:

1. **`search()`** — Accepts JavaScript code that queries the OpenAPI specification. Agents write code to filter endpoints by product, path, tags, or metadata without loading the full spec into context. The spec object has all `$refs` pre-resolved for direct schema traversal.

2. **`execute()`** — Accepts JavaScript code that makes authenticated API calls via `cloudflare.request()`, handles pagination, chains operations, and processes responses.

Both execute within a Dynamic Worker isolate — V8 sandbox, no filesystem, disabled external fetches by default.

**Token economics:**
| Approach | Tokens Required | Tools in Context |
|----------|----------------|-----------------|
| Full MCP (1 tool per endpoint) | 1,170,000 | 2,500+ |
| Dynamic tool search | ~10,000-50,000 | Varies per query |
| **Code Mode** | **~1,000** | **2** |

**99.9% token reduction. Fixed cost regardless of API size.**

### Practical Example: DDoS Protection

The article demonstrates protecting an origin from DDoS:

**Step 1 — Discovery**: Agent calls `search()` with JS that filters for WAF/ruleset endpoints:
```
2,500+ endpoints → ~10 relevant ones (agent never sees the other 2,490)
```

**Step 2 — Action**: Agent calls `execute()` with JS that:
- Checks existing rulesets
- Inspects DDoS L7 and WAF configs
- Chains multiple API calls in one execution

**Result: 4 tool calls total** instead of dozens in traditional MCP.

### Traditional vs Code Mode Flow

Traditional agent tool use:
```
LLM → tool_call(search_dns) → result → LLM → tool_call(create_record) → result → LLM → tool_call(verify) → result
```
**3 LLM round-trips, 3 tool descriptions in context, high token cost.**

Code Mode:
```
LLM → generates single TypeScript function that chains search → create → verify → result
```
**1 LLM call, 1 execution, agent writes the orchestration logic itself.**

### Comparison to Alternative Approaches

| Approach | Example | Tradeoff |
|----------|---------|----------|
| **Client-side Code Mode** | Goose, Anthropic Claude SDK | Requires secure sandbox on client side |
| **CLI-based** | OpenClaw, Moltworker | Self-documenting but broader attack surface than isolates |
| **Dynamic tool search** | Claude Code | Reduces context but each matched tool still costs tokens; requires maintained search functions |
| **Server-side Code Mode** | **Cloudflare MCP** | Fixed token cost, progressive discovery, but JS/TS only |

**Notable: Cloudflare explicitly categorizes OpenClaw as a "CLI-based approach"** alongside Goose and Anthropic's SDK.

### Progressive Discovery

Agents explore API capabilities through code execution, not by scanning tool descriptions:
- No pre-loading documentation
- Agent writes queries against the OpenAPI spec
- Only relevant schemas enter the context
- API can grow to 10,000+ endpoints with zero token cost increase

### MCP Server Portals (Future)

Cloudflare is building **MCP Server Portals** — compose multiple MCP servers behind a unified gateway, applying Code Mode patterns across heterogeneous services. Same fixed-token footprint regardless of how many services sit behind the portal.

**This is the "API gateway for agents" concept.** One search + execute interface across all services.

### OAuth 2.1 Integration

Uses Workers OAuth Provider to downscope tokens to user-approved permissions. Supports both:
- **OAuth-based user authorization** (interactive)
- **API token management** (CI/CD scenarios)

### Loader API

```javascript
let worker = env.LOADER.load({
  compatibilityDate: "2026-03-01",
  mainModule: "agent.js",
  modules: { "agent.js": agentCode },
  env: { CHAT_ROOM: chatRoomRpcStub },
  globalOutbound: null,  // blocks all outbound by default
});
```

---

## Security Architecture

Defense-in-depth for isolate-based sandboxing:

1. **V8 sandbox** — Standard V8 isolate boundary. Patches deployed "within hours" of disclosure.
2. **Custom second-layer sandbox** — Dynamic tenant cordoning (isolate misbehaving code without affecting others).
3. **Hardware features** — Memory Protection Keys (Intel MPK) for memory isolation.
4. **Malicious code scanning** — Pattern matching with automatic blocking before execution.
5. **Credential injection** — HTTP requests pass through configurable callbacks for auth token injection. Agent code never has direct access to secrets.
6. **`globalOutbound: null`** — Default-deny network access. Explicit allowlist for outbound.

### TypeScript RPC over HTTP

Cloudflare recommends TypeScript RPC interfaces for agent-to-API communication instead of HTTP:
- **Fewer tokens** to describe than HTTP interfaces
- **More granular security boundaries** (type-level access control)
- **Compile-time verification** of agent-generated code

---

## Supporting Libraries

| Library | Purpose |
|---------|---------|
| `@cloudflare/codemode` | Wraps generated code with `DynamicWorkerExecutor()`, normalizes formatting, controls outbound fetch |
| `@cloudflare/worker-bundler` | Pre-bundles modules with npm deps via esbuild |
| `@cloudflare/shell` | Virtual filesystem (read, write, search, replace, diff) backed by SQLite + R2 storage |

---

## Relevance to Software Factory

### Sandbox Architecture Comparison

| Dimension | Software Factory (Docker) | OpenClaw Hub (Docker) | Cloudflare Dynamic Workers |
|-----------|--------------------------|----------------------|---------------------------|
| Startup | ~500ms-2s | ~500ms-2s | ~2-5ms |
| Memory per task | ~200-500MB | ~663MB image | ~2-10MB |
| Isolation | Container (Linux namespaces) | Container (network: none) | V8 isolate + HW MPK |
| Language support | Any (full OS) | Any (Debian image) | JavaScript/TypeScript only |
| Network control | Docker network rules | network: none | globalOutbound callbacks |
| Credential handling | Env vars in container | Env vars + allowlist | Callback injection (never exposed) |
| Persistence | Volume mounts | /workspace mount | SQLite + R2 (cold storage) |
| Scale | Single machine | Single machine | Global edge (100s locations) |
| Cost model | Fixed (host resources) | Fixed (host resources) | Per-invocation ($0.002/day) |

### Key Tradeoffs

**Isolates win when:**
- Tasks are JavaScript/TypeScript (most agent output is)
- Startup time matters (high-frequency triggers like Ramp's 1000 monitors)
- Memory is constrained (running many concurrent agents)
- Global distribution needed

**Containers win when:**
- Full OS needed (Python, Go, Rust, shell scripts)
- Complex toolchains (compilers, test frameworks, databases)
- Large dependency trees
- Need to run existing codebases unmodified

### The "Code Mode" Implication for Agent Architecture

Code Mode challenges a foundational assumption: that agents need many granular tools. The alternative:
- Give the agent a **code execution sandbox** and an **API description**
- Let it **write a program** that accomplishes the task
- Execute the program in one shot

This is conceptually what Software Factory's agents already do (generate code, run in sandbox, output PR), but applied to **tool use itself**. An agent that writes a function to chain 5 API calls is more efficient than an agent that makes 5 sequential tool calls.

**Concrete applications for Software Factory:**
1. **GitHub API agent**: Instead of `tool_call(list_prs)` → `tool_call(get_diff)` → `tool_call(post_review)`, agent generates one script that does all three
2. **OpenClaw exec tool**: Could adopt search+execute pattern — agent discovers available commands then writes a multi-step bash script
3. **MCP Server Portals pattern**: Software Factory's multi-service integration (GitHub + Linear + Datadog) could use a unified search+execute gateway instead of separate tool definitions per service

### The MCP Scaling Problem (Quantified)

| API Surface | Traditional MCP Tokens | Code Mode Tokens | Savings |
|-------------|----------------------|-------------------|---------|
| 100 endpoints | ~47,000 | ~1,000 | 97.9% |
| 500 endpoints | ~234,000 | ~1,000 | 99.6% |
| 2,500 endpoints | ~1,170,000 | ~1,000 | 99.9% |
| 10,000 endpoints | ~4,680,000 | ~1,000 | 99.98% |

**Token cost is O(1) with Code Mode vs O(n) with traditional MCP.** As the number of services an agent can interact with grows, the gap becomes unbridgeable.

---

## Open Questions

1. **JS/TS only**: Most production codebases include Python, Go, etc. Does isolate-only limit agent capabilities?
2. **Complex reproduction**: Ramp's agents reproduce bugs end-to-end. Can a V8 isolate run a full test suite?
3. **State across invocations**: Cold storage between runs means rebuilding context. How does this compare to persistent containers?
4. **Debugging**: When agent-generated code fails inside an isolate, what observability exists?
5. **Hybrid model**: Could you use isolates for fast triage + containers for deep debugging/reproduction?
6. **Error recovery**: When agent-generated code fails mid-execution in Code Mode, how does it recover? Traditional tool calls let the LLM see each result and adjust. Code Mode is all-or-nothing.
7. **MCP Server Portals**: When composing multiple APIs behind one gateway, how does the agent discover which service has the capability it needs? Does search() scale across heterogeneous specs?
