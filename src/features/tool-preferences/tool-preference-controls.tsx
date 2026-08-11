'use client'

import { useEffect } from 'react'
import { Button } from '@appica/ui-react/button'
import type { ToolSlug } from '@/lib/tool-registry/tools'
import { useToolPreferences } from './use-tool-preferences'

export function ToolPreferenceControls({
  slug,
  labels,
}: {
  slug: ToolSlug
  labels: { addFavorite: string; removeFavorite: string }
}) {
  const { favorites, addRecent, toggleFavorite } = useToolPreferences()
  const isFavorite = favorites.includes(slug)

  useEffect(() => {
    addRecent(slug)
  }, [addRecent, slug])

  return (
    <Button variant="outline" size="sm" onClick={() => toggleFavorite(slug)} aria-pressed={isFavorite}>
      {isFavorite ? labels.removeFavorite : labels.addFavorite}
    </Button>
  )
}
