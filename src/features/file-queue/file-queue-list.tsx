'use client'

import { Button } from '@appica/ui-react/button'
import { formatFileSize } from '@/lib/files/format-file-size'
import type { FileQueueItem } from './file-queue-state'

type FileQueueListProps = {
  items: readonly FileQueueItem[]
  locale: string
  labels: {
    queued: string
    processing: string
    success: string
    error: string
    cancelled: string
    retry: string
    remove: string
  }
  getErrorMessage?(item: FileQueueItem): string | undefined
  onRetry(id: string): void
  onRemove(id: string): void
}

export function FileQueueList({
  items,
  locale,
  labels,
  getErrorMessage,
  onRetry,
  onRemove,
}: FileQueueListProps) {
  if (items.length === 0) return null

  const zh = locale.toLowerCase().startsWith('zh')
  const completed = items.filter((item) =>
    ['success', 'error', 'cancelled'].includes(item.status),
  ).length
  const failed = items.filter((item) => item.status === 'error').length
  const overallProgress =
    items.reduce((sum, item) => {
      if (item.status === 'success' || item.status === 'error' || item.status === 'cancelled') {
        return sum + 1
      }
      if (item.status === 'processing') return sum + item.progress
      return sum
    }, 0) / items.length

  return (
    <div className="mt-6 grid gap-3">
      <section
        aria-live="polite"
        className="rounded-2xl border border-border bg-background-muted/35 p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-medium">
            {zh ? '批量进度' : 'Batch progress'} · {completed}/{items.length}
          </span>
          <span className="text-muted-foreground">
            {Math.round(overallProgress * 100)}%
            {failed > 0 ? ` · ${zh ? '失败' : 'Failed'} ${failed}` : ''}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-background-muted">
          <div
            className="h-full rounded-full bg-[var(--lt-brand)] transition-[width] motion-reduce:transition-none"
            style={{ width: `${Math.round(overallProgress * 100)}%` }}
          />
        </div>
      </section>

      {items.map((item) => {
        const errorMessage = item.status === 'error' ? getErrorMessage?.(item) : undefined
        return (
          <article key={item.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" title={item.file.name}>
                  {item.file.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatFileSize(item.file.size, locale)} · {labels[item.status]}
                </p>
                {errorMessage ? (
                  <p role="alert" className="mt-2 text-sm text-destructive">
                    {errorMessage}
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2">
                {item.status === 'error' || item.status === 'cancelled' ? (
                  <Button variant="outline" size="sm" onClick={() => onRetry(item.id)}>
                    {labels.retry}
                  </Button>
                ) : null}
                <Button variant="ghost" size="sm" onClick={() => onRemove(item.id)}>
                  {labels.remove}
                </Button>
              </div>
            </div>
            {item.status === 'processing' ? (
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-background-muted"
                aria-label={`${labels.processing} ${Math.round(item.progress * 100)}%`}
              >
                <div
                  className="h-full rounded-full bg-[var(--lt-brand)] transition-[width] motion-reduce:transition-none"
                  style={{ width: `${Math.round(item.progress * 100)}%` }}
                />
              </div>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}
