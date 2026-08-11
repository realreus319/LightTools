import { ToolError } from '@/lib/errors/tool-error'
import type { WorkerRequest, WorkerResponse } from './protocol'

type PendingTask = {
  resolve(value: unknown): void
  reject(error: unknown): void
  onProgress?: (progress: number) => void
  removeAbortListener?: () => void
}

export type WorkerRunOptions = {
  transfer?: Transferable[]
  signal?: AbortSignal
  onProgress?: (progress: number) => void
}

export class WorkerClient {
  private readonly pending = new Map<string, PendingTask>()
  private disposed = false

  constructor(private readonly worker: Worker) {
    worker.addEventListener('message', this.handleMessage)
    worker.addEventListener('error', this.handleWorkerError)
  }

  run<TResult>(task: string, payload: unknown, options: WorkerRunOptions = {}): Promise<TResult> {
    if (this.disposed) {
      return Promise.reject(
        new ToolError('WORKER_CRASHED', 'Worker client is disposed', { stage: 'worker' }),
      )
    }
    if (options.signal?.aborted) {
      return Promise.reject(
        new ToolError('TASK_CANCELLED', 'Task cancelled before start', { stage: 'worker' }),
      )
    }

    const id = crypto.randomUUID()
    return new Promise<TResult>((resolve, reject) => {
      const pending: PendingTask = {
        resolve: (value) => resolve(value as TResult),
        reject,
        onProgress: options.onProgress,
      }

      if (options.signal) {
        const handleAbort = () => this.cancel(id)
        options.signal.addEventListener('abort', handleAbort, { once: true })
        pending.removeAbortListener = () =>
          options.signal?.removeEventListener('abort', handleAbort)
      }

      this.pending.set(id, pending)
      const request: WorkerRequest = { type: 'run', id, task, payload }
      this.worker.postMessage(request, options.transfer ?? [])
    })
  }

  cancel(id: string): void {
    const pending = this.pending.get(id)
    if (!pending) return
    this.pending.delete(id)
    pending.removeAbortListener?.()
    this.worker.postMessage({ type: 'cancel', id } satisfies WorkerRequest)
    pending.reject(new ToolError('TASK_CANCELLED', 'Task cancelled', { stage: 'worker' }))
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.worker.removeEventListener('message', this.handleMessage)
    this.worker.removeEventListener('error', this.handleWorkerError)
    this.worker.terminate()
    for (const pending of this.pending.values()) {
      pending.removeAbortListener?.()
      pending.reject(new ToolError('WORKER_CRASHED', 'Worker client disposed', { stage: 'worker' }))
    }
    this.pending.clear()
  }

  private readonly handleMessage = (event: MessageEvent<WorkerResponse>) => {
    const response = event.data
    const pending = this.pending.get(response.id)
    if (!pending) return

    if (response.type === 'progress') {
      pending.onProgress?.(Math.max(0, Math.min(1, response.progress)))
      return
    }

    this.pending.delete(response.id)
    pending.removeAbortListener?.()
    if (response.type === 'success') {
      pending.resolve(response.result)
      return
    }
    pending.reject(
      new ToolError(response.error.code, response.error.message, {
        stage: response.error.stage,
      }),
    )
  }

  private readonly handleWorkerError = (event: ErrorEvent) => {
    const error = new ToolError('WORKER_CRASHED', event.message || 'Worker crashed', {
      stage: 'worker',
      cause: event.error,
    })
    for (const pending of this.pending.values()) {
      pending.removeAbortListener?.()
      pending.reject(error)
    }
    this.pending.clear()
  }
}
