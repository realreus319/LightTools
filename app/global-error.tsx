'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
            background: '#f8fafc',
            color: '#111827',
          }}
        >
          <section style={{ maxWidth: 560 }}>
            <div
              style={{
                width: 48,
                height: 48,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 14,
                background: '#6d28d9',
                color: '#fff',
                fontWeight: 800,
              }}
            >
              L
            </div>
            <h1 style={{ marginTop: 24, fontSize: 32 }}>LightTools could not load</h1>
            <p style={{ marginTop: 12, lineHeight: 1.7, color: '#64748b' }}>
              A global application error occurred. Refreshing this boundary will not upload your
              local files. 应用发生全局错误，重试不会上传你的本地文件。
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 24,
                border: 0,
                borderRadius: 12,
                padding: '10px 16px',
                background: '#6d28d9',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Try again / 重试
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
