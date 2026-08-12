import type { Locale } from './config'

const COPY: Record<Locale, { copy: string; copied: string }> = {
  'zh-CN': { copy: '复制结果', copied: '已复制' },
  en: { copy: 'Copy result', copied: 'Copied' },
}

export function getCommonActionCopy(locale: Locale) {
  return COPY[locale]
}
