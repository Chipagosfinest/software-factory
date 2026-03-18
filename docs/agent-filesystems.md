# Agent Filesystems: The Database-as-Directory Pattern

*Research date: March 18, 2026 | Primary source: tigerfs.io, Tiger Data, Turso AgentFS, Arize analysis*

> When multiple agents need shared state with transactional guarantees, the emerging answer isn't "better APIs" — it's mounting a database as a filesystem.

---

## The Problem

Autonomous coding agents already know how to work with files. They've been pretrained on billions of lines of bash, `cat`, `grep`, `ls`, `mv`. But shared agent state has historically been a pick-two triangle:

| Interface | Agents Know It | Transactions | Multi-Machine |
|-----------|---------------|-------------|---------------|
| Local filesystem | Yes | No | No |
| S3 / Object storage | Somewhat | No | Yes |
| Database (SQL) | No (context-expensive) | Yes | Yes |
| Git | Somewhat | No (merge hell) | Yes |

The agent filesystem pattern adds a fourth option: **mount a database as a POSIX directory**, giving agents the interface they already know with the semantics they need.

---

## TigerFS — Postgres as a Directory

**Site**: [tigerfs.io](https://tigerfs.io) | **Company**: Tiger Data | **Backend**: PostgreSQL + TimescaleDB

### What It Is

TigerFS mounts a PostgreSQL database as a local directory via FUSE (Linux) or NFS (macOS). Every file is a real database row. Writes are ACID transactions. Multiple agents and humans can read/write concurrently with full transactional guarantees, locally or across machines.

```bash
# Install
curl -fsSL https://install.tigerfs.io | sh

# Mount a database
tigerfs mount tiger:my-db /mnt/db

# Now use normal Unix tools
ls /mnt/db/tasks/
cat /mnt/db/tasks/fix-auth.md
echo '---
status: doing
assignee: agent-3
---
Fix the auth middleware timeout.' > /mnt/db/tasks/fix-auth.md
```

### Two Modes

**File-First**: Write markdown files with YAML frontmatter → TigerFS auto-creates database tables. Frontmatter keys become columns, body becomes `_body` text column, filename becomes `_path` primary key.

**Data-First**: Mount an existing Postgres database → tables become directories, rows become files. Navigate with paths, filter with chained path segments.

### Architecture

```
Agent (cat, grep, mv, vim)
    ↓
FUSE daemon (Linux) / NFS mount (macOS)
    ↓
TigerFS local daemon
    ↓
PostgreSQL (local or Tiger Cloud)
    ↓
TimescaleDB hypertables (version history)
```

### Multi-Agent Coordination Primitive

The killer pattern for agent systems is **atomic file moves as task claiming**:

```bash
# Agent claims a task (atomic database transaction)
mv /mnt/db/tasks/todo/fix-auth.md /mnt/db/tasks/doing/

# Two agents can't claim the same task — the mv is atomic
# Loser gets ENOENT, retries on next available task
```

Three directories (`todo/`, `doing/`, `done/`) + `mv` = a complete task queue with zero infrastructure. Moves are atomic database operations, so race conditions are impossible.

### Version History

Requires TimescaleDB (included in Tiger Cloud). Every edit and delete is captured as a timestamped snapshot:

```bash
ls /mnt/db/notes/.history/hello.md/
# 2026-02-12T013000Z
# 2026-02-14T091500Z
# 2026-03-01T143000Z

# Recover a past version
cat /mnt/db/notes/.history/hello.md/2026-02-12T013000Z > /mnt/db/notes/hello.md

# Stable row UUIDs persist across renames
cat /mnt/db/notes/.history/hello.md/.id
# a1b2c3d4-...
```

### Pipeline Query System

Path segments compile to optimized SQL — not N filesystem calls:

```bash
# Get last 10 orders for customer 123, sorted by date, as JSON
cat /mnt/db/orders/.by/customer_id/123/.order/created_at/.last/10/.export/json
```

Available segments: `.by/`, `.filter/`, `.order/`, `.columns/`, `.first/`, `.last/`, `.sample/`, `.export/`

### Special Directories

| Directory | Purpose |
|-----------|---------|
| `.build/` | Create new apps/tables |
| `.history/` | Version history (read-only) |
| `.export/` | Bulk export (csv, tsv, json) |
| `.import/` | Bulk import (append, sync, overwrite) |
| `.info/` | Metadata/row counts |
| `.by/`, `.filter/`, `.order/` | Query pipeline |
| `.create/`, `.modify/`, `.delete/` | Schema DDL staging |

### Claude Code Integration

TigerFS ships Claude Code skills that teach agents safe interaction patterns — checking `.info/count` before listing large tables, using pipeline queries for efficient reads, and following recipes for common workflows.

---

## AgentFS (Turso) — SQLite for Agent State

**Repo**: [github.com/tursodatabase/agentfs](https://github.com/tursodatabase/agentfs) | **Company**: Turso | **Backend**: SQLite (libSQL)

### What It Is

Everything an agent does — files, state, tool calls — lives in a single SQLite database file. Mountable via FUSE (Linux) / NFS (macOS), or accessible through TypeScript, Python, and Rust SDKs.

### Three Abstractions

| Abstraction | Purpose |
|-------------|---------|
| **Filesystem** | POSIX-like files and directories |
| **Key-Value** | Agent state and context storage |
| **Toolcall** | Audit trail of every tool invocation |

### Key Architectural Difference from TigerFS

AgentFS disaggregates at the **database layer** using SQLite's WAL (write-ahead log):

```
Agent → FUSE mount → local SQLite (disk speed)
                         ↓ (async)
                    WAL frames → Coordinator → S3 (durable)
```

- Reads hit kernel page cache — no FUSE overhead for cached data
- Writes buffer through page cache, async flush to S3
- State can migrate between machines via lazy page loading from S3

### Trade-offs vs TigerFS

| Dimension | TigerFS | AgentFS |
|-----------|---------|---------|
| Backend | PostgreSQL (server) | SQLite (embedded) |
| Multi-agent writes | Native (Postgres MVCC) | Single-writer (needs Turso MVCC) |
| Version history | TimescaleDB hypertables | WAL-based time-travel |
| Query power | Full SQL via path segments | Basic filesystem ops |
| Deployment | Needs Postgres instance | Single file, S3 sync |
| Schema | YAML frontmatter → auto-tables | Flat files + KV |
| Best for | Shared multi-agent workspaces | Per-agent isolated state |

---

## The Disaggregated Architecture (Pekka Enberg's Design)

Turso's Pekka Enberg published a [design document](https://penberg.org/blog/disaggregated-agentfs.html) for disaggregated agent filesystems on object storage. Key insights:

### Design Decisions
- **SQLite WAL as the replication primitive** — captures all mutations as a sequence of changes, naturally maps to object storage append
- **Local-speed reads, background S3 sync** — agents never wait for network on hot-path operations
- **Copy-on-write for agent isolation** — fork a filesystem for parallel experiments without duplicating storage

### Known Limitations
- **Single-writer bottleneck** — SQLite's model requires MVCC extension for concurrent agent writes
- **Write amplification** — 4KB page granularity means single-byte changes write full pages
- **Large files** — Multi-GB artifacts need hybrid S3-direct storage, not SQLite pages
- **Checkpoint latency** — Periodic WAL-to-DB folding introduces pauses; incremental checkpointing needed

---

## Industry Context: Filesystem vs API vs Database

Arize published a [comparison](https://arize.com/blog/agent-interfaces-in-2026-filesystem-vs-api-vs-database-what-actually-works/) of agent interface patterns:

### Why Filesystem Wins for Agents

> "By the time the LLM is taught how to use a particular API you've gobbled up a bunch of your context window"

- LLMs have extensive pretraining on bash/filesystem ops → minimal context tokens for education
- APIs require thousands of tokens for documentation → less room for reasoning
- Databases require teaching query languages and schemas → context-expensive

### The Hybrid Pattern Emerging

"Virtual filesystem" — preprocess remote data into a sandboxed filesystem at agent runtime:
- Session-scoped (exists only during execution)
- Agents explore with familiar tools (`cat`, `grep`, `jq`)
- No persistent file maintenance
- Storage backend is transparent to the agent

### No Production Winner Yet

The article emphasizes this remains experimental as of March 2026. The pattern is validated conceptually but no large-scale deployment (Stripe-level, 1,300 PRs/week) has published results using agent filesystems for coordination.

---

## Tiger Data's Broader Vision: "Agentic Postgres"

Tiger Data (the company behind TigerFS) is building a full agent-native Postgres stack:

### Components
- **TigerFS** — Filesystem interface (what we've been analyzing)
- **MCP Server** — Built-in Model Context Protocol with 10+ years of Postgres expertise baked in as "master prompts"
- **pg_textsearch** — BM25 ranking for keyword search (hybrid AI retrieval)
- **pgvectorscale** — Improved semantic search (higher throughput than pgvector)
- **Fluid Storage** — Disaggregated architecture with copy-on-write block storage, 110K+ IOPS
- **Zero-copy forks** — Agents spawn isolated production data copies in seconds
- **Free tier** — Three commands to install the complete stack

### Why This Matters for Software Factory

The zero-copy fork is the interesting primitive. An agent could:
1. Fork the production database
2. Run a migration in the fork
3. Verify the migration works
4. Apply to production (or discard)

This is the database equivalent of our sandbox isolation pattern — but at the data layer, not just the code layer.

---

## Relevance to Software Factory Architecture

### Current State
Software Factory runs agents in Docker sandboxes. Agent state is ephemeral — each run builds context from the event + repo. No shared mutable state between agent runs.

### What Agent Filesystems Could Enable

| Capability | Current Approach | With Agent Filesystem |
|-----------|-----------------|----------------------|
| **Shared task queue** | BullMQ + Redis | `mv todo/task.md doing/` (atomic) |
| **Agent memory** | None (stateless) | Persistent files with version history |
| **Cross-agent context** | Rebuilt from scratch | Shared directory, instant visibility |
| **Audit trail** | SQLite logs | `.history/` with timestamped snapshots |
| **Repo context cache** | Built per-run | Cached in filesystem, incrementally updated |

### Potential Integration Points

1. **Shared knowledge base** — Mount a TigerFS directory where agents write their findings. PR Reviewer discovers a pattern → writes it to `/mnt/db/knowledge/patterns/auth-middleware.md` → CI Debugger reads it when debugging auth failures.

2. **Task coordination** — Replace BullMQ with filesystem-based task queues. Simpler, observable with `ls`, atomic with `mv`, and agents can read task context with `cat` instead of deserializing from Redis.

3. **Agent state persistence** — Agents that learn from past runs. Security Patcher remembers which CVE patterns it's seen → faster triage on repeat patterns.

4. **Sandbox data layer** — Use Tiger Data's zero-copy forks to give each agent an isolated database copy for testing migrations and schema changes.

### Why NOT to Adopt Yet

- **No production validation at scale** — The Arize article confirms no large-scale deployment has been published
- **FUSE/NFS overhead** — Additional syscall layer for every file operation. Performance impact unknown for high-throughput agent workloads
- **Single point of failure** — If the Postgres instance goes down, all agents lose their filesystem. BullMQ + Redis is battle-tested for this
- **Complexity budget** — Adding another infrastructure dependency (Postgres + TimescaleDB) for state that's currently ephemeral
- **macOS NFS quirks** — We've learned the hard way that macOS has filesystem edge cases (bash 3.2, launchd env). NFS adds more

### Verdict

**Watch, don't adopt.** TigerFS is the most architecturally interesting agent coordination primitive to emerge in 2026. The "filesystem is the API" thesis is sound — agents genuinely work better with files than APIs. But the pattern needs a production validation story before it's worth integrating into Software Factory.

**Best candidate for first experiment**: Replace the BullMQ task queue with a TigerFS-backed `todo/doing/done/` directory pattern in a non-critical workflow. Low risk, easy to evaluate, easy to revert.

---

## Key Numbers

| Metric | Value | Source |
|--------|-------|--------|
| TigerFS install | One-liner, no deps on macOS | tigerfs.io |
| Tiger Fluid Storage IOPS | 110,000+ per volume | Tiger Data blog |
| AgentFS backend | Single SQLite file | Turso docs |
| Context tokens for filesystem education | Minimal (pretrained) | Arize analysis |
| Context tokens for API education | Thousands | Arize analysis |
| Production deployments at scale | **0 published** | Arize analysis |

---

## Sources

- [TigerFS](https://tigerfs.io/) — Product page and documentation
- [TigerFS Docs](https://tigerfs.io/docs.html) — Technical reference
- [Postgres for Agents — Tiger Data](https://www.tigerdata.com/blog/postgres-for-agents) — Agentic Postgres vision
- [AgentFS — Turso](https://github.com/tursodatabase/agentfs) — SQLite-based agent filesystem
- [Disaggregated Agent Filesystem — Pekka Enberg](https://penberg.org/blog/disaggregated-agentfs.html) — Architecture design doc
- [Agent Interfaces in 2026 — Arize](https://arize.com/blog/agent-interfaces-in-2026-filesystem-vs-api-vs-database-what-actually-works/) — Filesystem vs API vs Database comparison
- [We Built an AI Agent on Tiger Cloud — DEV Community](https://dev.to/lin_liang_7f755b0dc2fe65b/we-built-an-ai-agent-on-tiger-cloud-c5b) — Implementation case study
- [Fluid Storage — Tiger Data](https://www.tigerdata.com/blog/fluid-storage-forkable-ephemeral-durable-infrastructure-age-of-agents) — Infrastructure architecture
