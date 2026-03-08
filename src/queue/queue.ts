import { Queue } from 'bullmq'
import type { FactoryEvent } from '../types.js'

const connection = {
  host: new URL(process.env.REDIS_URL || 'redis://localhost:6379').hostname,
  port: parseInt(new URL(process.env.REDIS_URL || 'redis://localhost:6379').port || '6379'),
}

export const factoryQueue = new Queue<FactoryEvent>('software-factory', { connection })

export async function enqueueEvent(event: FactoryEvent): Promise<string> {
  const job = await factoryQueue.add(event.type, event, {
    jobId: event.id,
    attempts: 1, // No auto-retry — agents handle their own retry logic
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  })
  console.log(`[queue] Enqueued ${event.type} job ${job.id}`)
  return job.id!
}
