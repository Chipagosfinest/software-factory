# CodeRabbit

*Refreshed 2026-11-09*

## What they do

CodeRabbit's docs describe an agent for change management: pull-request review, a CLI, and IDE tools, plus a triage queue that orders pull requests by value and risk. The product site uses the same framing.

## What they do well

Review is the product. On October 30, 2026, CodeRabbit said it committed $1M in tokens over two weeks for free customer security scans; in one week it ran about 10k scans and identified 35,000 critical vulnerabilities.

In a GPT-6 Cyber eval, that model inside CodeRabbit's security scan caught 22 of 33 known vulnerabilities, against 19 for its production ensemble, with 66% more high and medium severity findings.

## Patterns shown

- [Verification](../patterns/verification/README.md) — pull-request review with a CLI and IDE path

## Key numbers

| Figure | Meaning | Source |
|--------|---------|--------|
| $1M | Tokens committed over two weeks for free customer security scans | [2026-10-30 post](https://x.com/coderabbitai/status/2116258631222231179) |
| ~10k | Scans in one week | Same |
| 35,000 | Critical vulnerabilities identified in that week | Same |
| 22 of 33 | Known vulnerabilities caught by GPT-6 Cyber in the security scan | [GPT-6 Cyber eval](https://x.com/coderabbitai/status/2118399600101093813) |
| 19 of 33 | Same set, production ensemble | Same |
| 66% more | High and medium severity findings, GPT-6 Cyber against the ensemble | Same |

## Sources

- [Docs](https://docs.coderabbit.ai)
- [Product](https://www.coderabbit.ai/)
- [Free security scans, 2026-10-30](https://x.com/coderabbitai/status/2116258631222231179)
- [GPT-6 Cyber eval](https://x.com/coderabbitai/status/2118399600101093813)
