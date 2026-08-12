import { WorkerClientPool, getRecommendedWorkerCount } from '@/lib/workers/worker-client-pool'

export function createImageWorkerPool(): WorkerClientPool {
  return new WorkerClientPool(
    () =>
      new Worker(new URL('../image-compress/image-compress.worker.ts', import.meta.url), {
        type: 'module',
      }),
    getRecommendedWorkerCount(2),
  )
}
