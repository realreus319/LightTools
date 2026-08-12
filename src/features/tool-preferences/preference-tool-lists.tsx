'use client'

import Link from 'next/link'
import type { ToolSlug } from '@/lib/tool-registry/tools'
import { useToolPreferences } from './use-tool-preferences'

type ToolItem = {
  slug: ToolSlug
  href: string
  title: string
}

export function PreferenceToolLists({
  tools,
  labels,
}: {
  tools: readonly ToolItem[]
  labels: { favorites: string; recent: string }
}) {
  const { favorites, recent } = useToolPreferences()
  const bySlug = new Map(tools.map((tool) => [tool.slug, tool]))

  const renderList = (title: string, slugs: readonly ToolSlug[]) => {
    const items = slugs.flatMap((slug) => {
      const item = bySlug.get(slug)
      return item ? [item] : []
    })
    if (items.length === 0) return null

    return (
      <section className="rounded-2xl border border-border bg-background p-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              className="rounded-lg bg-background-muted px-3 py-2 text-sm hover:text-[var(--lt-brand)]"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </section>
    )
  }

  if (favorites.length === 0 && recent.length === 0) return null

  return (
    <div className="grid gap-3 py-8 sm:grid-cols-2">
      {renderList(labels.favorites, favorites)}
      {renderList(labels.recent, recent)}
    </div>
  )
}
