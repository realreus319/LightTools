import type { ToolErrorCode, ToolStage } from '@/lib/errors/tool-error'

export type WorkerRunRequest = {
  type: 'run'
  id: string
  task: string
  payload: unknown
}

export type WorkerCancelRequest = {
  type: 'cancel'
  id: string
}

export type WorkerRequest = WorkerRunRequest | WorkerCancelRequest

export type WorkerProgressResponse = {
  type: 'progress'
  id: string
  progress: number
}

export type WorkerSuccessResponse = {
  type: 'success'
  id: string
  result: unknown
}

export type WorkerErrorResponse = {
  type: 'error'
  id: string
  error: {
    code: ToolErrorCode
    message: string
    stage?: ToolStage
  }
}

export type WorkerResponse = WorkerProgressResponse | WorkerSuccessResponse | WorkerErrorResponse

export type WorkerHandlerContext = {
  readonly signal: { readonly aborted: boolean }
  reportProgress(progress: number): void
  throwIfCancelled(): void
}

export type WorkerHandlerResult = {
  result: unknown
  transfer?: Transferable[]
}

export type WorkerHandler = (
  payload: unknown,
  context: WorkerHandlerContext,
) => Promise<WorkerHandlerResult> | WorkerHandlerResult

export type WorkerHandlers = Readonly<Record<string, WorkerHandler>>
