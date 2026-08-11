import Link from 'next/link'
import { Badge } from '@appica/ui-react/badge'
import type { ToolStatus } from '@/lib/tool-registry/schema'

type ToolCardLabels = {
  local: string
  stable: string
  beta: string
  planned: string
  open: string
}

type ToolCardProps = {
  href: string
  title: string
  description: string
  category: string
  status: ToolStatus
  labels: ToolCardLabels
  localOnly?: boolean
}

export function ToolCard({
  href,
  title,
  description,
  category,
  status,
  labels,
  localOnly = true,
}: ToolCardProps) {
  const statusLabel = status === 'stable' ? labels.stable : status === 'beta' ? labels.beta : labels.planned

  return (
    <Link
      href={href}
      className="group block min-h-52 rounded-[var(--lt-radius-card)] border border-border/80 bg-background p-5 transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-[var(--lt-brand)] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lt-brand)] focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{category}</span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {localOnly ? (
            <Badge variant="soft" size="sm">
              {labels.local}
            </Badge>
          ) : null}
          <Badge variant="soft" size="sm">
            {statusLabel}
          </Badge>
        </div>
      </div>
      <div className="mt-5">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--lt-brand)]">
        {labels.open}
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  )
}
