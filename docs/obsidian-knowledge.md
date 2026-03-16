# Obsidian as an Agent Knowledge Base

*Last updated: March 16, 2026*

---

## Why Obsidian for Agents

Obsidian vaults are plain markdown files on disk. No API authentication, no cloud dependency, no vendor lock-in. Agents read and write them the same way they read and write code. This makes Obsidian the lowest-friction knowledge store for autonomous agent workflows.

The Software Factory already uses a structured `docs/` directory (inspired by OpenAI's harness engineering pattern). Obsidian extends this pattern with graph-based navigation, semantic search via plugins, and a growing MCP server ecosystem that lets agents query vaults without filesystem access.

---

## MCP Server Ecosystem

As of March 2026, there are 10+ MCP servers bridging AI agents to Obsidian vaults.

| Server | Key Feature | Best For |
|--------|-------------|----------|
| [cyanheads/obsidian-mcp-server](https://github.com/cyanheads/obsidian-mcp-server) | 8 tools (read, write, search, frontmatter, tags, delete), vault cache fallback | Most comprehensive general-purpose server |
| [iansinnott/obsidian-claude-code-mcp](https://github.com/iansinnott/obsidian-claude-code-mcp) | Obsidian plugin implementing MCP server; dual transport (WebSocket + HTTP/SSE) | Claude Code integration |
| [aaronsb/obsidian-mcp-plugin](https://github.com/aaronsb/obsidian-mcp-plugin) | Semantic graph traversal, semantic hints | Exploiting Obsidian's link graph for context |
| [MarkusPfundstein/mcp-obsidian](https://github.com/MarkusPfundstein/mcp-obsidian) | Interacts via Obsidian Local REST API plugin | Simple, mature integration |
| [msdanyg/smart-connections-mcp](https://github.com/msdanyg/smart-connections-mcp) | Uses Smart Connections embeddings (384-dim vectors), connection graphs | Semantic search without external APIs |
| [ToKiDoO/mcp-obsidian-advanced](https://github.com/ToKiDoO/mcp-obsidian-advanced) | Deep structure/links/content analysis | Advanced vault understanding |
| [Hint-Services/obsidian-github-mcp](https://mcpservers.org/en/servers/Hint-Services/obsidian-github-mcp) | Connects to GitHub-hosted Obsidian vaults | Remote vault access |
| [Piotr1215/mcp-obsidian](https://github.com/Piotr1215/mcp-obsidian) | Simple local notes MCP; 10x faster than keyword search | Lightweight local use |

### Integration Patterns

**Pattern 1: MCP Server (most common in 2026)**
```
Claude Code / Agent  <-->  MCP Server  <-->  Obsidian Local REST API  <-->  Vault Files
```
Best option: `cyanheads/obsidian-mcp-server` for breadth, or `aaronsb/obsidian-mcp-plugin` for graph-aware search.

**Pattern 2: Direct Filesystem (simplest)**
```
Claude Code  <-->  Vault Files (same directory tree)
```
No MCP server needed. Create the vault as a subfolder of the agent project. Add `CLAUDE.md` at vault root with conventions. This is how Daniel Nest's "Second Brain" pattern works.

**Pattern 3: RAG Pipeline (best retrieval quality)**
```
Vault Markdown  -->  Chunker  -->  Embedding Model  -->  Vector DB  -->  Query API  -->  Agent
```
Best stack: `llm-text-splitter` for markdown-aware chunking, VoyageAI `voyage-context-3` for embeddings (or Ollama `nomic-embed-text-v1.5` for free local), sqlite-vec for embedded vector storage or Meilisearch for hybrid search.

**Pattern 4: Smart Connections + MCP (zero external API cost)**
```
Smart Connections (local TaylorAI/bge-micro-v2 embeddings)  -->  smart-connections-mcp  -->  Agent
```
384-dimensional vectors, multi-level connection graphs. Zero API costs. 786K+ downloads of the Smart Connections plugin.

---

## How Agents Read and Write Obsidian Vaults

### Reading

Agents consume vault content through:

1. **Direct file reads** -- markdown files are natively LLM-readable. No conversion needed.
2. **Frontmatter parsing** -- YAML frontmatter provides structured metadata (tags, status, type, dates) for filtering and routing.
3. **Wikilink traversal** -- `[[backlinks]]` create a navigable graph. MCP servers like aaronsb's can traverse this graph semantically.
4. **Dataview queries** -- Dataview plugin enables SQL-like queries over vault metadata (`TABLE file.ctime, tags FROM "projects" WHERE status = "active"`).
5. **Semantic search** -- Smart Connections or external vector DB for similarity search across notes.

### Writing

Agents write to vaults through:

1. **Filesystem writes** -- create/edit `.md` files directly. Works with Claude Code's native file tools.
2. **MCP write tools** -- `cyanheads` server provides `write_note`, `edit_note`, `update_frontmatter` tools.
3. **Git commits** -- write files, commit changes. Full version history, diffable, PR-reviewable knowledge changes.
4. **Template instantiation** -- agents can use Templater-compatible templates to create consistently structured notes.

### Best Practices for Agent-Readable Vaults

**Folder structure** (synthesized from COG Second Brain, PARA method, and Steph Ango's approach):

```
vault/
  CLAUDE.md                    # Agent instructions, conventions, vault map
  index.md                     # Master index (auto-maintained by agent)
  00-inbox/                    # Capture zone, brain dumps
  01-projects/                 # Active work with deadlines
    index.md
    project-name/
      overview.md
      requirements.md
      decisions/               # Architecture Decision Records
  02-areas/                    # Ongoing responsibilities
  03-resources/                # Reference material (runbooks, API docs, patterns)
  04-archive/                  # Completed/inactive
  05-daily/                    # Daily notes (YYYY-MM-DD.md)
  templates/                   # Note templates
```

**Frontmatter conventions:**
```yaml
---
title: "Note Title"
created: 2026-03-16
modified: 2026-03-16
tags: [project/alpha, type/decision, status/active]
type: adr | meeting | runbook | pattern | reference
status: draft | active | review | archived
---
```

**Key rules:**
- Always use YAML frontmatter -- it is the primary metadata agents parse
- Use hierarchical tags for filtering: `#type/decision`, `#project/alpha/design`
- Include `type` and `status` fields -- agents use these for routing and filtering
- One concept per note (atomic notes) for precise retrieval
- Maintain `index.md` per folder -- instruct agents to update it on every file create/delete
- Limit nesting to 2-3 levels -- flat is better for agent navigation

---

## Plugin Ecosystem Relevant to Agents

| Plugin | Downloads | What It Does for Agents |
|--------|-----------|------------------------|
| [Smart Connections](https://github.com/brianpetro/obsidian-smart-connections) | 786K+ | Local semantic search with embeddings. No external API needed. |
| [Obsidian Copilot](https://github.com/logancyang/obsidian-copilot) | 100K+ | Agentic experience inside Obsidian. Any model. |
| [Dataview](https://github.com/blacksmithgu/obsidian-dataview) | Millions | SQL-like queries over vault metadata. Agents can query structured data. |
| [Templater](https://github.com/SilentVoid13/Templater) | Millions | Template engine. Agents instantiate consistent note structures. |
| [Local REST API](https://github.com/coddingtonbear/obsidian-local-rest-api) | Popular | REST API for vault access. Required by several MCP servers. |
| [Git](https://github.com/denolehov/obsidian-git) | Popular | Auto-commit/push vault changes. Version control for knowledge. |
| [Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) | Popular | Structured task management within notes. |
| [Obsidian Skills](https://github.com/kepano/obsidian-skills) | New | Official agent skills by Obsidian CEO Steph Ango. 5 skills: markdown, bases, canvas, CLI, defuddle. |

---

## Comparison with Other Knowledge Stores

### Obsidian vs Notion

| Dimension | Obsidian | Notion |
|-----------|----------|--------|
| Data ownership | Local files on your machine | Cloud-hosted by Notion |
| Agent access | Filesystem or MCP servers | REST API or MCP server (2,500+ stars) |
| AI integration | Plugin-based, full model choice | Native Notion AI (GPT-5.2, Claude Opus 4.5, Gemini 3) |
| Collaboration | Single-user only | Real-time multi-user, comments, permissions |
| Structured data | Frontmatter + Dataview (limited) | Native databases with relations, rollups, formulas |
| Cost for agents | Free | Notion AI costs per user |
| Vendor lock-in | None -- plain markdown survives everything | Proprietary format, API-dependent export |

**Choose Obsidian** when: privacy matters, you want model choice, you need hackability, or you are a solo operator. **Choose Notion** when: team collaboration is essential, you want zero-config AI, or you need structured databases with an API.

### Obsidian vs Confluence

| Dimension | Obsidian | Confluence |
|-----------|----------|------------|
| Agent access | Filesystem, MCP | REST API, Rovo AI agents (Atlassian) |
| Search | Plugin-dependent | Built-in full-text + AI-powered |
| Collaboration | None | Enterprise-grade (permissions, spaces, comments) |
| Cost | Free | $5.75+/user/mo |
| Best for | Individual/small team knowledge | Enterprise wiki with governance |

Confluence is the right choice only if your team is already on Atlassian and needs enterprise permissions. For agent knowledge bases, Obsidian's filesystem-native approach is simpler and more flexible.

### Obsidian vs Plain Markdown in Git

| What Obsidian Adds | Value for Agents |
|--------------------|-----------------|
| Graph visualization | Humans can visually navigate relationships; agents use backlink data |
| Backlink tracking | Automatic detection of bidirectional links -- graph structure for free |
| Plugin ecosystem | Semantic search, templates, task management without custom tooling |
| Quick switcher / search | Humans find notes faster alongside agents |
| Canvas | Visual thinking boards (JSON Canvas format) |
| Bases | Lightweight database views over notes |

**When plain markdown + git is sufficient:** If agents only read/write files and you handle search externally (embeddings/vector DB), Obsidian adds overhead without clear benefit. The MCP servers work on the filesystem regardless.

**When Obsidian adds value:** If humans also use the knowledge base and need visual navigation, or you want built-in semantic search via Smart Connections without building a custom RAG pipeline.

### Summary Recommendation

| Knowledge Store | Agent-Friendliness | Collaboration | Cost | Best For |
|----------------|-------------------|---------------|------|----------|
| **Obsidian** | Excellent (filesystem + MCP) | None | Free | Solo/small team, private, hackable |
| **Notion** | Good (REST API + MCP) | Excellent | $10+/user/mo | Team knowledge with structured databases |
| **Confluence** | Adequate (REST API) | Enterprise | $5.75+/user/mo | Atlassian-native enterprises |
| **Plain markdown + git** | Best (zero overhead) | Via PRs | Free | Pure agent knowledge, no human browsing |
| **Vector DB (Pinecone/ChromaDB)** | Complementary | N/A | Varies | Retrieval layer over any of the above |

---

## Integration with QMD's Hybrid Search Patterns

Tobi Lutke's [QMD](https://github.com/tobi/qmd) demonstrates the gold standard for local knowledge retrieval: three-layer hybrid search (BM25 keyword + vector semantic + LLM reranking). QMD exposes search as MCP tools (`query`, `get`, `multi_get`, `status`) and organizes content into named collections with context descriptors.

### Applying QMD Patterns to Obsidian

| QMD Pattern | Obsidian Implementation |
|-------------|------------------------|
| **Hybrid search (BM25 + vector + reranking)** | Meilisearch (50% vector / 50% full-text) over vault content, with LLM reranking pass. Laurent Cazanove's [retrieval API](https://laurentcazanove.com/blog/obsidian-rag-api) demonstrates this exact pattern. |
| **Collections + context descriptors** | Map to Obsidian folders with `index.md` context files. Each folder = a QMD collection. Agent knows *what kind* of knowledge it is searching. |
| **Query expansion (lex + vec + hyde)** | Agent expands simple queries into keyword, semantic, and hypothetical-document sub-queries before searching. Improves recall for ambiguous agent queries. |
| **MCP server interface** | Use existing Obsidian MCP servers for basic access; add QMD-style hybrid search as a custom MCP tool wrapping Meilisearch or sqlite-vec. |

### Recommended Architecture for Software Factory

```
Obsidian Vault (source of truth, human-authored + agent-authored)
    |
    +--> Git (version control, PR-reviewable knowledge changes)
    |
    +--> Embedding Pipeline (on vault change)
    |       Chunker: llm-text-splitter (markdown-aware)
    |       Embeddings: VoyageAI voyage-context-3 (contextualized)
    |       Storage: sqlite-vec (embedded, local)
    |
    +--> Hybrid Search API (QMD-style)
    |       BM25 (keyword) + Vector (semantic) + LLM Reranking
    |       Exposed as MCP tools
    |
    +--> Agent Access
            Claude Code reads/writes via filesystem
            Other agents query via MCP hybrid search
```

Key insight from Cazanove's research: **contextualized embeddings** (processing entire documents, not isolated chunks) significantly outperform independent chunk embeddings. The embedding model needs the full document context to understand what each section means.

Key insight from the `obsidian-note-taking-assistant` project: **graph-boosted retrieval** multiplies semantic similarity scores by 1.2x for graph-connected (wikilinked) notes, surfacing "hidden connections" that pure vector search misses.

---

## Case Studies

### Eleanor Konik -- 12 Million Words + Claude MCP
Connected Claude Desktop to a 12-million-word vault via MCP. Claude handled queries that built-in search failed at (e.g., finding Substack newsletters about fatherhood by specific authors). Used for bulk operations: reformatting daily notes, updating naming conventions, fixing broken links.
Source: [How Claude + Obsidian + MCP Solved My Organizational Problems](https://www.eleanorkonik.com/p/how-claude-obsidian-mcp-solved-my)

### COG Second Brain (Claude + Obsidian + Git)
Self-evolving PKM system with 17 AI-powered skills and 7 role packs. Processes braindumps through daily/weekly/monthly cycles. Reports 120+ braindumps processed with 95%+ source accuracy. Works with Claude Code, Kiro, Gemini CLI, and OpenAI Codex.
Source: [COG Second Brain](https://github.com/huytieu/COG-second-brain)

### Daniel Nest -- Portable Self-Maintaining Knowledge Base
Vault as subfolder of Claude Code project. SessionStart hook auto-scans Inbox folder. `CLAUDE.md` rule: "Every time you create or delete a file, update the index.md in that folder." Simple, effective, zero infrastructure.
Source: [Build Your Second Brain With Claude Code & Obsidian](https://www.whytryai.com/p/claude-code-obsidian)

### Laurent Cazanove -- Production RAG API
Built retrieval API using VoyageAI `voyage-context-3`, Meilisearch for hybrid search (50% vector / 50% full-text), `llm-text-splitter` for markdown-aware chunking. Demonstrated that contextualized embeddings dramatically outperform independent chunk embeddings.
Source: [Building a retrieval API to search my Obsidian vault](https://laurentcazanove.com/blog/obsidian-rag-api)

---

## Sources

- [How Claude + Obsidian + MCP Solved My Organizational Problems (Konik)](https://www.eleanorkonik.com/p/how-claude-obsidian-mcp-solved-my)
- [Build Your Second Brain With Claude Code & Obsidian (Nest)](https://www.whytryai.com/p/claude-code-obsidian)
- [Building a Retrieval API to Search My Obsidian Vault (Cazanove)](https://laurentcazanove.com/blog/obsidian-rag-api)
- [COG Second Brain](https://github.com/huytieu/COG-second-brain)
- [cyanheads/obsidian-mcp-server](https://github.com/cyanheads/obsidian-mcp-server)
- [iansinnott/obsidian-claude-code-mcp](https://github.com/iansinnott/obsidian-claude-code-mcp)
- [aaronsb/obsidian-mcp-plugin](https://github.com/aaronsb/obsidian-mcp-plugin)
- [MarkusPfundstein/mcp-obsidian](https://github.com/MarkusPfundstein/mcp-obsidian)
- [msdanyg/smart-connections-mcp](https://github.com/msdanyg/smart-connections-mcp)
- [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills)
- [brianpetro/obsidian-smart-connections](https://github.com/brianpetro/obsidian-smart-connections)
- [logancyang/obsidian-copilot](https://github.com/logancyang/obsidian-copilot)
- [sspaeti/obsidian-note-taking-assistant](https://github.com/sspaeti/obsidian-note-taking-assistant)
- [proofgeist/obsidian-notes-rag](https://github.com/proofgeist/obsidian-notes-rag)
- [tobi/qmd](https://github.com/tobi/qmd)
- [AI Automation Agency Guide: Notion vs Obsidian 2026](https://www.browse-ai.tools/blog/ai-automation-agency-guide-notion-vs-obsidian-2026)
- [Using Obsidian as an ADR Tool](https://medium.com/@mttpla/using-obsidian-as-an-adr-tool-5f63d187de6b)
