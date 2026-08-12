import { PDFDocument } from 'pdf-lib'
import { ToolError } from '@/lib/errors/tool-error'

function copyArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

function mapPdfLoadError(error: unknown): ToolError {
  const message = error instanceof Error ? error.message : String(error)
  if (/encrypt|password|password-protected/i.test(message)) {
    return new ToolError('PDF_ENCRYPTED', 'PDF is encrypted or password protected', {
      stage: 'decode',
      cause: error,
    })
  }
  return new ToolError('PDF_INVALID', 'PDF could not be loaded', {
    stage: 'decode',
    cause: error,
  })
}

async function loadPdf(buffer: ArrayBuffer): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(buffer, { updateMetadata: false })
  } catch (error) {
    throw mapPdfLoadError(error)
  }
}

export async function inspectPdf(buffer: ArrayBuffer): Promise<{ pageCount: number }> {
  const document = await loadPdf(buffer)
  return { pageCount: document.getPageCount() }
}

export async function mergePdfDocuments(buffers: readonly ArrayBuffer[]): Promise<ArrayBuffer> {
  if (buffers.length < 1) throw new RangeError('At least one PDF is required')

  const output = await PDFDocument.create()
  for (const buffer of buffers) {
    const source = await loadPdf(buffer)
    const indices = source.getPageIndices()
    const pages = await output.copyPages(source, indices)
    for (const page of pages) output.addPage(page)
  }

  return copyArrayBuffer(await output.save())
}

function validatePageIndices(indices: readonly number[], pageCount: number): void {
  if (indices.length < 1) throw new RangeError('At least one page is required')
  for (const index of indices) {
    if (!Number.isInteger(index) || index < 0 || index >= pageCount) {
      throw new RangeError(`Invalid PDF page index: ${index}`)
    }
  }
}

export async function extractPdfPages(
  buffer: ArrayBuffer,
  indices: readonly number[],
): Promise<ArrayBuffer> {
  const source = await loadPdf(buffer)
  validatePageIndices(indices, source.getPageCount())
  const output = await PDFDocument.create()
  const pages = await output.copyPages(source, [...indices])
  for (const page of pages) output.addPage(page)
  return copyArrayBuffer(await output.save())
}

export async function splitPdfPages(
  buffer: ArrayBuffer,
  indices: readonly number[],
): Promise<ArrayBuffer[]> {
  const source = await loadPdf(buffer)
  validatePageIndices(indices, source.getPageCount())
  const outputs: ArrayBuffer[] = []

  for (const index of indices) {
    const output = await PDFDocument.create()
    const [page] = await output.copyPages(source, [index])
    if (!page) throw new ToolError('PDF_INVALID', 'PDF page could not be copied', { stage: 'transform' })
    output.addPage(page)
    outputs.push(copyArrayBuffer(await output.save()))
  }

  return outputs
}
