# Zed

*Refreshed 2026-11-16*

## What they do

Zed's external-agent docs describe agents that connect through the Agent Client Protocol (ACP). Zed hosts the thread in the Agent Panel. The external agent usually owns its runtime.

On November 13, 2026, Zed said agents will be able to trace code back to the threads that produced it, for decisions the code does not record. The agent is pointed at that thread with a summary and tools to inspect the conversation. The whole thread is not pulled into context. The next day's post names the failure mode "agent archaeology": reconstructing why a teammate and their agent wrote code a certain way from scattered commits, transcripts, and conversations. They point at a talk on using Delta to avoid it.

## What they do well

The split is the protocol: the editor is the UI, and the agent is replaceable. The page does not score those agents. The thread link is a pointer plus tools, not a dump of the original conversation into the window.

## Patterns shown

- [Harness engineering](../patterns/harness-engineering/README.md) — the editor hosts the thread; the agent brings its runtime
- [Memory and knowledge](../patterns/memory-knowledge/README.md) — a summary and tools back to the thread that wrote the code

## Key numbers

No quantitative claim is repeated here. The sources describe the system without a figure this profile uses.

## Sources

- [External agents](https://zed.dev/docs/ai/external-agents)
- [Trace code to the thread, 2026-11-13](https://x.com/zeddotdev/status/2121279582703628747)
- [Summary, not the whole thread, 2026-11-13](https://x.com/zeddotdev/status/2121284258706719186)
- [Agent archaeology, 2026-11-14](https://x.com/zeddotdev/status/2121650009158435324)
