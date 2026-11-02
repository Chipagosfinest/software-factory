# Open-Inspect

*Refreshed 2026-11-01*

## What they do

Open-Inspect (`ColeMurray/background-agents`) is an open-source background coding agent modeled on [Ramp Inspect](./ramp-inspect.md). A person submits a prompt and collects the result later. The architecture note is [background agents (Open-Inspect)](../patterns/background-agents/background-agents-open-inspect.md).

The split is three tiers:

- Control plane on Cloudflare Workers and Durable Objects: per-session SQLite, a WebSocket hub, D1 for repository-scoped secrets, GitHub handlers.
- Data plane on Modal: one container sandbox per session (Debian, Node.js 22, Python 3.12, git, Playwright), filesystem snapshots, OpenCode as a runtime, plus Claude and Codex as agent runtimes.
- Clients: Next.js, Slack, GitHub, and Linear bots.

Topology in the note: mesh, with multiplayer sessions sharing sandbox state.

## What they do well

- It copies a production shape (Inspect's snapshot sandbox plus a durable session) without keeping that shape private.
- Session control and code execution are different processes, so the chat/control plane can restart without being the sandbox.
- The indexed figures, as of the 2026-05-26 pass: 1,524 stars, 232 forks, MIT license.

## Patterns shown

- [Background agents](../patterns/background-agents/README.md) — async prompt, sandboxed run, pull request

## Key numbers

| Figure | Meaning | Where this repo records it |
|--------|---------|----------------------------|
| 1,524 stars | GitHub stars on 2026-05-26 | Open-Inspect note; index |
| 232 forks | Same date | Open-Inspect note |
| MIT | License | Open-Inspect note |
| 3 tiers | Cloudflare + Modal + Next.js | Open-Inspect note |

## Sources

- [GitHub: ColeMurray/background-agents](https://github.com/ColeMurray/background-agents)
- [backgroundagents.dev](https://backgroundagents.dev)
- [Ramp: why we built a background agent](https://builders.ramp.com/post/why-we-built-our-background-agent)
