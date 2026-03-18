# Open Questions — Contradictions, Unknowns & Frontier

*What the research doesn't agree on, doesn't know yet, and what to watch for.*

---

## Contradictions Between Sources

### One-Shot vs Multi-Turn
Stripe uses **one-shot architecture** (fully assembled context, single LLM call, no conversation) and ships 1,300 PRs/week. LangChain's Deep Agents uses **multi-turn with middleware** and got +13.7pp on Terminal Bench. OpenAI's harness sits somewhere in between. Which is better?

**Current best answer:** It depends on task complexity. Simple, well-scoped tasks (lint fixes, type updates, dependency bumps) favor one-shot. Complex, multi-file reasoning favors multi-turn with planning tools. No source has done a controlled comparison.

### Observation Masking vs LLM Summarization
JetBrains found observation masking beats LLM summarization (+2.6% vs +1.8% solve rate, 52% vs 40% cost reduction). But Deep Agents' `SummarizationMiddleware` uses LLM summarization as the default and reports good results. Are they measuring different things?

**Current best answer:** Likely yes. JetBrains measured on short, single-issue tasks (SWE-bench). Deep Agents targets long-horizon multi-step tasks where earlier context genuinely needs compression, not just masking. The right technique may depend on task horizon length.

### High Reasoning Everywhere vs Reasoning Sandwich
LangChain found that using the highest reasoning model on every step scored **worse** (53.9%) than the reasoning sandwich (66.5%). But Stripe's one-shot architecture uses the best available model for its single call. Why doesn't Stripe's approach suffer?

**Current best answer:** Stripe's one-shot doesn't have a "planning step" or "verification step" — it's a single call, so there's nothing to sandwich. The overhead of high reasoning hurts when it's applied to low-reasoning subtasks (file listing, grep) in multi-step workflows, not in one-shot.

### Agent Autonomy vs Code Quality
CodeRabbit research shows AI-generated code has 1.75x more logic errors and 2.74x more XSS vulnerabilities than human code. Yet Stripe, Spotify, and OpenAI ship thousands of agent PRs weekly. Are they just accepting worse code?

**Current best answer:** No — they compensate with mandatory human review, CI verification, LLM judges (~25% veto rate at Spotify), and blast radius controls. The raw code quality gap is real, but the governance layer catches most of it. The open question is whether the remaining gap matters at scale.

---

## Unanswered Questions

### How Much Does the Model Still Matter?
Harness engineering gets the headline ("+13.7pp from harness alone"), but no one has published results showing the same harness with different models. Is a great harness with a mediocre model better than a mediocre harness with the best model? The competency matrix suggests harness matters more, but there's no controlled study.

### What's the Ceiling for Harness Engineering?
LangChain went from 52.8% → 66.5% on Terminal Bench with harness changes. But the best score on SWE-bench Verified is ~81% (Claude Code). Is the remaining gap model capability, or is there more harness headroom? No one knows.

### Can Background Agents Handle Greenfield Work?
Every successful background agent deployment (Stripe, Spotify, Ramp) focuses on maintenance: migrations, lint fixes, CI repair, dependency updates. Carson claims Symphony handles feature work from Linear issues, but his evidence is a single demo. Can agents reliably do greenfield feature development at scale?

### Is There a Cost Floor?
Stripe's $0.50–$3.00/PR is remarkably cheap. But as tasks get more complex, costs rise nonlinearly (Devin: $4.50–$9.00/task). Is there a natural cost floor below which agent quality degrades too much? No one has mapped the quality-vs-cost curve systematically.

### Do Evals Actually Predict Production Performance?
SWE-bench Pro vs Verified shows a massive gap (~46% vs ~81%), suggesting contamination. But even Pro may not predict real-world agent effectiveness — it's still isolated tasks on open-source repos. Only 52% of teams in the LangChain survey have adopted evals. Are the teams without evals actually worse off, or are current evals too disconnected from production?

### Does Agent Memory Work at Scale?
Every memory system studied (Napkin, Mem0, Letta, hmem) is early-stage. None has been tested at the scale of Stripe's 1,300 PRs/week or Spotify's 650/month. Will memory systems help or hurt at that volume? Will stale memories poison future runs?

### Do Agent Filesystems Beat Message Queues for Coordination?
TigerFS and AgentFS propose filesystem interfaces to databases for multi-agent coordination — atomic `mv` as task claiming, shared directories as knowledge bases. The thesis: agents already know files, so stop teaching them APIs. But no production system at scale (Stripe, Spotify) has published results using this pattern. Is the FUSE/NFS overhead acceptable for high-throughput agent workloads? Does the "filesystem is the API" pattern hold when you need complex queries, not just file reads? Early-stage, but if validated, it could simplify the BullMQ/Redis/Postgres stack that most agent systems currently rely on.

### What Governance Scales Beyond 10 Agents?
Paperclip and Composio show fleet management for ~10 agents. Carson runs 10 parallel. But no one has published patterns for 100+ concurrent agents with shared state. What governance patterns emerge at that scale? Do circuit breakers cascade? Do budget caps need dynamic adjustment?

---

## What to Watch For

### Upcoming Events
- **Interrupt 2026** (May 13-14, SF) — LangChain's conference. Likely Deep Agents updates, Open SWE benchmarks, and harness engineering talks.
- **SWE-bench Live** updates monthly — Microsoft Research adds 50 new verified tasks per month. Watch for score regression as contamination gets harder.

### Emerging Patterns
- **Kernel-level enforcement** — Ona's Veto system enforces agent constraints at the OS level, not via LLM self-policing. Early but significant shift from prompt-based governance to system-level controls.
- **Agent-as-a-Judge** — Using agents to evaluate other agents. Survey paper (arXiv 2601.05111) maps the landscape. Could replace human review at scale.
- **MCP standardization** — 81K stars and growing. If MCP wins (likely), tool interoperability becomes a solved problem and the differentiator shifts entirely to harness quality.

### Risks to Current Assumptions
- **Model capabilities may leapfrog harness engineering.** If a model ships that can reliably self-plan, self-verify, and self-scope, much of the harness infrastructure becomes unnecessary. Current evidence says we're far from this, but it's the existential risk to the "harness > model" thesis.
- **Benchmark contamination may undermine all eval comparisons.** SWE-bench Verified is already considered unreliable. If Pro and Live also get contaminated, we lose the ability to compare approaches quantitatively.
- **Regulatory intervention.** The $400M collective cloud leak and AI code quality gaps could trigger enterprise-level restrictions on autonomous agent deployments.
