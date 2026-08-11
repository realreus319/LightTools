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
import { WorkerClientPool, getRecommendedWorkerCount } from '@/lib/workers/worker-client-pool'
import { getImageCompressCopy } from './copy'
import { createImageOutputName } from '../shared/image-output-name'
import {
  isSupportedImageMime,
  type ImageProcessPayload,
  type ImageProcessResult,
  type SupportedImageMime,
} from '../shared/image-types'

type OutputFormat = 'same' | SupportedImageMime

type ImageStats = {
  outputBytes: number
  width: number
  height: number
  mime: SupportedImageMime
  quality: number
  attempts: number
  targetReached?: boolean
}

function createPool(): WorkerClientPool {
  return new WorkerClientPool(
    () => new Worker(new URL('./image-compress.worker.ts', import.meta.url), { type: 'module' }),
    getRecommendedWorkerCount(2),
  )
}

export function ImageCompressTool({ locale }: { locale: Locale }) {
  const copy = getImageCompressCopy(locale)
  const { items, dispatch } = useFileQueue()
  const [quality, setQuality] = useState(80)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('same')
  const [maxDimension, setMaxDimension] = useState('')
  const [targetSizeKb, setTargetSizeKb] = useState('')
  const [batchError, setBatchError] = useState<string>()
  const [stats, setStats] = useState<Record<string, ImageStats>>({})
  const poolRef = useRef<WorkerClientPool | undefined>(undefined)
  const controllersRef = useRef(new Map<string, AbortController>())

  const getPool = useCallback(() => {
    poolRef.current ??= createPool()
    return poolRef.current
  }, [])

  const processItem = useCallback(
    async (item: NewFileQueueItem | FileQueueItem) => {
      const controller = new AbortController()
      controllersRef.current.set(item.id, controller)
      dispatch({ type: 'start', id: item.id })

      try {
        const validation = await validateFile(item.file, IMAGE_FILE_POLICY)
        if (!isSupportedImageMime(validation.mimeType)) {
          throw new TypeError('Validated image MIME is not supported by the image worker')
        }

        const inputMime = validation.mimeType
        const outputMime = outputFormat === 'same' ? inputMime : outputFormat
        const dimensionLimit = Number.parseInt(maxDimension, 10)
        const targetKilobytes = Number.parseFloat(targetSizeKb)
        const buffer = await item.file.arrayBuffer()
        const payload: ImageProcessPayload = {
          buffer,
          inputMime,
          outputMime,
          quality,
          ...(Number.isFinite(dimensionLimit) && dimensionLimit > 0
            ? { maxWidth: dimensionLimit, maxHeight: dimensionLimit }
            : {}),
          ...(Number.isFinite(targetKilobytes) && targetKilobytes > 0
            ? { targetBytes: Math.round(targetKilobytes * 1024) }
            : {}),
        }
        const result = await getPool().run<ImageProcessResult>('process-image', payload, {
          signal: controller.signal,
          transfer: [buffer],
          onProgress: (progress) => dispatch({ type: 'progress', id: item.id, progress }),
        })
        const blob = new Blob([result.buffer], { type: result.mime })
        const fileName = createImageOutputName(item.file.name, result.mime)
        dispatch({ type: 'success', id: item.id, result: { blob, fileName } })
        setStats((current) => ({
          ...current,
          [item.id]: {
            outputBytes: blob.size,
            width: result.width,
            height: result.height,
            mime: result.mime,
            quality: result.quality,
            attempts: result.attempts,
            targetReached: result.targetReached,
          },
        }))
      } catch (error) {
        const toolError = toToolError(error)
        if (toolError.code === 'TASK_CANCELLED') {
          dispatch({ type: 'cancel', id: item.id })
        } else {
          dispatch({ type: 'error', id: item.id, error: toolError })
        }
      } finally {
        controllersRef.current.delete(item.id)
      }
    },
    [dispatch, getPool, maxDimension, outputFormat, quality, targetSizeKb],
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

      const newItems = createFileQueueItems(files)
      dispatch({ type: 'add', items: newItems })
      for (const item of newItems) void processItem(item)
    },
    [dispatch, items, locale, processItem],
  )

  const successItems = useMemo(
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
    setStats((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  const clearAll = () => {
    for (const controller of controllersRef.current.values()) controller.abort()
    dispatch({ type: 'clear' })
    setStats({})
    setBatchError(undefined)
  }

  const downloadAll = async () => {
    const entries = successItems.flatMap((item) =>
      item.result ? [{ name: item.result.fileName, blob: item.result.blob }] : [],
    )
    if (entries.length === 0) return
    try {
      const archive = await createZipBlob(entries)
      downloadBlob(archive, 'lighttools-images.zip')
    } catch (error) {
      const toolError = toToolError(error)
      setBatchError(getToolErrorMessage(locale, toolError.code))
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-3xl border border-border bg-background p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
        <label className="grid gap-2 text-sm font-medium">
          <span>
            {copy.quality}: {quality}
          </span>
          <input
            type="range"
            min="1"
            max="100"
            value={quality}
            onChange={(event) => setQuality(event.currentTarget.valueAsNumber)}
            className="accent-[var(--lt-brand)]"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span>{copy.outputFormat}</span>
          <select
            value={outputFormat}
            onChange={(event) => setOutputFormat(event.currentTarget.value as OutputFormat)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="same">{copy.sameFormat}</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
            <option value="image/avif">AVIF</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span>{copy.maxDimension}</span>
          <Input
            type="number"
            min="1"
            inputMode="numeric"
            placeholder="2048"
            value={maxDimension}
            onChange={(event) => setMaxDimension(event.currentTarget.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span>{copy.targetSize}</span>
          <Input
            type="number"
            min="1"
            step="1"
            inputMode="decimal"
            placeholder="100"
            value={targetSizeKb}
            onChange={(event) => setTargetSizeKb(event.currentTarget.value)}
          />
        </label>
        {outputFormat === 'image/png' ? (
          <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-4">{copy.pngQualityNote}</p>
        ) : null}
      </section>

      <FileDropzone
        policy={IMAGE_FILE_POLICY}
        labels={copy.dropzone}
        onFilesSelected={handleFilesSelected}
      />

      {batchError ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <strong>{copy.batchError}:</strong> {batchError}
        </div>
      ) : null}

      <FileQueueList
        items={items}
        locale={locale}
        labels={copy.queue}
        getErrorMessage={(item) =>
          item.error ? getToolErrorMessage(locale, item.error.code) : undefined
        }
        onRetry={retry}
        onRemove={remove}
      />

      {successItems.length > 0 ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{copy.resultSize}</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => void downloadAll()}>
                {copy.downloadAll}
              </Button>
              <Button variant="ghost" onClick={clearAll}>
                {copy.clearAll}
              </Button>
            </div>
          </div>
          <div className="grid gap-3">
            {successItems.map((item) => {
              const result = item.result
              if (!result) return null
              const itemStats = stats[item.id]
              const savings = itemStats
                ? Math.round((1 - itemStats.outputBytes / item.file.size) * 100)
                : 0
              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-border bg-background p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <p className="truncate font-medium" title={result.fileName}>
                        {result.fileName}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {copy.originalSize}: {formatFileSize(item.file.size, locale)} ·{' '}
                        {copy.resultSize}: {formatFileSize(result.blob.size, locale)}
                        {itemStats
                          ? ` · ${copy.saved}: ${savings}% · ${copy.dimensions}: ${itemStats.width}×${itemStats.height} · ${copy.finalQuality}: ${itemStats.quality}`
                          : ''}
                      </p>
                      {itemStats?.targetReached !== undefined ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {itemStats.targetReached ? copy.targetReached : copy.targetClosest} · {copy.attempts}: {itemStats.attempts}
                        </p>
                      ) : null}
                    </div>
                    <Button onClick={() => downloadBlob(result.blob, result.fileName)}>
                      {copy.download}
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
