'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@appica/ui-react/button'
import { FileDropzone } from '@/components/file-dropzone/file-dropzone'
import type { Locale } from '@/i18n/config'
import { getToolErrorMessage } from '@/lib/errors/error-messages'
import { toToolError } from '@/lib/errors/tool-error'
import { createZipBlob } from '@/lib/files/create-zip'
import { downloadBlob } from '@/lib/files/download-blob'
import { PDF_FILE_POLICY } from '@/lib/files/file-policy'
import { formatFileSize } from '@/lib/files/format-file-size'
import { validateFile } from '@/lib/files/validate-file'
import type { WorkerClientPool } from '@/lib/workers/worker-client-pool'
import { createPdfWorkerPool } from '../shared/create-pdf-worker-pool'
import { getSafePdfStem } from '../shared/pdf-output-name'
import { renderPdfToImages, type PdfRenderFormat } from './pdf-renderer'

type InspectResult = { pageCount: number }

function getCopy(locale: Locale) {
  const zh = locale === 'zh-CN'
  return {
    title: zh ? '选择 PDF 转成图片' : 'Choose a PDF to convert to images',
    description: zh
      ? 'PDF.js 在浏览器中解析页面，逐页渲染后直接生成下载文件。'
      : 'PDF.js parses the document in-browser and renders each page directly to downloadable images.',
    choose: zh ? '选择 PDF' : 'Choose PDF',
    drop: zh ? '松开即可添加 PDF' : 'Release to add PDF',
    format: zh ? '输出格式' : 'Output format',
    scale: zh ? '渲染倍率' : 'Render scale',
    quality: zh ? '质量' : 'Quality',
    pages: zh ? '页' : 'pages',
    convert: zh ? '转换全部页面' : 'Convert all pages',
    converting: zh ? '正在转换…' : 'Converting…',
    cancel: zh ? '取消' : 'Cancel',
    download: zh ? '下载结果' : 'Download result',
    result: zh ? '转换结果' : 'Result',
    error: zh ? '转换失败' : 'Conversion failed',
  }
}

export function PdfToImageTool({ locale }: { locale: Locale }) {
  const copy = getCopy(locale)
  const [file, setFile] = useState<File>()
  const [pageCount, setPageCount] = useState<number>()
  const [format, setFormat] = useState<PdfRenderFormat>('image/png')
  const [scale, setScale] = useState('1.5')
  const [quality, setQuality] = useState(90)
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [result, setResult] = useState<{ blob: Blob; fileName: string }>()
  const pdfPoolRef = useRef<WorkerClientPool | undefined>(undefined)
  const controllerRef = useRef<AbortController | undefined>(undefined)

  const getPdfPool = useCallback(() => {
    pdfPoolRef.current ??= createPdfWorkerPool()
    return pdfPoolRef.current
  }, [])

  useEffect(
    () => () => {
      controllerRef.current?.abort()
      pdfPoolRef.current?.dispose()
    },
    [],
  )

  const handleFile = useCallback(
    async (files: File[]) => {
      const selected = files[0]
      if (!selected) return
      setFile(selected)
      setPageCount(undefined)
      setResult(undefined)
      setErrorMessage(undefined)
      try {
        await validateFile(selected, PDF_FILE_POLICY)
        const buffer = await selected.arrayBuffer()
        const inspected = await getPdfPool().run<InspectResult>(
          'inspect-pdf',
          { buffer },
          { transfer: [buffer] },
        )
        setPageCount(inspected.pageCount)
      } catch (error) {
        const toolError = toToolError(error)
        setErrorMessage(getToolErrorMessage(locale, toolError.code))
      }
    },
    [getPdfPool, locale],
  )

  const convert = async () => {
    if (!file) return
    const controller = new AbortController()
    controllerRef.current = controller
    setBusy(true)
    setProgress(0)
    setResult(undefined)
    setErrorMessage(undefined)

    try {
      const pages = await renderPdfToImages(await file.arrayBuffer(), {
        scale: Math.max(0.5, Math.min(3, Number.parseFloat(scale) || 1.5)),
        format,
        quality,
        signal: controller.signal,
        onProgress: setProgress,
      })
      const stem = getSafePdfStem(file.name)
      const extension = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg'
      if (pages.length === 1 && pages[0]) {
        setResult({ blob: pages[0].blob, fileName: `${stem}-page-1.${extension}` })
      } else {
        const archive = await createZipBlob(
          pages.map((page) => ({
            name: `${stem}-page-${page.pageNumber}.${extension}`,
            blob: page.blob,
          })),
          controller.signal,
        )
        setResult({ blob: archive, fileName: `${stem}-images.zip` })
      }
    } catch (error) {
      const toolError = toToolError(error)
      if (toolError.code !== 'TASK_CANCELLED') {
        setErrorMessage(getToolErrorMessage(locale, toolError.code))
      }
    } finally {
      controllerRef.current = undefined
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-3xl border border-border bg-background p-5 sm:grid-cols-3 sm:p-6">
        <label className="grid gap-2 text-sm font-medium">
          <span>{copy.format}</span>
          <select
            value={format}
            onChange={(event) => setFormat(event.currentTarget.value as PdfRenderFormat)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WebP</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span>{copy.scale}</span>
          <select
            value={scale}
            onChange={(event) => setScale(event.currentTarget.value)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="1">1×</option>
            <option value="1.5">1.5×</option>
            <option value="2">2×</option>
            <option value="3">3×</option>
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
            disabled={format === 'image/png'}
            value={quality}
            onChange={(event) => setQuality(event.currentTarget.valueAsNumber)}
            className="accent-[var(--lt-brand)]"
          />
        </label>
      </section>

      <FileDropzone
        policy={{ ...PDF_FILE_POLICY, maxFiles: 1 }}
        labels={{
          title: copy.title,
          description: copy.description,
          chooseFiles: copy.choose,
          dropActive: copy.drop,
        }}
        multiple={false}
        onFilesSelected={(files) => void handleFile(files)}
      />

      {file ? (
        <p className="text-sm text-muted-foreground">
          {file.name} · {formatFileSize(file.size, locale)}
          {pageCount ? ` · ${pageCount} ${copy.pages}` : ''}
        </p>
      ) : null}

      {busy ? (
        <div className="space-y-2" aria-live="polite">
          <div className="h-2 overflow-hidden rounded-full bg-background-muted">
            <div
              className="h-full bg-[var(--lt-brand)] transition-[width] motion-reduce:transition-none"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{Math.round(progress * 100)}%</p>
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
        <Button disabled={!pageCount || busy} onClick={() => void convert()}>
          {busy ? copy.converting : copy.convert}
        </Button>
        {busy ? (
          <Button variant="outline" onClick={() => controllerRef.current?.abort()}>
            {copy.cancel}
          </Button>
        ) : null}
        {result ? (
          <Button variant="outline" onClick={() => downloadBlob(result.blob, result.fileName)}>
            {copy.download}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
