import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { Container } from './container'

const NAV_ITEMS = [
  { href: '#image-tools', label: '图片' },
  { href: '#pdf-tools', label: 'PDF' },
  { href: '#developer-tools', label: '开发' },
] as const

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <Container className="flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-xl bg-[var(--lt-brand)] text-sm font-bold text-white"
          >
            L
          </span>
          <span>LightTools</span>
        </Link>

        <nav aria-label="主导航" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-background-muted hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-lg border border-border px-3 py-2 text-sm font-medium">
              导航
            </summary>
            <nav
              aria-label="移动端导航"
              className="absolute end-0 mt-2 w-40 rounded-xl border border-border bg-background p-2 shadow-lg"
            >
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-background-muted"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </details>
        </div>
      </Container>
    </header>
  )
}
