import { File } from 'node:buffer'
import { describe, expect, it } from 'vitest'
import {
  createFileQueueItems,
  fileQueueReducer,
  type FileQueueItem,
} from '../src/features/file-queue/file-queue-state'
import { ToolError } from '../src/lib/errors/tool-error'

function createFiles(): globalThis.File[] {
  return ['ok.png', 'broken.png'].map(
    (name) => new File(['data'], name, { type: 'image/png' }) as unknown as globalThis.File,
  )
}

describe('file queue integration', () => {
  it('isolates a failed file from successful items and supports retry', () => {
    const newItems = createFileQueueItems(createFiles())
    const [successItem, failedItem] = newItems
    if (!successItem || !failedItem) throw new Error('Expected two queue items')

    let state: readonly FileQueueItem[] = fileQueueReducer([], { type: 'add', items: newItems })
    state = fileQueueReducer(state, { type: 'start', id: successItem.id })
    state = fileQueueReducer(state, { type: 'start', id: failedItem.id })
    state = fileQueueReducer(state, {
      type: 'success',
      id: successItem.id,
      result: { blob: new Blob(['ok']), fileName: 'ok.webp' },
    })
    state = fileQueueReducer(state, {
      type: 'error',
      id: failedItem.id,
      error: new ToolError('DECODE_FAILED', 'broken image', { stage: 'decode' }),
    })

    expect(state.find((item) => item.id === successItem.id)?.status).toBe('success')
    expect(state.find((item) => item.id === failedItem.id)?.status).toBe('error')

    state = fileQueueReducer(state, { type: 'retry', id: failedItem.id })

    expect(state.find((item) => item.id === successItem.id)?.status).toBe('success')
    expect(state.find((item) => item.id === failedItem.id)).toMatchObject({
      status: 'queued',
      progress: 0,
      error: undefined,
      result: undefined,
    })
  })
})
