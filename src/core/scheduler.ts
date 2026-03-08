import { Queue, type JobsOptions } from 'bullmq'
import type { AgentType } from '../types.js'
import { router } from '../router.js'
import { getDb } from './db.js'

const connection = {
  host: new URL(process.env.REDIS_URL || 'redis://localhost:6379').hostname,
  port: parseInt(new URL(process.env.REDIS_URL || 'redis://localhost:6379').port || '6379'),
}

const cronQueue = new Queue('software-factory-cron', { connection })

interface CronJob {
  agentType: AgentType
  pattern: string
  enabled: boolean
}

const CRON_JOBS: CronJob[] = [
  { agentType: 'backfill', pattern: '0 1 * * *', enabled: true },
  { agentType: 'signal-harvester', pattern: '0 2 * * *', enabled: true },
  { agentType: 'tool-discovery', pattern: '0 3 * * *', enabled: true },
  { agentType: 'drift-detector', pattern: '0 4 * * *', enabled: true },
  { agentType: 'integration-tester', pattern: '0 5 * * 0', enabled: false }, // Sundays, disabled until Docker
]

export async function startCronScheduler(): Promise<void> {
  // Remove all existing repeatable jobs to reset schedule
  const existing = await cronQueue.getRepeatableJobs()
  for (const job of existing) {
    await cronQueue.removeRepeatableByKey(job.key)
  }

  for (const job of CRON_JOBS) {
    if (!job.enabled) {
      console.log(`[scheduler] Skipping disabled cron: ${job.agentType}`)
      continue
    }

    await cronQueue.add(
      job.agentType,
      { agentType: job.agentType },
      {
        repeat: { pattern: job.pattern },
        jobId: `cron-${job.agentType}`,
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    )

    console.log(`[scheduler] Registered cron: ${job.agentType} @ ${job.pattern}`)
  }

  // Process cron jobs by dispatching through router
  const { Worker } = await import('bullmq')
  const worker = new Worker(
    'software-factory-cron',
    async (job) => {
      const agentType = job.data.agentType as AgentType

      // Get last run state
      const state = getDb()
        .prepare('SELECT last_run_at FROM cron_job_state WHERE agent_type = ?')
        .get(agentType) as { last_run_at: string | null } | undefined

      const lastRunAt = state?.last_run_at ?? null

      console.log(`[scheduler] Firing cron: ${agentType} (last run: ${lastRunAt || 'never'})`)

      await router.dispatchCron(agentType, job.opts.repeat?.pattern || '', lastRunAt)

      // Update state
      getDb()
        .prepare(
          `INSERT INTO cron_job_state (agent_type, last_run_at, last_status)
           VALUES (?, datetime('now'), 'success')
           ON CONFLICT(agent_type) DO UPDATE SET last_run_at = datetime('now'), last_status = 'success', consecutive_failures = 0`,
        )
        .run(agentType)
    },
    { connection, concurrency: 1 },
  )

  worker.on('failed', (job, err) => {
    const agentType = job?.data?.agentType
    console.error(`[scheduler] Cron ${agentType} failed:`, err.message)
    if (agentType) {
      getDb()
        .prepare(
          `INSERT INTO cron_job_state (agent_type, last_run_at, last_status, consecutive_failures)
           VALUES (?, datetime('now'), 'failure', 1)
           ON CONFLICT(agent_type) DO UPDATE SET last_run_at = datetime('now'), last_status = 'failure', consecutive_failures = consecutive_failures + 1`,
        )
        .run(agentType)
    }
  })

  console.log('[scheduler] Cron scheduler started')
}

export async function triggerCron(agentType: AgentType): Promise<void> {
  const state = getDb()
    .prepare('SELECT last_run_at FROM cron_job_state WHERE agent_type = ?')
    .get(agentType) as { last_run_at: string | null } | undefined

  await router.dispatchCron(agentType, 'manual', state?.last_run_at ?? null)
}
