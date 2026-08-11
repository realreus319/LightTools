'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@appica/ui-react/button'
import { Input } from '@appica/ui-react/input'
import { FileDropzone } from '@/components/file-dropzone/file-dropzone'
import { FileQueueList } from '@/features/file-queue/file-queue-list'
import {
  createFileQueueItems,
  type FileQueueItem,
  type NewFileQueueItem,
} from '@/features/file-queue/file-queue-state'
import { useFileQueue } from '@/features/file-queue/use-file-queue'
import type { Locale } from '@/i18n/config'
import { getToolErrorMessage } from '@/lib/errors/error-messages'
import { toToolError } from '@/lib/errors/tool-error'
import { createZipBlob } from '@/lib/files/create-zip'
import { downloadBlob } from '@/lib/files/download-blob'
import { IMAGE_FILE_POLICY, validateBatchLimits } from '@/lib/files/file-policy'
import { formatFileSize } from '@/lib/files/format-file-size'
import { validateFile } from '@/lib/files/validate-file'
import type { WorkerClientPool } from '@/lib/workers/worker-client-pool'
import { getImageTransformCopy, type ImageTransformMode } from './copy'
import { createImageWorkerPool } from '../shared/create-image-worker-pool'
import { createImageOutputName } from '../shared/image-output-name'
import {
  isSupportedImageMime,
  type ImageProcessPayload,
  type ImageProcessResult,
  type SupportedImageMime,
} from '../shared/image-types'

type ImageTransformToolProps = {
  locale: Locale
  mode: ImageTransformMode
}

export function ImageTransformTool({ locale, mode }: ImageTransformToolProps) {
  const copy = getImageTransformCopy(locale, mode)
  const { items, dispatch } = useFileQueue()
  const [quality, setQuality] = useState(mode === 'metadata' ? 95 : 85)
  const [outputMime, setOutputMime] = useState<SupportedImageMime>('image/webp')
  const [maxWidth, setMaxWidth] = useState('')
  const [maxHeight, setMaxHeight] = useState('')
  const [batchError, setBatchError] = useState<string>()
  const poolRef = useRef<WorkerClientPool | undefined>(undefined)
  const controllersRef = useRef(new Map<string, AbortController>())

  const getPool = useCallback(() => {
    poolRef.current ??= createImageWorkerPool()
    return poolRef.current
  }, [])

  const processItem = useCallback(
    async (item: NewFileQueueItem | FileQueueItem) => {
      const controller = new AbortController()
      controllersRef.current.set(item.id, controller)
      dispatch({ type: 'start', id: item.id })

      try {
        const validation = await validateFile(item.file, IMAGE_FILE_POLICY)
        if (!isSupportedImageMime(validation.mimeType)) throw new TypeError('Unsupported validated image MIME')
        const inputMime = validation.mimeType
        const width = Number.parseInt(maxWidth, 10)
        const height = Number.parseInt(maxHeight, 10)
        const buffer = await item.file.arrayBuffer()
        const payload: ImageProcessPayload = {
          buffer,
          inputMime,
          outputMime: mode === 'convert' ? outputMime : inputMime,
          quality,
          ...(mode === 'resize' && Number.isFinite(width) && width > 0 ? { maxWidth: width } : {}),
          ...(mode === 'resize' && Number.isFinite(height) && height > 0 ? { maxHeight: height } : {}),
        }
        const result = await getPool().run<ImageProcessResult>('process-image', payload, {
          signal: controller.signal,
          transfer: [buffer],
          onProgress: (progress) => dispatch({ type: 'progress', id: item.id, progress }),
        })
        const blob = new Blob([result.buffer], { type: result.mime })
        dispatch({
          type: 'success',
          id: item.id,
          result: { blob, fileName: createImageOutputName(item.file.name, result.mime) },
        })
      } catch (error) {
        const toolError = toToolError(error)
        dispatch(
          toolError.code === 'TASK_CANCELLED'
            ? { type: 'cancel', id: item.id }
            : { type: 'error', id: item.id, error: toolError },
        )
      } finally {
        controllersRef.current.delete(item.id)
      }
    },
    [dispatch, getPool, maxHeight, maxWidth, mode, outputMime, quality],
  )

  useEffect(() => {
    const controllers = controllersRef.current
    return () => {
      for (const controller of controllers.values()) controller.abort()
      controllers.clear()
      poolRef.current?.dispose()
      poolRef.current = undefined
    }
  }, [])

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      setBatchError(undefined)
      try {
        validateBatchLimits([...items.map((item) => item.file), ...files], IMAGE_FILE_POLICY)
      } catch (error) {
        const toolError = toToolError(error)
        setBatchError(getToolErrorMessage(locale, toolError.code))
        return
      }
      const additions = createFileQueueItems(files)
      dispatch({ type: 'add', items: additions })
      for (const item of additions) void processItem(item)
    },
    [dispatch, items, locale, processItem],
  )

  const successful = useMemo(
    () => items.filter((item) => item.status === 'success' && item.result),
    [items],
  )

  const retry = (id: string) => {
    const item = items.find((candidate) => candidate.id === id)
    if (!item) return
    dispatch({ type: 'retry', id })
    void processItem(item)
  }

  const remove = (id: string) => {
    controllersRef.current.get(id)?.abort()
    dispatch({ type: 'remove', id })
  }

  const clearAll = () => {
    for (const controller of controllersRef.current.values()) controller.abort()
    dispatch({ type: 'clear' })
    setBatchError(undefined)
  }

  const downloadAll = async () => {
    const entries = successful.flatMap((item) =>
      item.result ? [{ name: item.result.fileName, blob: item.result.blob }] : [],
    )
    if (!entries.length) return
    try {
      downloadBlob(await createZipBlob(entries), 'lighttools-images.zip')
    } catch (error) {
      const toolError = toToolError(error)
      setBatchError(getToolErrorMessage(locale, toolError.code))
    }
  }

  return (
    <div className="space-y-6">
      {mode !== 'metadata' ? (
        <section className="grid gap-4 rounded-3xl border border-border bg-background p-5 sm:grid-cols-2 sm:p-6">
          {mode === 'convert' ? (
            <label className="grid gap-2 text-sm font-medium">
              <span>{copy.outputFormat}</span>
              <select
                value={outputMime}
                onChange={(event) => setOutputMime(event.currentTarget.value as SupportedImageMime)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
              >
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
                <option value="image/avif">AVIF</option>
              </select>
            </label>
          ) : null}
          {mode === 'resize' ? (
            <>
              <label className="grid gap-2 text-sm font-medium">
                <span>{copy.width}</span>
                <Input type="number" min="1" inputMode="numeric" value={maxWidth} onChange={(event) => setMaxWidth(event.currentTarget.value)} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                <span>{copy.height}</span>
                <Input type="number" min="1" inputMode="numeric" value={maxHeight} onChange={(event) => setMaxHeight(event.currentTarget.value)} />
              </label>
            </>
          ) : null}
          {mode === 'convert' ? (
            <label className="grid gap-2 text-sm font-medium">
              <span>{copy.quality}: {quality}</span>
              <input type="range" min="1" max="100" value={quality} onChange={(event) => setQuality(event.currentTarget.valueAsNumber)} className="accent-[var(--lt-brand)]" />
            </label>
          ) : null}
        </section>
      ) : null}

      <FileDropzone policy={IMAGE_FILE_POLICY} labels={copy.dropzone} onFilesSelected={handleFilesSelected} />
      {batchError ? (
        <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <strong>{copy.batchError}:</strong> {batchError}
        </div>
      ) : null}
      <FileQueueList
        items={items}
        locale={locale}
        labels={copy.queue}
        getErrorMessage={(item) => (item.error ? getToolErrorMessage(locale, item.error.code) : undefined)}
        onRetry={retry}
        onRemove={remove}
      />

      {successful.length ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{copy.result}</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => void downloadAll()}>{copy.downloadAll}</Button>
              <Button variant="ghost" onClick={clearAll}>{copy.clearAll}</Button>
            </div>
          </div>
          <div className="grid gap-3">
            {successful.map((item) => {
              const result = item.result
              if (!result) return null
              return (
                <article key={item.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium" title={result.fileName}>{result.fileName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatFileSize(item.file.size, locale)} → {formatFileSize(result.blob.size, locale)}</p>
                  </div>
                  <Button onClick={() => downloadBlob(result.blob, result.fileName)}>{copy.download}</Button>
                </article>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
