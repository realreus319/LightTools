import Link from 'next/link'
import { Badge } from '@appica/ui-react/badge'
import { Container } from '@/components/app-shell/container'
import { ToolInfoOverlay } from '@/components/tool-shell/tool-info-overlay'
import { ShareToolButton } from '@/components/tool-shell/share-tool-button'
import type { Locale } from '@/i18n/config'
import type { Messages } from '@/i18n/messages'
import type { ToolDefinition } from '@/lib/tool-registry/schema'
import type { ToolSlug } from '@/lib/tool-registry/tools'
import { ToolPreferenceControls } from '@/features/tool-preferences/tool-preference-controls'

type ToolPageShellProps = {
  locale: Locale
  messages: Messages
  tool: ToolDefinition
  slug: ToolSlug
  title: string
  description: string
  children?: React.ReactNode
}

export function ToolPageShell({
  locale,
  messages,
  tool,
  slug,
  title,
  description,
  children,
}: ToolPageShellProps) {
  return (
    <main id="main-content">
      <Container className="py-10 sm:py-14">
        <nav
          aria-label="Breadcrumb"
          className="mb-7 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Link href={`/${locale}`} className="hover:text-foreground">
            {messages.toolPage.breadcrumbHome}
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-foreground">
            {title}
          </span>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2">
              {tool.localOnly ? <Badge variant="soft">{messages.toolPage.localBadge}</Badge> : null}
              {tool.status === 'planned' ? (
                <Badge variant="soft">{messages.toolCard.planned}</Badge>
              ) : tool.status === 'beta' ? (
                <Badge variant="soft">{messages.toolCard.beta}</Badge>
              ) : (
                <Badge variant="soft">{messages.toolCard.stable}</Badge>
              )}
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ToolPreferenceControls slug={slug} labels={messages.preferences} />
            <ToolInfoOverlay
              locale={locale}
              localOnly={tool.localOnly}
              status={tool.status}
              inputKinds={tool.inputKinds}
              outputKinds={tool.outputKinds}
            />
            <ShareToolButton locale={locale} />
          </div>
        </div>

        <div className="mt-10">
          {children ?? (
            <section className="rounded-3xl border border-dashed border-border bg-background-muted/35 p-7 sm:p-10">
              <h2 className="text-xl font-semibold">{messages.toolPage.plannedTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {messages.toolPage.plannedDescription}
              </p>
            </section>
          )}
        </div>
      </Container>
    </main>
  )
}
