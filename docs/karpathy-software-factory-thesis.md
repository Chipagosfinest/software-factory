# Karpathy's Software Factory Thesis

*Compiled: March 21, 2026*

---

## The Arc: Craft → Orchestration → Factory

Karpathy's public thinking has evolved rapidly over the past 13 months:

| Date | Concept | Key Shift |
|------|---------|-----------|
| Feb 2025 | **Vibe Coding** | Let the LLM write code, stop fighting it |
| Feb 8, 2026 | **Agentic Engineering** | You're not coding, you're orchestrating agents |
| Feb 25, 2026 | **"Programming is unrecognizable"** | Agents handle 30-min projects autonomously |
| Mar 2, 2026 | **Agent Command Center** | tmux isn't enough, need proper IDE for agent fleets |
| Mar 7, 2026 | **AutoResearch** | Agents run 100+ ML experiments overnight on 1 GPU |
| Mar 20, 2026 | **No Priors Interview** | Haven't typed code since Dec 2025, 16hrs/day "expressing intent" |
| Mar 21, 2026 | **Code Quality Q&A** | Agents produce working but ugly code — and that's acceptable |

The trajectory: **individual coding → AI-assisted coding → agent orchestration → factory production → quality is a tradeoff you accept.**

---

## No Priors Interview (Mar 20, 2026) — Key Points

Source: [YouTube](https://www.youtube.com/watch?v=kwSVtQ7dziU) — Sarah Guo, No Priors podcast

### The Phase Shift (December 2025)
- "December is when something really flipped. I went from mostly writing code myself to mostly delegating it to agents."
- "I haven't typed a line of code since."
- Describes being in a "perpetual state of AI psychosis" — the feeling that rapidly expanding AI capabilities make almost anything possible.

### Token Throughput as the New Bottleneck
- The constraint shifted from GPU flops to **token throughput** — how many tokens/sec you can push through agents.
- Unused subscription capacity now feels like waste ("subscription anxiety").
- Goal: maximize tokens processed per second while removing yourself as the bottleneck.

### Claws — Persistent Agent Systems
- "Claws" = persistent AI systems that operate continuously without direct user interaction.
- Multiple parallel agents across different subscriptions, treated as workers pulling from a task queue.
- Peter Steinberg model: 10+ repos checked out, dispatching work to agents, moving between them.

### Engineers as Factory Managers
- Developers oversee multiple AI agents working in parallel across different tasks.
- Instead of editing functions or debugging lines, engineers assign entire features or projects to separate agents.
- "Code's not even the right verb anymore. I have to express my will to my agents for 16 hours a day."

### Failure Attribution: Skill Issue
- When agents fail, Karpathy attributes it to inadequate instructions, poor memory tooling, or suboptimal AGENTS.md files — not capability limits.
- "It often feels like a skill issue — not a limitation of the technology, but of how instructions are given or systems are configured."
- Improving prompts, memory systems, and agent coordination = the new engineering expertise.

### Jevons Paradox Applied to Software
- As coding becomes cheaper, demand for software increases (not decreases).
- ATMs didn't eliminate bank tellers — they made branches cheaper to open, so more branches opened, hiring more tellers.
- Software was scarce. If the barrier comes down, you get MORE demand for engineering, not less.

### AutoResearch
- Agents autonomously run ML experiments overnight on a single GPU.
- Found hyperparameter improvements on an already well-tuned codebase.
- Implication: human researchers are bottlenecks in loops that have objective metrics.

---

## Code Quality Q&A (Mar 21, 2026) — Critical Admission

Source: [X thread](https://x.com/karpathy/status/2035173492447224237) — reply to @RhysSullivan

**Q:** Are you happy with the code quality agents give, or does it not matter as long as it functions?

**Karpathy's answer (verbatim):**

> "I'm not very happy with the code quality and I think agents bloat abstractions, have poor code aesthetics, are very prone to copy pasting code blocks and it's a mess, but at this point I stopped fighting it too hard and just moved on. The agents do not listen to my instructions in the AGENTS.md files. E.g. just as one example, no matter how many times I say something like:
>
> 'Every line of code should do exactly one thing and use intermediate variables as a form of documentation'
>
> They will still 'multitask' and create complex constructs where one line of code calls 2 functions and then indexes an array with the result. I think in principle I could use hooks or slash commands to clean this up but at some point just a shrug is easier.
>
> Yes I think LLM as a judge for soft rewards is in principle and long term slightly problematic (due to goodharting concerns), but in practice and for now I don't think we've picked the low hanging fruit yet here."

### Specific Code Quality Issues Identified
1. **Bloated abstractions** — over-engineering, unnecessary layers
2. **Poor code aesthetics** — messy, hard to read
3. **Copy-paste duplication** — code blocks repeated instead of extracted
4. **Instruction non-compliance** — AGENTS.md rules are routinely ignored
5. **Complex one-liners** — chaining multiple operations instead of readable intermediate variables

### Potential Mitigations He Mentioned (But Hasn't Implemented)
- **Hooks** — post-generation cleanup/reformatting
- **Slash commands** — manual style enforcement
- **LLM as judge** — soft reward signal for code quality (with Goodhart's Law caveat)

---

## Implications for Software Factory

### 1. Verification Loops Must Include Style
Our current verification loop (Spotify pattern) checks: does it build? do tests pass? does the LLM judge approve the diff? **Missing:** does the code meet style/quality standards? Karpathy confirms agents won't self-enforce quality from instructions alone.

**Action:** Add a code quality verifier to the agent pipeline — not just "does it work" but "is it clean." This could be:
- AST-based complexity checks (cyclomatic complexity, nesting depth)
- Duplication detection (copy-paste blocks)
- Style linting beyond formatting (intermediate variables, single-responsibility lines)

### 2. AGENTS.md / CLAUDE.md Instructions Have a Ceiling
Even Karpathy — who literally coined "agentic engineering" — can't get agents to follow style instructions in markdown files. This validates our approach of using **programmatic constraints** (hooks, verifiers, governance layer) over **instructional constraints** (markdown rules).

**Action:** Don't rely on CLAUDE.md for code quality. Use hooks and automated reformatting as post-processing steps.

### 3. The "Shrug Threshold" Is Real
At some point, fighting for code quality costs more than accepting the mess. The factory model accepts this tradeoff: **velocity over aesthetics.** The question is where to draw the line.

For our use case (ProductRank maintenance + Visa commerce), we probably need higher quality than Karpathy's personal projects. Production systems accumulate technical debt faster than personal repos.

### 4. LLM-as-Judge for Quality Is Underexplored
Karpathy says "we haven't picked the low hanging fruit yet" on using LLMs to judge code quality. Our LLM judge (Spotify pattern) currently checks scope — did the agent stay on task? Extending it to check quality (readability, duplication, complexity) is a natural evolution.

**Goodhart's Law risk:** If agents are optimized to satisfy an LLM quality judge, they may game the metric (e.g., splitting every expression into trivially simple lines). Need real verification (tests pass, builds succeed) as the hard constraint, with quality as a soft signal.

### 5. The Factory Analogy Is Apt
Factories produce consistent, functional output at scale. They don't produce artisanal craftsmanship. Software Factory should embrace this:
- **Consistent** — every agent follows the same lifecycle
- **Functional** — verification loops ensure it works
- **At scale** — multiple agents, multiple repos, continuous operation
- **Not artisanal** — accept that agent-written code won't be beautiful

The quality gap is a feature, not a bug — it's what creates demand for the governance/verification layer we're building.

---

## Related Voices

### CircleCI CTO — "The Era of the Software Factory"
CircleCI's CTO discussed the same framing in their State of Software Delivery report (March 2026): AI is transforming software delivery from craft to factory. The shift requires new infrastructure for managing output quality at scale.

### Steve Yegge — Gas Town (30-Agent Factory)
Yegge's Gastown orchestrator (11.2k GitHub stars) runs 20-30 agents in parallel. 75,000 lines of Go, built in 17 days with AI agents. The factory floor analogy is literal: agents are workers, the orchestrator is the floor manager.

### Walseth AI — Agent Command Center
Built the "agent command center" Karpathy asked for (Mar 2 tweet). Key insight: the gap isn't monitoring (tmux can do that) — it's **governance**. Dispatching structured work packages, not ad-hoc prompts. Agent trust scores, performance tracking, scheming detection.

---

## Key Quotes for Reference

> "Programming is becoming unrecognizable. You're not typing computer code into an editor like the way things were since computers were invented, that era is over." — Karpathy, Feb 25, 2026

> "The biggest prize is in figuring out how you can keep ascending the layers of abstraction to set up long-running orchestrator Claws with all of the right tools, memory and instructions that productively manage multiple parallel Code instances for you." — Karpathy, Feb 25, 2026

> "I'm not very happy with the code quality... but at this point I stopped fighting it too hard and just moved on." — Karpathy, Mar 21, 2026

> "The agents do not listen to my instructions in the AGENTS.md files." — Karpathy, Mar 21, 2026

> "One day, frontier AI research used to be done by meat computers in between eating, sleeping, having other fun, and synchronizing once in a while using sound wave interconnect in the ritual of 'group meeting'. That era is long gone." — Karpathy, AutoResearch README, Mar 2026

---

## The Quality Problem: Industry-Wide Evidence

Karpathy's "shrug" on code quality isn't isolated — it's an industry-wide crisis being documented in real time.

### JetBrains Coins "Shadow Tech Debt" (Mar 11, 2026)

JetBrains launched Junie CLI and JetBrains Air specifically to address what they call **Shadow Tech Debt** — low-quality, architecture-blind code generated by AI agents with no structural understanding of the projects they modify.

> "The current state of working with coding agents is fragmented: Each agent runs in a separate tool, with a different setup, different context, and no structural understanding of your code." — Nik Tkachev, JetBrains Head of Product

Key insight: "Complex codebases aren't yet ready for pure agentic coding." JetBrains' response is an infrastructure layer (Air) that gives agents structural awareness — not better prompts.

Source: [The New Stack](https://thenewstack.io/jetbrains-names-the-debt-ai-agents-leave-behind/)

### The Compounding Problem (Mar 2, 2026)

Anuradha Weeraman (CTO, Verdentra) documented how AI-generated code degrades differently from human code:

- **Errors compound, not accumulate.** Each time you extend AI-generated code containing mistakes, the new code adapts to the existing mistakes rather than correcting them. The model treats your broken codebase as a style guide.
- **Bad patterns multiply.** A convoluted auth pattern scattered across 3 modules becomes 30 modules. The model faithfully replicates convolution because that's the "established pattern."
- **Review fatigue is real.** The ratio of code-to-read to time-available-to-read is collapsing. Volume overwhelms human reviewers.

**Mitigation:** Architectural boundaries with human-written scaffolding. End-to-end tests before refactoring. Continuous simplification discipline.

Source: [weeraman.com](https://weeraman.com/the-compounding-problem)

### "Lint Against the Machine" — Quantified Anti-Patterns (Mar 6, 2026)

Christopher Montes audited a 130,000-line project and found the same rate limiter implemented **four separate times** by the same AI agent in the same week. His data:

| Metric | AI-Authored PRs | Human-Only PRs | Multiplier |
|--------|----------------|----------------|------------|
| Issues per PR | 10.83 | 6.45 | **1.7x** |
| Logic errors | — | — | **1.75x** |
| Readability issues | — | — | **3x** |
| Security vulnerabilities | — | — | **2.74x** |
| Concurrency errors | — | — | **2x** |

(Source: CodeRabbit analysis of 470 GitHub PRs)

GitClear's analysis of **211 million changed lines** (2021-2024): copy/paste code rose from 8.3% to 12.3%, while refactoring dropped from 25% to under 10%.

**The AI Anti-Pattern Top 10:** Phantom duplication, error handling gaps, security vulnerabilities, dead code/over-engineering, async misuse, deprecated API suggestions, test suites that achieve high coverage but verify nothing ("The Lie of Unit Test Coverage"), style inconsistencies.

Source: [Medium — Lint Against the Machine](https://medium.com/@montes.makes/lint-against-the-machine-a-field-guide-to-catching-ai-coding-agent-anti-patterns-3c4ef7baeb9e)

### 75% of AI Agents Break Working Code Over Time (Mar 8, 2026)

Alibaba's **SWE-CI benchmark** tested 18 models across 100 real Python codebases (avg 233 days, 71 consecutive commits). Key findings:

- **75% of models break previously working code** during long-term maintenance
- Only **Claude Opus** exceeded a 50% zero-regression rate — every other model fell below 25%
- New metric: **EvoScore** — penalizes agents that game snapshot benchmarks with brittle fixes

> "A tool that resolves today's ticket but introduces regressions you'll discover next sprint isn't saving engineering time. It's borrowing from the future at a high interest rate."

Source: [Awesome Agents](https://awesomeagents.ai/news/alibaba-swe-ci-ai-coding-agents-long-term-maintenance/)

---

## The Instruction Compliance Crisis

Karpathy said "agents do not listen to my AGENTS.md files." The Claude Code GitHub issues tell the same story at scale.

### "Reads Rules, Cites Rules, Violates Rules" — The Narrate-Then-Violate Pattern

[Issue #33097](https://github.com/anthropics/claude-code/issues/33097): The model retrieves a rule from CLAUDE.md, references it in narration ("Now posting via GraphQL, file-based body per MEMORY convention"), then generates a tool call that violates the rule in the same response.

> "The model appears to process rules as narration context rather than execution constraints."

The model reads the rule. References it in text. Generates code that violates it. Recognizes the violation after failure. Self-corrects. Every time.

### 200+ Lines of Rules, All Ignored

[Issue #33603](https://github.com/anthropics/claude-code/issues/33603): A user documented 4 consecutive sessions where every CLAUDE.md rule was violated — with full token-level evidence. Each violation led to a stronger rule, which was violated in the next session.

> "Every rule in this system was added in direct response to a specific documented failure. Every rule has been violated again after being added."

### The Community Consensus: Hooks > Instructions

The resolution across 20+ GitHub issues is unanimous:

| Mechanism | Enforcement Level |
|-----------|------------------|
| CLAUDE.md rules | Guidance — "like code comments, frequently ignored under pressure" |
| Memory/MEMORY.md | Guidance — loaded but not actionable |
| Hooks with `exit 2` | **Enforcement** — "mechanically prevents violations" |

**The mental model:**
- CLAUDE.md = suggestions (helpful, frequently ignored)
- Hooks = CI checks (mechanically enforced)

> "Any rule that MUST be followed needs a hook, not a CLAUDE.md line."

Academic research cited: "How Many Instructions Can LLMs Follow at Once?" (Jaroslawicz et al., 2025) found instruction compliance decreases uniformly as count increases. Best models follow <30% perfectly in agent scenarios.

Sources: [#33097](https://github.com/anthropics/claude-code/issues/33097), [#33603](https://github.com/anthropics/claude-code/issues/33603), [#32161](https://github.com/anthropics/claude-code/issues/32161), [#32290](https://github.com/anthropics/claude-code/issues/32290)

---

## Multi-Agent Fleet Management: The Factory Floor

### The "3 Workers Beats 10" Finding

OptinAmpOut ran production multi-agent fleets (30+ Claude Code instances) and confirmed: **2-3 focused workers outperform 10 parallel workers** due to context contention and coordination overhead.

Their fleet architecture uses the **Puppeteer Pattern** (NeurIPS 2025): centralized orchestrator dynamically directing specialized workers via tmux.

Key lesson: "Filesystem queues are underrated. We tried Redis, SQLite, and custom APIs before landing on... files in a directory."

Source: [OptinAmpOut](https://optinampout.com/blogs/multi-agent-fleet-orchestration-production.php)

### "Orbit" — Harness, Not Smarter Agents (Mar 8, 2026)

Trine built "Orbit" after running 7 agents across 3 repos and documenting every failure mode:

- **Information cocoon:** Agent commits to approach A, tries A', A'', A''' — never asks "should I try B?"
- **No meta-cognition:** Agent can't evaluate whether its current direction is promising or a dead end
- **Context pollution:** State leaks between tasks when one agent works sequentially

Key insight: "The verifier can catch bad implementations. It cannot catch bad directions."

> "AI agents are power tools. A power drill doesn't decide where to put the hole."

Source: [trine.dev](https://blog.trine.dev/posts/2026-03-08-orbit-ai-agents/)

### LangSmith Fleet (Mar 19, 2026)

LangChain rebranded Agent Builder to **LangSmith Fleet** — a centralized enterprise agent management platform. Signals market maturation: the demand isn't for better individual agents but for **fleet governance.**

Source: [AIToolly](https://aitoolly.com/ai-news/article/2026-03-20-langchain-rebrands-agent-builder-to-langsmith-fleet-a-centralized-enterprise-agent-management-platfo)

### Market Size

Gartner: 1,445% surge in multi-agent system inquiries (Q1 2024 → Q2 2025). Agent management market projected to grow from ~$7.8B to $52B+ by 2030. 40% of enterprise apps will embed AI agents by end of 2026 (up from <5% in 2025).

Source: [Zylos Research](https://zylos.ai/research/2026-02-19-ai-agent-fleet-management)

---

## LLM-as-Judge for Code Quality

Karpathy mentioned LLM-as-judge for soft rewards. Here's the state of the art.

### Key Findings (Dec 2025 — Mar 2026)

- **Evaluation is easier than generation** — the judge sees both question and answer, making it a narrower task (Pydantic)
- **"Thinking" models (CoT) significantly outperform** specialized smaller judge models (Softtech survey)
- **Major weaknesses:** Can't reliably detect functional bugs without execution, verbosity bias (prefers longer answers), position bias
- **Best for code:** Code translation assessment and content adequacy. Worst for: detecting subtle bugs, security flaws
- **LLMs systematically underrate human-written code** because it "feels less natural" to them than AI-generated code
- **Combine deterministic checks with LLM judges:** Run type validation and format checks first, save LLM evaluation for semantic quality
- **Goodhart's Law risk is real but manageable:** Use LLM judge as soft signal, keep hard constraints (tests pass, builds succeed) as the gate

### Practical Architecture

```
Agent generates code
      │
  ┌───▼────────────────┐
  │ Deterministic checks │ ← Linting, type checking, formatting (free, fast)
  │ (AST complexity,     │
  │  duplication detect)  │
  └───┬────────────────┘
      │
  ┌───▼────────────────┐
  │ Test execution       │ ← Hard gate — does it work?
  └───┬────────────────┘
      │
  ┌───▼────────────────┐
  │ LLM-as-Judge        │ ← Soft signal — is it good?
  │ (readability, style, │   (Goodhart risk: don't optimize for this alone)
  │  duplication, arch)   │
  └───┬────────────────┘
      │
  Score + reasoning → feed back into agent or flag for human review
```

Sources:
- [Softtech — LLM-as-Judge for Code](https://medium.com/softtechas/utilising-llm-as-a-judge-to-evaluate-llm-generated-code-451e9631c713)
- [Pydantic — Practical Guide](https://pydantic.dev/articles/llm-as-a-judge)
- [Weights & Biases — Exploring LLM-as-Judge](https://wandb.ai/site/articles/exploring-llm-as-a-judge/)

---

## Jevons Paradox: More Software, Different Jobs

Karpathy referenced Jevons Paradox in his No Priors interview (ATMs → more bank branches). The data supports it — with a twist.

### The Bull Case: More Software Than Ever

- GitHub: **43 million PRs merged in 2025** — up 23% YoY. Nearly 1 billion commits, up 25%. Apple App Store: 557,000 new apps, up 24%.
- Goldman Sachs projects application software market growing to **$780B by 2030** at 13% CAGR
- BLS projects software developer employment growing **15% through 2034**
- Faros AI: developers using AI complete 21% more tasks, merge **98% more PRs**

### The Bear Case: Different Jobs, Not More Jobs

- Software engineer job postings dropped to **64% of Feb 2020 baseline** by mid-2025 (Indeed Hiring Lab)
- Software output up ~500%, junior hiring down ~30%
- The bottleneck moved: from "write code" to "decide what to build, integrate safely, own outcomes"
- Entry-level roles disappearing because entry-level work (CRUD endpoints, boilerplate) is exactly what AI handles well

### The Synthesis

> "The Jevons paradox isn't wrong. We're burning more compute than ever. We just need fewer shovels." — Tekta.ai

The value is shifting to:
1. **Orchestration** — directing AI systems, deciding which tool handles which component
2. **Context engineering** — managing what the AI is given (rules, constraints, domain knowledge)
3. **Verification** — confirming output actually works, catching fluent errors

These are exactly the three pillars Software Factory is built on.

Sources:
- [Mr. Phil Games — Jevons Paradox](https://mrphilgames.com/blog/jevons-paradox-software-development-ai-more-developers)
- [Tekta.ai — Why 10x Engineers Aren't Creating 10x Jobs](https://www.tekta.ai/insights/jevons-paradox-software-engineering-jobs-2026)
- [Jim Montgomery — When Code Gets Cheaper](https://www.jimmont.com/code-jevons-paradox-intellectual-work)
- [MindStudio — Jevons Paradox in AI](https://www.mindstudio.ai/blog/jevons-paradox-ai-human-work-demand)

---

## LLM Knowledge Bases (Apr 2, 2026)

Karpathy described his workflow for using LLMs to build personal knowledge bases — directly relevant to how this repo operates.

Source: [X post](https://x.com/karpathy/status/2039805659525644595)

### The Pattern

```
raw/ (source documents) → LLM "compiles" → wiki/ (.md files) → Q&A + enhancement loop
```

| Stage | What Happens |
|-------|-------------|
| **Ingest** | Index articles, papers, repos, datasets, images into `raw/`. Obsidian Web Clipper for web→md. Download images locally for LLM reference. |
| **Compile** | LLM incrementally builds a wiki: summaries, backlinks, concept articles, cross-links. LLM owns the wiki — you rarely edit manually. |
| **IDE** | Obsidian as frontend. Marp plugin for slides. View raw data, compiled wiki, and derived visualizations. |
| **Q&A** | At ~100 articles / ~400K words, ask complex questions. No fancy RAG needed — LLM auto-maintains index files and brief summaries. |
| **Output** | Render markdown, slides (Marp), matplotlib images. File outputs back into wiki. Explorations always "add up." |
| **Linting** | LLM health checks: find inconsistencies, impute missing data (web search), suggest new article candidates. |
| **Tools** | Vibe-coded search engine (web UI + CLI for LLM tool use on larger queries). |

> "I think there is room here for an incredible new product instead of a hacky collection of scripts." — Karpathy

### Obsidian Founder's Response: Vault Separation

Steph Ango (Obsidian founder) responded with a critical operational insight:

> "Keep your personal vault clean and create a messy vault for your agents."

Key principles:
- **Contamination risk**: Mixing agent-created and human-created artifacts makes your personal vault unreliable as a representation of *your* thoughts
- **Source traceability**: Personal vault content should have known origins. Agent-generated content often can't be sourced.
- **Tool degradation**: Search, bases, quick switcher, backlinks, graph — all stop being scoped to *your* knowledge when flooded with agent artifacts
- **Graduation pattern**: Only bring agent-generated artifacts into your primary vault once they've proven useful

### Implications for Software Factory

1. **This repo IS the agent-facing vault.** `docs/` is the "messy vault" where agents compile research. The pattern matches exactly: `raw/` → agent-compiled wiki → Q&A loop.
2. **The graduation pattern applies to our roadmap.** Research that proves actionable (e.g., the instruction compliance crisis → hooks architecture) graduates into code. Research that stays informational stays in docs.
3. **Knowledge base as product.** Karpathy explicitly says "there is room for an incredible new product." Software Factory's docs/ directory is a working prototype of this — agent-compiled, LLM-queryable, incrementally enhanced.
4. **Scale threshold: ~400K words before needing RAG.** Our thesis doc alone is ~7K words. At current growth rate, we have significant headroom before needing vector search over the wiki.

---

## Sources

### Karpathy Primary Sources
- [No Priors Interview — YouTube](https://www.youtube.com/watch?v=kwSVtQ7dziU) (Mar 20, 2026)
- [Karpathy X Thread — Code Quality Q&A](https://x.com/karpathy/status/2035173492447224237) (Mar 21, 2026)
- [Karpathy — "Programming has changed" post](https://kbr.sh/blogmark/2026/Feb/26/karpathy-hard-to-communicate-how-much-programming-has-changed/) (Feb 25, 2026)
- [AutoResearch repo](https://github.com/karpathy/autoresearch) (Mar 7, 2026)
- [Fortune — "The Karpathy Loop"](http://fortune.com/2026/03/17/andrej-karpathy-loop-autonomous-ai-agents-future/) (Mar 17, 2026)
- [Agent Wars — Karpathy Agentic IDE](https://agent-wars.com/news/2026-03-12-andrej-karpathy-agentic-ide) (Mar 12, 2026)
- [Garry's List — One GPU Research Lab](https://gli.st/posts/karpathy-just-turned-one-gpu-into-a-research-lab-f55754a6) (Mar 8, 2026)
- [Quasa — AI Agents Transform Programming](https://quasa.io/media/karpathy-s-observation-ai-agents-transform-programming-from-coding-to-orchestration) (Mar 9, 2026)
- [Walseth AI — Agent Command Center](https://walseth.ai/blog/karpathy-command-center) (Mar 15, 2026)
- [Economic Times — Karpathy no longer writes code](https://economictimes.indiatimes.com/tech/artificial-intelligence/ai-researcher-andrej-karpathy-no-longer-writes-code-spends-hours-directing-ai-agents/articleshow/129716812.cms) (Mar 21, 2026)

### LLM Knowledge Bases
- [Karpathy — LLM Knowledge Bases](https://x.com/karpathy/status/2039805659525644595) (Apr 2, 2026)
- Steph Ango (Obsidian founder) — Vault separation response (Apr 2, 2026)

### Code Quality & Technical Debt
- [JetBrains — Shadow Tech Debt](https://thenewstack.io/jetbrains-names-the-debt-ai-agents-leave-behind/) (Mar 11, 2026)
- [The Compounding Problem](https://weeraman.com/the-compounding-problem) (Mar 2, 2026)
- [Lint Against the Machine — AI Anti-Patterns](https://medium.com/@montes.makes/lint-against-the-machine-a-field-guide-to-catching-ai-coding-agent-anti-patterns-3c4ef7baeb9e) (Mar 6, 2026)
- [SWE-CI: 75% of Agents Break Working Code](https://awesomeagents.ai/news/alibaba-swe-ci-ai-coding-agents-long-term-maintenance/) (Mar 8, 2026)

### Instruction Compliance
- [Claude Code #33097 — Narrate-then-violate pattern](https://github.com/anthropics/claude-code/issues/33097) (Mar 11, 2026)
- [Claude Code #33603 — 200+ rules, all ignored](https://github.com/anthropics/claude-code/issues/33603) (Mar 12, 2026)
- [Claude Code #32161 — CLAUDE.md knowledge retrieval ignored](https://github.com/anthropics/claude-code/issues/32161) (Mar 8, 2026)
- [Claude Code #32290 — Reads files, ignores instructions](https://github.com/anthropics/claude-code/issues/32290) (Mar 9, 2026)

### Fleet Management
- [OptinAmpOut — Multi-Agent Fleet Orchestration](https://optinampout.com/blogs/multi-agent-fleet-orchestration-production.php) (Feb 15, 2026)
- [Orbit — 7 Agents Across 3 Repos](https://blog.trine.dev/posts/2026-03-08-orbit-ai-agents/) (Mar 8, 2026)
- [LangSmith Fleet](https://aitoolly.com/ai-news/article/2026-03-20-langchain-rebrands-agent-builder-to-langsmith-fleet-a-centralized-enterprise-agent-management-platfo) (Mar 19, 2026)
- [Zylos — AI Agent Fleet Management](https://zylos.ai/research/2026-02-19-ai-agent-fleet-management) (Feb 19, 2026)

### LLM-as-Judge
- [Softtech — LLM-as-Judge for Code Evaluation](https://medium.com/softtechas/utilising-llm-as-a-judge-to-evaluate-llm-generated-code-451e9631c713) (Dec 28, 2025)
- [Pydantic — Practical Guide with Evals](https://pydantic.dev/articles/llm-as-a-judge) (Feb 11, 2026)
- [Weights & Biases — Exploring LLM-as-Judge](https://wandb.ai/site/articles/exploring-llm-as-a-judge/) (Jan 28, 2026)

### Jevons Paradox
- [Mr. Phil Games — More Developers, Not Fewer](https://mrphilgames.com/blog/jevons-paradox-software-development-ai-more-developers) (Mar 15, 2026)
- [Tekta.ai — Why 10x Isn't Creating 10x Jobs](https://www.tekta.ai/insights/jevons-paradox-software-engineering-jobs-2026) (Jan 9, 2026)
- [Jim Montgomery — When Code Gets Cheaper](https://www.jimmont.com/code-jevons-paradox-intellectual-work) (Mar 15, 2026)
- [MindStudio — Jevons Paradox in AI](https://www.mindstudio.ai/blog/jevons-paradox-ai-human-work-demand) (Mar 15, 2026)
