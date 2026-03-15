# QMD (Tobi Lutke) — Local-First Knowledge Search for Agents

**Source:** [tobi/qmd](https://github.com/tobi/qmd) — by Shopify CEO

A local-first search engine for personal knowledge management. Indexes markdown, meeting transcripts, and documentation with hybrid search (BM25 + vector + LLM reranking). All processing runs locally via node-llama-cpp with GGUF models.

---

## Patterns Relevant to Software Factory

### 1. Hybrid Search (Three-Layer)

```
BM25 (keyword) + Vector (semantic) + LLM Reranking (quality)
```

Not just keyword matching, not just embeddings — both, then LLM-reranked. This is the pattern for making agent context retrieval actually work.

When agents need to search codebases, docs, or previous experiment results, hybrid search dramatically improves recall over any single approach.

### 2. MCP Server for Agent Access

QMD exposes search as MCP tools (`query`, `get`, `multi_get`, `status`), allowing AI agents to search indexed documents directly.

Agents could use QMD-style search to query the structured `docs/` knowledge base (OpenAI harness pattern) rather than relying on grep/glob alone.

### 3. Collections + Context Metadata

Documents are organized into named collections with glob patterns. Hierarchical context descriptors improve search relevance — the search engine knows *what kind* of document it's searching, not just the content.

```bash
qmd collection add ~/notes --name notes
qmd context add qmd://notes "Personal notes and ideas"
```

Agent prompts, design docs, and execution plans could be organized as QMD collections with domain-specific context, enabling semantic search across the factory's knowledge base.

### 4. Query Expansion

Simple queries auto-expand via LLM into structured sub-queries with types: `lex` (keyword), `vec` (semantic), `hyde` (hypothetical document). Users can also manually specify query types for fine-grained control.

When agents search for context before acting, query expansion finds related information that exact-match search misses.

---

## Resources

- [tobi/qmd](https://github.com/tobi/qmd) — Source code
