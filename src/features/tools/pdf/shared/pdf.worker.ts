import type { WorkerRuntimeScope } from '@/lib/workers/worker-runtime'
import { installWorkerRuntime } from '@/lib/workers/worker-runtime'
import { extractPdfPages, inspectPdf, mergePdfDocuments, splitPdfPages } from './pdf-engine'

function readBuffer(value: unknown): ArrayBuffer {
  if (!(value instanceof ArrayBuffer)) throw new TypeError('PDF task is missing a buffer')
  return value
}

function readIndices(value: unknown): number[] {
  if (!Array.isArray(value) || !value.every((item) => Number.isInteger(item))) {
    throw new TypeError('PDF task is missing page indices')
  }
  return value as number[]
}

installWorkerRuntime(self as unknown as WorkerRuntimeScope, {
  'inspect-pdf': async (value) => {
    const payload = value as { buffer?: unknown }
    return { result: await inspectPdf(readBuffer(payload.buffer)) }
  },
  'merge-pdfs': async (value, context) => {
    const payload = value as { buffers?: unknown }
    if (!Array.isArray(payload.buffers)) throw new TypeError('PDF merge task is missing buffers')
    const buffers = payload.buffers.map(readBuffer)
    context.reportProgress(0.05)
    context.throwIfCancelled()
    const buffer = await mergePdfDocuments(buffers)
    context.throwIfCancelled()
    context.reportProgress(1)
    return { result: { buffer }, transfer: [buffer] }
  },
  'extract-pdf-pages': async (value, context) => {
    const payload = value as { buffer?: unknown; indices?: unknown }
    context.reportProgress(0.1)
    const buffer = await extractPdfPages(readBuffer(payload.buffer), readIndices(payload.indices))
    context.throwIfCancelled()
    context.reportProgress(1)
    return { result: { buffer }, transfer: [buffer] }
  },
  'split-pdf-pages': async (value, context) => {
    const payload = value as { buffer?: unknown; indices?: unknown }
    context.reportProgress(0.1)
    const buffers = await splitPdfPages(readBuffer(payload.buffer), readIndices(payload.indices))
    context.throwIfCancelled()
    context.reportProgress(1)
    return { result: { buffers }, transfer: buffers }
  },
})
