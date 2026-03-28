# Agent Memory Systems — Research Deep-Dive

*Last updated: March 27, 2026*

How autonomous coding agents remember, learn, and avoid repeating mistakes across sessions.

---

## The Core Problem

LLM agents are stateless. Every session starts fresh. CLAUDE.md and AGENTS.md help, but they hit a scaling wall — you can only stuff so much into a single file before it dilutes the important stuff.

The 2025-2026 landscape shows two fundamentally different bets on how to solve this:

```
        The Agent Memory Spectrum

  Simple ◄──────────────────────────────► Complex
  File-based                           DB-backed

  CLAUDE.md    Napkin     hmem    Mem0    Letta/MemGPT
  (manual)   (curated)  (hier)  (auto)   (full platform)
     │          │         │       │          │
     ▼          ▼         ▼       ▼          ▼
  ~500 tok   ~2K tok   ~200 tok  SDK     Full server
  No search  BM25      Summaries Vector   Graph + vector
  No curation Auto-curate Tiered  Multi-  Structured
              Max 10/cat  5-level  tenant  memory blocks
```

---

## Napkin (Michael Livshitz) — Progressive Disclosure

**Repo**: [github.com/Michaelliv/napkin](https://github.com/Michaelliv/napkin)
**Package**: `napkin-ai` on npm
**License**: MIT | **Created**: March 15, 2026
**Stack**: TypeScript, MiniSearch (BM25), sql.js, zero external APIs
**Built for**: `pi` coding agent (Mario Zechner's platform)
**Public announcement**: [March 16, 2026](https://x.com/micLivs/status/2033605835092312491) — "a knowledge base that doubles as an agent memory layer, ultra fast, completely sidestepping vector search"

### HotpotQA Benchmark (March 27, 2026)

Hard numbers on multi-hop question answering (250 questions, seed 42):

```
┌──────────────┬──────────┬──────────┐
│ System       │ Recall   │ Answer F1│
├──────────────┼──────────┼──────────┤
│ Napkin (BM25)│ 99.8%    │ 79.6%    │
│ Ori          │ 90.0%    │ 41.0%    │
│ Mem0         │ 29.0%    │ 19.0%    │
└──────────────┴──────────┴──────────┘
```

- Model: **Haiku 4.5** — cheapest Claude tier
- No embeddings, no vector DB, no cloud
- Reproducible: `npx tsx bench/hotpotqa-eval.ts --n 250 --seed 42`
- Source: [@micLivs March 27, 2026](https://x.com/micLivs)

This is the strongest public evidence that BM25 + progressive disclosure beats vector search for agent memory retrieval. Napkin achieved near-perfect recall while Mem0 (the most popular vector-based agent memory) scored under 30%.

### The Anti-RAG Bet

Napkin's core thesis: **you don't need vector search**. Traditional RAG uses a dumber model (embeddings) to pre-filter what a smarter model (the LLM) sees. This is architecturally backwards. If you give the LLM a well-structured map of your knowledge, it can navigate to what it needs.

### Four-Level Progressive Disclosure

Instead of dumping everything into context, Napkin reveals information in graduated levels:

```
┌─────────────────────────────────────────────────┐
│  L0: NAPKIN.md (~200 tokens)                    │
│  ┌─────────────────────────────────────────────┐│
│  │ Always loaded. Project goals, conventions,  ││
│  │ key decisions. The "executive summary."     ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  L1: Keyword Map (~1-2K tokens)                 │
│  ┌─────────────────────────────────────────────┐│
│  │ TF-IDF extracted keywords per directory.    ││
│  │ Agent sees WHAT exists and WHERE.           ││
│  │ Headings 3x, filenames 2x, body 1x weight. ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  L2: BM25 Search (~2-5K tokens)                 │
│  ┌─────────────────────────────────────────────┐│
│  │ napkin search <query>                       ││
│  │ BM25 + backlink PageRank + recency scoring  ││
│  │ Match-only lines, NO surrounding context.   ││
│  │ Scores HIDDEN from agent (prevents anchor). ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  L3: Full Read (~5-20K tokens)                  │
│  ┌─────────────────────────────────────────────┐│
│  │ napkin read <file>                          ││
│  │ Complete file content. Agent earns its way  ││
│  │ here by navigating through L0-L2 first.    ││
│  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### Search Ranking Formula

```
composite = bm25Score + (backlinks × 0.5) + (recency × 1.0)
```

- **BM25** via MiniSearch (fuzzy 0.2, prefix matching, basename 2x boost)
- **Backlinks** — files with more inbound `[[wikilinks]]` rank higher (PageRank-lite)
- **Recency** — file mtime normalized 0-1, used as tiebreaker

### TF-IDF Keyword Extraction Pipeline

1. Group files by folder
2. Collect weighted text: headings (3×), filenames (2×), frontmatter title (2×), body (1×)
3. Strip noise (URLs, code blocks, emails, hex hashes)
4. Tokenize (lowercase, 3+ chars, stop words filtered)
5. Extract bigrams (must appear 2+ times, no duplicate words)
6. Score TF-IDF across folders (each folder = one document)
7. Deduplicate: if bigram selected, suppress constituent unigrams

### Model Psychology Design

Napkin makes deliberate UX choices for LLM consumers, not humans:

| Pattern | Why |
|---------|-----|
| **Scores hidden by default** | Agents anchor on numeric scores and refuse to read low-scored files |
| **Context 0 by default** | Unlike Google snippets (2-3 lines for skimming), agents process every token — match-only is denser |
| **Hints as control flow** | Tool output includes embedded hints that steer the agent through progressive disclosure |
| **`--json` everywhere** | Every command supports structured output for programmatic access |
| **Minimal by default** | Agent gets the minimum, then requests more — respects token budgets |

### Schema-Led Knowledge Generation

Rather than freeform notes, Napkin uses **templates** that define structured extraction schemas:

| Template | Directories | Use Case |
|----------|-------------|----------|
| coding | decisions/, architecture/, guides/, changelog/ | Software projects |
| company | people/, projects/, runbooks/, infrastructure/ | Organization KB |
| product | features/, roadmap/, research/, specs/, releases/ | Product management |
| personal | people/, projects/, areas/, references/ | Personal assistant |
| research | papers/, concepts/, questions/, experiments/ | Academic/research |

Key insight: the same extraction pipeline produces radically different outputs depending on the schema. **The schema is the leverage point, not the model.**

### Auto-Distillation

Background processes (via pi extensions) automatically:
1. Capture knowledge from conversations on a timer (default: 60 min)
2. Fork session to temp directory
3. Spawn sub-agent (Claude Sonnet) with forked conversation
4. Sub-agent reads vault templates, creates/appends structured notes
5. Clean up — knowledge accrues passively without user intervention

### Storage: Obsidian-Compatible, Obsidian-Independent

- `.napkin/` directories function as Obsidian vaults
- Wiki-style `[[links]]`, YAML frontmatter, folder structure
- Config auto-syncs to `.obsidian/` for human use
- Force-directed graph visualization via Glimpse (native macOS) or browser
- **Zero external services. Zero API keys for core.**

### Feature Surface

Beyond search and read, Napkin provides:
- **Daily notes** — Obsidian-compatible
- **Tags** — list, info, counts, aliases
- **Tasks** — list (filter by done/todo/daily), toggle
- **Links** — outgoing, backlinks, unresolved, orphans, deadends
- **Bases** — YAML-defined database views over vault files (Jexl formulas + SQLite)
- **Canvas** — JSON Canvas spec 1.0 operations
- **Bookmarks** — file, folder, search, URL

---

## Napkin (Siqi Chen / @blader) — Curated Scratchpad

**Repo**: [github.com/blader/napkin](https://github.com/blader/napkin)
**Type**: Claude Code skill
**License**: MIT | **Stars**: 390
**Complexity**: 4 commits, ~1 file

A much simpler take on the same problem. Maintains a `.claude/napkin.md` file per repository:

- **On session start**: reads existing napkin, silently internalizes, curates (merges duplicates, removes stale)
- **During work**: logs frequent gotchas, user preferences, non-obvious tactics
- **Max 10 items per category** — forced curation, not unbounded growth
- **Default categories**: Execution & Validation, Shell & Command Reliability, Domain Behavior Guardrails, User Directives
- **Format**: date, rule title, explicit "Do instead:" line
- **By sessions 3-5**: agent demonstrably stops repeating mistakes

Part of a larger ecosystem from the same author:
- **Claudeception** (2,047 stars) — autonomous skill extraction and continuous learning
- **Taskmaster** (474 stars) — stop hook that keeps agent working until all plans complete
- **Theorist** (167 stars) — per-repo operating theory documents
- **Schematic** (134 stars) — reverse-engineer specs from git branches

---

## The Broader Landscape

### Comparison Matrix

```
┌───────────────┬──────────────┬─────────────┬───────────┬───────────┬──────────┐
│ System        │ Storage      │ Search      │ Embeddings│ Local?    │ Agent UX │
├───────────────┼──────────────┼─────────────┼───────────┼───────────┼──────────┤
│ Napkin (Liv)  │ Markdown     │ BM25+links  │ No        │ Yes       │ ★★★★★   │
│ Napkin (Chen) │ Single .md   │ None        │ No        │ Yes       │ ★★★★☆   │
│ CLAUDE.md     │ Single file  │ None        │ No        │ Yes       │ ★★☆☆☆   │
│ hmem          │ SQLite       │ Hierarchical│ No        │ Yes       │ ★★★★☆   │
│ Mem0          │ Multi-backend│ Hybrid      │ Yes       │ Optional  │ ★★★☆☆   │
│ Engram        │ MCP server   │ Semantic    │ Yes       │ Yes       │ ★★★☆☆   │
│ Memori        │ SQLite/Rust  │ Hybrid+decay│ Yes       │ Yes       │ ★★★☆☆   │
│ Zep/Graphiti  │ Graph DB     │ Temporal    │ Yes       │ No        │ ★★☆☆☆   │
│ Letta/MemGPT  │ Full platform│ Everything  │ Yes       │ Optional  │ ★★☆☆☆   │
└───────────────┴──────────────┴─────────────┴───────────┴───────────┴──────────┘

Stars reflect agent-specific UX optimization, not overall capability.
```

### Key Systems

**Mem0** (50.1K stars) — Multi-tiered (User/Session/Agent), auto-extracts from conversations. Claims +26% accuracy vs OpenAI memory, 90% fewer tokens. Criticism: "stores memories but doesn't learn user patterns" — user corrections are the highest-signal data and Mem0 doesn't prioritize them.

**hmem** — Hierarchical 5-level SQLite memory, MCP server. Only loads L1 summaries (~20 tokens each) vs full file injection (3-8K tokens). Cross-IDE (Claude Code, Cursor, Windsurf).

**Engram** — MCP server with "intelligence at read time." Claims 20% better than Mem0 on LOCOMO benchmark. Philosophy: store raw observations, apply intelligence at retrieval.

**Memori** (Rust) — Hybrid search, auto-dedup, decay scoring, SQLite. Fast, local-first. Explicitly targets Claude Code's statelessness problem.

**Letta/MemGPT** (21.6K stars) — Full stateful agent platform with structured memory blocks. Most capable but heavy — overkill for coding agents.

**Zep/Graphiti** — Temporal knowledge graphs. Best for tracking how facts evolve over time. Complex setup, enterprise-focused.

---

## Architectural Patterns

### 1. Write-Time Curation vs Read-Time Intelligence

```
Write-Time Curation (Napkin Chen, CLAUDE.md):
  conversation → curate → store actionable rules only
  Pro: Small, focused memory. Fast reads.
  Con: Lossy — discards context that might matter later.

Read-Time Intelligence (Engram, Mem0):
  conversation → store everything → apply intelligence at retrieval
  Pro: Nothing lost. Can re-interpret with better models later.
  Con: Storage bloat. Retrieval quality depends on search.

Hybrid (Napkin Liv, hmem):
  conversation → structured extraction → tiered retrieval
  Pro: Best of both — curated at write, progressive at read.
  Con: More complex to build and maintain.
```

### 2. Progressive Disclosure vs Full Dump

```
Full Dump (CLAUDE.md, AGENTS.md):
┌──────────────────────────────────┐
│ Everything loaded every session  │  3-8K tokens
│ No filtering, no relevance      │  ← Wastes context
│ Works until ~50 rules            │     window
└──────────────────────────────────┘

Progressive Disclosure (Napkin Liv):
┌──────────┐
│ L0: 200t │ ← Always loaded
├──────────┤
│ L1: 1-2K │ ← On demand (map)
├──────────┤
│ L2: 2-5K │ ← On demand (search)
├──────────┤
│ L3: 5-20K│ ← On demand (full read)
└──────────┘
Agent navigates to what it needs. Token-efficient.

Hierarchical Summaries (hmem):
┌──────────┐
│ L1: 20t  │ ← Always loaded (summary of summary)
├──────────┤
│ L2: 200t │ ← On demand
├──────────┤
│ L3: 2K   │ ← On demand
├──────────┤
│ L4: full │ ← On demand
├──────────┤
│ L5: raw  │ ← Archived
└──────────┘
Most token-efficient. Requires summarization pipeline.
```

### 3. Memory Security (Unsolved)

```
⚠️  THE MEMORY POISONING PROBLEM

  Malicious input → Agent writes to memory → Memory persists
       │                                         │
       └─── Permanent compromise ────────────────┘

  No current system has:
  ✗ Integrity verification / signing
  ✗ Provenance tracking (who wrote what)
  ✗ Anomaly detection on memory writes
  ✗ Rollback on suspicious entries

  Agent Hypervisor project attempts provenance tracking
  but is early-stage and not widely adopted.
```

---

## What Works, What Doesn't

### Works

| Pattern | Evidence |
|---------|----------|
| **Correction-based learning** | Napkin Chen: "by sessions 3-5, agent stops repeating mistakes" — logging what went wrong + the fix is highest-signal |
| **Per-repo scoping** | Cross-project memory causes contamination. Project-specific memory stays focused |
| **Capped curation** | Max 10 items/category forces quality. Unbounded memory becomes noise |
| **Progressive disclosure** | Token-efficient. Agent navigates to what it needs instead of drowning in context |
| **BM25 + signals** | TF-IDF, backlinks, recency — classic IR with thoughtful weighting replaces vectors at personal scale |
| **Schema-driven extraction** | Templates produce dramatically better output than freeform — schema is the leverage point |

### Doesn't Work (Yet)

| Anti-Pattern | Why |
|-------------|-----|
| **Dump everything into context** | CLAUDE.md scaling wall — dilutes important rules with noise |
| **Global memory across projects** | Too much cross-contamination between unrelated domains |
| **Pure vector retrieval** | Without structure, returns "related" but not "useful" results |
| **Manual memory management** | Humans won't curate. Auto-curation or nothing |
| **Cross-agent memory sharing** | Unsolved at scale — different agents need different context |
| **Showing relevance scores to agents** | Agents anchor on numbers instead of evaluating content quality |

---

## Software Factory Relevance

### Direct Applicability

| Napkin Pattern | Software Factory Use |
|----------------|---------------------|
| **Progressive disclosure** | Agent context builder (`src/core/context.ts`) could use L0→L3 levels instead of dumping full repo context |
| **BM25 + backlinks** | Knowledge retrieval for agents without embedding API dependency. Aligns with self-hosted story |
| **Schema-driven extraction** | Each agent type (PR Reviewer, CI Debugger, etc.) gets a domain-specific extraction schema |
| **Model psychology UX** | Hide irrelevant metadata from agents. Design tool output for LLM consumers |
| **Auto-distillation** | Post-run transcript distillation into searchable knowledge base |
| **NAPKIN.md as L0** | Already doing this with CLAUDE.md — could formalize as first tier of a multi-level system |

### Integration Path

```
Phase 2 (Harness + Middleware):
├── Adopt progressive disclosure in context builder
├── Add BM25 search to knowledge retrieval (replaces or augments QMD)
├── Schema templates per agent type
└── Model psychology patterns in tool output design

Phase 3 (General-Purpose):
├── Auto-distillation from agent run transcripts
├── Cross-agent knowledge sharing with per-agent L0 views
└── Obsidian vault as human-readable knowledge interface
```

### Key Insight for OpenClaw Hub

Napkin Liv's architecture maps almost perfectly to OpenClaw's existing structure:
- `.napkin/` → `~/.openclaw/workspace-*/` (already directory-per-agent)
- NAPKIN.md → SOUL.md + MEMORY.md (already tiered)
- BM25 search → could replace need for embedding API key that's currently blocking memory search
- Auto-distillation → could run as a launchd service alongside existing 8 services

---

## QMD — Production Search for Agent Memory

**Repo**: [github.com/tobi/qmd](https://github.com/tobi/qmd) | **16K stars** | By Tobi Lütke (Shopify CEO)
**Stack**: SQLite + BM25 + local vector embeddings + LLM re-ranking via node-llama-cpp (~2GB GGUF models, all local)

### Why It Matters

QMD is the production-grade search layer that sits between Obsidian/markdown vaults and agent memory. It solves the problem that both grep (file reads) and pure vector search fail at: fast, local, multi-signal retrieval that returns relevant *snippets* instead of whole files.

### The Token Savings

Andrew Levine (@andrarchy) reported **96% token savings** using QMD:
- **Before**: 600+ note Obsidian vault, agent greps through files and reads them whole — ~15,000 tokens per search query
- **After**: QMD returns relevant snippets — ~500 tokens per query

The Obsidian CLI (queries Obsidian's built-in search index) shows an even starker comparison:
- **Orphan detection via grep**: ~7M tokens, 15.6 seconds
- **Orphan detection via Obsidian CLI**: ~100 tokens, 0.26 seconds (70,000x cheaper)

### Architecture

Three complementary search approaches:
1. **BM25 full-text** — fast keyword matching (exact terms, error strings, IDs, code symbols)
2. **Vector semantic** — conceptual similarity via local GGUF embeddings
3. **LLM re-ranking** — Reciprocal Rank Fusion for final result quality

Search modes selectable per query: keyword-only (fastest), semantic-only, or hybrid with re-ranking (best quality).

### Agent Integration Patterns

QMD integrates directly as an OpenClaw memory backend (replaces default SQLite):
```
memory.backend: "qmd"
memory.citations: "auto"  // adds source paths + line numbers
```

Can also index external directories (Obsidian vaults, project docs) alongside agent memory. Critical setting: `compaction.memoryFlush.enabled: true` — without this, decisions discussed mid-conversation never reach disk and become unsearchable after context compaction.

### Relevance to Software Factory

QMD validates Napkin's anti-RAG thesis at scale: BM25 + signals beats pure vector for curated knowledge. The 96% token savings is the strongest quantitative evidence that search architecture matters more than model choice for agent memory retrieval.

For coding agents, QMD could index:
- Repository documentation and decision logs
- Past agent run transcripts (post-distillation)
- Architecture decision records
- CI/CD configuration and error patterns

---

## The Obsidian-as-State-Layer Pattern

The 2026 Obsidian + AI agent community has independently converged on patterns that validate the agent memory research:

### Core Principle

> "Treat AI sessions as stateless workers and the vault as the persistent state layer."

### Vault Structure for AI Orientation

```
000-Rules/           ← Meta: rules, decisions log, TODO, index
Working-Context/     ← One file per active project (current state + open questions)
{domain}/            ← Domain-specific atomic notes
Templates/           ← Extraction schemas per domain
Handoffs/            ← Session closure summaries
```

### Session Protocols

**Session Start** (eliminate "re-orientation tax"):
1. Read vault navigation (MOCs/indexes)
2. Read active project state files
3. Read domain-specific context

**Session Close** (handoff protocol):
1. Write structured summary: completed work, items for review, deferred tasks, next steps
2. Update project state files
3. Auto-commit to Git

### Context Pollution Prevention

The #1 production failure mode. Solutions:
- **Lightweight index notes** — cherry-pick context, don't accumulate randomly
- **Staged memory retrieval** — inject project state file → selectively reference linked notes → never load full vault
- **`<ai-suggestion>` tags** — mark all AI-generated content, require human approval before tag removal
- **Daily template simplicity** — overloaded templates create signal/noise problems; focused fields perform better

### Production Gotchas

| Issue | Fix |
|-------|-----|
| Spaces in vault name | Use hyphens (indexing breaks with spaces) |
| Obsidian API ~75% success rate | Fallback logic for critical workflows |
| "Rabbit hole" token drain | Bounded context windows, cost monitoring |
| Obsidian Sync + .Claude dirs | Isolate Claude work in separate directory |
| CLAUDE.md goes stale | Periodic: "Compare notes to CLAUDE.md, update conventions" |
| Context window fills → silent compression | Fresh session at 50% capacity |

Sources: [Obsidian Forum: Vault Design for AI](https://forum.obsidian.md/t/design-your-vault-for-ai-orientation-not-just-human-navigation/112010), [Obsidian CLI 70,000x savings](https://prokopov.me/posts/obsidian-cli-changes-everything-for-ai-agents/), [Axton Liu workflows](https://www.axtonliu.ai/newsletters/ai-2/posts/obsidian-claude-code-workflows), [QMD fix guide](https://www.josecasanova.com/blog/openclaw-qmd-memory)

---

## Sources

- [Napkin HotpotQA benchmark](https://x.com/micLivs) — 99.8% recall vs 29% Mem0, March 27 2026
- [Napkin (Livshitz) — Blog post](https://michaellivs.com/blog/building-napkin-memory-system-for-agents)
- [Napkin (Livshitz) — GitHub](https://github.com/Michaelliv/napkin) — MIT, TypeScript
- [Napkin (Chen) — GitHub](https://github.com/blader/napkin) — MIT, Claude Code skill
- [Mem0](https://github.com/mem0ai/mem0) — 50.1K stars, multi-tiered agent memory
- [Letta/MemGPT](https://github.com/letta-ai/letta) — 21.6K stars, stateful agent platform
- [Zep/Graphiti](https://github.com/getzep/graphiti) — Temporal knowledge graphs
- [hmem](https://github.com/hmem-ai/hmem) — Hierarchical 5-level SQLite memory
- [Engram](https://github.com/engram-ai/engram) — MCP server, intelligence at read time
- [Memori](https://github.com/memori-ai/memori) — Rust, hybrid search + decay scoring
- [QMD](https://github.com/tobi/qmd) — 16K stars, Tobi Lütke, BM25 + vector + LLM re-ranking, all local
- [QMD 96% token savings](https://x.com/andrarchy/status/2015783856087929254) — Andrew Levine benchmark
- [Obsidian CLI 70,000x cheaper](https://prokopov.me/posts/obsidian-cli-changes-everything-for-ai-agents/) — Obsidian index vs grep
- [QMD OpenClaw integration](https://www.josecasanova.com/blog/openclaw-qmd-memory) — Configuration guide
- [Obsidian vault for AI](https://forum.obsidian.md/t/design-your-vault-for-ai-orientation-not-just-human-navigation/112010) — Community patterns
