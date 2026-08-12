import type { Locale } from '@/i18n/config'
import { CronTool } from './cron-tool'
import { DiffTool } from './diff-tool'
import { QrTool } from './qr-tool'

export const EXTENDED_TEXT_TOOL_SLUGS = ['text-diff', 'qr-code', 'cron-explain'] as const
export type ExtendedTextToolSlug = (typeof EXTENDED_TEXT_TOOL_SLUGS)[number]

export function isExtendedTextToolSlug(value: string): value is ExtendedTextToolSlug {
  return EXTENDED_TEXT_TOOL_SLUGS.some((slug) => slug === value)
}

export function ExtendedTextTool({ locale, slug }: { locale: Locale; slug: ExtendedTextToolSlug }) {
  if (slug === 'text-diff') return <DiffTool locale={locale} />
  if (slug === 'qr-code') return <QrTool locale={locale} />
  return <CronTool locale={locale} />
}
