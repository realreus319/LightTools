import type { MetadataRoute } from 'next'
import { locales } from '@/i18n/config'
import { getSiteUrl } from '@/lib/seo/site-url'
import { tools } from '@/lib/tool-registry/tools'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const homeEntries: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: new URL(`/${locale}`, siteUrl).toString(),
    changeFrequency: 'weekly',
    priority: 1,
  }))
  const stableToolEntries: MetadataRoute.Sitemap = tools
    .filter((tool) => tool.status === 'stable')
    .flatMap((tool) =>
      locales.map((locale) => ({
        url: new URL(`/${locale}/tools/${tool.slug}`, siteUrl).toString(),
        changeFrequency: 'monthly' as const,
        priority: tool.featured ? 0.9 : 0.8,
      })),
    )

  return [...homeEntries, ...stableToolEntries]
}
