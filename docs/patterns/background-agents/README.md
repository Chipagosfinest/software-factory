# Background Agents

*Refreshed 2026-11-01*

Parent hub for agents that run without a developer sitting in the loop: isolated sandboxes, warm start, worktrees, and a pull request as the handoff. The developer submits work and reviews the result.

## Children

- [Sandbox isolation](./sandbox-isolation.md) — containers, VMs, warm pools, network and filesystem limits
- [Sandbox architecture 2026](./sandbox-architecture-2026.md) — agent-in-sandbox vs sandbox-as-tool
- [Open-Inspect](./background-agents-open-inspect.md) — Cloudflare control plane, Modal data plane
- [Agent filesystems](./agent-filesystems.md) — database-as-directory coordination
- [Cloudflare Dynamic Workers](./cloudflare-dynamic-workers.md) — isolate sandboxes and Code Mode

## Practitioners

- [Stripe Minions](../../practitioners/stripe-minions.md)
- [Spotify Honk](../../practitioners/spotify-honk.md)
- [Ramp Inspect](../../practitioners/ramp-inspect.md)
- [Open-Inspect](../../practitioners/open-inspect.md)
- [OpenHands](../../practitioners/openhands.md)
- [Goose](../../practitioners/goose.md)
- [Replit Agent Habitat](../../practitioners/replit-agent-habitat.md)
- [Vercel](../../practitioners/vercel.md)

## Sources

- [Stripe Minions](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)
- [Spotify Honk, part 1](https://engineering.atspotify.com/2025/11/spotifys-background-coding-agent-part-1)
- [Ramp on Modal](https://modal.com/blog/how-ramp-built-a-full-context-background-coding-agent-on-modal)
