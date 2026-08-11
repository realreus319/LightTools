import { notFound } from 'next/navigation'
import { Container } from '@/components/app-shell/container'
import { SiteFooter } from '@/components/app-shell/site-footer'
import { SiteHeader } from '@/components/app-shell/site-header'
import { ToolCard } from '@/components/tool-shell/tool-card'
import { ToolPageShell } from '@/components/tool-shell/tool-page-shell'
import { ImageCompressTool } from '@/features/tools/image/image-compress/image-compress-tool'
import { ImageTransformTool } from '@/features/tools/image/image-transform/image-transform-tool'
import { getAlternateLocale, isLocale, locales } from '@/i18n/config'
import { getMessages, getToolCopy } from '@/i18n/messages'
import { getRelatedTools, getToolBySlug, tools, type ToolSlug } from '@/lib/tool-registry/tools'

export function generateStaticParams() {
  return locales.flatMap((locale) => tools.map((tool) => ({ locale, slug: tool.slug })))
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: rawLocale, slug } = await params
  if (!isLocale(rawLocale)) notFound()
  const tool = getToolBySlug(slug)
  if (!tool) notFound()

  const locale = rawLocale
  const messages = getMessages(locale)
  const copy = getToolCopy(locale, tool.slug as ToolSlug)
  const alternateLocale = getAlternateLocale(locale)
  const related = getRelatedTools(tool)
  const toolContent =
    tool.slug === 'image-compress' ? (
      <ImageCompressTool locale={locale} />
    ) : tool.slug === 'image-convert' ? (
      <ImageTransformTool locale={locale} mode="convert" />
    ) : tool.slug === 'image-resize' ? (
      <ImageTransformTool locale={locale} mode="resize" />
    ) : tool.slug === 'image-metadata-remove' ? (
      <ImageTransformTool locale={locale} mode="metadata" />
    ) : undefined

  return (
    <>
      <a href="#main-content" className="lt-skip-link">
        {copy.title}
      </a>
      <SiteHeader
        locale={locale}
        messages={messages}
        languageHref={`/${alternateLocale}/tools/${tool.slug}`}
      />
      <ToolPageShell
        locale={locale}
        messages={messages}
        tool={tool}
        slug={tool.slug as ToolSlug}
        title={copy.title}
        description={copy.description}
      >
        {toolContent}
      </ToolPageShell>
      <section className="border-t border-border/60 py-12 sm:py-16">
        <Container>
          <h2 className="text-2xl font-semibold tracking-tight">
            {messages.toolPage.relatedTitle}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((relatedTool) => {
              const relatedCopy = getToolCopy(locale, relatedTool.slug as ToolSlug)
              return (
                <ToolCard
                  key={relatedTool.slug}
                  href={`/${locale}/tools/${relatedTool.slug}`}
                  title={relatedCopy.title}
                  description={relatedCopy.description}
                  category={messages.categories[relatedTool.category].title}
                  status={relatedTool.status}
                  labels={messages.toolCard}
                  localOnly={relatedTool.localOnly}
                />
              )
            })}
          </div>
        </Container>
      </section>
      <section className="border-t border-border/60 bg-background-muted/40 py-12">
        <Container>
          <h2 className="text-xl font-semibold">{messages.toolPage.privacyTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {messages.toolPage.privacyDescription}
          </p>
        </Container>
      </section>
      <SiteFooter locale={locale} messages={messages} />
    </>
  )
}
