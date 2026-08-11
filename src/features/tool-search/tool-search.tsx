'use client'

import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import { Input } from '@appica/ui-react/input'

type SearchItem = {
  slug: string
  href: string
  title: string
  description: string
  category: string
  status: 'stable' | 'beta' | 'planned'
  searchText: string
}

type ToolSearchProps = {
  items: readonly SearchItem[]
  labels: {
    label: string
    placeholder: string
    resultsLabel: string
    noResults: string
    planned: string
  }
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase()
}

export function ToolSearch({ items, labels }: ToolSearchProps) {
  const [query, setQuery] = useState('')
  const firstResultRef = useRef<HTMLAnchorElement>(null)
  const normalizedQuery = normalize(query)
  const results = useMemo(() => {
    if (!normalizedQuery) return []
    return items.filter((item) => normalize(item.searchText).includes(normalizedQuery)).slice(0, 8)
  }, [items, normalizedQuery])

  return (
    <div role="search" className="relative mx-auto mt-10 max-w-3xl">
      <label htmlFor="tool-search" className="sr-only">
        {labels.label}
      </label>
      <Input
        id="tool-search"
        type="search"
        autoComplete="off"
        value={query}
        placeholder={labels.placeholder}
        aria-controls="tool-search-results"
        aria-expanded={Boolean(normalizedQuery)}
        onChange={(event) => setQuery(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && results.length > 0) {
            event.preventDefault()
            firstResultRef.current?.focus()
          }
          if (event.key === 'Escape') {
            setQuery('')
          }
        }}
        className="h-14 rounded-2xl bg-background px-5 text-base shadow-lg"
      />

      {normalizedQuery ? (
        <div
          id="tool-search-results"
          aria-label={labels.resultsLabel}
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-border bg-background p-2 shadow-xl"
        >
          {results.length > 0 ? (
            <div className="grid gap-1">
              {results.map((item, index) => (
                <Link
                  key={item.slug}
                  ref={index === 0 ? firstResultRef : undefined}
                  href={item.href}
                  className="rounded-xl px-4 py-3 hover:bg-background-muted focus:bg-background-muted focus:outline-none"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{item.title}</span>
                    {item.status === 'planned' ? (
                      <span className="text-xs text-muted-foreground">{labels.planned}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{item.description}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">{labels.noResults}</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
