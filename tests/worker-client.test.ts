import { describe, expect, it } from 'vitest'
import { WorkerClient } from '../src/lib/workers/worker-client'
import type { WorkerRequest, WorkerResponse } from '../src/lib/workers/protocol'

class FakeWorker extends EventTarget {
  readonly posted: WorkerRequest[] = []
  terminated = false

  postMessage(message: WorkerRequest): void {
    this.posted.push(message)
  }

  terminate(): void {
    this.terminated = true
  }

  respond(response: WorkerResponse): void {
    this.dispatchEvent(new MessageEvent('message', { data: response }))
  }
}

function getRunRequest(worker: FakeWorker): Extract<WorkerRequest, { type: 'run' }> {
  const request = worker.posted.find(
    (candidate): candidate is Extract<WorkerRequest, { type: 'run' }> => candidate.type === 'run',
  )
  if (!request) throw new Error('Expected a run request')
  return request
}

describe('WorkerClient integration', () => {
  it('runs a task, forwards progress, and resolves the worker result', async () => {
    const worker = new FakeWorker()
    const client = new WorkerClient(worker as unknown as Worker)
    const progress: number[] = []

    const pending = client.run<{ ok: boolean }>('echo', { value: 1 }, {
      onProgress: (value) => progress.push(value),
    })
    const request = getRunRequest(worker)

    worker.respond({ type: 'progress', id: request.id, progress: 1.5 })
    worker.respond({ type: 'success', id: request.id, result: { ok: true } })

    await expect(pending).resolves.toEqual({ ok: true })
    expect(progress).toEqual([1])
    client.dispose()
    expect(worker.terminated).toBe(true)
  })

  it('cancels an active task through AbortSignal without leaking the pending task', async () => {
    const worker = new FakeWorker()
    const client = new WorkerClient(worker as unknown as Worker)
    const controller = new AbortController()

    const pending = client.run('slow-task', {}, { signal: controller.signal })
    const request = getRunRequest(worker)
    controller.abort()

    await expect(pending).rejects.toMatchObject({ code: 'TASK_CANCELLED', stage: 'worker' })
    expect(worker.posted).toContainEqual({ type: 'cancel', id: request.id })
    client.dispose()
  })

  it('rejects pending work when disposed', async () => {
    const worker = new FakeWorker()
    const client = new WorkerClient(worker as unknown as Worker)
    const pending = client.run('pending', {})

    client.dispose()

    await expect(pending).rejects.toMatchObject({ code: 'WORKER_CRASHED', stage: 'worker' })
    expect(worker.terminated).toBe(true)
  })
})
