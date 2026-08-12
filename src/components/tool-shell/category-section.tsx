import type { ReactNode } from 'react'

type CategorySectionProps = {
  id: string
  title: string
  description: string
  children: ReactNode
}

export function CategorySection({ id, title, description, children }: CategorySectionProps) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border/60 py-10 first:border-t-0">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  )
}
