# Cloudflare Sandbox

*Refreshed 2026-11-02*

## What they do

Cloudflare's sandbox docs describe an isolated place to run code, including untrusted or generated code, on the Workers paid plan. The sandbox cannot read the calling application's memory. The docs also describe a container runtime, sessions, and preview URLs.

## What they do well

The boundary is the isolation claim: the Worker decides what the sandbox may do. No customer count is taken from this page.

## Patterns shown

- [Background agents](../patterns/background-agents/README.md) — isolated containers beside Workers

## Key numbers

No quantitative claim is repeated here. The sources describe the system without a figure this profile uses.

## Sources

- [Sandboxes](https://developers.cloudflare.com/sandbox/)
