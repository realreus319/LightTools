import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LegalPage } from '@/components/legal/legal-page'
import { SiteFooter } from '@/components/app-shell/site-footer'
import { SiteHeader } from '@/components/app-shell/site-header'
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
  const document = getLegalDocument(locale, 'privacy')
  return {
    title: document.title,
    description: document.description,
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: { 'zh-CN': '/zh-CN/privacy', en: '/en/privacy' },
    },
  }
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const messages = getMessages(locale)
  const alternateLocale = getAlternateLocale(locale)

  return (
    <>
      <a href="#main-content" className="lt-skip-link">
        {getLegalDocument(locale, 'privacy').title}
      </a>
      <SiteHeader
        locale={locale}
        messages={messages}
        languageHref={`/${alternateLocale}/privacy`}
      />
      <LegalPage document={getLegalDocument(locale, 'privacy')} />
      <SiteFooter locale={locale} messages={messages} />
    </>
  )
}
