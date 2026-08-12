import type { Locale } from './config'

export function getAccessibilityCopy(locale: Locale) {
  return locale === 'zh-CN'
    ? { breadcrumb: '面包屑导航', faq: '常见问题' }
    : { breadcrumb: 'Breadcrumb', faq: 'Frequently asked questions' }
}
