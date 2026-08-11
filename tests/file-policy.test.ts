import { File } from 'node:buffer'
import { describe, expect, it } from 'vitest'
import { IMAGE_FILE_POLICY, validateBatchLimits } from '../src/lib/files/file-policy'
import { validateFile } from '../src/lib/files/validate-file'

function jpegBytes(): Uint8Array {
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46])
}

describe('file validation', () => {
  it('accepts a matching image signature, mime and extension', async () => {
    const file = new File([jpegBytes()], 'photo.jpg', { type: 'image/jpeg' }) as unknown as globalThis.File
    await expect(validateFile(file, IMAGE_FILE_POLICY)).resolves.toEqual({ mimeType: 'image/jpeg' })
  })

  it('rejects a misleading image mime type', async () => {
    const file = new File([jpegBytes()], 'photo.png', { type: 'image/png' }) as unknown as globalThis.File
    await expect(validateFile(file, IMAGE_FILE_POLICY)).rejects.toMatchObject({ code: 'FILE_TYPE_MISMATCH' })
  })

  it('enforces batch file count', () => {
    const files = Array.from(
      { length: IMAGE_FILE_POLICY.maxFiles + 1 },
      (_, index) => new File(['x'], `file-${index}.jpg`, { type: 'image/jpeg' }) as unknown as globalThis.File,
    )
    expect(() => validateBatchLimits(files, IMAGE_FILE_POLICY)).toThrow('Too many files selected')
  })
})
