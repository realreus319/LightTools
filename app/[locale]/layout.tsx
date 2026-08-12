import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AppProviders } from '@/components/app-shell/app-providers'
import { isLocale, locales } from '@/i18n/config'
import { getMessages } from '@/i18n/messages'
import { getSiteUrl } from '@/lib/seo/site-url'
import '../globals.css'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const messages = getMessages(locale)
  const canonical = `/${locale}`

  return {
    metadataBase: getSiteUrl(),
    title: {
      default: `${messages.brand.name} · ${messages.brand.chineseName}`,
      template: `%s · ${messages.brand.name}`,
    },
    description: messages.home.description,
    alternates: {
      canonical,
      languages: {
        'zh-CN': '/zh-CN',
        en: '/en',
      },
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title: `${messages.brand.name} · ${messages.brand.chineseName}`,
      description: messages.home.description,
      locale: locale === 'zh-CN' ? 'zh_CN' : 'en',
    },
    twitter: {
      card: 'summary',
      title: `${messages.brand.name} · ${messages.brand.chineseName}`,
      description: messages.home.description,
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
