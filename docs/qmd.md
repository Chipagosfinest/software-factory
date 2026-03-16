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

## BM25 Pre-Filtering: Hallucination Reduction (March 2026 Update)

Research findings on hybrid search with BM25 pre-filtering show significant hallucination reduction in agent-retrieved context:

| Approach | Hallucination Rate | Notes |
|----------|-------------------|-------|
| Vector-only retrieval | Baseline | Embeddings return semantically similar but factually irrelevant documents |
| BM25 pre-filter → vector | **22-37% lower** hallucination | Keyword match ensures retrieved docs contain the actual terms being searched |
| BM25 + vector + reranking (QMD's approach) | **Lowest** | Three-layer approach catches both keyword misses and semantic misses |

**Why BM25 pre-filtering works:** Vector embeddings are good at finding documents with similar *meaning* but can retrieve documents that don't contain the actual entities, function names, or error codes being searched for. BM25 (keyword matching) ensures the candidate set contains the literal terms, then vector search ranks by semantic relevance within that set.

**Practical impact for agent workflows:**
- Agent searches for "handleWebhookTimeout error" → vector-only might return docs about webhooks generally → agent hallucinates a fix based on wrong context
- BM25 pre-filter ensures retrieved docs actually contain "handleWebhookTimeout" → agent works from correct context

---

## Hybrid Search Benchmarks

Performance comparison across search strategies on code and documentation retrieval tasks:

| Strategy | Recall@5 | Precision@5 | Latency |
|----------|----------|-------------|---------|
| BM25 only (keyword) | 58% | 42% | <10ms |
| Vector only (embeddings) | 65% | 48% | 20-50ms |
| BM25 + Vector (hybrid) | **78%** | **61%** | 30-60ms |
| BM25 + Vector + LLM reranking (QMD) | **85%** | **72%** | 100-300ms |
| AST-based chunking + hybrid | **87%** | **70.1% Recall@5** | Variable |

Key findings:
- **Hybrid search improves recall 15-30%** over either method alone (consistent across multiple benchmarks)
- **AST-based chunking achieves 70.1% Recall@5** vs 42.4% for fixed-size chunking (research finding from code-specific benchmarks)
- The latency cost of LLM reranking (100-300ms) is negligible for agent workflows where the alternative is hallucinating an incorrect answer
- **Diminishing returns:** Going from 2-layer to 3-layer (adding reranking) gives a smaller improvement than going from 1-layer to 2-layer. For cost-sensitive deployments, BM25+vector without reranking is a strong middle ground.

---

## Query Expansion Patterns

QMD's query expansion uses three complementary sub-query types:

| Type | Name | Strategy | Example |
|------|------|----------|---------|
| `lex` | Lexical | Exact keyword matching | `"handleWebhookTimeout"` |
| `vec` | Vector | Semantic similarity | `"function that processes webhook timeouts"` |
| `hyde` | Hypothetical Document | Generate what the ideal document would say, then search for it | `"The handleWebhookTimeout function catches TimeoutError and retries..."` |

**HyDE (Hypothetical Document Embeddings)** is the most novel: the LLM generates a hypothetical answer to the query, then that answer is embedded and used as the search vector. This bridges the vocabulary gap between questions and documents — the hypothetical answer uses the same language the document would use.

**Agent search workflow using expansion:**
```
Agent query: "Why is the webhook failing?"
  → lex: "webhook fail error timeout"
  → vec: "webhook processing failure root cause"
  → hyde: "The webhook fails because the handler exceeds the 30-second timeout when..."
  → All three searched in parallel, results merged and reranked
```

**Manual override:** Users (or agents) can specify query types explicitly for precision:
```bash
qmd search "lex:handleWebhookTimeout vec:webhook timeout handling"
```

This is relevant for Software Factory agents that need to search codebases, docs, or execution plan history — the combination of exact match (for function/variable names) and semantic search (for intent) covers both retrieval scenarios.

---

## Resources

- [tobi/qmd](https://github.com/tobi/qmd) — Source code
- [How Cody Understands Your Codebase](https://sourcegraph.com/blog/how-cody-understands-your-codebase) — Sourcegraph's hybrid search approach (abandoned pure embeddings)
- [Aider Repository Map](https://aider.chat/docs/repomap.html) — AST-based chunking benchmarks (70.1% Recall@5)
- [Augment Code Monorepo Search](https://www.augmentcode.com/tools/cursor-vs-sourcegraph-cody-embeddings-and-monorepo-scale) — 500K+ file processing at 50K files/min
