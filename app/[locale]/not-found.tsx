import Link from 'next/link'
import { Container } from '@/components/app-shell/container'

export default function NotFound() {
  return (
    <main id="main-content">
      <Container className="py-20 sm:py-28">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-[var(--lt-brand)]">404</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Page not found</h1>
          <p className="mt-4 leading-7 text-muted-foreground">
            The page may have moved or the tool address is invalid. 页面不存在或工具地址已变更。
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex rounded-xl bg-[var(--lt-brand)] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to LightTools / 返回首页
          </Link>
        </div>
      </Container>
    </main>
  )
}
