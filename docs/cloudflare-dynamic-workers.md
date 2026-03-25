# Cloudflare Dynamic Workers: Isolate-Based Agent Sandboxing

*Last updated: March 24, 2026*

Cloudflare's Dynamic Workers use V8 isolates instead of containers for AI agent code execution. Millisecond startup, megabytes of memory, and a "Code Mode" pattern that replaces sequential tool calls with single generated functions.

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

Traditional agent tool use:
```
LLM → tool_call(search_dns) → result → LLM → tool_call(create_record) → result → LLM → tool_call(verify) → result
```
**3 LLM round-trips, 3 tool descriptions in context, high token cost.**

Code Mode with Dynamic Workers:
```
LLM → generates single TypeScript function that chains search → create → verify → result
```
**1 LLM call, 1 execution, agent writes the orchestration logic itself.**

Cloudflare's MCP server exposes their **entire API with just 2 tools and under 1,000 tokens**:
1. A "code mode" tool that accepts generated TypeScript
2. A "describe API" tool for discovery

vs. traditional MCP: one tool per API operation (hundreds of tools, thousands of tokens in context).

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

### The "Code Mode" Implication

Code Mode challenges the assumption that agents need many granular tools. Instead:
- Give the agent a **code execution sandbox** and an **API description**
- Let it **write a program** that accomplishes the task
- Execute the program in one shot

This is conceptually what Software Factory's agents already do (generate code, run in sandbox, output PR), but applied to tool use itself. An agent that writes a function to chain 5 API calls is more efficient than an agent that makes 5 sequential tool calls.

**Potential application**: Software Factory agents could generate TypeScript "task scripts" that combine multiple GitHub API operations into a single execution, reducing LLM round-trips and token cost.

---

## Open Questions

1. **JS/TS only**: Most production codebases include Python, Go, etc. Does isolate-only limit agent capabilities?
2. **Complex reproduction**: Ramp's agents reproduce bugs end-to-end. Can a V8 isolate run a full test suite?
3. **State across invocations**: Cold storage between runs means rebuilding context. How does this compare to persistent containers?
4. **Debugging**: When agent-generated code fails inside an isolate, what observability exists?
5. **Hybrid model**: Could you use isolates for fast triage + containers for deep debugging/reproduction?
