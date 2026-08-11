import type { WorkerRuntimeScope } from '@/lib/workers/worker-runtime'
import { installWorkerRuntime } from '@/lib/workers/worker-runtime'
import { processImage } from '../shared/image-codec'
import { isSupportedImageMime, type ImageProcessPayload } from '../shared/image-types'

function parsePayload(value: unknown): ImageProcessPayload {
  if (!value || typeof value !== 'object') throw new TypeError('Invalid image payload')
  const payload = value as Partial<ImageProcessPayload>
  if (!(payload.buffer instanceof ArrayBuffer)) throw new TypeError('Image payload is missing buffer')
  if (!payload.inputMime || !isSupportedImageMime(payload.inputMime)) throw new TypeError('Unsupported input mime')
  if (!payload.outputMime || !isSupportedImageMime(payload.outputMime)) throw new TypeError('Unsupported output mime')
  if (typeof payload.quality !== 'number') throw new TypeError('Image payload is missing quality')
  return payload as ImageProcessPayload
}

installWorkerRuntime(self as unknown as WorkerRuntimeScope, {
  'process-image': async (value, context) => {
    context.reportProgress(0.05)
    const payload = parsePayload(value)
    context.throwIfCancelled()
    const result = await processImage(payload)
    context.throwIfCancelled()
    context.reportProgress(1)
    return { result, transfer: [result.buffer] }
  },
})
