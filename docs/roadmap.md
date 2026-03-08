# ProductRank Expansion Roadmap

## Now: Software Factory
Autonomous PR review, CI debugging, security patching, incident response, and merge conflict resolution. Cron agents expand the ProductRank knowledge graph daily.

**Key metric:** Agent-written PRs as % of total PRs

## Next: Visa Claws
Reuse Software Factory infrastructure (agents, queue, governance) as the backend for Visa's agentic commerce platform. The same agent patterns that review PRs can review transactions, flag fraud, and automate compliance.

**Key metric:** Infrastructure reuse ratio (how much of Factory becomes Claws)

## Then: Visa Network
Expand from single-org to multi-org. The knowledge graph becomes a shared data layer for tool recommendations across the Visa partner network.

**Key metric:** Graph coverage (% of developer tools with trusted profiles)

## Architecture Reuse

| Component | Factory Use | Claws Use | Network Use |
|-----------|------------|-----------|-------------|
| Event Router | GitHub webhooks | Transaction events | Multi-org events |
| Agent Runner | PR review, CI debug | Fraud detection, compliance | Cross-org analysis |
| Governance | File/cost limits | Transaction limits | Org-level permissions |
| Queue (BullMQ) | Webhook processing | Transaction processing | Federated queues |
| Audit Log | Agent actions | Compliance trail | Cross-org audit |
| Knowledge Graph | Tool rankings | Merchant intelligence | Network intelligence |
