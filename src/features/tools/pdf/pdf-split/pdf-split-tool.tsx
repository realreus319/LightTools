'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@appica/ui-react/button'
import { Input } from '@appica/ui-react/input'
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
import { getPdfCopy } from '../shared/copy'
import { createPdfWorkerPool } from '../shared/create-pdf-worker-pool'
import { createPdfOutputName, getSafePdfStem } from '../shared/pdf-output-name'
import { parsePageRange } from '../shared/page-range'

type InspectResult = { pageCount: number }
type BufferResult = { buffer: ArrayBuffer }
type BuffersResult = { buffers: ArrayBuffer[] }
type SplitMode = 'extract' | 'split'

const MEMORY_WARNING_BYTES = 100 * 1024 * 1024

export function PdfSplitTool({ locale }: { locale: Locale }) {
  const copy = getPdfCopy(locale)
  const [file, setFile] = useState<File>()
  const [pageCount, setPageCount] = useState<number>()
  const [range, setRange] = useState('')
  const [mode, setMode] = useState<SplitMode>('extract')
  const [errorMessage, setErrorMessage] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ blob: Blob; fileName: string }>()
  const poolRef = useRef<WorkerClientPool | undefined>(undefined)

  const getPool = useCallback(() => {
    poolRef.current ??= createPdfWorkerPool()
    return poolRef.current
  }, [])

  useEffect(() => () => poolRef.current?.dispose(), [])

  const handleFiles = useCallback(
    async (files: File[]) => {
      const selected = files[0]
      if (!selected) return
      setFile(selected)
      setPageCount(undefined)
      setRange('')
      setResult(undefined)
      setErrorMessage(undefined)

      try {
        await validateFile(selected, PDF_FILE_POLICY)
        const buffer = await selected.arrayBuffer()
        const inspected = await getPool().run<InspectResult>(
          'inspect-pdf',
          { buffer },
          { transfer: [buffer] },
        )
        setPageCount(inspected.pageCount)
        setRange(`1-${inspected.pageCount}`)
      } catch (error) {
        const toolError = toToolError(error)
        setErrorMessage(getToolErrorMessage(locale, toolError.code))
      }
    },
    [getPool, locale],
  )

  const processPdf = async () => {
    if (!file || !pageCount) return
    setErrorMessage(undefined)
    setResult(undefined)

    let indices: number[]
    try {
      indices = parsePageRange(range, pageCount)
    } catch {
      setErrorMessage(copy.invalidRange)
      return
    }

    setBusy(true)
    try {
      const buffer = await file.arrayBuffer()
      if (mode === 'extract') {
        const output = await getPool().run<BufferResult>(
          'extract-pdf-pages',
          { buffer, indices },
          { transfer: [buffer] },
        )
        setResult({
          blob: new Blob([output.buffer], { type: 'application/pdf' }),
          fileName: createPdfOutputName(file.name, 'extracted'),
        })
      } else {
        const output = await getPool().run<BuffersResult>(
          'split-pdf-pages',
          { buffer, indices },
          { transfer: [buffer] },
        )
        const stem = getSafePdfStem(file.name)
        const archive = await createZipBlob(
          output.buffers.map((pageBuffer, index) => ({
            name: `${stem}-page-${indices[index]! + 1}.pdf`,
            blob: new Blob([pageBuffer], { type: 'application/pdf' }),
          })),
        )
        setResult({ blob: archive, fileName: `${stem}-split.zip` })
      }
    } catch (error) {
      const toolError = toToolError(error)
      setErrorMessage(getToolErrorMessage(locale, toolError.code))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <FileDropzone
        policy={{ ...PDF_FILE_POLICY, maxFiles: 1 }}
        labels={{
          title: copy.chooseOnePdf,
          description: copy.localDescription,
          chooseFiles: copy.chooseOnePdf,
          dropActive: copy.dropActive,
        }}
        multiple={false}
        onFilesSelected={(files) => void handleFiles(files)}
      />

      {file ? (
        <section className="space-y-5 rounded-3xl border border-border bg-background p-5 sm:p-6">
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatFileSize(file.size, locale)} ·{' '}
              {pageCount ? `${pageCount} ${copy.pages}` : copy.loading}
            </p>
          </div>

          {file.size > MEMORY_WARNING_BYTES ? (
            <p className="rounded-xl bg-background-muted p-3 text-sm text-muted-foreground">
              {copy.memoryWarning}
            </p>
          ) : null}

          <label className="grid gap-2 text-sm font-medium">
            <span>{copy.range}</span>
            <Input
              value={range}
              placeholder={copy.rangePlaceholder}
              disabled={!pageCount}
              onChange={(event) => setRange(event.currentTarget.value)}
            />
          </label>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pdf-split-mode"
                checked={mode === 'extract'}
                onChange={() => setMode('extract')}
              />
              {copy.extract}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pdf-split-mode"
                checked={mode === 'split'}
                onChange={() => setMode('split')}
              />
              {copy.split}
            </label>
          </div>
        </section>
      ) : null}

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button disabled={!pageCount || busy} onClick={() => void processPdf()}>
          {busy ? copy.processing : copy.process}
        </Button>
        {result ? (
          <Button variant="outline" onClick={() => downloadBlob(result.blob, result.fileName)}>
            {copy.download}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
