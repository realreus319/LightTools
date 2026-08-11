import Link from 'next/link'
import { Container } from './container'

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 py-10">
      <Container className="flex flex-col gap-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-foreground">LightTools · 轻工具</p>
          <p className="mt-1">打开即用，尽量在浏览器本地完成。</p>
        </div>
        <nav aria-label="页脚导航" className="flex flex-wrap gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            隐私
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            条款
          </Link>
          <a href="https://github.com/realreus319/LightTools" className="hover:text-foreground">
            GitHub
          </a>
        </nav>
      </Container>
    </footer>
  )
}
