import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import { getAlternateLocale } from '@/i18n/config'
import type { Messages } from '@/i18n/messages'
import { Container } from './container'
import { ThemeToggle } from './theme-toggle'

type SiteHeaderProps = {
  locale: Locale
  messages: Messages
  languageHref?: string
}

export function SiteHeader({ locale, messages, languageHref }: SiteHeaderProps) {
  const alternateLocale = getAlternateLocale(locale)
  const navItems = [
    { href: `/${locale}#image-tools`, label: messages.nav.image },
    { href: `/${locale}#pdf-tools`, label: messages.nav.pdf },
    { href: `/${locale}#text-tools`, label: messages.nav.text },
    { href: `/${locale}#developer-tools`, label: messages.nav.developer },
  ] as const

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <Container className="flex min-h-16 items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-xl bg-[var(--lt-brand)] text-sm font-bold text-white"
          >
            L
          </span>
          <span>{messages.brand.name}</span>
        </Link>

        <nav aria-label={messages.nav.mainLabel} className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-background-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href={languageHref ?? `/${alternateLocale}`}
            hrefLang={alternateLocale}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-background-muted hover:text-foreground"
          >
            {locale === 'zh-CN' ? 'EN' : '中文'}
          </Link>
          <ThemeToggle labels={messages.theme} />
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-lg border border-border px-3 py-2 text-sm font-medium">
              {messages.nav.mobileLabel}
            </summary>
            <nav
              aria-label={messages.nav.mobileLabel}
              className="absolute end-0 mt-2 w-44 rounded-xl border border-border bg-background p-2 shadow-lg"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-background-muted"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </Container>
    </header>
  )
}
