'use client'

import { Button } from '@appica/ui-react/button'
import { useTheme } from '@appica/ui-react/hooks/use-theme'

const THEME_ORDER = ['system', 'light', 'dark'] as const

const LABELS: Record<(typeof THEME_ORDER)[number], string> = {
  system: '跟随系统',
  light: '浅色',
  dark: '深色',
}

export function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme()

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" aria-label="切换主题" disabled>
        主题
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
      aria-label={`当前主题：${LABELS[currentTheme]}，点击切换为${LABELS[nextTheme]}`}
      onClick={() => setTheme(nextTheme)}
    >
      {LABELS[currentTheme]}
    </Button>
  )
}
