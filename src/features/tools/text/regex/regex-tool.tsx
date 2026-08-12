'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@appica/ui-react/button'
import type { Locale } from '@/i18n/config'
import { getToolErrorMessage } from '@/lib/errors/error-messages'
import { ToolError } from '@/lib/errors/tool-error'

type Match = { value: string; index: number; groups: readonly string[] }
type WorkerResponse = { ok: true; matches: Match[] } | { ok: false; message: string }

function executeRegex(pattern: string, flags: string, text: string, timeoutMs = 300): Promise<Match[]> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./regex.worker.ts', import.meta.url), { type: 'module' })
    const timeout = window.setTimeout(() => {
      worker.terminate()
      reject(new ToolError('REGEX_TIMEOUT', 'Regex execution timed out', { stage: 'worker' }))
    }, timeoutMs)

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      window.clearTimeout(timeout)
      worker.terminate()
      if (event.data.ok) resolve(event.data.matches)
      else reject(new Error(event.data.message))
    }
    worker.onerror = (event) => {
      window.clearTimeout(timeout)
      worker.terminate()
      reject(new Error(event.message))
    }
    worker.postMessage({ pattern, flags, text })
  })
}

export function RegexTool({ locale }: { locale: Locale }) {
  const zh = locale === 'zh-CN'
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState<string>()
  const mountedRef = useRef(true)

  useEffect(() => () => { mountedRef.current = false }, [])

  const run = async () => {
    setError(undefined)
    try {
      const result = await executeRegex(pattern, flags, text)
      if (mountedRef.current) setMatches(result)
    } catch (value) {
      if (!mountedRef.current) return
      setMatches([])
      setError(value instanceof ToolError ? getToolErrorMessage(locale, value.code) : value instanceof Error ? value.message : String(value))
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <label className="grid gap-2 text-sm font-medium">
          <span>{zh ? '正则表达式' : 'Regular expression'}</span>
          <input value={pattern} onChange={(event) => setPattern(event.currentTarget.value)} className="h-10 rounded-xl border border-border bg-background px-3 font-mono" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span>Flags</span>
          <input value={flags} onChange={(event) => setFlags(event.currentTarget.value)} className="h-10 rounded-xl border border-border bg-background px-3 font-mono" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium">
        <span>{zh ? '测试文本（最多 20 万字符）' : 'Test text (max 200k characters)'}</span>
        <textarea value={text} onChange={(event) => setText(event.currentTarget.value)} className="min-h-64 rounded-2xl border border-border bg-background p-4 font-mono text-sm" />
      </label>
      <Button onClick={() => void run()}>{zh ? '测试正则' : 'Test regex'}</Button>
      <p className="text-xs text-muted-foreground">{zh ? '表达式在独立 Worker 中执行，超过时间预算会直接终止 Worker，避免卡死页面。' : 'The expression runs in an isolated worker that is terminated if it exceeds the time budget.'}</p>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <div className="space-y-2">
        {matches.map((match, index) => (
          <div key={`${match.index}-${index}`} className="rounded-xl border border-border p-3 font-mono text-sm">
            <span className="text-muted-foreground">@{match.index}</span> {match.value || '∅'}
            {match.groups.length ? <span className="ml-2 text-muted-foreground">[{match.groups.join(', ')}]</span> : null}
          </div>
        ))}
      </div>
    </div>
  )
}
