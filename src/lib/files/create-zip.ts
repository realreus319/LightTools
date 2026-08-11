import { Zip, ZipPassThrough } from 'fflate'
import { ToolError } from '@/lib/errors/tool-error'
import { createUniqueArchiveNames } from './archive-name'

export type ZipEntry = {
  name: string
  blob: Blob
}

async function pipeBlobToZipFile(blob: Blob, target: ZipPassThrough, signal?: AbortSignal) {
  const reader = blob.stream().getReader()
  try {
    while (true) {
      if (signal?.aborted) throw new ToolError('TASK_CANCELLED', 'Archive cancelled', { stage: 'archive' })
      const { done, value } = await reader.read()
      if (done) break
      target.push(value, false)
    }
    target.push(new Uint8Array(0), true)
  } finally {
    reader.releaseLock()
  }
}

export async function createZipBlob(entries: readonly ZipEntry[], signal?: AbortSignal): Promise<Blob> {
  if (signal?.aborted) {
    throw new ToolError('TASK_CANCELLED', 'Archive cancelled', { stage: 'archive' })
  }

  const names = createUniqueArchiveNames(entries.map((entry) => entry.name))

  return new Promise<Blob>((resolve, reject) => {
    const chunks: Uint8Array[] = []
    let settled = false
    const zip = new Zip((error, data, final) => {
      if (settled) return
      if (error) {
        settled = true
        reject(new ToolError('ZIP_FAILED', 'ZIP creation failed', { stage: 'archive', cause: error }))
        return
      }
      chunks.push(data)
      if (final) {
        settled = true
        resolve(new Blob(chunks, { type: 'application/zip' }))
      }
    })

    void (async () => {
      try {
        for (let index = 0; index < entries.length; index += 1) {
          const entry = entries[index]
          if (!entry) continue
          const file = new ZipPassThrough(names[index] ?? `file-${index + 1}`)
          zip.add(file)
          await pipeBlobToZipFile(entry.blob, file, signal)
        }
        zip.end()
      } catch (error) {
        if (settled) return
        settled = true
        zip.terminate()
        reject(
          error instanceof ToolError
            ? error
            : new ToolError('ZIP_FAILED', 'ZIP creation failed', { stage: 'archive', cause: error }),
        )
      }
    })()
  })
}
