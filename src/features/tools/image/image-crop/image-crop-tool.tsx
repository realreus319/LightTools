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
import { createImageWorkerPool } from '../shared/create-image-worker-pool'
import { createImageOutputName } from '../shared/image-output-name'
import type { ImagePixelTransform } from '../shared/image-pixel-transform'
import {
  isSupportedImageMime,
  type ImageProcessPayload,
  type ImageProcessResult,
  type SupportedImageMime,
} from '../shared/image-types'

type CropPreset = 'free' | '1:1' | '4:3' | '16:9'
type OutputFormat = 'same' | SupportedImageMime

type CropResultStats = {
  width: number
  height: number
  quality: number
  mime: SupportedImageMime
}

function getCopy(locale: Locale) {
  const zh = locale === 'zh-CN'
  return {
    dropzone: {
      title: zh ? '选择图片并裁剪' : 'Choose images to crop',
      description: zh
        ? '裁剪、旋转和翻转都在浏览器 Worker 中完成，原图不会上传服务器。'
        : 'Crop, rotate, and flip inside browser workers without uploading the source image.',
      chooseFiles: zh ? '选择图片' : 'Choose images',
      dropActive: zh ? '松开即可添加图片' : 'Release to add images',
    },
    cropPreset: zh ? '裁剪比例' : 'Crop ratio',
    free: zh ? '自由区域' : 'Free area',
    x: zh ? '左侧起点 %' : 'Left %',
    y: zh ? '顶部起点 %' : 'Top %',
    width: zh ? '区域宽度 %' : 'Width %',
    height: zh ? '区域高度 %' : 'Height %',
    rotate: zh ? '旋转' : 'Rotate',
    flipX: zh ? '水平翻转' : 'Flip horizontal',
    flipY: zh ? '垂直翻转' : 'Flip vertical',
    outputFormat: zh ? '输出格式' : 'Output format',
    sameFormat: zh ? '保持原格式' : 'Keep original format',
    quality: zh ? '质量' : 'Quality',
    jpegBackground: zh ? 'JPEG 背景色' : 'JPEG background',
    dimensions: zh ? '最终尺寸' : 'Final dimensions',
    result: zh ? '处理结果' : 'Results',
    download: zh ? '下载' : 'Download',
    downloadAll: zh ? '下载全部 ZIP' : 'Download all as ZIP',
    clearAll: zh ? '清空' : 'Clear',
    batchError: zh ? '无法添加这批文件' : 'This batch could not be added',
    queue: {
      queued: zh ? '等待处理' : 'Queued',
      processing: zh ? '处理中' : 'Processing',
      success: zh ? '已完成' : 'Complete',
      error: zh ? '失败' : 'Failed',
      cancelled: zh ? '已取消' : 'Cancelled',
      retry: zh ? '重试' : 'Retry',
      remove: zh ? '移除' : 'Remove',
    },
  }
}

function parseHexColor(value: string): readonly [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(value)
  if (!match?.[1]) return [255, 255, 255]
  const hex = match[1]
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ]
}

function createTransform(
  preset: CropPreset,
  values: {
    x: string
    y: string
    width: string
    height: string
    rotate: string
    flipX: boolean
    flipY: boolean
  },
): ImagePixelTransform {
  const crop =
    preset === 'free'
      ? {
          mode: 'free' as const,
          xPercent: Number.parseFloat(values.x) || 0,
          yPercent: Number.parseFloat(values.y) || 0,
          widthPercent: Number.parseFloat(values.width) || 100,
          heightPercent: Number.parseFloat(values.height) || 100,
        }
      : {
          mode: 'aspect' as const,
          aspectRatio: preset === '1:1' ? 1 : preset === '4:3' ? 4 / 3 : 16 / 9,
        }

  const rotation = Number.parseInt(values.rotate, 10)
  const rotate: 0 | 90 | 180 | 270 =
    rotation === 90 || rotation === 180 || rotation === 270 ? rotation : 0

  return {
    crop,
    rotate,
    flipX: values.flipX,
    flipY: values.flipY,
  }
}

export function ImageCropTool({ locale }: { locale: Locale }) {
  const copy = getCopy(locale)
  const { items, dispatch } = useFileQueue()
  const [preset, setPreset] = useState<CropPreset>('1:1')
  const [x, setX] = useState('0')
  const [y, setY] = useState('0')
  const [width, setWidth] = useState('100')
  const [height, setHeight] = useState('100')
  const [rotate, setRotate] = useState('0')
  const [flipX, setFlipX] = useState(false)
  const [flipY, setFlipY] = useState(false)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('same')
  const [quality, setQuality] = useState(92)
  const [jpegBackground, setJpegBackground] = useState('#ffffff')
  const [batchError, setBatchError] = useState<string>()
  const [stats, setStats] = useState<Record<string, CropResultStats>>({})
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
        if (!isSupportedImageMime(validation.mimeType)) {
          throw new TypeError('Unsupported validated image MIME')
        }

        const selectedOutputMime =
          outputFormat === 'same' ? validation.mimeType : outputFormat
        const buffer = await item.file.arrayBuffer()
        const payload: ImageProcessPayload = {
          buffer,
          inputMime: validation.mimeType,
          outputMime: selectedOutputMime,
          quality,
          transform: createTransform(preset, {
            x,
            y,
            width,
            height,
            rotate,
            flipX,
            flipY,
          }),
          ...(selectedOutputMime === 'image/jpeg'
            ? { jpegBackground: parseHexColor(jpegBackground) }
            : {}),
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
          result: {
            blob,
            fileName: createImageOutputName(item.file.name, result.mime),
          },
        })
        setStats((current) => ({
          ...current,
          [item.id]: {
            width: result.width,
            height: result.height,
            quality: result.quality,
            mime: result.mime,
          },
        }))
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
    [
      dispatch,
      flipX,
      flipY,
      getPool,
      height,
      jpegBackground,
      outputFormat,
      preset,
      quality,
      rotate,
      width,
      x,
      y,
    ],
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
    const entries = successful.flatMap((item) =>
      item.result ? [{ name: item.result.fileName, blob: item.result.blob }] : [],
    )
    if (entries.length === 0) return

    try {
      downloadBlob(await createZipBlob(entries), 'lighttools-cropped-images.zip')
    } catch (error) {
      const toolError = toToolError(error)
      setBatchError(getToolErrorMessage(locale, toolError.code))
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-3xl border border-border bg-background p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
        <label className="grid gap-2 text-sm font-medium">
          <span>{copy.cropPreset}</span>
          <select
            value={preset}
            onChange={(event) => setPreset(event.currentTarget.value as CropPreset)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="free">{copy.free}</option>
            <option value="1:1">1:1</option>
            <option value="4:3">4:3</option>
            <option value="16:9">16:9</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span>{copy.rotate}</span>
          <select
            value={rotate}
            onChange={(event) => setRotate(event.currentTarget.value)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="0">0°</option>
            <option value="90">90°</option>
            <option value="180">180°</option>
            <option value="270">270°</option>
          </select>
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

        {outputFormat === 'image/jpeg' ? (
          <label className="grid gap-2 text-sm font-medium">
            <span>{copy.jpegBackground}</span>
            <input
              type="color"
              value={jpegBackground}
              onChange={(event) => setJpegBackground(event.currentTarget.value)}
              className="h-10 w-full cursor-pointer rounded-xl border border-border bg-background p-1"
            />
          </label>
        ) : null}

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={flipX}
            onChange={(event) => setFlipX(event.currentTarget.checked)}
          />
          {copy.flipX}
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={flipY}
            onChange={(event) => setFlipY(event.currentTarget.checked)}
          />
          {copy.flipY}
        </label>

        {preset === 'free' ? (
          <>
            <label className="grid gap-2 text-sm font-medium">
              <span>{copy.x}</span>
              <Input
                type="number"
                min="0"
                max="99"
                value={x}
                onChange={(event) => setX(event.currentTarget.value)}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              <span>{copy.y}</span>
              <Input
                type="number"
                min="0"
                max="99"
                value={y}
                onChange={(event) => setY(event.currentTarget.value)}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              <span>{copy.width}</span>
              <Input
                type="number"
                min="1"
                max="100"
                value={width}
                onChange={(event) => setWidth(event.currentTarget.value)}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              <span>{copy.height}</span>
              <Input
                type="number"
                min="1"
                max="100"
                value={height}
                onChange={(event) => setHeight(event.currentTarget.value)}
              />
            </label>
          </>
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

      {successful.length > 0 ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{copy.result}</h2>
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
            {successful.map((item) => {
              const result = item.result
              if (!result) return null
              const itemStats = stats[item.id]
              return (
                <article
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium" title={result.fileName}>
                      {result.fileName}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatFileSize(item.file.size, locale)} →{' '}
                      {formatFileSize(result.blob.size, locale)}
                      {itemStats
                        ? ` · ${copy.dimensions}: ${itemStats.width}×${itemStats.height}`
                        : ''}
                    </p>
                  </div>
                  <Button onClick={() => downloadBlob(result.blob, result.fileName)}>
                    {copy.download}
                  </Button>
                </article>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
