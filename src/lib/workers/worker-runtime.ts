import { isToolError, ToolError, toToolError } from '@/lib/errors/tool-error'
import type { WorkerHandlers, WorkerRequest, WorkerResponse } from './protocol'

type WorkerScope = {
  addEventListener(type: 'message', listener: (event: MessageEvent<WorkerRequest>) => void): void
  postMessage(message: WorkerResponse, transfer?: Transferable[]): void
}

function isWorkerRequest(value: unknown): value is WorkerRequest {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  if (typeof record.id !== 'string') return false
  if (record.type === 'cancel') return true
  return record.type === 'run' && typeof record.task === 'string' && 'payload' in record
}

export function installWorkerRuntime(scope: WorkerScope, handlers: WorkerHandlers): void {
  const cancelled = new Set<string>()

  scope.addEventListener('message', (event) => {
    if (!isWorkerRequest(event.data)) return
    const request = event.data
    if (request.type === 'cancel') {
      cancelled.add(request.id)
      return
    }

    const handler = handlers[request.task]
    if (!handler) {
      scope.postMessage({
        type: 'error',
        id: request.id,
        error: { code: 'UNKNOWN_ERROR', message: `Unknown worker task: ${request.task}`, stage: 'worker' },
      })
      return
    }

    void (async () => {
      try {
        const context = {
          signal: {
            get aborted() {
              return cancelled.has(request.id)
            },
          },
          reportProgress(progress: number) {
            if (cancelled.has(request.id)) return
            scope.postMessage({
              type: 'progress',
              id: request.id,
              progress: Math.max(0, Math.min(1, progress)),
            })
          },
          throwIfCancelled() {
            if (cancelled.has(request.id)) {
              throw new ToolError('TASK_CANCELLED', 'Task cancelled', { stage: 'worker' })
            }
          },
        }
        const output = await handler(request.payload, context)
        context.throwIfCancelled()
        scope.postMessage({ type: 'success', id: request.id, result: output.result }, output.transfer)
      } catch (error) {
        const toolError = isToolError(error) ? error : toToolError(error)
        scope.postMessage({
          type: 'error',
          id: request.id,
          error: { code: toolError.code, message: toolError.message, stage: toolError.stage },
        })
      } finally {
        cancelled.delete(request.id)
      }
    })()
  })
}
