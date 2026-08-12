'use client'

import { useState } from 'react'
import { Button } from '@appica/ui-react/button'
import { Input } from '@appica/ui-react/input'
import type { Locale } from '@/i18n/config'
import { decodeJwt, generateUuids, parseTimestamp } from './shared/text-utils'

type DeveloperMode = 'uuid' | 'timestamp' | 'jwt-decode'

export function DeveloperDataTool({ locale, mode }: { locale: Locale; mode: DeveloperMode }) {
  const zh = locale === 'zh-CN'
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [count, setCount] = useState('10')
  const [error, setError] = useState<string>()

  const run = () => {
    setError(undefined)
    try {
      if (mode === 'uuid') {
        setOutput(generateUuids(Number.parseInt(count, 10) || 1).join('\n'))
      } else if (mode === 'timestamp') {
        const result = parseTimestamp(input)
        setOutput([
          `Unix (s): ${result.unixSeconds}`,
          `Unix (ms): ${result.unixMilliseconds}`,
          `ISO: ${result.iso}`,
          `${zh ? '本地时间' : 'Local'}: ${result.local}`,
        ].join('\n'))
      } else {
        const result = decodeJwt(input)
        setOutput(`Header\n${JSON.stringify(result.header, null, 2)}\n\nPayload\n${JSON.stringify(result.payload, null, 2)}`)
      }
    } catch (value) {
      setError(value instanceof Error ? value.message : String(value))
    }
  }

  return (
    <div className="space-y-5">
      {mode === 'uuid' ? (
        <label className="grid max-w-xs gap-2 text-sm font-medium">
          <span>{zh ? '数量（最多 1000）' : 'Count (max 1000)'}</span>
          <Input type="number" min="1" max="1000" value={count} onChange={(event) => setCount(event.currentTarget.value)} />
        </label>
      ) : (
        <label className="grid gap-2 text-sm font-medium">
          <span>{mode === 'timestamp' ? (zh ? 'Unix 时间戳或日期时间' : 'Unix timestamp or date/time') : 'JWT'}</span>
          <textarea value={input} onChange={(event) => setInput(event.currentTarget.value)} spellCheck={false} className="min-h-40 rounded-2xl border border-border bg-background p-4 font-mono text-sm" />
        </label>
      )}

      {mode === 'jwt-decode' ? (
        <p className="rounded-xl bg-background-muted p-3 text-sm text-muted-foreground">
          {zh ? '这里只解析 Header 与 Payload，不验证签名，也不代表 Token 可信。' : 'This only decodes the header and payload. It does not verify the signature or establish trust.'}
        </p>
      ) : null}

      <Button onClick={run}>{mode === 'uuid' ? (zh ? '生成 UUID' : 'Generate UUIDs') : mode === 'timestamp' ? (zh ? '转换' : 'Convert') : (zh ? '解析 JWT' : 'Decode JWT')}</Button>

      {output ? (
        <label className="grid gap-2 text-sm font-medium">
          <span>{zh ? '结果' : 'Result'}</span>
          <textarea value={output} readOnly spellCheck={false} className="min-h-64 rounded-2xl border border-border bg-background p-4 font-mono text-sm" />
        </label>
      ) : null}
      {output ? <Button variant="ghost" size="sm" onClick={() => void navigator.clipboard.writeText(output)}>{zh ? '复制结果' : 'Copy result'}</Button> : null}
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
