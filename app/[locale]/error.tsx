'use client'

import { useEffect } from 'react'
import { Button } from '@appica/ui-react/button'
import { Container } from '@/components/app-shell/container'
import { reportSafeError } from '@/lib/errors/error-reporter'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportSafeError({ code: 'UNKNOWN_ERROR', stage: 'transform' })
  }, [])

  return (
    <main id="main-content">
      <Container className="py-20 sm:py-28">
        <div className="max-w-xl rounded-3xl border border-border bg-background p-7 sm:p-10">
          <h1 className="text-2xl font-semibold tracking-tight">Something went wrong / 出现错误</h1>
          <p className="mt-4 leading-7 text-muted-foreground">
            The current tool could not finish this page. Your local file contents are not included in
            the error report. 当前页面未能完成加载，错误上报不会包含你的本地文件内容。
          </p>
          {error.digest ? (
            <p className="mt-3 text-xs text-muted-foreground">Reference: {error.digest}</p>
          ) : null}
          <Button className="mt-6" onClick={reset}>
            Try again / 重试
          </Button>
        </div>
      </Container>
    </main>
  )
}
