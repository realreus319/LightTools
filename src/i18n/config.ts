export const locales = ['zh-CN', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'zh-CN'

export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value)
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === 'zh-CN' ? 'en' : 'zh-CN'
}
