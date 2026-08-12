import { ConcurrencyPool } from './concurrency-pool'
import { WorkerClient, type WorkerRunOptions } from './worker-client'

export class WorkerClientPool {
  private readonly clients: WorkerClient[]
  private readonly available: WorkerClient[]
  private readonly concurrency: ConcurrencyPool
  private disposed = false

  constructor(workerFactory: () => Worker, size: number) {
    if (!Number.isInteger(size) || size < 1) {
      throw new RangeError('Worker pool size must be a positive integer')
    }

    this.clients = Array.from({ length: size }, () => new WorkerClient(workerFactory()))
    this.available = [...this.clients]
    this.concurrency = new ConcurrencyPool(size)
  }

  run<TResult>(task: string, payload: unknown, options: WorkerRunOptions = {}): Promise<TResult> {
    if (this.disposed) {
      return Promise.reject(new Error('Worker pool is disposed'))
    }

    return this.concurrency.schedule(async () => {
      const client = this.available.pop()
      if (!client) {
        throw new Error('Worker pool invariant violated: no available client')
      }

      try {
        return await client.run<TResult>(task, payload, options)
      } finally {
        this.available.push(client)
      }
    }, options.signal)
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    for (const client of this.clients) client.dispose()
    this.available.length = 0
  }
}

export function getRecommendedWorkerCount(maximum = 2): number {
  if (typeof navigator === 'undefined') return 1
  const hardwareConcurrency = Math.max(1, navigator.hardwareConcurrency || 2)
  return Math.max(1, Math.min(maximum, hardwareConcurrency - 1))
}
