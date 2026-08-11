import Link from 'next/link'
import { Badge } from '@appica/ui-react/badge'

type ToolCardProps = {
  href: string
  title: string
  description: string
  category: string
  localOnly?: boolean
  disabled?: boolean
}

export function ToolCard({
  href,
  title,
  description,
  category,
  localOnly = true,
  disabled = false,
}: ToolCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {category}
        </span>
        {localOnly ? (
          <Badge variant="soft" size="sm">
            本地处理
          </Badge>
        ) : null}
      </div>
      <div className="mt-5">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--lt-brand)]">
        {disabled ? '即将提供' : '打开工具'}
        {!disabled ? <span aria-hidden="true">→</span> : null}
      </span>
    </>
  )

  const className =
    'group block min-h-52 rounded-[var(--lt-radius-card)] border border-border/80 bg-background p-5 transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-[var(--lt-brand)] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lt-brand)] focus-visible:ring-offset-2'

  if (disabled) {
    return (
      <div className={`${className} cursor-not-allowed opacity-70`} aria-disabled="true">
        {content}
      </div>
    )
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  )
}
