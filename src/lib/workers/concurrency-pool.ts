import { ToolError } from '@/lib/errors/tool-error'

type QueueEntry = {
  run(): Promise<void>
}

export class ConcurrencyPool {
  private readonly queue: QueueEntry[] = []
  private running = 0

  constructor(readonly limit: number) {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new RangeError('Concurrency limit must be a positive integer')
    }
  }

  schedule<T>(task: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const entry: QueueEntry = {
        run: async () => {
          if (signal?.aborted) {
            reject(
              new ToolError('TASK_CANCELLED', 'Task cancelled before execution', {
                stage: 'worker',
              }),
            )
            return
          }
          try {
            resolve(await task())
          } catch (error) {
            reject(error)
          }
        },
      }
      this.queue.push(entry)
      this.pump()
    })
  }

  get activeCount(): number {
    return this.running
  }

  get pendingCount(): number {
    return this.queue.length
  }

  private pump(): void {
    while (this.running < this.limit) {
      const entry = this.queue.shift()
      if (!entry) return
      this.running += 1
      void entry.run().finally(() => {
        this.running -= 1
        this.pump()
      })
    }
  }
}
