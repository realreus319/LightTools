import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/app-shell/container'
import { SiteFooter } from '@/components/app-shell/site-footer'
import { SiteHeader } from '@/components/app-shell/site-header'
import { getAlternateLocale, isLocale } from '@/i18n/config'
import { getMessages } from '@/i18n/messages'

const PACKAGES = [
  ['Next.js', '16.2.12', 'MIT'],
  ['React / React DOM', '19.2.8', 'MIT'],
  ['Appica UI', '1.0.0', 'MIT'],
  ['jSquash image codecs', 'locked versions', 'Apache-2.0 + upstream codec notices'],
  ['pdf-lib', '1.17.1', 'MIT'],
  ['pdfjs-dist', '5.7.284', 'Apache-2.0'],
  ['fflate', '0.8.3', 'MIT'],
  ['qrcode', '1.5.4', 'MIT'],
  ['optional sharp/libvips runtime', '1.2.4', 'LGPL-3.0-or-later reviewed exception'],
] as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const zh = locale === 'zh-CN'
  return {
    title: zh ? '第三方许可' : 'Third-party licenses',
    description: zh
      ? 'LightTools 商业发布所使用的主要第三方软件与许可说明。'
      : 'Primary third-party software and license notes used by the LightTools commercial build.',
    alternates: {
      canonical: `/${locale}/licenses`,
      languages: { 'zh-CN': '/zh-CN/licenses', en: '/en/licenses' },
    },
  }
}

export default async function LicensesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const zh = locale === 'zh-CN'
  const messages = getMessages(locale)
  const alternateLocale = getAlternateLocale(locale)

  return (
    <>
      <a href="#main-content" className="lt-skip-link">
        {zh ? '跳到主要内容' : 'Skip to main content'}
      </a>
      <SiteHeader
        locale={locale}
        messages={messages}
        languageHref={`/${alternateLocale}/licenses`}
      />
      <main id="main-content">
        <Container className="py-12 sm:py-16">
          <header className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              {zh ? '第三方许可' : 'Third-party licenses'}
            </h1>
            <p className="mt-4 leading-7 text-muted-foreground">
              {zh
                ? '这里展示生产版本的主要依赖。完整传递依赖、许可证例外与保留义务以仓库中的 THIRD_PARTY_NOTICES.md 和锁文件为准，并由 CI 自动扫描。'
                : 'This page lists the primary production dependencies. The locked dependency graph, reviewed exceptions, and notice obligations are governed by THIRD_PARTY_NOTICES.md and the lockfile, with automated CI scanning.'}
            </p>
          </header>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-2xl border-collapse text-sm">
              <thead className="bg-background-muted text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">{zh ? '组件' : 'Component'}</th>
                  <th className="px-4 py-3 font-semibold">{zh ? '版本' : 'Version'}</th>
                  <th className="px-4 py-3 font-semibold">{zh ? '许可' : 'License'}</th>
                </tr>
              </thead>
              <tbody>
                {PACKAGES.map(([name, version, license]) => (
                  <tr key={name} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{version}</td>
                    <td className="px-4 py-3 text-muted-foreground">{license}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 max-w-3xl text-sm leading-6 text-muted-foreground">
            {zh
              ? '任何新增的未知、源代码可用或未经审核的 copyleft 生产依赖都会使许可证 CI 门禁失败，直到完成明确审查。'
              : 'Any new unknown, source-available, or unreviewed copyleft production dependency fails the license CI gate until explicitly reviewed.'}
          </p>
        </Container>
      </main>
      <SiteFooter locale={locale} messages={messages} />
    </>
  )
}
