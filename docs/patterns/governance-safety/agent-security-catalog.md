# Agent Security Catalog

Archived snapshot as of April 2026. Not the current market map. Current state of play: [Landscape](../../landscape/README.md). Weekly updates: [X insights](../../signals/x-insights.md).


An emerging category. As agents gain real credentials and make real API calls, the security surface expands beyond traditional guardrails. **April 2026 saw an explosion of entrants** — Brex CrabTrap, Permiso SandyClaw, Capsule Security ($7M seed), iron-proxy, agentcage, ToolMesh.

### Comparison Matrix

| System | Layer | Approach | Best For |
|--------|-------|----------|----------|
| [CrabTrap (Brex)](https://github.com/brexhq/CrabTrap) | Transport (HTTP/S proxy) | LLM-as-a-judge + static rules | Framework-agnostic egress control |
| [NVIDIA OpenShell](https://github.com/NVIDIA/OpenShell) | Kernel (Landlock, seccomp) | Docker sandbox + YAML policies | Kernel-level isolation |
| [Deconvolute](https://github.com/nichochar/deconvolute) | Protocol (MCP) | MCP session firewall | MCP-heavy architectures |
| [ClawShield](https://github.com/nichochar/ClawShield) | Application | 5 specialized AI agents + YAML policy | PII redaction, prompt injection scanning |
| [Permiso SandyClaw](https://permiso.io) | Skill (dynamic detonation) | Detonates agent skills in sandbox | Cross-framework skill safety |
| [Capsule Security](https://capsulesecurity.ai) | Runtime | Behavior control at runtime | Enterprise runtime governance |
| [iron-proxy](https://github.com/iron-proxy/iron-proxy) | Transport + credential | MITM egress + proxy tokens | Real secrets never enter sandbox |
| [ToolMesh](https://toolmesh.io) | Protocol (MCP) | Self-hosted MCP gateway | Enterprise MCP control plane |
| [Superserve](https://superserve.io) | Transport (credential) | Injects API keys at network level | Credential isolation (not request filtering) |

### CrabTrap Deep Dive

CrabTrap (Brex, open-sourced April 21, 2026) sits between AI agents and external APIs. Two-tier evaluation:

1. **Static rules** — Deterministic URL pattern matching (prefix, exact, glob). Deny rules always win. Microsecond execution.
2. **LLM-as-a-judge** — When no static rule matches, full request context goes to an LLM with a natural-language security policy. Returns structured ALLOW/DENY with reasoning.

**Production findings from Brex:**
- Policies derived from observed traffic beat hand-written rules
- LLM judge fires on <3% of requests (static rules catch the rest)
- Audit trail became a discovery tool for tightening agents themselves
- Prompt injection defense: JSON-encoded payloads, 4KB header cap, 16KB body truncation

**Architecture:** Go + TypeScript, MIT license, PostgreSQL audit trail, AWS Bedrock with Anthropic models, React admin dashboard.

**Limitations:** Outbound only (not a WAF), no approval queue, doesn't filter responses, fundamentally probabilistic on the LLM layer.

Sources: [GitHub](https://github.com/brexhq/CrabTrap) · [Brex Blog](https://www.brex.com/journal/building-crabtrap-open-source) · [HN Discussion](https://news.ycombinator.com/item?id=47850212)
