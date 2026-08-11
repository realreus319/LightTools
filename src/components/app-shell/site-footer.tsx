import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import type { Messages } from '@/i18n/messages'
import { Container } from './container'

export function SiteFooter({ locale, messages }: { locale: Locale; messages: Messages }) {
  return (
    <footer className="border-t border-border/70 py-10">
      <Container className="flex flex-col gap-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-foreground">
            {messages.brand.name} · {messages.brand.chineseName}
          </p>
          <p className="mt-1">{messages.brand.tagline}</p>
        </div>
        <nav aria-label={messages.nav.footerLabel} className="flex flex-wrap gap-4">
          <Link href={`/${locale}/privacy`} className="hover:text-foreground">
            {messages.footer.privacy}
          </Link>
          <Link href={`/${locale}/terms`} className="hover:text-foreground">
            {messages.footer.terms}
          </Link>
          <a href="https://github.com/realreus319/LightTools" className="hover:text-foreground">
            {messages.footer.github}
          </a>
        </nav>
      </Container>
    </footer>
  )
}
