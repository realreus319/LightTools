'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { isToolSlug, type ToolSlug } from '@/lib/tool-registry/tools'

const STORAGE_KEY = 'lighttools:tool-preferences:v1'
const CHANGE_EVENT = 'lighttools:tool-preferences-change'
const EMPTY_SNAPSHOT = '{"favorites":[],"recent":[]}'
const RECENT_LIMIT = 8

type ToolPreferences = {
  favorites: ToolSlug[]
  recent: ToolSlug[]
}

function sanitizeSlugs(value: unknown): ToolSlug[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is ToolSlug => typeof item === 'string' && isToolSlug(item))
}

function parseSnapshot(snapshot: string): ToolPreferences {
  try {
    const value: unknown = JSON.parse(snapshot)
    if (!value || typeof value !== 'object') return { favorites: [], recent: [] }
    const record = value as Record<string, unknown>
    return {
      favorites: sanitizeSlugs(record.favorites),
      recent: sanitizeSlugs(record.recent).slice(0, RECENT_LIMIT),
    }
  } catch {
    return { favorites: [], recent: [] }
  }
}

function getSnapshot(): string {
  return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY_SNAPSHOT
}

function getServerSnapshot(): string {
  return EMPTY_SNAPSHOT
}

function subscribe(listener: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener()
  }
  window.addEventListener('storage', handleStorage)
  window.addEventListener(CHANGE_EVENT, listener)
  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(CHANGE_EVENT, listener)
  }
}

function writePreferences(preferences: ToolPreferences): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function useToolPreferences() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const preferences = useMemo(() => parseSnapshot(snapshot), [snapshot])
  const addRecent = useCallback((slug: ToolSlug) => {
    const current = parseSnapshot(getSnapshot())
    writePreferences({
      ...current,
      recent: [slug, ...current.recent.filter((item) => item !== slug)].slice(0, RECENT_LIMIT),
    })
  }, [])
  const toggleFavorite = useCallback((slug: ToolSlug) => {
    const current = parseSnapshot(getSnapshot())
    const exists = current.favorites.includes(slug)
    writePreferences({
      ...current,
      favorites: exists
        ? current.favorites.filter((item) => item !== slug)
        : [slug, ...current.favorites],
    })
  }, [])

  return {
    ...preferences,
    addRecent,
    toggleFavorite,
  }
}
