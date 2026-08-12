import { ToolError } from '@/lib/errors/tool-error'

export type PdfRenderFormat = 'image/png' | 'image/jpeg' | 'image/webp'

export type PdfRenderedPage = {
  pageNumber: number
  blob: Blob
  width: number
  height: number
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: PdfRenderFormat,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else
          reject(
            new ToolError('ENCODE_FAILED', 'Canvas could not encode PDF page', { stage: 'encode' }),
          )
      },
      format,
      Math.max(0.01, Math.min(1, quality / 100)),
    )
  })
}

function mapPdfJsError(error: unknown): ToolError {
  const message = error instanceof Error ? error.message : String(error)
  const name = error instanceof Error ? error.name : ''
  if (/password/i.test(message) || /PasswordException/i.test(name)) {
    return new ToolError('PDF_ENCRYPTED', 'PDF is password protected', {
      stage: 'decode',
      cause: error,
    })
  }
  return new ToolError('PDF_INVALID', 'PDF could not be rendered', {
    stage: 'decode',
    cause: error,
  })
}

export async function renderPdfToImages(
  buffer: ArrayBuffer,
  options: {
    scale: number
    format: PdfRenderFormat
    quality: number
    signal?: AbortSignal
    onProgress?: (progress: number) => void
  },
): Promise<PdfRenderedPage[]> {
  try {
    const pdfjs = await import('pdfjs-dist/webpack.mjs')
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      stopAtErrors: true,
      useWasm: false,
      maxImageSize: 80_000_000,
    })
    const document = await loadingTask.promise
    const pages: PdfRenderedPage[] = []

    try {
      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
        if (options.signal?.aborted) {
          throw new ToolError('TASK_CANCELLED', 'PDF rendering cancelled', { stage: 'transform' })
        }

        const page = await document.getPage(pageNumber)
        const viewport = page.getViewport({ scale: options.scale })
        const width = Math.max(1, Math.ceil(viewport.width))
        const height = Math.max(1, Math.ceil(viewport.height))
        if (width * height > 40_000_000) {
          throw new ToolError('IMAGE_TOO_LARGE', 'Rendered PDF page exceeds pixel safety limit', {
            stage: 'transform',
          })
        }

        const canvas = globalThis.document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d', { alpha: options.format === 'image/png' })
        if (!context)
          throw new ToolError('ENCODE_FAILED', 'Canvas 2D context is unavailable', {
            stage: 'transform',
          })

        if (options.format !== 'image/png') {
          context.fillStyle = '#ffffff'
          context.fillRect(0, 0, width, height)
        }

        await page.render({ canvas, canvasContext: context, viewport }).promise
        const blob = await canvasToBlob(canvas, options.format, options.quality)
        pages.push({ pageNumber, blob, width, height })
        page.cleanup()
        canvas.width = 1
        canvas.height = 1
        options.onProgress?.(pageNumber / document.numPages)
      }
      return pages
    } finally {
      await document.destroy()
    }
  } catch (error) {
    if (error instanceof ToolError) throw error
    throw mapPdfJsError(error)
  }
}
