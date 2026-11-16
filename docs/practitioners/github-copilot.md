# GitHub Copilot

*Refreshed 2026-11-16*

## What they do

GitHub's docs now describe this product as Copilot cloud agent. The concepts URL requested for the older "coding agent" name redirects onto Copilot's agent documentation. The cloud-agent how-to is the page that states the loop.

## What they do well

The how-to says Copilot can research a repository, plan and make code changes, and open pull requests. Sessions can start on GitHub, from the mobile app, the CLI, the API, or an issue via agent apps. The concepts page retrieved here lists three environment choices for Copilot in the cloud: a cloud sandbox, a GitHub Actions-based session, and a remote custom environment. The Actions path is one of those choices, not the only one.

GitHub's November 6, 2026 engineering post says an internal test of its new Git storage supported 5,000 concurrent agents on one repo, sending 7,200 pushes per second, while reads stayed at low latency. The design minimizes coordination and decouples storage from compute: Git objects are immutable and content-addressed, so only reference updates need agreement.

Copilot app projects give Copilot a goal across one or more repos and have it coordinate sessions and recurring automations.

The [8 November 2026 GitHub Universe talk](https://www.youtube.com/watch?v=-GpxKKgoWWg) is Levi Strauss & Co. on 17 agents across one SDLC. See [Levi Strauss](./levi-strauss.md).

On November 10, 2026, Patrick Nikoletich said the Copilot SDK is used more for non-coding work than for coding, and that a team can replace the default harness, including identity, prompt sections, tools, permissions, and skills. The demo is a Docker pool of isolated workers. An inference gateway holds credentials so the agent does not, and a sandbox can mask them and limit the network. Agent Host Protocol tunnels a CLI into that environment, including a direct-to-Azure path that does not go through GitHub. A session is a workspace, so the agent can clone more than one repository. Harness 2.0 is described as a Rust rewrite, with the protocol in the SDK.

## Patterns shown

- [Background agents](../patterns/background-agents/README.md) — a cloud agent that edits a repository and opens a pull request
- [Harness engineering](../patterns/harness-engineering/README.md) — a replaceable harness inside the SDK
- [Governance and safety](../patterns/governance-safety/README.md) — credentials stay at the inference gateway, not in the agent

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| 5,000 | Concurrent agents on one repo in an internal storage test | GitHub engineering |
| 7,200 / second | Pushes in that test, with reads at low latency | Same |

## Sources

- [Cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent)
- [Concepts page that lists environments](https://docs.github.com/en/copilot/concepts/agents/coding-agent)
- [Git storage for agent scale, 2026-11-06](https://github.blog/engineering/architecture-optimization/building-git-infrastructure-for-agent-scale-development/)
- [Git storage post, 2026-11-06](https://x.com/github/status/2118830274431873379)
- [Copilot app projects](https://x.com/github/status/2119133311465353675)
- [Levi Strauss at GitHub Universe](https://www.youtube.com/watch?v=-GpxKKgoWWg) (2026-11-08)
- [Inside the Microsoft Copilot Harness](https://www.youtube.com/watch?v=STVHfSaSw7o) (2026-11-10)
