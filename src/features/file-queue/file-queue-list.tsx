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

function getItemProgress(item: FileQueueItem): number {
  if (item.status === 'queued') return 0
  if (item.status === 'processing') return item.progress
  return 1
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

  const overallProgress = items.reduce((sum, item) => sum + getItemProgress(item), 0) / items.length
  const overallPercent = Math.round(overallProgress * 100)
  const hasActiveItems = items.some(
    (item) => item.status === 'queued' || item.status === 'processing',
  )

  return (
    <div className="mt-6 grid gap-3">
      {hasActiveItems ? (
        <div className="flex items-center gap-3" aria-live="polite">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={overallPercent}
            className="h-2 flex-1 overflow-hidden rounded-full bg-background-muted"
          >
            <div
              className="h-full rounded-full bg-[var(--lt-brand)] transition-[width] motion-reduce:transition-none"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <span className="w-12 text-end text-xs tabular-nums text-muted-foreground">
            {overallPercent}%
          </span>
        </div>
      ) : null}

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
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(item.progress * 100)}
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-background-muted"
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
