import { notFound } from 'next/navigation'
import { Badge } from '@appica/ui-react/badge'
import { buttonVariants } from '@appica/ui-react/button'
import { Container } from '@/components/app-shell/container'
import { SiteFooter } from '@/components/app-shell/site-footer'
import { SiteHeader } from '@/components/app-shell/site-header'
import { CategorySection } from '@/components/tool-shell/category-section'
import { ToolCard } from '@/components/tool-shell/tool-card'
import { PreferenceToolLists } from '@/features/tool-preferences/preference-tool-lists'
import { ToolSearch } from '@/features/tool-search/tool-search'
import { isLocale } from '@/i18n/config'
import { getMessages, getToolCopy } from '@/i18n/messages'
import { TOOL_CATEGORIES, tools, type ToolSlug } from '@/lib/tool-registry/tools'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params
  if (!isLocale(rawLocale)) notFound()
  const locale = rawLocale
  const messages = getMessages(locale)
  const visibleCategories = TOOL_CATEGORIES.filter((category) => tools.some((tool) => tool.category === category))
  const toolItems = tools.map((tool) => {
    const copy = getToolCopy(locale, tool.slug as ToolSlug)
    return {
      slug: tool.slug as ToolSlug,
      href: `/${locale}/tools/${tool.slug}`,
      title: copy.title,
      description: copy.description,
      category: messages.categories[tool.category].title,
      status: tool.status,
      searchText: [copy.title, copy.description, ...tool.aliases, ...tool.keywords].join(' '),
    }
  })

  return (
    <>
      <a href="#main-content" className="lt-skip-link">
        {messages.home.browseTools}
      </a>
      <SiteHeader locale={locale} messages={messages} />
      <main id="main-content">
        <section className="relative overflow-visible border-b border-border/60 py-20 sm:py-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-96 max-w-4xl rounded-full bg-[color-mix(in_oklab,var(--lt-brand)_12%,transparent)] blur-3xl"
          />
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="soft">{messages.home.privacyBadge}</Badge>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">
                {messages.home.titleLead}{' '}
                <span className="text-[var(--lt-brand)]">{messages.home.titleAccent}</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {messages.home.description}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a href="#image-tools" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                  {messages.home.browseTools}
                </a>
                <a href="#privacy-first" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                  {messages.home.privacyAction}
                </a>
              </div>
              <ToolSearch items={toolItems} labels={messages.search} />
            </div>
          </Container>
        </section>

        <Container>
          <PreferenceToolLists tools={toolItems} labels={messages.preferences} />
          {visibleCategories.map((category) => {
            const categoryTools = tools.filter((tool) => tool.category === category)
            const categoryCopy = messages.categories[category]
            return (
              <CategorySection
                key={category}
                id={`${category}-tools`}
                title={categoryCopy.title}
                description={categoryCopy.description}
              >
                {categoryTools.map((tool) => {
                  const copy = getToolCopy(locale, tool.slug as ToolSlug)
                  return (
                    <ToolCard
                      key={tool.slug}
                      href={`/${locale}/tools/${tool.slug}`}
                      title={copy.title}
                      description={copy.description}
                      category={categoryCopy.title}
                      status={tool.status}
                      labels={messages.toolCard}
                      localOnly={tool.localOnly}
                    />
                  )
                })}
              </CategorySection>
            )
          })}
        </Container>

        <section id="privacy-first" className="border-t border-border/60 bg-background-muted/40 py-14 sm:py-20">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold text-[var(--lt-brand)]">{messages.home.privacyEyebrow}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{messages.home.privacyTitle}</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {messages.home.privacySteps.map((step) => (
                  <div key={step.number} className="rounded-2xl border border-border bg-background p-5">
                    <span className="text-xs font-semibold text-[var(--lt-brand)]">{step.number}</span>
                    <h3 className="mt-4 font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter locale={locale} messages={messages} />
    </>
  )
}
