# Latent Briefing: KV Cache Compaction for Multi-Agent Systems

*Last updated: April 11, 2026*

Research summary of [Ramp Labs, "Latent Briefing: Efficient Memory Sharing for Multi-Agent Systems via KV Cache Compaction"](https://x.com/RampLabs/status/2042660310851449223) (Ben Geist, April 10 2026), with a honest applicability assessment for Software Factory's API-only architecture.

**One-line:** instead of LLM summarization or RAG for cross-agent memory, compress the worker's KV cache using attention scores derived from the orchestrator's current task prompt — keep only the representations the worker will actually attend to.

---

## The Problem They're Solving

Recursive Language Models (RLMs, [Zhang et al., 2025](https://arxiv.org/abs/2510.08037)) give an orchestrator a REPL and let it call a worker model repeatedly. The orchestrator accumulates a rich reasoning trajectory across many calls; the worker only sees what the orchestrator explicitly passes in. Two failure modes:

1. **Pass-everything**: inflates input tokens on every call, accuracy can *degrade* from irrelevant context (Chroma's "context rot" finding applies here too — see [`context-engineering.md`](context-engineering.md)).
2. **Pass-nothing**: worker has a narrow view of a problem the orchestrator already partly understands. Rework and dead ends repeat.

Standard mitigations all have drawbacks:

| Approach | Latency | Precision | Cost |
|----------|---------|-----------|------|
| LLM summarization | 20-60s per step | Lossy, may miss what sub-task needs | LLM call per step |
| RAG / chunking | Moderate | Misses cross-chunk dependencies | Embedding + retrieval |
| Pass raw trajectory | Zero | Perfect but noisy | Full input tokens every call |

Latent Briefing sits between these: fast (~1.7s), task-adaptive, and operates on the *representation* level rather than the text level.

---

## Method

Built on the **Attention Matching (AM)** framework ([Zweiger et al., 2026](https://arxiv.org/abs/2602.16284)). AM finds a compact KV cache of size `t < S` such that `softmax(Q·C1ᵀ + β)·C2 ≈ softmax(Q·Kᵀ)·V` — i.e., the compact cache produces near-identical attention outputs to the full cache. Three components per (layer, head):

- **C1**: selected subset of key vectors
- **β**: bias corrections from NNLS to compensate for dropped keys
- **C2**: reconstructed values via ridge regression

### Ramp's three modifications

**1. Task-guided query vectors.** Vanilla AM samples reference queries from the context itself. Latent Briefing replaces those with queries derived from the orchestrator's *current task prompt for this specific worker call*. The attention scores between the task-prompt queries and the trajectory keys become the relevance signal for which tokens to keep.

```
K = trajectory KV cache keys
Q = attention queries from orchestrator's task prompt

attn[l,h]   = softmax(Q · Kᵀ / √d)           # task→trajectory attention
scores[l,h](pos) = RMS_q(attn[l,h](:, pos))  # per-position relevance
```

**2. Shared global token selection.** Vanilla AM processes each of Qwen3-14B's 320 (layer, head) pairs independently — 320 serialized CUDA solves, ~30s overhead on an A100. Latent Briefing aggregates scores across all heads into a single per-position vote, enabling **batched execution** (2-3 batches for all 40 layers). Reduces overhead to ~1.7s median. Small accuracy trade-off from losing per-head specificity.

**3. MAD-normalized thresholding.** Keep every position where `score > median + threshold · MAD` instead of fixed top-k. Threshold `t` controls aggressiveness:

| Threshold | Compression | Best for |
|-----------|-------------|----------|
| `t = -1.0` | 18% | Long documents (32k-100k) |
| `t = 0.0` | Moderate | Mixed |
| `t = 1.0` | 68% | Short easy (<32k) |
| `t = 2.0` | 79% | **Hard questions** |

---

## Results (LongBench v2, 126 questions)

Orchestrator = Claude Sonnet 4, Worker = Qwen3-14B.

- **+3pp accuracy** at optimal threshold per condition (over vanilla RLM baseline)
- **42-57% worker token reduction** (median)
- **21-31% total token reduction** (median)
- **~1.7s median compaction overhead**, scales linearly with trajectory length
- **~20× faster** than sequential AM, **10-30× faster** than LLM summarization

### The counterintuitive finding

**Harder questions benefit from *more* aggressive compaction.** On hard LongBench questions, `t=2.0` (79% compression) beats the uncompressed baseline by 3 points. The mechanism:

> Hard questions lead the orchestrator to explore many hypotheses, generating speculative reasoning in its trajectory. This speculative content *dilutes the signal* for the worker. Aggressive compaction acts as a relevance filter, stripping away the noise and giving the worker a cleaner, more focused signal.

Conversely, **long documents want lighter compaction** (`t=-1.0`, 18%) because information is dispersed — you can't prune aggressively without losing facts.

This inverts the engineer's default intuition that "more tokens = more information = better answer." The value of each token depends on its relevance to the *current* task, and the orchestrator's broader reasoning is noise from the worker's perspective.

---

## Applicability to Software Factory

**The core mechanism is blocked by our architecture.** Latent Briefing requires direct access to the worker's KV cache during forward passes — reading attention scores, writing compacted keys, solving NNLS + ridge regression per head. Software Factory routes every LLM call through OpenRouter ([`src/core/llm.ts`](../src/core/llm.ts)) to hosted models (Claude Sonnet 4, GPT-4.1, Gemini 2.5 Flash) and runs agents in short-lived containers. No local model hosting, no GPU, no persistent worker process, no KV cache access. That rules out:

- The AM compaction pipeline (C1/β/C2 reconstruction)
- Task-guided query vectors against trajectory keys
- KV prefix caching across agent invocations (our containers reset)
- Shared token selection via attention head voting
- Everything that makes Latent Briefing *fast* (1.7s via batched tensor ops)

**The insight is not blocked.** The underlying claim — *orchestrator speculative reasoning is noise for the worker; task-guided filtering before the worker sees the trajectory improves both cost and accuracy* — translates to API-only systems if you accept a text-level (rather than representation-level) implementation.

### Adapted patterns for API-only agents

**Pattern A: Task-guided trajectory pruning before pipeline handoff.**
Before the CI Debugger or Merge Resolver re-invokes itself, make a cheap Gemini 2.5 Flash call that takes `(orchestrator trajectory, current sub-task)` and returns the relevant slice. Effectively a cheap filter LLM playing the role of the attention score. Not novel (it's classical summarization), but the Ramp result justifies being *more* aggressive on hard retries than intuition suggests — speculative reasoning from failed iterations is noise, not signal.

**Pattern B: Difficulty-adaptive context ratio.**
Follow Latent Briefing's finding: harder tasks get *smaller* context, not bigger. Define a difficulty heuristic (retry count, prior veto count, convergence detection signal already tracked in [`src/orchestrator/state.ts`](../src/orchestrator/state.ts)) and map it to a compression ratio in the filter call:

```
attempt 1 → 100% of trajectory
attempt 2 → 50%   (prune prior reasoning, keep facts)
attempt 3 → 20%   (drop almost all prior reasoning)
```

This contradicts the common retry-with-more-context pattern — Ramp's data says that pattern is wrong above moderate difficulty.

**Pattern C: Task-key extraction for relevance masking.**
Instead of summarizing, extract keyword/phrase "keys" from the orchestrator's current task prompt and inject them into the worker prompt as explicit relevance instructions ("focus only on trajectory items matching <keys>; treat everything else as background context"). Simulates MAD thresholding via prompt, not cache mutation. Cheaper than a filter-LLM pass but less precise.

### Where it plugs in

| Candidate | Why | File |
|-----------|-----|------|
| CI Debugger | Iterates on build failures, budget $2, max 2 retries → trajectory grows fast | [`src/agents/prompts/ci-debugger.md`](../src/agents/prompts/ci-debugger.md) |
| Merge Resolver | Iterates on conflicts, max 20 files → longest trajectories in the system | [`src/agents/prompts/merge-resolver.md`](../src/agents/prompts/merge-resolver.md) |
| Orchestrator loop | State-machine already has convergence detection → natural place for difficulty signal | [`src/orchestrator/state.ts`](../src/orchestrator/state.ts) |
| LLM router | Single chokepoint for wrapping filter calls | [`src/core/llm.ts`](../src/core/llm.ts) |

One-shot agents (`pr-reviewer`, `security`, `incident`) **do not benefit** — no trajectory, no compaction to apply. Skip them.

### What to measure

Software Factory already records `cost_tracking` per `agent_run` in SQLite. To validate an adapted version, add three columns to `agent_runs`:

- `pre_filter_tokens` / `post_filter_tokens` — direct token reduction per call
- `retry_count_at_filter` — for correlating compression with difficulty
- `outcome` — build fixed / conflict resolved / veto / failure

Success criteria (mirror the paper):
- CI Debugger: first-attempt fix rate unchanged or improved with ≥30% fewer tokens on retry 2+
- Merge Resolver: auto-merge rate on retry 2 ≥ baseline, with 40%+ token reduction
- No increase in convergence-detection stop rate (the hard-stop-after-5-failures guard)

Run A/B via a feature flag in `src/router.ts`. Ship it dark for 100 runs before declaring a win.

---

## What NOT to build

1. **A mock KV cache in TypeScript.** Tempting to track "attended" tokens by parsing verbose LLM outputs or chain-of-thought, but OpenRouter gives zero visibility into actual model internals. Any heuristic built on response text is a guess, not attention.
2. **A stateful wrapper pretending to be a persistent worker.** Software Factory's "cattle, not pets" principle (README design principle #6) means every sandbox is identical and disposable. Faking persistence across container restarts burns tokens on re-prefill and violates the architecture.
3. **Per-head anything.** Not our world. Stay at the message / trajectory level.
4. **Running Qwen3-14B locally to match the paper's setup.** No GPU, no ops budget for it, and the whole point of the current architecture is that commodity API models are good enough when the harness is strong (see [`harness-engineering.md`](harness-engineering.md)).

---

## Related KV compaction research (corpus cross-links)

Latent Briefing is one of several papers attacking the agent memory problem from different angles:

- **[Baseten STILL](https://www.baseten.co/research/towards-infinite-context-windows-neural-kv-cache-compaction/)** (O'Neill et al., April 2026) — Trains a fixed perceiver encoder to compact any KV cache in a single forward pass. SAE-like amortization of AM's per-context optimization. 8× compression, 85%+ factual accuracy retention.
- **[TriAttention](https://github.com/WeianMao/triattention)** (Mao et al., April 2026, MIT/NVIDIA/ZJU) — Trigonometric frequency-domain compression via pre-RoPE Q/K clustering. 10.7× KV memory reduction, 2.5× throughput on AIME25, no accuracy loss. vLLM plugin, OpenClaw-compatible.
- **[The KV Cache Wars](https://kenhuangus.substack.com/p/the-kv-cache-wars)** (Ken Huang, April 6 2026) — Industry survey of the three families: eviction/sparse attention, quantization/dim-reduction, hierarchical memory.
- **[Attention Matching](https://arxiv.org/abs/2602.16284)** (Zweiger et al., 2026) — The base framework Latent Briefing extends.
- **[Cartridges](https://arxiv.org/abs/2506.06266)** (Eyuboglu et al., 2025) — End-to-end gradient-optimized compact caches; minutes-to-hours per context, extreme quality, not agent-loop compatible.

All of these require model-level access that Software Factory deliberately does not have. They are relevant if and when the architecture shifts to self-hosted inference (ProductRank might; Software Factory will not).

---

## Related corpus docs

- [`context-engineering.md`](context-engineering.md) — the biggest-lever framing this paper extends
- [`orchestrator.md`](orchestrator.md) — how our orchestrator trajectory currently accumulates
- [`harness-engineering.md`](harness-engineering.md) — why commodity API models + strong harness beats custom model hosting
- [`ramp-self-maintaining-code.md`](ramp-self-maintaining-code.md) — prior Ramp research in the corpus

---

## Key takeaways

1. **The counterintuitive finding is the export.** Harder retries should get *smaller* context, not bigger. Our current retry loops almost certainly violate this.
2. **Difficulty-adaptive compression is buildable today** with a small Gemini 2.5 Flash filter call, no model internals needed.
3. **The 1.7s overhead number is not our number.** In an API-only system, a filter-LLM adds 500-1500ms *plus* its own cost. Only worth it when the saved input tokens pay for the filter call.
4. **Measure before shipping.** The paper's gains are on LongBench v2 reading comprehension, not on code repair. Code tasks may respond differently. Run the A/B.
5. **Don't port the paper, port the insight.** The representation-level mechanism is blocked; the relevance-filtering principle is not.

---

## Open questions

- Does the "hard tasks want aggressive compression" finding replicate on code-repair benchmarks (SWE-bench, SWE-CI)? The orchestrator's speculative trajectory looks different when debugging a stack trace vs. reading a legal document.
- What's the minimum filter model that captures the benefit? Gemini 2.5 Flash is cheap; can we go further (GPT-4.1-nano)?
- Does Pattern C (key extraction into prompt) give meaningful gains over Pattern A (filter-LLM), given its much lower cost?
- Is there a version of this that fits within a single LLM call via system-prompt instructions ("discard anything in the trajectory not matching <task-keys>"), eliminating the filter-call overhead entirely?
