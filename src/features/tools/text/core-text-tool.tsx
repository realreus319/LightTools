import type { Locale } from '@/i18n/config'
import { BasicTextTool } from './basic-text-tools'
import { DeveloperDataTool } from './developer-data-tools'
import { EncodingTool } from './encoding-tools'
import { RegexTool } from './regex/regex-tool'

export type CoreTextToolSlug =
  | 'json-format'
  | 'base64'
  | 'url-codec'
  | 'text-stats'
  | 'text-clean'
  | 'uuid'
  | 'timestamp'
  | 'hash'
  | 'jwt-decode'
  | 'regex'

export function CoreTextTool({ locale, slug }: { locale: Locale; slug: CoreTextToolSlug }) {
  if (slug === 'json-format' || slug === 'url-codec' || slug === 'text-stats' || slug === 'text-clean') {
    return <BasicTextTool locale={locale} mode={slug} />
  }
  if (slug === 'base64' || slug === 'hash') {
    return <EncodingTool locale={locale} mode={slug} />
  }
  if (slug === 'uuid' || slug === 'timestamp' || slug === 'jwt-decode') {
    return <DeveloperDataTool locale={locale} mode={slug} />
  }
  return <RegexTool locale={locale} />
}
