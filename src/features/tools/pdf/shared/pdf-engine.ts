import { PDFDocument } from 'pdf-lib'
import { ToolError } from '@/lib/errors/tool-error'

export type PdfImageInput = {
  buffer: ArrayBuffer
  mime: 'image/jpeg' | 'image/png'
}

export type ImageToPdfOptions = {
  pageSize: 'fit' | 'a4' | 'letter'
  orientation: 'auto' | 'portrait' | 'landscape'
  margin: number
}

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
    if (!page) {
      throw new ToolError('PDF_INVALID', 'PDF page could not be copied', { stage: 'transform' })
    }
    output.addPage(page)
    outputs.push(copyArrayBuffer(await output.save()))
  }

  return outputs
}

function getPageDimensions(
  naturalWidth: number,
  naturalHeight: number,
  options: ImageToPdfOptions,
): readonly [number, number] {
  const margin = Math.max(0, Math.min(144, options.margin))
  let width: number
  let height: number

  if (options.pageSize === 'a4') {
    width = 595.28
    height = 841.89
  } else if (options.pageSize === 'letter') {
    width = 612
    height = 792
  } else {
    // 图片像素按 96 DPI 换算到 PDF 的 72 pt/in，避免把 4K 图片做成超大物理页面。
    width = naturalWidth * 0.75 + margin * 2
    height = naturalHeight * 0.75 + margin * 2
  }

  const orientation =
    options.orientation === 'auto'
      ? naturalWidth >= naturalHeight
        ? 'landscape'
        : 'portrait'
      : options.orientation
  const currentlyLandscape = width >= height
  if ((orientation === 'landscape') !== currentlyLandscape) {
    return [height, width]
  }
  return [width, height]
}

export async function imagesToPdf(
  images: readonly PdfImageInput[],
  options: ImageToPdfOptions,
): Promise<ArrayBuffer> {
  if (images.length < 1) throw new RangeError('At least one image is required')
  const output = await PDFDocument.create()
  const margin = Math.max(0, Math.min(144, options.margin))

  for (const imageInput of images) {
    const image =
      imageInput.mime === 'image/jpeg'
        ? await output.embedJpg(imageInput.buffer)
        : await output.embedPng(imageInput.buffer)
    const [pageWidth, pageHeight] = getPageDimensions(image.width, image.height, options)
    const page = output.addPage([pageWidth, pageHeight])
    const availableWidth = Math.max(1, pageWidth - margin * 2)
    const availableHeight = Math.max(1, pageHeight - margin * 2)
    const scale = Math.min(availableWidth / image.width, availableHeight / image.height)
    const drawWidth = image.width * scale
    const drawHeight = image.height * scale

    page.drawImage(image, {
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    })
  }

  return copyArrayBuffer(await output.save())
}
