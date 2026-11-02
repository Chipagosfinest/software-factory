# Meta Confucius

*Refreshed 2026-11-02*

## What they do

Confucius is an internal Meta agent framework. Meta's own post on the Ranking Engineer Agent (REA) says REA is built on Confucius, which is for complex multistep reasoning, code generation, and an SDK into internal tools such as job scheduling. A market survey adds a teardown this post does not.

## What they do well

The survey's Meta section calls Confucius a shared harness about two years old, with 60+ applications, DAG workflows, and human-in-the-loop gates between stages. In that same paragraph it lists specialist systems on the harness, including Tribal Knowledge Agents that it says produce about 59 concise context files per codebase. Those counts are the survey's, and this pass did not open a Meta page that states them. The REA post confirms the framework and the SDK. It does not, in the text retrieved here, mention workflow graphs, approval gates, or context files. KernelEvolve's throughput number in the same survey paragraph is a different system and is not a Confucius result.

## Patterns shown

- [Orchestration](../patterns/orchestration/README.md) — a shared framework other Meta agents are built on
- [Harness engineering](../patterns/harness-engineering/README.md) — multistep code generation plus an internal SDK

## Key numbers

No quantitative claim is repeated here. The sources describe the system without a figure this profile uses.

## Sources

- [REA on Confucius](https://engineering.fb.com/2026/03/17/developer-tools/ranking-engineer-agent-rea-autonomous-ai-system-accelerating-meta-ads-ranking-innovation/)
- [Orchestrator survey](https://jackkora.com/p/mapping-the-ai-coding-orchestrator)
