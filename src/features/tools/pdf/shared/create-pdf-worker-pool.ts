import { WorkerClientPool } from '@/lib/workers/worker-client-pool'

export function createPdfWorkerPool(): WorkerClientPool {
  return new WorkerClientPool(
    () => new Worker(new URL('./pdf.worker.ts', import.meta.url), { type: 'module' }),
    1,
  )
}
