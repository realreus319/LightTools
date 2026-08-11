import type { ToolError } from '@/lib/errors/tool-error'

export type FileQueueResult = {
  blob: Blob
  fileName: string
}

export type FileQueueStatus = 'queued' | 'processing' | 'success' | 'error' | 'cancelled'

export type FileQueueItem = {
  id: string
  file: File
  status: FileQueueStatus
  progress: number
  result?: FileQueueResult
  error?: ToolError
}

export type FileQueueAction =
  | { type: 'add'; files: readonly File[] }
  | { type: 'start'; id: string }
  | { type: 'progress'; id: string; progress: number }
  | { type: 'success'; id: string; result: FileQueueResult }
  | { type: 'error'; id: string; error: ToolError }
  | { type: 'cancel'; id: string }
  | { type: 'retry'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'clear' }

function updateItem(
  items: readonly FileQueueItem[],
  id: string,
  update: (item: FileQueueItem) => FileQueueItem,
): FileQueueItem[] {
  return items.map((item) => (item.id === id ? update(item) : item))
}

export function fileQueueReducer(
  items: readonly FileQueueItem[],
  action: FileQueueAction,
): readonly FileQueueItem[] {
  switch (action.type) {
    case 'add':
      return [
        ...items,
        ...action.files.map((file) => ({
          id: crypto.randomUUID(),
          file,
          status: 'queued' as const,
          progress: 0,
        })),
      ]
    case 'start':
      return updateItem(items, action.id, (item) => ({
        ...item,
        status: 'processing',
        progress: 0,
        error: undefined,
      }))
    case 'progress':
      return updateItem(items, action.id, (item) => ({
        ...item,
        progress: Math.max(0, Math.min(1, action.progress)),
      }))
    case 'success':
      return updateItem(items, action.id, (item) => ({
        ...item,
        status: 'success',
        progress: 1,
        result: action.result,
        error: undefined,
      }))
    case 'error':
      return updateItem(items, action.id, (item) => ({
        ...item,
        status: 'error',
        error: action.error,
      }))
    case 'cancel':
      return updateItem(items, action.id, (item) => ({
        ...item,
        status: 'cancelled',
        progress: 0,
      }))
    case 'retry':
      return updateItem(items, action.id, (item) => ({
        ...item,
        status: 'queued',
        progress: 0,
        error: undefined,
        result: undefined,
      }))
    case 'remove':
      return items.filter((item) => item.id !== action.id)
    case 'clear':
      return []
  }
}
