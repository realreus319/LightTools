import { describe, expect, it } from 'vitest'
import {
  IMAGE_FILE_POLICY,
  PDF_FILE_POLICY,
  validateBatchLimits,
} from '../src/lib/files/file-policy'
import { validateFile } from '../src/lib/files/validate-file'

function sizedFile(size: number, name = 'virtual.bin', type = 'application/octet-stream'): File {
  return { size, name, type } as File
}

describe('memory protection guards', () => {
  it('rejects oversized image batches before any payload allocation or processing', () => {
    const files = Array.from({ length: IMAGE_FILE_POLICY.maxFiles }, (_, index) =>
      sizedFile(IMAGE_FILE_POLICY.maxFileBytes, `image-${index}.png`, 'image/png'),
    )

    expect(() => validateBatchLimits(files, IMAGE_FILE_POLICY)).toThrowError(
      expect.objectContaining({ code: 'BATCH_TOO_LARGE', stage: 'validation' }),
    )
  })

  it('rejects a PDF over the per-file memory limit before reading its signature', async () => {
    const oversized = sizedFile(
      PDF_FILE_POLICY.maxFileBytes + 1,
      'huge.pdf',
      'application/pdf',
    )

    await expect(validateFile(oversized, PDF_FILE_POLICY)).rejects.toMatchObject({
      code: 'FILE_TOO_LARGE',
      stage: 'validation',
    })
  })

  it('rejects an oversized PDF batch using metadata only', () => {
    const files = [
      sizedFile(260 * 1024 * 1024, 'a.pdf', 'application/pdf'),
      sizedFile(260 * 1024 * 1024, 'b.pdf', 'application/pdf'),
    ]

    expect(() => validateBatchLimits(files, PDF_FILE_POLICY)).toThrowError(
      expect.objectContaining({ code: 'BATCH_TOO_LARGE', stage: 'validation' }),
    )
  })
})
