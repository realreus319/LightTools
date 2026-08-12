'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@appica/ui-react/button'
import { FileDropzone } from '@/components/file-dropzone/file-dropzone'
import type { Locale } from '@/i18n/config'
import { getToolErrorMessage } from '@/lib/errors/error-messages'
import { toToolError, type ToolError } from '@/lib/errors/tool-error'
import { downloadBlob } from '@/lib/files/download-blob'
import { PDF_FILE_POLICY, validateBatchLimits } from '@/lib/files/file-policy'
import { formatFileSize } from '@/lib/files/format-file-size'
import { validateFile } from '@/lib/files/validate-file'
import type { WorkerClientPool } from '@/lib/workers/worker-client-pool'
import { createPdfWorkerPool } from '../shared/create-pdf-worker-pool'
import { getPdfCopy } from '../shared/copy'

type PdfEntry = {
  id: string
  file: File
  pageCount?: number
  error?: ToolError
  loading: boolean
}

type InspectResult = { pageCount: number }
type MergeResult = { buffer: ArrayBuffer }

const MEMORY_WARNING_BYTES = 100 * 1024 * 1024

export function PdfMergeTool({ locale }: { locale: Locale }) {
  const copy = getPdfCopy(locale)
  const [entries, setEntries] = useState<PdfEntry[]>([])
  const [draggingId, setDraggingId] = useState<string>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<Blob>()
  const poolRef = useRef<WorkerClientPool | undefined>(undefined)

  const getPool = useCallback(() => {
    poolRef.current ??= createPdfWorkerPool()
    return poolRef.current
  }, [])

  useEffect(() => () => poolRef.current?.dispose(), [])

  const inspectEntry = useCallback(
    async (entry: PdfEntry) => {
      try {
        await validateFile(entry.file, PDF_FILE_POLICY)
        const buffer = await entry.file.arrayBuffer()
        const inspected = await getPool().run<InspectResult>(
          'inspect-pdf',
          { buffer },
          { transfer: [buffer] },
        )
        setEntries((current) =>
          current.map((item) =>
            item.id === entry.id
              ? { ...item, pageCount: inspected.pageCount, loading: false }
              : item,
          ),
        )
      } catch (error) {
        const toolError = toToolError(error)
        setEntries((current) =>
          current.map((item) =>
            item.id === entry.id ? { ...item, loading: false, error: toolError } : item,
          ),
        )
      }
    },
    [getPool],
  )

  const handleFiles = useCallback(
    (files: File[]) => {
      setErrorMessage(undefined)
      setResult(undefined)
      try {
        validateBatchLimits([...entries.map((entry) => entry.file), ...files], PDF_FILE_POLICY)
      } catch (error) {
        const toolError = toToolError(error)
        setErrorMessage(getToolErrorMessage(locale, toolError.code))
        return
      }

      const additions = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        loading: true,
      }))
      setEntries((current) => [...current, ...additions])
      for (const entry of additions) void inspectEntry(entry)
    },
    [entries, inspectEntry, locale],
  )

  const moveEntry = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= entries.length) return
    setEntries((current) => {
      const next = [...current]
      const [entry] = next.splice(index, 1)
      if (!entry) return current
      next.splice(target, 0, entry)
      return next
    })
  }

  const dropBefore = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return
    setEntries((current) => {
      const sourceIndex = current.findIndex((entry) => entry.id === draggingId)
      const targetIndex = current.findIndex((entry) => entry.id === targetId)
      if (sourceIndex < 0 || targetIndex < 0) return current
      const next = [...current]
      const [entry] = next.splice(sourceIndex, 1)
      if (!entry) return current
      next.splice(targetIndex, 0, entry)
      return next
    })
    setDraggingId(undefined)
  }

  const merge = async () => {
    setErrorMessage(undefined)
    setResult(undefined)
    if (entries.length < 2 || entries.some((entry) => entry.loading || entry.error)) return

    setBusy(true)
    try {
      const buffers = await Promise.all(entries.map((entry) => entry.file.arrayBuffer()))
      const merged = await getPool().run<MergeResult>(
        'merge-pdfs',
        { buffers },
        { transfer: buffers },
      )
      setResult(new Blob([merged.buffer], { type: 'application/pdf' }))
    } catch (error) {
      const toolError = toToolError(error)
      setErrorMessage(getToolErrorMessage(locale, toolError.code))
    } finally {
      setBusy(false)
    }
  }

  const totalBytes = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.file.size, 0),
    [entries],
  )
  const ready = entries.length >= 2 && entries.every((entry) => !entry.loading && !entry.error)

  return (
    <div className="space-y-6">
      <FileDropzone
        policy={PDF_FILE_POLICY}
        labels={{
          title: copy.choosePdf,
          description: copy.localDescription,
          chooseFiles: copy.choosePdf,
          dropActive: copy.dropActive,
        }}
        onFilesSelected={handleFiles}
      />

      {totalBytes > MEMORY_WARNING_BYTES ? (
        <p className="rounded-2xl border border-border bg-background-muted p-4 text-sm text-muted-foreground">
          {copy.memoryWarning}
        </p>
      ) : null}

      {entries.length > 0 ? (
        <section className="space-y-3">
          <p className="text-sm text-muted-foreground">{copy.dragHint}</p>
          {entries.map((entry, index) => (
            <article
              key={entry.id}
              draggable={!entry.loading}
              onDragStart={() => setDraggingId(entry.id)}
              onDragEnd={() => setDraggingId(undefined)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropBefore(entry.id)}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium" title={entry.file.name}>
                  {index + 1}. {entry.file.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatFileSize(entry.file.size, locale)} ·{' '}
                  {entry.loading
                    ? copy.loading
                    : entry.error
                      ? getToolErrorMessage(locale, entry.error.code)
                      : `${entry.pageCount ?? 0} ${copy.pages}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => moveEntry(index, -1)}
                >
                  {copy.moveUp}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === entries.length - 1}
                  onClick={() => moveEntry(index, 1)}
                >
                  {copy.moveDown}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setEntries((current) => current.filter((item) => item.id !== entry.id))
                  }
                >
                  {copy.remove}
                </Button>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {copy.batchError}: {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button disabled={!ready || busy} onClick={() => void merge()}>
          {busy ? copy.merging : copy.merge}
        </Button>
        {result ? (
          <Button variant="outline" onClick={() => downloadBlob(result, 'lighttools-merged.pdf')}>
            {copy.download}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
