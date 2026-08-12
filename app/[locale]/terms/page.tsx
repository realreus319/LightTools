import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteFooter } from '@/components/app-shell/site-footer'
import { SiteHeader } from '@/components/app-shell/site-header'
import { LegalPage } from '@/components/legal/legal-page'
import { getAlternateLocale, isLocale } from '@/i18n/config'
import { getLegalDocument } from '@/i18n/legal'
import { getMessages } from '@/i18n/messages'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const document = getLegalDocument(locale, 'terms')
  return {
    title: document.title,
    description: document.description,
    alternates: {
      canonical: `/${locale}/terms`,
      languages: { 'zh-CN': '/zh-CN/terms', en: '/en/terms' },
    },
  }
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const messages = getMessages(locale)
  const alternateLocale = getAlternateLocale(locale)

  return (
    <>
      <a href="#main-content" className="lt-skip-link">
        {getLegalDocument(locale, 'terms').title}
      </a>
      <SiteHeader locale={locale} messages={messages} languageHref={`/${alternateLocale}/terms`} />
      <LegalPage document={getLegalDocument(locale, 'terms')} />
      <SiteFooter locale={locale} messages={messages} />
    </>
  )
}
