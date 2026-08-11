import { Button } from '@appica/ui-react/button'

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <h3 className="font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string
  description: string
  onRetry?: () => void
}) {
  return (
    <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
      <h3 className="font-semibold text-destructive">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button className="mt-4" variant="outline" size="sm" onClick={onRetry}>
          重试
        </Button>
      ) : null}
    </div>
  )
}

export function LoadingState({ label = '正在处理' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 text-sm text-muted-foreground">
      <span className="size-4 animate-spin rounded-full border-2 border-border border-t-[var(--lt-brand)] motion-reduce:animate-none" />
      <span>{label}</span>
    </div>
  )
}

export function ToolCardSkeleton() {
  return (
    <div aria-hidden="true" className="min-h-52 animate-pulse rounded-2xl border border-border p-5 motion-reduce:animate-none">
      <div className="h-3 w-20 rounded bg-background-muted" />
      <div className="mt-7 h-5 w-32 rounded bg-background-muted" />
      <div className="mt-3 h-3 w-full rounded bg-background-muted" />
      <div className="mt-2 h-3 w-4/5 rounded bg-background-muted" />
    </div>
  )
}
