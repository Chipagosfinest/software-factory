# Modal

*Refreshed 2026-11-02*

## What they do

Modal's sandbox guide documents sandboxes that run commands, expose a filesystem, and take snapshots, including exit snapshots marked beta. Readiness probes cover processes that need warm-up before they serve traffic. That warm-up is not the same thing as a warm pool, which this page does not describe. [Ramp Inspect](./ramp-inspect.md) is the production system in this repo that runs on Modal.

## What they do well

Snapshots are the mechanism that makes a sandbox reusable. The guide does not, by itself, state Ramp's merge rate.

## Patterns shown

- [Background agents](../patterns/background-agents/README.md) — sandboxes with filesystem snapshots

## Key numbers

No quantitative claim is repeated here. The sources describe the system without a figure this profile uses.

## Sources

- [Sandboxes](https://modal.com/docs/guide/sandbox)
