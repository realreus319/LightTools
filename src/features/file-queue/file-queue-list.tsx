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
  onRetry(id: string): void
  onRemove(id: string): void
}

export function FileQueueList({ items, locale, labels, onRetry, onRemove }: FileQueueListProps) {
  if (items.length === 0) return null

  return (
    <div className="mt-6 grid gap-3">
      {items.map((item) => (
        <article key={item.id} className="rounded-2xl border border-border bg-background p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium" title={item.file.name}>
                {item.file.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatFileSize(item.file.size, locale)} · {labels[item.status]}
              </p>
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
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background-muted" aria-hidden="true">
              <div
                className="h-full rounded-full bg-[var(--lt-brand)] transition-[width] motion-reduce:transition-none"
                style={{ width: `${Math.round(item.progress * 100)}%` }}
              />
            </div>
          ) : null}
        </article>
      ))}
    </div>
  )
}
