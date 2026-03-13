import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { router } from './router.js'
import { verifyWebhookSignature } from './core/webhook.js'
import { startWorker } from './queue/worker.js'
import { startCronScheduler, triggerCron } from './core/scheduler.js'
import { getAuditLog, getAgentRuns, getCostSummary } from './core/db.js'
import { getFlywheelMetrics } from './core/flywheel.js'
import { startOrchestrator, stopOrchestrator, getOrchestratorStatus } from './orchestrator/orchestrator.js'
import { getOrchestratorMetrics } from './core/db.js'
import type { AgentType } from './types.js'

const app = new Hono()

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'software-factory', version: '0.1.0' }))
app.get('/health', (c) => c.json({ status: 'ok' }))

// GitHub webhook endpoint
app.post('/webhook/github', async (c) => {
  const event = c.req.header('x-github-event')
  const signature = c.req.header('x-hub-signature-256')
  const deliveryId = c.req.header('x-github-delivery')

  if (!event || !signature || !deliveryId) {
    return c.json({ error: 'Missing webhook headers' }, 400)
  }

  const body = await c.req.text()

  // Verify webhook signature
  const secret = process.env.GITHUB_WEBHOOK_SECRET
  if (secret && !verifyWebhookSignature(body, signature, secret)) {
    return c.json({ error: 'Invalid signature' }, 401)
  }

  const payload = JSON.parse(body)
  const result = await router.dispatch(event, payload, deliveryId)

  if (result.dispatched) {
    return c.json({ status: 'dispatched', agent: result.agentType, eventId: result.eventId })
  }

  return c.json({ status: 'ignored', reason: result.reason })
})

// Manual trigger endpoint
app.post('/trigger/:agent', async (c) => {
  const agentType = c.req.param('agent') as AgentType
  console.log(`[manual] Triggering ${agentType} agent`)
  await triggerCron(agentType)
  return c.json({ status: 'triggered', agent: agentType })
})

// Cron trigger endpoint
app.post('/cron/:agent/trigger', async (c) => {
  const agentType = c.req.param('agent') as AgentType
  console.log(`[cron] Manual trigger for ${agentType}`)
  await triggerCron(agentType)
  return c.json({ status: 'triggered', agent: agentType })
})

// Audit log endpoint
app.get('/audit', (c) => {
  const limit = parseInt(c.req.query('limit') || '50')
  const entries = getAuditLog(limit)
  return c.json({ entries })
})

// Agent runs endpoint
app.get('/runs', (c) => {
  const limit = parseInt(c.req.query('limit') || '50')
  const runs = getAgentRuns(limit)
  return c.json({ runs })
})

// Cost summary endpoint
app.get('/costs', (c) => {
  const summary = getCostSummary()
  return c.json(summary)
})

// Flywheel metrics endpoints
app.get('/graph/metrics', async (c) => {
  try {
    const metrics = await getFlywheelMetrics()
    return c.json(metrics)
  } catch (error) {
    return c.json({ error: 'Supabase not configured' }, 503)
  }
})

// ─── Orchestrator endpoints ─────────────────────────────────

app.get('/orchestrator/status', (c) => {
  return c.json(getOrchestratorStatus())
})

app.get('/orchestrator/tasks', (c) => {
  const metrics = getOrchestratorMetrics()
  return c.json(metrics)
})

app.post('/orchestrator/start', async (c) => {
  await startOrchestrator()
  return c.json({ status: 'started' })
})

app.post('/orchestrator/stop', (c) => {
  stopOrchestrator()
  return c.json({ status: 'stopped' })
})

const port = parseInt(process.env.PORT || '3847')

console.log(`Software Factory starting on port ${port}`)

// Start BullMQ worker
startWorker()

// Start cron scheduler (only if Redis is available)
startCronScheduler().catch((err) => {
  console.warn('[startup] Cron scheduler failed to start (Redis may not be running):', err.message)
})

// Start orchestrator (Symphony-style reconciliation loop)
startOrchestrator().catch((err) => {
  console.warn('[startup] Orchestrator failed to start:', err.message)
})

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Listening on http://localhost:${info.port}`)
  console.log(`Webhook URL: POST /webhook/github`)
  console.log(`Health: GET /health`)
  console.log(`Audit: GET /audit`)
  console.log(`Runs: GET /runs`)
  console.log(`Costs: GET /costs`)
  console.log(`Graph: GET /graph/metrics`)
})
