# OpenCode

*Refreshed 2026-11-23*

## What they do

OpenCode is an open-source coding agent. `github.com/sst/opencode` redirects to `anomalyco/opencode`. The project site says you can use included free models or connect any model from any provider, including Claude, GPT, and Gemini, and that the agent runs in the terminal, an IDE, or a desktop app.

On October 31, 2026, Dax Raad wrote that OpenCode's token cost is double its payroll: the 25-person team says its output is similar to a 75-person pre-AI team, so software cost is not going to zero at current token prices. On November 2, 2026, he wrote that GitHub org- and repo-level secrets can be exfiltrated by anyone whose write-access account is compromised, and that secrets belong in environments with protection rules.

On November 23, 2026, OpenCode 2.4.0 shipped automations the agent can create. They run on a schedule or react to MCP events, and they can trigger a prompt, a shell command, or a code-mode script that can call MCP tools. On November 21, OpenCode Console added keyless auth, so calling models from CI, or from anywhere that supports OIDC, does not need a long-lived API token.

## What they do well

Provider choice is the harness decision the site leads with. It also says multiple agents can run in parallel on the same project. No benchmark score is taken from these pages.

## Patterns shown

- [Harness engineering](../patterns/harness-engineering/README.md) — one terminal agent, many model providers
- [Orchestration](../patterns/orchestration/README.md) — automations on a schedule or on MCP events
- [Governance and safety](../patterns/governance-safety/README.md) — OIDC keyless auth in place of a long-lived API token

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| 2× | Token cost relative to payroll | [2026-10-31 post](https://x.com/thdxr/status/2116527005801873662) |
| 25 | Team size named in that post | Same |
| 75 | Pre-AI team size used as the output comparison | Same |

## Sources

- [Site](https://opencode.ai)
- [GitHub](https://github.com/anomalyco/opencode)
- [Token cost, 2026-10-31](https://x.com/thdxr/status/2116527005801873662)
- [GitHub secrets, 2026-11-02](https://x.com/thdxr/status/2117299716987789772)
- [Keyless auth, 2026-11-21](https://x.com/opencode/status/2124037654639468759)
- [Automations in 2.4.0, 2026-11-23](https://x.com/opencode/status/2124886266835505473)
