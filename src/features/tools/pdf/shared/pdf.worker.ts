import type { WorkerRuntimeScope } from '@/lib/workers/worker-runtime'
import { installWorkerRuntime } from '@/lib/workers/worker-runtime'
import {
  extractPdfPages,
  imagesToPdf,
  inspectPdf,
  mergePdfDocuments,
  splitPdfPages,
  type ImageToPdfOptions,
  type PdfImageInput,
} from './pdf-engine'

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

function readImages(value: unknown): PdfImageInput[] {
  if (!Array.isArray(value)) throw new TypeError('Image-to-PDF task is missing images')
  return value.map((item) => {
    if (!item || typeof item !== 'object') throw new TypeError('Invalid image input')
    const record = item as Record<string, unknown>
    const mime = record.mime
    if (mime !== 'image/jpeg' && mime !== 'image/png') {
      throw new TypeError('PDF embedding supports only JPEG and PNG inputs')
    }
    return { buffer: readBuffer(record.buffer), mime }
  })
}

function readImageToPdfOptions(value: unknown): ImageToPdfOptions {
  if (!value || typeof value !== 'object') throw new TypeError('Image-to-PDF options are missing')
  const record = value as Record<string, unknown>
  const pageSize = record.pageSize
  const orientation = record.orientation
  const margin = record.margin
  if (pageSize !== 'fit' && pageSize !== 'a4' && pageSize !== 'letter') {
    throw new TypeError('Invalid PDF page size')
  }
  if (orientation !== 'auto' && orientation !== 'portrait' && orientation !== 'landscape') {
    throw new TypeError('Invalid PDF orientation')
  }
  if (typeof margin !== 'number' || !Number.isFinite(margin)) {
    throw new TypeError('Invalid PDF margin')
  }
  return { pageSize, orientation, margin }
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
  'images-to-pdf': async (value, context) => {
    const payload = value as { images?: unknown; options?: unknown }
    context.reportProgress(0.05)
    const images = readImages(payload.images)
    const options = readImageToPdfOptions(payload.options)
    context.throwIfCancelled()
    const buffer = await imagesToPdf(images, options)
    context.throwIfCancelled()
    context.reportProgress(1)
    return { result: { buffer }, transfer: [buffer] }
  },
})
