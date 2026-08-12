'use client'

import { Button } from '@appica/ui-react/button'
import { useTheme } from '@appica/ui-react/hooks/use-theme'

type ThemeLabels = {
  switchLabel: string
  system: string
  light: string
  dark: string
}

const THEME_ORDER = ['system', 'light', 'dark'] as const

export function ThemeToggle({ labels }: { labels: ThemeLabels }) {
  const { theme, setTheme, mounted } = useTheme()
  const displayLabels = {
    system: labels.system,
    light: labels.light,
    dark: labels.dark,
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" aria-label={labels.switchLabel} disabled>
        {labels.switchLabel}
      </Button>
    )
  }

  const currentTheme = THEME_ORDER.includes(theme as (typeof THEME_ORDER)[number])
    ? (theme as (typeof THEME_ORDER)[number])
    : 'system'
  const currentIndex = THEME_ORDER.indexOf(currentTheme)
  const nextTheme = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length] ?? 'system'

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={`${labels.switchLabel}: ${displayLabels[currentTheme]} → ${displayLabels[nextTheme]}`}
      onClick={() => setTheme(nextTheme)}
    >
      {displayLabels[currentTheme]}
    </Button>
  )
}
