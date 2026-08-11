import { ToolError } from '@/lib/errors/tool-error'

const MIB = 1024 * 1024

export type FilePolicy = {
  maxFiles: number
  maxFileBytes: number
  maxTotalBytes: number
  maxPixels?: number
  acceptedMimeTypes: readonly string[]
}

export const IMAGE_FILE_POLICY: FilePolicy = Object.freeze({
  maxFiles: 50,
  maxFileBytes: 50 * MIB,
  maxTotalBytes: 250 * MIB,
  maxPixels: 80_000_000,
  acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
})

export const PDF_FILE_POLICY: FilePolicy = Object.freeze({
  maxFiles: 50,
  maxFileBytes: 200 * MIB,
  maxTotalBytes: 500 * MIB,
  acceptedMimeTypes: ['application/pdf'],
})

export function matchesAcceptedMime(mimeType: string, acceptedMimeTypes: readonly string[]): boolean {
  return acceptedMimeTypes.some((accepted) => {
    if (accepted.endsWith('/*')) {
      return mimeType.startsWith(`${accepted.slice(0, -1)}`)
    }
    return mimeType === accepted
  })
}

export function validateBatchLimits(files: readonly File[], policy: FilePolicy): void {
  if (files.length > policy.maxFiles) {
    throw new ToolError('TOO_MANY_FILES', 'Too many files selected', { stage: 'validation' })
  }

  const totalBytes = files.reduce((total, file) => total + file.size, 0)
  if (totalBytes > policy.maxTotalBytes) {
    throw new ToolError('BATCH_TOO_LARGE', 'Selected batch is too large', { stage: 'validation' })
  }
}
