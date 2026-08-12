import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import {
  extractPdfPages,
  inspectPdf,
  mergePdfDocuments,
  splitPdfPages,
} from '../src/features/tools/pdf/shared/pdf-engine'

async function createPdf(pageCount: number): Promise<ArrayBuffer> {
  const document = await PDFDocument.create()
  for (let index = 0; index < pageCount; index += 1) {
    const page = document.addPage([320 + index, 240 + index])
    page.drawText(`page-${index + 1}`, { x: 20, y: 20 })
  }
  const bytes = await document.save()
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

describe('PDF engine integration', () => {
  it('merges documents while preserving all pages', async () => {
    const merged = await mergePdfDocuments([await createPdf(1), await createPdf(2)])
    await expect(inspectPdf(merged)).resolves.toEqual({ pageCount: 3 })
  })

  it('extracts a selected range into one PDF', async () => {
    const source = await createPdf(4)
    const extracted = await extractPdfPages(source, [0, 2, 3])
    await expect(inspectPdf(extracted)).resolves.toEqual({ pageCount: 3 })
  })

  it('splits selected pages into independent one-page PDFs', async () => {
    const outputs = await splitPdfPages(await createPdf(3), [0, 2])
    expect(outputs).toHaveLength(2)
    await expect(Promise.all(outputs.map((output) => inspectPdf(output)))).resolves.toEqual([
      { pageCount: 1 },
      { pageCount: 1 },
    ])
  })
})
