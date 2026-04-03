import { Worker, Job } from 'bullmq'
import type { FactoryEvent } from '../types.js'
import { runAgent } from '../agents/runner.js'
import { isExecutionAllowed } from '../core/executor-gate.js'
import { recordAudit } from '../core/db.js'
import { redisConnection } from '../core/redis.js'

async function processJob(job: Job<FactoryEvent>): Promise<void> {
  const event = job.data

  const gate = isExecutionAllowed(event.type)
  if (!gate.allowed) {
    console.log(`[worker] Blocked by executor gate: ${gate.reason}`)
    recordAudit({
      eventId: event.id,
      agentType: event.type,
      action: 'blocked',
      detail: gate.reason || 'Executor gate blocked',
    })
    return
  }

  await runAgent(event)
}

let _worker: Worker | null = null

export function startWorker(): Worker {
  if (_worker) return _worker

  _worker = new Worker<FactoryEvent>('software-factory', processJob, {
    connection: redisConnection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '3'),
    limiter: {
      max: 10,
      duration: 60_000,
    },
  })

  _worker.on('completed', (job) => {
    console.log(`[worker] Job ${job.id} (${job.name}) completed`)
  })

  _worker.on('failed', (job, err) => {
    console.error(`[worker] Job ${job?.id} (${job?.name}) failed:`, err.message)
  })

  console.log('[worker] BullMQ worker started')
  return _worker
}

export function stopWorker(): Promise<void> {
  if (_worker) {
    const w = _worker
    _worker = null
    return w.close()
  }
  return Promise.resolve()
}
