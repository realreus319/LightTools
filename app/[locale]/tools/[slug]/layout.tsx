import type { Metadata } from 'next'
import { ToolStructuredData } from '@/components/seo/tool-structured-data'
import { isLocale, locales } from '@/i18n/config'
import { getMessages, getToolCopy } from '@/i18n/messages'
import { getSiteUrl } from '@/lib/seo/site-url'
import { getToolBySlug, type ToolSlug } from '@/lib/tool-registry/tools'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const tool = getToolBySlug(slug)
  if (!tool) return {}

  const copy = getToolCopy(locale, tool.slug as ToolSlug)
  const canonical = `/${locale}/tools/${tool.slug}`
  const languages = Object.fromEntries(
    locales.map((alternateLocale) => [alternateLocale, `/${alternateLocale}/tools/${tool.slug}`]),
  )

  return {
    metadataBase: getSiteUrl(),
    title: copy.title,
    description: copy.description,
    alternates: { canonical, languages },
    robots: {
      index: tool.status === 'stable',
      follow: true,
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title: copy.title,
      description: copy.description,
      locale: locale === 'zh-CN' ? 'zh_CN' : 'en',
    },
  }
}

export default async function ToolLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) return children
  const tool = getToolBySlug(slug)
  if (!tool) return children
  const messages = getMessages(locale)
  const copy = getToolCopy(locale, tool.slug as ToolSlug)

  return (
    <>
      <ToolStructuredData
        locale={locale}
        tool={tool}
        title={copy.title}
        description={copy.description}
        homeLabel={messages.toolPage.breadcrumbHome}
      />
      {children}
    </>
  )
}
