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
import { ImageComparisonPreview } from '../shared/image-comparison-preview'
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

type CompressionPresetValue = {
  quality: number
  outputFormat: OutputFormat
  maxDimension: string
  targetSizeKb: string
}

type StoredCompressionPreset = {
  id: string
  name: string
  value: CompressionPresetValue
}

const PRESET_STORAGE_KEY = 'lighttools:image-compress-presets:v1'
const MAX_CUSTOM_PRESETS = 12

const BUILT_IN_PRESETS: readonly StoredCompressionPreset[] = [
  {
    id: 'web-balanced',
    name: 'Web Balanced',
    value: { quality: 80, outputFormat: 'image/webp', maxDimension: '1920', targetSizeKb: '' },
  },
  {
    id: 'small-file',
    name: 'Small File',
    value: { quality: 68, outputFormat: 'image/webp', maxDimension: '1600', targetSizeKb: '200' },
  },
  {
    id: 'keep-format',
    name: 'Keep Format',
    value: { quality: 85, outputFormat: 'same', maxDimension: '2048', targetSizeKb: '' },
  },
]

function isOutputFormat(value: unknown): value is OutputFormat {
  return value === 'same' || (typeof value === 'string' && isSupportedImageMime(value))
}

function loadCustomPresets(): StoredCompressionPreset[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PRESET_STORAGE_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((value) => {
      if (!value || typeof value !== 'object') return []
      const record = value as Record<string, unknown>
      const presetValue = record.value
      if (!presetValue || typeof presetValue !== 'object') return []
      const settings = presetValue as Record<string, unknown>
      if (
        typeof record.id !== 'string' ||
        typeof record.name !== 'string' ||
        typeof settings.quality !== 'number' ||
        !isOutputFormat(settings.outputFormat) ||
        typeof settings.maxDimension !== 'string' ||
        typeof settings.targetSizeKb !== 'string'
      ) {
        return []
      }
      return [
        {
          id: record.id,
          name: record.name.slice(0, 40),
          value: {
            quality: Math.max(1, Math.min(100, settings.quality)),
            outputFormat: settings.outputFormat,
            maxDimension: settings.maxDimension,
            targetSizeKb: settings.targetSizeKb,
          },
        },
      ]
    })
  } catch {
    return []
  }
}

function createPool(): WorkerClientPool {
  return new WorkerClientPool(
    () => new Worker(new URL('./image-compress.worker.ts', import.meta.url), { type: 'module' }),
    getRecommendedWorkerCount(2),
  )
}

export function ImageCompressTool({ locale }: { locale: Locale }) {
  const copy = getImageCompressCopy(locale)
  const zh = locale === 'zh-CN'
  const { items, dispatch } = useFileQueue()
  const [quality, setQuality] = useState(80)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('same')
  const [maxDimension, setMaxDimension] = useState('')
  const [targetSizeKb, setTargetSizeKb] = useState('')
  const [batchError, setBatchError] = useState<string>()
  const [stats, setStats] = useState<Record<string, ImageStats>>({})
  const [customPresets, setCustomPresets] = useState<StoredCompressionPreset[]>([])
  const [presetName, setPresetName] = useState('')
  const poolRef = useRef<WorkerClientPool | undefined>(undefined)
  const controllersRef = useRef(new Map<string, AbortController>())

  useEffect(() => {
    setCustomPresets(loadCustomPresets())
  }, [])

  const getPool = useCallback(() => {
    poolRef.current ??= createPool()
    return poolRef.current
  }, [])

  const applyPreset = (preset: StoredCompressionPreset) => {
    setQuality(preset.value.quality)
    setOutputFormat(preset.value.outputFormat)
    setMaxDimension(preset.value.maxDimension)
    setTargetSizeKb(preset.value.targetSizeKb)
  }

  const persistPresets = (presets: StoredCompressionPreset[]) => {
    setCustomPresets(presets)
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets))
  }

  const saveCurrentPreset = () => {
    const name = presetName.trim().slice(0, 40)
    if (!name) return
    const preset: StoredCompressionPreset = {
      id: crypto.randomUUID(),
      name,
      value: { quality, outputFormat, maxDimension, targetSizeKb },
    }
    persistPresets([preset, ...customPresets].slice(0, MAX_CUSTOM_PRESETS))
    setPresetName('')
  }

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
  const firstSuccess = successItems[0]

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
          <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-4">
            {copy.pngQualityNote}
          </p>
        ) : null}
      </section>

      <section className="space-y-4 rounded-3xl border border-border bg-background-muted/30 p-5">
        <div>
          <h2 className="text-sm font-semibold">{zh ? '参数预设' : 'Parameter presets'}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {zh
              ? '预设只保存压缩参数到本机，不保存图片、文件名或正文。'
              : 'Presets save processing parameters locally; images, filenames, and content are never stored.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {BUILT_IN_PRESETS.map((preset) => (
            <Button key={preset.id} variant="outline" size="sm" onClick={() => applyPreset(preset)}>
              {preset.name}
            </Button>
          ))}
          {customPresets.map((preset) => (
            <div key={preset.id} className="inline-flex items-center rounded-xl border border-border bg-background">
              <button type="button" className="px-3 py-2 text-sm font-medium" onClick={() => applyPreset(preset)}>
                {preset.name}
              </button>
              <button
                type="button"
                aria-label={`${zh ? '删除预设' : 'Delete preset'} ${preset.name}`}
                className="border-s border-border px-2 py-2 text-sm text-muted-foreground hover:text-destructive"
                onClick={() => persistPresets(customPresets.filter((item) => item.id !== preset.id))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex max-w-xl flex-col gap-2 sm:flex-row">
          <Input
            value={presetName}
            maxLength={40}
            placeholder={zh ? '自定义预设名称' : 'Custom preset name'}
            onChange={(event) => setPresetName(event.currentTarget.value)}
          />
          <Button variant="outline" disabled={!presetName.trim()} onClick={saveCurrentPreset}>
            {zh ? '保存当前参数' : 'Save current settings'}
          </Button>
        </div>
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

      {firstSuccess?.result ? (
        <ImageComparisonPreview
          original={firstSuccess.file}
          result={firstSuccess.result.blob}
          locale={locale}
        />
      ) : null}

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
                          {itemStats.targetReached ? copy.targetReached : copy.targetClosest} ·{' '}
                          {copy.attempts}: {itemStats.attempts}
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
