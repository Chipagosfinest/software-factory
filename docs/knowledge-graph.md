# Knowledge Graph Expansion

The ProductRank knowledge graph grows across five dimensions through autonomous cron agents.

## Five Dimensions

### 1. Breadth — New Tools
**Agent:** Tool Discovery (daily, 3:00 AM)
Scans GitHub trending, HN, ProductHunt, and newsletters for new developer tools. Adds them to the discovery queue with `confidence: 0`.

### 2. Depth — Rich Profiles
**Agent:** Backfill (daily, 1:00 AM)
Enriches incomplete product profiles with descriptions, categories, pricing, tags, and alternatives.

### 3. Accuracy — Fresh Signals
**Agent:** Signal Harvester (daily, 2:00 AM)
Refreshes quantitative signals: GitHub stars, npm downloads, PR velocity, issue response time.

### 4. Reliability — Drift Detection
**Agent:** Drift Detector (daily, 4:00 AM)
Checks for deprecated, archived, acquired, or pricing-changed tools. Flags drift events and queues successor discovery.

### 5. Completeness — Integration Testing
**Agent:** Integration Tester (weekly, Sundays 5:00 AM)
Verifies tools work with claimed stacks in Docker sandboxes. Currently disabled until Docker is enabled.

## The Review-Driven Flywheel

Every agent review cycle makes the graph both larger and more reliable:

```
DISCOVER → VALIDATE → BACKFILL → DISCOVER
   (new)    (verify)    (gaps)     (more)
```

Each validation updates a product's `confidence` score (0.0 → 1.0). Products graduate from "raw" to "trusted" as confidence accumulates across review cycles.

## Confidence Scoring

| Agent | Dimension | Delta |
|-------|-----------|-------|
| Signal Harvester | signals_verified | +0.3 |
| Drift Detector | drift_checked | +0.2 |
| Integration Tester | integration_tested | +0.3 |
| Backfill | profile_complete | +0.2 |

A product reaching confidence >= 0.8 is considered "trusted" and ranks normally. Below 0.8, it's weighted down in GraphRank.

## Daily Cost

| Agent | Budget | Source |
|-------|--------|--------|
| Tool Discovery | $1.50 | LLM (Gemini Flash) |
| Signal Harvester | $0.00 | Free APIs (GitHub, npm) |
| Drift Detector | $0.50 | LLM (Gemini Flash) |
| Backfill | $3.00 | LLM (Claude Sonnet) |
| Integration Tester | $0.00 | Local Docker |
| **Total** | **~$5/day** | **~$150/month** |
