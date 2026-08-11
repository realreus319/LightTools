import { ToolError } from '@/lib/errors/tool-error'
import type { FilePolicy } from './file-policy'
import { matchesAcceptedMime } from './file-policy'
import { isExtensionCompatible, readFileSignature, sniffMimeType } from './file-signature'

export type FileValidationResult = {
  mimeType: string
}

export async function validateFile(file: File, policy: FilePolicy): Promise<FileValidationResult> {
  if (file.size === 0) {
    throw new ToolError('EMPTY_FILE', 'File is empty', { stage: 'validation' })
  }
  if (file.size > policy.maxFileBytes) {
    throw new ToolError('FILE_TOO_LARGE', 'File exceeds size limit', { stage: 'validation' })
  }

  const signature = await readFileSignature(file)
  const sniffedMime = sniffMimeType(signature)
  const declaredMime = file.type.trim().toLowerCase()
  const effectiveMime = sniffedMime ?? declaredMime

  if (!effectiveMime || !matchesAcceptedMime(effectiveMime, policy.acceptedMimeTypes)) {
    throw new ToolError('UNSUPPORTED_FORMAT', 'Unsupported file format', { stage: 'validation' })
  }

  if (sniffedMime && declaredMime && sniffedMime !== declaredMime) {
    throw new ToolError('FILE_TYPE_MISMATCH', 'Declared MIME does not match file contents', {
      stage: 'validation',
    })
  }

  if (!isExtensionCompatible(file.name, effectiveMime)) {
    throw new ToolError('FILE_TYPE_MISMATCH', 'File extension does not match file contents', {
      stage: 'validation',
    })
  }

  return { mimeType: effectiveMime }
}
