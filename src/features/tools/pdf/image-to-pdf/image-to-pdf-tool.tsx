'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@appica/ui-react/button'
import { Input } from '@appica/ui-react/input'
import { FileDropzone } from '@/components/file-dropzone/file-dropzone'
import { createImageWorkerPool } from '@/features/tools/image/shared/create-image-worker-pool'
import {
  isSupportedImageMime,
  type ImageProcessResult,
} from '@/features/tools/image/shared/image-types'
import type { Locale } from '@/i18n/config'
import { getToolErrorMessage } from '@/lib/errors/error-messages'
import { toToolError } from '@/lib/errors/tool-error'
import { downloadBlob } from '@/lib/files/download-blob'
import { IMAGE_FILE_POLICY, validateBatchLimits } from '@/lib/files/file-policy'
import { formatFileSize } from '@/lib/files/format-file-size'
import { validateFile } from '@/lib/files/validate-file'
import type { WorkerClientPool } from '@/lib/workers/worker-client-pool'
import { createPdfWorkerPool } from '../shared/create-pdf-worker-pool'

type PageSize = 'fit' | 'a4' | 'letter'
type Orientation = 'auto' | 'portrait' | 'landscape'
type PdfResult = { buffer: ArrayBuffer }

type NormalizedImage = {
  buffer: ArrayBuffer
  mime: 'image/jpeg' | 'image/png'
}

function getCopy(locale: Locale) {
  const zh = locale === 'zh-CN'
  return {
    title: zh ? '选择图片生成 PDF' : 'Choose images to build a PDF',
    description: zh
      ? 'JPEG、PNG 会直接嵌入；WebP、AVIF 会先在浏览器 Worker 中转为 PNG。'
      : 'JPEG and PNG are embedded directly; WebP and AVIF are converted to PNG in a browser worker first.',
    choose: zh ? '选择图片' : 'Choose images',
    drop: zh ? '松开即可添加图片' : 'Release to add images',
    pageSize: zh ? '页面尺寸' : 'Page size',
    fit: zh ? '适应图片' : 'Fit image',
    a4: 'A4',
    letter: 'Letter',
    orientation: zh ? '页面方向' : 'Orientation',
    auto: zh ? '自动' : 'Auto',
    portrait: zh ? '纵向' : 'Portrait',
    landscape: zh ? '横向' : 'Landscape',
    margin: zh ? '边距（pt）' : 'Margin (pt)',
    moveUp: zh ? '上移' : 'Move up',
    moveDown: zh ? '下移' : 'Move down',
    remove: zh ? '移除' : 'Remove',
    create: zh ? '生成 PDF' : 'Create PDF',
    creating: zh ? '正在生成…' : 'Creating…',
    download: zh ? '下载 PDF' : 'Download PDF',
    error: zh ? '生成失败' : 'PDF creation failed',
  }
}

export function ImageToPdfTool({ locale }: { locale: Locale }) {
  const copy = getCopy(locale)
  const [files, setFiles] = useState<File[]>([])
  const [pageSize, setPageSize] = useState<PageSize>('fit')
  const [orientation, setOrientation] = useState<Orientation>('auto')
  const [margin, setMargin] = useState('18')
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [result, setResult] = useState<Blob>()
  const imagePoolRef = useRef<WorkerClientPool | undefined>(undefined)
  const pdfPoolRef = useRef<WorkerClientPool | undefined>(undefined)

  const getImagePool = useCallback(() => {
    imagePoolRef.current ??= createImageWorkerPool()
    return imagePoolRef.current
  }, [])
  const getPdfPool = useCallback(() => {
    pdfPoolRef.current ??= createPdfWorkerPool()
    return pdfPoolRef.current
  }, [])

  useEffect(
    () => () => {
      imagePoolRef.current?.dispose()
      pdfPoolRef.current?.dispose()
    },
    [],
  )

  const handleFiles = useCallback(
    async (selected: File[]) => {
      setErrorMessage(undefined)
      setResult(undefined)
      try {
        validateBatchLimits([...files, ...selected], IMAGE_FILE_POLICY)
        await Promise.all(selected.map((file) => validateFile(file, IMAGE_FILE_POLICY)))
        setFiles((current) => [...current, ...selected])
      } catch (error) {
        const toolError = toToolError(error)
        setErrorMessage(getToolErrorMessage(locale, toolError.code))
      }
    },
    [files, locale],
  )

  const moveFile = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= files.length) return
    setFiles((current) => {
      const next = [...current]
      const [file] = next.splice(index, 1)
      if (!file) return current
      next.splice(target, 0, file)
      return next
    })
  }

  const normalizeImage = useCallback(
    async (file: File): Promise<NormalizedImage> => {
      const validation = await validateFile(file, IMAGE_FILE_POLICY)
      if (!isSupportedImageMime(validation.mimeType)) throw new TypeError('Unsupported image MIME')
      const source = await file.arrayBuffer()
      if (validation.mimeType === 'image/jpeg' || validation.mimeType === 'image/png') {
        return { buffer: source, mime: validation.mimeType }
      }

      const converted = await getImagePool().run<ImageProcessResult>(
        'process-image',
        {
          buffer: source,
          inputMime: validation.mimeType,
          outputMime: 'image/png',
          quality: 100,
        },
        { transfer: [source] },
      )
      return { buffer: converted.buffer, mime: 'image/png' }
    },
    [getImagePool],
  )

  const createPdf = async () => {
    if (files.length === 0) return
    setBusy(true)
    setResult(undefined)
    setErrorMessage(undefined)
    try {
      const images = await Promise.all(files.map(normalizeImage))
      const output = await getPdfPool().run<PdfResult>(
        'images-to-pdf',
        {
          images,
          options: {
            pageSize,
            orientation,
            margin: Math.max(0, Number.parseFloat(margin) || 0),
          },
        },
        { transfer: images.map((image) => image.buffer) },
      )
      setResult(new Blob([output.buffer], { type: 'application/pdf' }))
    } catch (error) {
      const toolError = toToolError(error)
      setErrorMessage(getToolErrorMessage(locale, toolError.code))
    } finally {
      setBusy(false)
    }
  }

  const totalBytes = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files])

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-3xl border border-border bg-background p-5 sm:grid-cols-3 sm:p-6">
        <label className="grid gap-2 text-sm font-medium">
          <span>{copy.pageSize}</span>
          <select
            value={pageSize}
            onChange={(event) => setPageSize(event.currentTarget.value as PageSize)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="fit">{copy.fit}</option>
            <option value="a4">{copy.a4}</option>
            <option value="letter">{copy.letter}</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span>{copy.orientation}</span>
          <select
            value={orientation}
            onChange={(event) => setOrientation(event.currentTarget.value as Orientation)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="auto">{copy.auto}</option>
            <option value="portrait">{copy.portrait}</option>
            <option value="landscape">{copy.landscape}</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span>{copy.margin}</span>
          <Input
            type="number"
            min="0"
            max="144"
            value={margin}
            onChange={(event) => setMargin(event.currentTarget.value)}
          />
        </label>
      </section>

      <FileDropzone
        policy={IMAGE_FILE_POLICY}
        labels={{
          title: copy.title,
          description: copy.description,
          chooseFiles: copy.choose,
          dropActive: copy.drop,
        }}
        onFilesSelected={(selected) => void handleFiles(selected)}
      />

      {files.length > 0 ? (
        <div className="space-y-3">
          {files.map((file, index) => (
            <article
              key={`${file.name}-${file.lastModified}-${index}`}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{file.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatFileSize(file.size, locale)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => moveFile(index, -1)}
                >
                  {copy.moveUp}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === files.length - 1}
                  onClick={() => moveFile(index, 1)}
                >
                  {copy.moveDown}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))
                  }
                >
                  {copy.remove}
                </Button>
              </div>
            </article>
          ))}
          <p className="text-xs text-muted-foreground">{formatFileSize(totalBytes, locale)}</p>
        </div>
      ) : null}

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {copy.error}: {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button disabled={files.length === 0 || busy} onClick={() => void createPdf()}>
          {busy ? copy.creating : copy.create}
        </Button>
        {result ? (
          <Button variant="outline" onClick={() => downloadBlob(result, 'lighttools-images.pdf')}>
            {copy.download}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
