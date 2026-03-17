# Context Engineering for Autonomous Coding Agents

*Last updated: March 16, 2026*

The single biggest lever for agent quality. How to design, structure, and dynamically assemble the information an LLM needs to make reliable autonomous decisions.

---

## What Context Engineering Is

**Context engineering** is the practice of designing all the information that enters an LLM's context window — prompts, memory, tool descriptions, retrieved data, conversation history — to enable reliable autonomous decisions. Anthropic defines it as "the set of strategies for curating and maintaining the optimal set of tokens during LLM inference."

**Origin of the term.** Popularized by Shopify CEO Tobi Lutke on [June 18, 2025](https://x.com/tobi/status/1935533422589399127): *"I really like the term 'context engineering' over prompt engineering. It describes the core skill better: the art of providing all the context for the task to be plausibly solvable by the LLM."* Andrej Karpathy endorsed the shift one week later. [Simon Willison's analysis](https://simonwillison.net/2025/jun/27/context-engineering/) helped crystallize the distinction.

**How it differs from prompt engineering:**

```
Prompt Engineering                    Context Engineering
━━━━━━━━━━━━━━━━━━                   ━━━━━━━━━━━━━━━━━━━
Craft a single instruction            Design the full information system
Focus: what to say                    Focus: what to show, when, in what format
Static                                Dynamic (assembled per-task)
One-shot                              Multi-turn with memory + retrieval
"Magic sentence"                      "Full screenplay for the AI"
```

Spotify's engineering team called context engineering **"the biggest lever"** for agent quality — agent effectiveness depends less on model size and more on context quality and relevance.

---

## Context Window Management

### The Core Constraint

LLMs have finite context windows (128K-1M tokens in 2026), but effective performance degrades well before the limit. [Chroma Research's "Context Rot" study](https://research.trychroma.com/context-rot) tested 18 SOTA models and found reliability decreases significantly with longer inputs even on simple tasks. The "effective context window" where models perform at high quality is often much smaller than advertised — currently under 256K tokens for most models.

### Four Strategies

```
┌──────────────────────────────────────────────────────────────────────┐
│                    CONTEXT MANAGEMENT STRATEGIES                     │
│                                                                      │
│  1. OBSERVATION MASKING          2. HIERARCHICAL SUMMARIZATION       │
│  ┌────────────────────────┐      ┌────────────────────────┐         │
│  │ Replace old tool output │      │ Progressive compression │         │
│  │ with placeholders.      │      │ as content ages.        │         │
│  │ Keep reasoning + actions│      │ Recent = verbatim       │         │
│  │                        │      │ Old = summary           │         │
│  │ 52% cheaper            │      │                        │         │
│  │ +2.6% solve rate       │      │ Claude Code auto-       │         │
│  │ (JetBrains, NeurIPS)   │      │ compacts at 95% usage  │         │
│  └────────────────────────┘      └────────────────────────┘         │
│                                                                      │
│  3. SLIDING WINDOWS              4. SUB-AGENT ARCHITECTURE           │
│  ┌────────────────────────┐      ┌────────────────────────┐         │
│  │ New info enters buffer, │      │ Specialized sub-agents  │         │
│  │ old info exits.         │      │ handle focused tasks    │         │
│  │ Fixed-size window.      │      │ with clean context.     │         │
│  │                        │      │                        │         │
│  │ Simple but lossy —     │      │ Each uses ~20K tokens   │         │
│  │ references to aged-out │      │ internally, returns     │         │
│  │ info break             │      │ ~1-2K summary           │         │
│  └────────────────────────┘      └────────────────────────┘         │
└──────────────────────────────────────────────────────────────────────┘
```

### Observation Masking (JetBrains Research)

Published in ["The Complexity Trap"](https://arxiv.org/html/2508.21433v2) (NeurIPS 2025 DL4Code Workshop):

| Metric | Observation Masking | LLM Summarization | Raw (no management) |
|--------|--------------------|--------------------|---------------------|
| Solve rate (Qwen3-Coder 480B) | **+2.6%** | +1.8% | baseline |
| Cost per instance | **52% cheaper** | 40% cheaper | baseline |
| Extra turns | baseline | **~15% more** | baseline |

Key insight: LLM summarization smooths over signals that should tell the agent to stop, causing it to run longer with no quality gain. Simple masking is better and cheaper.

- [Blog post](https://blog.jetbrains.com/research/2025/12/efficient-context-management/)
- [GitHub](https://github.com/JetBrains-Research/the-complexity-trap)

---

## The AGENTS.md Pattern

### What It Is

A standard Markdown file at the repository root that gives AI agents project-specific guidance — build steps, test commands, coding conventions, architecture notes. Released by OpenAI in August 2025 as "a README for agents."

### Adoption

As of December 2025: **60,000+ open-source projects** adopted AGENTS.md. Agent frameworks including Codex, Cursor, Devin, Factory, Gemini CLI, GitHub Copilot, Jules, and VS Code read it.

On December 9, 2025, the [Linux Foundation announced the Agentic AI Foundation (AAIF)](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) with three founding projects: Anthropic's MCP, Block's Goose, and OpenAI's AGENTS.md. Platinum members: AWS, Anthropic, Block, Bloomberg, Cloudflare, Google, Microsoft, OpenAI.

### What Goes Where

```
┌──────────────────────────────────────────────────────────────┐
│                  CONTEXT PLACEMENT GUIDE                      │
│                                                              │
│  AGENTS.md              System Prompt         Tool Descriptions│
│  ─────────              ─────────────         ─────────────── │
│  Build/test/lint        Agent persona         API parameters   │
│  commands               Reasoning strategy    Return formats   │
│  Coding conventions     Safety rules          Query syntax     │
│  Architecture notes     Output format         Error handling   │
│  Dependency rules       Tone/style            Rate limits      │
│  PR conventions                                                │
│                                                              │
│  ▲ Project-specific     ▲ Agent-specific      ▲ Tool-specific │
│  Changes per repo       Changes per agent     Changes per API │
└──────────────────────────────────────────────────────────────┘
```

### OpenAI's Hard-Learned Lesson

The team tried a "one big AGENTS.md" approach and it failed: *"Context is a scarce resource and a giant instruction file crowds out the task, the code, and the relevant docs."*

### Spotify's Alternative

Spotify encodes build-system invocation in an MCP server rather than AGENTS.md files, because Honk operates on thousands of repos with different build configs. The MCP approach also summarizes noisy build logs into digestible output.

- [AGENTS.md spec](https://github.com/agentsmd/agents.md) | [Official site](https://agents.md/)
- [OpenAI developer guide](https://developers.openai.com/codex/guides/agents-md/)

---

## Repository Context Building

### What to Include

| Context Type | Why | Source |
|-------------|-----|--------|
| File tree / directory structure | Agent's map of the codebase | Stripe, OpenAI both use as primary context |
| Recent git history | Intent + recency signals | Commit messages, recent diffs, blame |
| Dependency graphs | Scopes multi-file changes | Import/require tracing |
| Test results | What's broken, what must not break | CI output, local test runs |
| Build/lint output | Error messages guide fixes | Compiler, linter stderr |
| Architecture docs | High-level design context | ADRs, inline architecture comments |

### What to Omit

- Generated files (node_modules, build artifacts, lock files beyond first few lines)
- Binary files and large assets
- Stale documentation that contradicts code
- Redundant information (don't repeat AGENTS.md in system prompt)

---

## Multi-File Reasoning

The fan-out problem: most real tasks span multiple files. How does an agent discover which files to change, understand their relationships, and make coordinated changes within the context window?

### Three Production Approaches

```
STRIPE: ONE-SHOT TREE                    SPOTIFY: PIPELINE + VERIFY
━━━━━━━━━━━━━━━━━━━━━                   ━━━━━━━━━━━━━━━━━━━━━━━━━

Pre-assemble full context ──▶ Single     Plan ──▶ Execute ──▶ Verify
Score each piece for          LLM call       across files    (MCP tool)
relevance, prune to fit                                      │
                                                        ┌────┘
1,000+ merged PRs/week                    Retry if fail (max 2)
"Invest in what goes INTO
the prompt, not how many                  Claude Code: "describe
times the model reasons"                  end state, not steps"


OPENAI: HARNESS ENGINEERING
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tool dispatch + context management + safety enforcement at runtime
~1M lines of code, 3.5 PRs/eng/day
```

---

## Context Pollution

### When Too Much Context Hurts

| Symptom | Cause |
|---------|-------|
| Hallucinated connections | Unrelated context creates false associations |
| Ignored critical instructions | Instructions buried in noise |
| Longer execution, no quality gain | Model processes irrelevant tokens |
| Unpredictable behavior | Conflicting instructions |

### Tool-Space Interference (Microsoft Research)

[Microsoft Research studied 1,470 MCP servers](https://www.microsoft.com/en-us/research/blog/tool-space-interference-in-the-mcp-era-designing-for-agent-compatibility-at-scale/) and found:

```
┌─────────────────────────────────────────────────────────────┐
│           TOOL SPRAWL: THE NUMBERS                          │
│                                                             │
│  Performance drop with large tool spaces:  UP TO 85%       │
│  Largest MCP server:                       256 tools        │
│  Servers with 100+ tools:                  10+              │
│  Heaviest single tool response:            557,766 tokens   │
│  Tools producing >128K tokens:             16               │
│  OpenAI recommended max:                   <20 tools        │
│                                                             │
│  Tool name collisions ("search", "web_search",              │
│  "bing_search") confuse agents significantly.               │
└─────────────────────────────────────────────────────────────┘
```

### Mitigation: Progressive Disclosure

```
Layer 1 (Index):     Lightweight metadata — titles, descriptions
                     Cost: ~200 tokens per layer

Layer 2 (Details):   Full content, loaded only when agent decides relevance
                     Cost: ~2-5K tokens per item

Layer 3 (Deep Dive): Supporting materials accessed only when needed
                     Cost: ~5-20K tokens per item

Agent pays minimal context cost upfront — just enough for routing decisions.
```

---

## Dynamic Context Assembly

Rather than loading static context, build it on-the-fly based on the specific task.

### QMD (Tobi Lutke): BM25 + Vector + Rerank

```
Query ──▶ Expand (3 variants) ──▶ Dual retrieval per variant
                                    ├── BM25 (keyword)
                                    └── Vector (semantic)
                                         │
                                    6 ranked lists (20 candidates each)
                                         │
                                    Reciprocal Rank Fusion ──▶ Top 30
                                         │
                                    Cross-encoder reranking (Qwen3-reranker-0.6B)
                                         │
                                    Position-aware blending ──▶ Final ranking
```

### Stripe: Relevance Scoring

Minions' context assembly pipeline gathers data from multiple sources, **scores each piece for relevance**, and prunes to fit the token budget before making a single LLM call. Core principle: invest engineering effort in what goes INTO the prompt.

### Anthropic: Tool Description Engineering

From [Writing Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents): *"Think of how you would describe your tool to a new hire on your team, making explicit the context that you might implicitly bring — specialized query formats, definitions of niche terminology, relationships between underlying resources."*

---

## Key Findings With Numbers

| Finding | Number | Source |
|---------|--------|--------|
| Same model, different harness: score swing | **13.7 points** (52.8→66.5 on Terminal Bench 2.0) | [LangChain deep agents blog](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/) |
| Infrastructure config alone: score swing | **6 percentage points** | [Anthropic infrastructure noise study](https://www.anthropic.com/engineering/infrastructure-noise) |
| Observation masking: cost reduction | **52% cheaper** | [JetBrains "Complexity Trap"](https://arxiv.org/html/2508.21433v2) (NeurIPS 2025) |
| Observation masking: solve rate improvement | **+2.6%** | JetBrains "Complexity Trap" |
| LLM summarization: extra turns vs masking | **~15% more** | JetBrains "Complexity Trap" |
| Tool-space pollution: max performance drop | **Up to 85%** | [Microsoft Research](https://www.microsoft.com/en-us/research/blog/tool-space-interference-in-the-mcp-era-designing-for-agent-compatibility-at-scale/) |
| Largest MCP server: tool count | **256 tools** | Microsoft Research (1,470 servers analyzed) |
| Heaviest tool response | **557,766 tokens** | Microsoft Research |
| AGENTS.md adoption | **60,000+ repos** | [Linux Foundation AAIF](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) |
| OpenAI Codex: throughput | **3.5 PRs/eng/day** | [OpenAI harness engineering](https://openai.com/index/harness-engineering/) |
| Stripe Minions: weekly throughput | **1,000+ merged PRs/week** | [Stripe Minions blog](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) |
| Spotify Honk: total merged PRs | **1,500+ merged** | [Spotify Part 1](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1) |
| TELUS with agents: shipping speed | **30% faster** | [Anthropic 2026 Trends Report](https://resources.anthropic.com/2026-agentic-coding-trends-report) |
| Rakuten: time-to-market reduction | **79%** (24→5 days) | Anthropic 2026 Trends Report |

**Note:** The often-cited "17 points apart" claim likely combines harness (13.7pt) + infrastructure (6pt) effects. No single source cites exactly 17 as a standalone finding.

**Note:** The "BM25 reduces hallucination 22-37%" claim is well-established in RAG literature generally but may originate from an internal or unpublished study. The general finding is validated; the specific numbers need a primary source.

---

## Software Factory Relevance

| Pattern | Current State | Adoption Path |
|---------|--------------|---------------|
| Observation masking | Not implemented | Add to `src/core/context.ts` — replace old tool outputs with placeholders |
| Progressive disclosure | Not implemented | Tier context: L0 (always), L1 (map), L2 (search), L3 (full) |
| AGENTS.md | Using CLAUDE.md | Already aligned — CLAUDE.md serves same purpose |
| Tool scoping | ~20 tools | Good — stay under 20 per agent type |
| Relevance scoring | Not implemented | Score context pieces before assembly, prune to fit budget |
| Dynamic assembly | Basic (static file tree) | Add dependency tracing, test result filtering, git history relevance |

---

## References

### Spotify Engineering (Honk)
- [Part 1: 1,500+ PRs Later](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1)
- [Part 2: Context Engineering](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2)
- [Part 3: Feedback Loops](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3)

### OpenAI
- [Harness Engineering](https://openai.com/index/harness-engineering/)
- [Unlocking the Codex Harness](https://openai.com/index/unlocking-the-codex-harness/)
- [Unrolling the Codex Agent Loop](https://openai.com/index/unrolling-the-codex-agent-loop/)
- [AGENTS.md Guide](https://developers.openai.com/codex/guides/agents-md/)

### Anthropic
- [Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Writing Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
- [Infrastructure Noise in Evals](https://www.anthropic.com/engineering/infrastructure-noise)
- [Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [2026 Agentic Coding Trends Report](https://resources.anthropic.com/2026-agentic-coding-trends-report)

### JetBrains Research
- [Cutting Through the Noise](https://blog.jetbrains.com/research/2025/12/efficient-context-management/)
- [The Complexity Trap (arXiv)](https://arxiv.org/html/2508.21433v2)

### Microsoft Research
- [Tool-Space Interference in the MCP Era](https://www.microsoft.com/en-us/research/blog/tool-space-interference-in-the-mcp-era-designing-for-agent-compatibility-at-scale/)

### Stripe
- [Minions Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)
- [Minions Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)

### LangChain
- [Improving Deep Agents with Harness Engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/)
- [Context Management for Deep Agents](https://blog.langchain.com/context-management-for-deepagents/)
- [Context Engineering for Agents](https://blog.langchain.com/context-engineering-for-agents/)

### Other
- [Chroma: Context Rot](https://research.trychroma.com/context-rot)
- [Factory.ai: The Context Window Problem](https://factory.ai/news/context-window-problem)
- [Martin Fowler: Harness Engineering](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html)
- [arXiv 2603.05344: Building Effective AI Coding Agents (OPENDEV)](https://arxiv.org/abs/2603.05344)
- [arXiv 2510.04618: Agentic Context Engineering](https://arxiv.org/abs/2510.04618)
