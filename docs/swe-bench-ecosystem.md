# SWE-bench Ecosystem: Autonomous Coding Agent Evaluation (March 2026)

Deep-dive research into benchmarks, leaderboards, criticism, and real-world evaluation of AI coding agents.

---

## 1. SWE-bench Variants

### SWE-bench (Original / Full)
- **Paper**: "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?" by Carlos E. Jimenez, John Yang, Alexander Wettig, Shunyu Yao, Kexin Pei, Ofir Press, Karthik Narasimhan (Princeton PLI + University of Chicago)
- **Published**: ICLR 2024 (first submitted October 2023)
- **ArXiv**: https://arxiv.org/abs/2310.06770
- **What it tests**: 2,294 real GitHub issues from 12 popular Python repositories. Given a codebase and issue description, the model must edit the codebase to resolve the issue. Frequently requires coordinating changes across multiple functions, classes, and files.
- **Scoring**: Binary pass/fail per task based on whether the generated patch passes the associated test suite. Reported as % resolved.
- **Limitations**: Python-only, limited repository diversity, no visual/UI tasks.

### SWE-bench Verified
- **What it tests**: 500 tasks from SWE-bench Full, human-verified by software engineers (initiated by OpenAI) to confirm the test suites are adequate and the tasks are solvable.
- **Purpose**: Address noise in Full by removing ambiguous or poorly-tested instances.
- **Scoring**: Same binary pass/fail methodology. Reported as % resolved out of 500.
- **Status**: Effectively deprecated by OpenAI as of 2025-2026 due to contamination concerns (see Section 3).

### SWE-bench Lite
- **What it tests**: 300 tasks subset from Full, selected to be more tractable for evaluation.
- **Purpose**: Faster, cheaper evaluation cycle for rapid iteration.
- **Scoring**: Same binary pass/fail, % resolved out of 300.

### SWE-bench Pro
- **Paper**: "SWE-Bench Pro: Can AI Agents Solve Long-Horizon Software Engineering Tasks?" (Scale AI)
- **ArXiv**: https://arxiv.org/abs/2509.16941
- **What it tests**: 1,865 long-horizon tasks from 41 real repositories across Python, Go, TypeScript, and JavaScript. Tasks require an average of 107 lines of changes across 4.1 files. Designed to represent enterprise-level complexity.
- **Key innovation**: Three partitions — public (11 repos), held-out (12 repos), and commercial (18 proprietary repos via startup partnerships). GPL/copyleft + private repos create legal/access barriers against contamination.
- **Scoring**: Same resolve rate methodology. Standardized scaffolding (SEAL) and custom scaffolding tracks are reported separately.
- **Leaderboard**: https://labs.scale.com/leaderboard/swe_bench_pro_public
- **Why it matters**: Best model scores ~46% on Pro vs ~81% on Verified, demonstrating the contamination gap.

### SWE-bench Multimodal (SWE-bench M)
- **Paper**: "SWE-bench Multimodal: Do AI Systems Generalize to Visual Software Domains?"
- **ArXiv**: https://arxiv.org/abs/2410.03859
- **Presented**: ICLR 2025
- **What it tests**: 617 task instances from 17 JavaScript libraries (web UI, diagramming, data visualization, syntax highlighting, mapping). Every task includes at least one image (screenshots, visual diffs, UI elements). Human annotation confirms 83.5% of issues require visual reasoning.
- **Purpose**: Exposes the blind spot of text-only Python benchmarks. Tests cross-language generalization + multimodal understanding.
- **Scoring**: Same resolve rate. Top systems circa early 2025 solved only ~12% (SWE-agent) vs 6% for next best.
- **Leaderboard**: https://www.swebench.com/multimodal.html

### SWE-bench Multilingual
- **What it tests**: Tasks across C (30), C++ (12), Go (42), Java (43), JS/TS (43), PHP (43), Ruby (44), Rust (43).
- **Purpose**: Tests whether agent capabilities generalize beyond Python.
- **Leaderboard**: https://www.swebench.com/multilingual-leaderboard.html

### SWE-bench Live
- **Paper**: "SWE-bench Goes Live!" (Microsoft Research)
- **ArXiv**: https://arxiv.org/abs/2505.23419
- **Published**: NeurIPS 2025 Datasets & Benchmarks track
- **What it tests**: 1,890 tasks from 223 repositories, restricted to issues created Jan 2024 - Apr 2025. Adds 50 new verified issues monthly via automated curation pipeline.
- **Purpose**: Continuously updated, contamination-resistant benchmark. Each task has a dedicated Docker image for reproducible execution.
- **Leaderboard**: https://swe-bench-live.github.io/
- **GitHub**: https://github.com/microsoft/SWE-bench-Live

---

## 2. Current Leaderboards (as of March 2026)

### SWE-bench Verified
| Rank | Model/Agent | Score |
|------|------------|-------|
| 1 | Claude Opus 4.5 (Anthropic) | 80.9% |
| 2 | Claude Opus 4.6 (Anthropic) | 80.8% |
| 3 | Gemini 3.1 Pro (Google) | 80.6% |
| 4 | MiniMax M2.5 | 80.2% |
| 5 | GPT-5.2 (OpenAI) | 80.0% |
| 6 | Claude Sonnet 4.6 (Anthropic) | 79.6% |

Source: https://www.swebench.com/ and https://www.marc0.dev/en/leaderboard

**Note**: OpenAI has officially stopped submitting to SWE-bench Verified, citing contamination (see Section 3). Scores above ~75% should be interpreted with skepticism.

### SWE-bench Pro (Custom Scaffolding)
| Rank | Model/Agent | Score |
|------|------------|-------|
| 1 | Opus 4.6 + WarpGrep v2 | 57.5% |
| 2 | GPT-5.3-Codex (OpenAI) | 56.8% |
| 3 | GPT-5.2-Codex (OpenAI) | 56.4% |
| 4 | GPT-5.2 (OpenAI) | 55.6% |

### SWE-bench Pro (SEAL Standardized Scaffolding)
| Rank | Model/Agent | Score |
|------|------------|-------|
| 1 | Claude Opus 4.5 (Anthropic) | 45.9% |

Source: https://labs.scale.com/leaderboard/swe_bench_pro_public

**Key insight**: Custom scaffolding scores are NOT comparable to SEAL scores. The scaffolding (agent harness, search tools, retry logic) matters enormously.

### SWE-bench Multimodal
Early 2025 scores were very low (~12% best). Updated 2026 scores not prominently published but available at https://www.swebench.com/multimodal.html

---

## 3. Criticism and Limitations

### 3.1 The Contamination Problem

**"The SWE-Bench Illusion: When State-of-the-Art LLMs Remember Instead of Reason"**
- ArXiv: https://arxiv.org/abs/2506.12286
- Authors: Shanchao Liang, Spandan Garg, Roshanak Zilouchian Moghaddam
- Key finding: Models achieve up to 76% accuracy identifying buggy file paths using only issue descriptions (no repo structure), but only 53% on repos not in SWE-bench. Up to 35% consecutive 5-gram overlap on SWE-bench vs 18% on other benchmarks. This suggests memorization, not reasoning.

**OpenAI's withdrawal from SWE-bench Verified**
- Blog: https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/
- Core argument: Every frontier model shows training data contamination on the dataset. Flawed tests reward shortcuts. Training-data leakage inflates scores. OpenAI now recommends SWE-bench Pro instead.

### 3.2 Test Suite Inadequacy (UTBoost)

**"SWE-bench Verified is Flawed Despite Expert Review"**
- Blog: https://ddkang.substack.com/p/swe-bench-verified-is-flawed-despite
- Published: ACL 2025
- Key findings:
  - 26 out of 500 Verified tasks have insufficient unit tests even after human review
  - 176 incorrect patches in Lite and 169 in Verified were incorrectly scored as correct
  - When re-evaluated with fixed tests, 24.4% of Verified leaderboard rankings changed
  - 54.2% of Verified submission annotations required correction

### 3.3 Narrow Task Scope

**"What's in a Benchmark? The Case of SWE-Bench in Automated Program Repair"**
- ArXiv: https://arxiv.org/abs/2602.04449
- Authors: Matias Martinez, Xavier Franch (February 2026)
- Analyzed 79 Lite entries and 133 Verified entries
- Finding: Most top submissions come from industry (small companies + large public companies). The benchmark covers only a few Python projects, so performance may not generalize.

### 3.4 Benchmark =/= Mergeable Code

**METR: "Many SWE-bench-Passing PRs Would Not Be Merged into Main"**
- URL: https://metr.org/notes/2026-03-10-many-swe-bench-passing-prs-would-not-be-merged-into-main/
- Published: March 10, 2026
- Study design: 4 actual maintainers from 3 SWE-bench Verified repos (scikit-learn, Sphinx, pytest) reviewed 296 AI-generated PRs, blinded to human/AI authorship
- Key finding: **Maintainer merge rate is ~24 percentage points lower than SWE-bench automated scores.** A system scoring 72% on the grader would have only ~48% of PRs accepted by maintainers.
- Rejection reasons: core functionality failures, patch breaks other code, code quality issues.

---

## 4. Alternative Evaluation Frameworks

### METR (Model Evaluation & Threat Research)
- URL: https://metr.org/research/
- Focus: Measuring real-world developer productivity impact and autonomous agent capabilities
- Key work: Randomized controlled trial (Feb-Jun 2025) with 16 experienced OSS developers, 246 issues. Found AI tools made developers 19% slower (see Section 5).
- Also evaluates frontier model autonomy (e.g., GPT-5.1-Codex-Max evaluation: https://evaluations.metr.org//gpt-5-1-codex-max-report/)

### Aider Polyglot Benchmark
- URL: https://aider.chat/docs/leaderboards/
- Methodology: 225 of Exercism's most challenging problems across C++, Go, Java, JavaScript, Python, and Rust. Models get two attempts; on failure, shown test results from first attempt.
- Measures: Code editing ability across multiple languages, error correction capability
- Top score: Refact.ai Agent + Claude 3.7 Sonnet at 92.9%
- Last updated: November 2025
- Source: https://epoch.ai/benchmarks/aider-polyglot

### HumanEval / MBPP
- Focus: Function-level code generation (Python). HumanEval = 164 algorithmic problems; MBPP = 974 simpler programming problems.
- Limitation: Essentially saturated by frontier models (96%+ pass@1). No longer differentiates frontier capabilities.
- Enhanced versions: HumanEval Pro and MBPP Pro test self-invoking code generation (ACL 2025 Findings). o1-mini scores 96.2% on HumanEval but only 76.2% on HumanEval Pro.
- ArXiv: https://arxiv.org/abs/2412.21199

### LiveCodeBench
- URL: https://livecodebench.github.io/leaderboard.html
- Focus: Fresh competitive programming problems released after model training cutoffs, preventing contamination. 1,000+ problems across easy/medium/hard difficulty.
- Methodology: Continuously updated with new problems from competitive programming platforms.
- Key strength: Contamination-free by design (temporal cutoff).

### BigCodeBench
- URL: https://bigcode-bench.github.io/
- Published: ICLR 2025
- Focus: 1,140 function-level tasks requiring composition of multiple function calls from 139 libraries. Hard subset (BCB-Hard) = 148 tasks.
- Formats: Complete (code completion from docstring) and Instruct (NL instructions).
- Scoring: Calibrated Pass@1 with greedy decoding.
- GitHub: https://github.com/bigcode-project/bigcodebench

### CodeArena
- ArXiv: https://arxiv.org/abs/2503.01295
- Published: ACL 2025 Demo
- Focus: Online evaluation platform with collective scoring that dynamically recalibrates model scores based on all participants, mitigating benchmark leakage bias.
- Key innovation: Automation-ready APIs, public solution/test repository, continuous evaluation.
- URL: https://codearenaeval.github.io/

### SWE-bench++ (SWE-Bench Plus Plus)
- Focus: Automated pipeline producing 11,100+ repository-level tasks from 11 languages. Stratified 1,782-task subset for multilingual, multi-paradigm comparison.

---

## 5. The Evaluation Crisis

### The METR 19% Slowdown Paradox

**Study**: "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity"
- URL: https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/
- Design: Randomized controlled trial, 16 experienced OSS developers from repos averaging 22K+ stars and 1M+ LOC, 246 issues
- Tools used: Primarily Cursor Pro with Claude 3.5/3.7 Sonnet

**The paradox**:
- **Actual result**: Developers were 19% slower with AI tools
- **Pre-study prediction**: Developers expected to be 24% faster
- **Post-study belief**: Developers still believed AI sped them up by 20%
- **Perception gap**: 39 percentage points between reality and belief

**Contributing factors**: Low AI reliability, time spent double-checking outputs, context-switching overhead, over-reliance on suggestions.

**2026 Update**: https://metr.org/blog/2026-02-24-uplift-update/
- METR's second study faced selection bias: developers increasingly refuse to work without AI, biasing the control group
- Preliminary 2026 estimate: ~18% speedup (CI: -38% to +9%), suggesting tools have improved
- Internal transcript analysis suggests people are "substantially sped up" on tasks where they actually use Claude Code
- Key insight: The original study measured experienced devs on their own repos (where they already have deep context). The AI advantage may be larger on unfamiliar codebases.

**Reconciliation research**: https://metr.org/blog/2025-08-12-research-update-towards-reconciling-slowdown-with-time-horizons/

### Why Benchmarks Diverge from Real-World Performance

1. **Contamination inflates benchmark scores**: Models memorize SWE-bench solutions (76% file-path identification without context)
2. **Narrow scope**: SWE-bench = Python bug fixes. Real work = design, refactoring, multi-repo changes, deployment, docs
3. **Missing code quality signal**: SWE-bench only checks if tests pass. METR's maintainer study shows ~50% of passing PRs would be rejected for quality.
4. **Scaffolding matters more than model**: Same model can score 45.9% (SEAL) vs 57.5% (custom scaffolding) on Pro
5. **Selection bias in developer studies**: Best developers self-select out of no-AI conditions
6. **Task horizon mismatch**: Benchmarks test 15-minute tasks; real value comes from multi-hour/multi-day work

### Spotify's Internal Experience vs Benchmarks

**Spotify's Honk System** (Background Coding Agents):
- Blog series: https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3
- TechCrunch coverage: https://techcrunch.com/2026/02/12/spotify-says-its-best-developers-havent-written-a-line-of-code-since-december-thanks-to-ai/
- Shipped 50+ features/updates in 2025. Top engineers haven't written code since December 2025.
- Three failure modes identified:
  1. Agent fails to produce a PR
  2. PR fails CI
  3. **PR passes CI but is functionally incorrect** (the most dangerous — erodes trust)
- Spotify's approach: Strong verification loops, not benchmark scores. They measure trust and functional correctness, not SWE-bench % resolved.

---

## 6. Real-World Metrics That Actually Matter

### What Companies Measure

| Metric | What It Captures | Why It Matters |
|--------|-----------------|----------------|
| **PR merge rate** | % of agent PRs accepted by human reviewers | METR found ~50% gap vs benchmark scores |
| **Time-to-merge** | Hours/days from PR creation to merge | Measures review burden + iteration cycles |
| **CI pass rate** | % of agent PRs passing continuous integration | First gate; necessary but not sufficient |
| **Revert rate** | % of merged agent PRs later reverted | Measures hidden defects that slip past review |
| **Reviewer satisfaction** | Qualitative assessment of code quality | Captures style, readability, maintainability |
| **Defect rate** | Bugs found post-merge per agent PR | Production impact metric |
| **Cost per resolved issue** | $ spent (API calls + compute + review time) | Business viability metric |
| **Task completion rate** | % of assigned tasks actually completed | Many agents fail silently |
| **Lines changed accuracy** | Whether changes are minimal and focused | Agents tend to over-edit |

### Industry Measurement Patterns

**Tiered CI for Agent PRs** (emerging pattern):
1. Fast preflight: formatting, lint, typecheck, unit tests, secret scan
2. Full suite: integration tests + SAST + dependency scan + IaC scan
3. Human review gate: Required before merge

**Spring AI Bench** (enterprise-focused): Measures agent performance on issue triage, dependency upgrades, PR reviews, compliance checks, and test expansion — the maintenance work that keeps large systems healthy.

**METR's recommendation**: Don't naively extrapolate benchmark scores to real-world usefulness. The gap between automated grading and maintainer review is systematic, not random.

---

## 7. Key Papers and Resources

### Foundational Papers

| Paper | ArXiv/URL | Key Contribution |
|-------|-----------|-----------------|
| SWE-bench (original) | https://arxiv.org/abs/2310.06770 | Defined the benchmark. ICLR 2024. |
| SWE-agent | https://arxiv.org/abs/2405.15793 | Agent-computer interfaces for automated SE. NeurIPS 2024. |
| SWE-bench Multimodal | https://arxiv.org/abs/2410.03859 | Visual/JS extension. ICLR 2025. |
| SWE-bench Pro | https://arxiv.org/abs/2509.16941 | Long-horizon, multi-language, anti-contamination. Scale AI. |
| SWE-bench Goes Live! | https://arxiv.org/abs/2505.23419 | Continuously updated benchmark. NeurIPS 2025 D&B. Microsoft. |

### Criticism Papers

| Paper | ArXiv/URL | Key Finding |
|-------|-----------|-------------|
| The SWE-Bench Illusion | https://arxiv.org/abs/2506.12286 | Models memorize, not reason. 76% file-path ID without context. |
| What's in a Benchmark? | https://arxiv.org/abs/2602.04449 | Industry dominates submissions; narrow scope. Feb 2026. |
| UTBoost (test inadequacy) | https://ddkang.substack.com/p/swe-bench-verified-is-flawed-despite | 24% of Verified rankings change with fixed tests. ACL 2025. |
| Are "Solved Issues" Really Solved? | https://arxiv.org/html/2503.15223v1 | Empirical study of correctness of "solved" patches. |
| Dissecting SWE-Bench Leaderboards | https://arxiv.org/abs/2506.17208 | Profiles submitter architectures and patterns. |

### Industry Reports and Blog Posts

| Source | URL | Key Takeaway |
|--------|-----|--------------|
| OpenAI: Why We No Longer Evaluate SWE-bench Verified | https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/ | Contamination across all frontier models. |
| METR: Developer Productivity Study | https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ | 19% slowdown finding. |
| METR: 2026 Study Design Update | https://metr.org/blog/2026-02-24-uplift-update/ | Selection bias; ~18% speedup now estimated. |
| METR: SWE-bench PRs Not Mergeable | https://metr.org/notes/2026-03-10-many-swe-bench-passing-prs-would-not-be-merged-into-main/ | ~50% of passing PRs rejected by maintainers. |
| METR: Reconciling Slowdown | https://metr.org/blog/2025-08-12-research-update-towards-reconciling-slowdown-with-time-horizons/ | Task horizon affects measurement. |
| Anthropic: 2026 Agentic Coding Trends | https://resources.anthropic.com/2026-agentic-coding-trends-report | 60% AI integration; autonomy increasing; 99.9th percentile turn duration doubled. |
| Spotify: Background Coding Agents | https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3 | Verification loops > benchmark scores. |
| Morphllm: Why 46% Beats 81% | https://www.morphllm.com/swe-bench-pro | Pro vs Verified contamination gap explained. |
| Simon Willison: Feb 2026 Leaderboard Update | https://simonwillison.net/2026/Feb/19/swe-bench/ | Leaderboard snapshot and commentary. |
| SWE-bench Comprehensive Review | https://atoms.dev/insights/swe-bench-a-comprehensive-review-of-its-fundamentals-methodology-impact-and-future-directions/6c3cb9820d3b44e69862f7b064c1fd1e | Full methodology review. |

### Leaderboard URLs

| Benchmark | URL |
|-----------|-----|
| SWE-bench (all variants) | https://www.swebench.com/ |
| SWE-bench Pro (Scale SEAL) | https://labs.scale.com/leaderboard/swe_bench_pro_public |
| SWE-bench Pro (Private) | https://labs.scale.com/leaderboard/swe_bench_pro_private |
| SWE-bench Live | https://swe-bench-live.github.io/ |
| SWE-bench Multimodal | https://www.swebench.com/multimodal.html |
| SWE-bench Multilingual | https://www.swebench.com/multilingual-leaderboard.html |
| SWE-rebench | https://swe-rebench.com |
| Aider Polyglot | https://aider.chat/docs/leaderboards/ |
| BigCodeBench | https://bigcode-bench.github.io/ |
| LiveCodeBench | https://livecodebench.github.io/leaderboard.html |
| Epoch AI (aggregator) | https://epoch.ai/benchmarks/swe-bench-verified |
| LLM Stats (aggregator) | https://llm-stats.com/benchmarks/swe-bench-verified |

---

## Summary: The State of Evaluation in March 2026

**The benchmark landscape is fractured.** SWE-bench Verified — once the gold standard — is now widely considered contaminated. OpenAI stopped submitting. UTBoost showed 24% of rankings were wrong. METR showed half of "passing" PRs wouldn't be merged.

**SWE-bench Pro is the current best-available benchmark** for frontier differentiation, with anti-contamination design (copyleft + private repos), multi-language support, and long-horizon tasks. But even Pro scores (45-57%) are far from ceiling.

**No single benchmark captures real-world agent value.** The gap between automated test-passing and maintainer-approved code is systematic. Companies like Spotify measure trust, verification loops, and functional correctness — not benchmark percentages.

**The evaluation crisis is real.** METR's 19% slowdown finding (now potentially reversed in 2026) shows that even rigorous studies produce counterintuitive results. Developer perception systematically overestimates AI benefit. The field needs:
1. Continuously updated benchmarks (SWE-bench Live)
2. Multi-dimensional evaluation (code quality, not just test passing)
3. Real-world deployment metrics (merge rate, revert rate, defect rate)
4. Human-in-the-loop validation (METR's maintainer review approach)

*Last updated: March 16, 2026*
