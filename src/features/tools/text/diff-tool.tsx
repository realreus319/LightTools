'use client'

import { useMemo, useState } from 'react'
import type { Locale } from '@/i18n/config'
import { diffLines } from './shared/line-diff'

export function DiffTool({ locale }: { locale: Locale }) {
  const zh = locale === 'zh-CN'
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const result = useMemo(() => {
    try {
      return { operations: diffLines(left, right), error: undefined }
    } catch (error) {
      return { operations: [], error: error instanceof Error ? error.message : String(error) }
    }
  }, [left, right])

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          <span>{zh ? '原始文本' : 'Original text'}</span>
          <textarea
            value={left}
            onChange={(event) => setLeft(event.currentTarget.value)}
            className="min-h-64 rounded-2xl border border-border bg-background p-4 font-mono text-sm"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span>{zh ? '修改后文本' : 'Changed text'}</span>
          <textarea
            value={right}
            onChange={(event) => setRight(event.currentTarget.value)}
            className="min-h-64 rounded-2xl border border-border bg-background p-4 font-mono text-sm"
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        {zh
          ? '按行比较，最多各 500 行、合计 10 万字符，避免大输入阻塞页面。'
          : 'Line-based diff, capped at 500 lines per side and 100k total characters to protect responsiveness.'}
      </p>
      {result.error ? (
        <p role="alert" className="text-sm text-destructive">
          {result.error}
        </p>
      ) : null}
      <div className="overflow-hidden rounded-2xl border border-border font-mono text-sm">
        {result.operations.map((operation, index) => (
          <div
            key={index}
            className={`grid grid-cols-[2rem_1fr] gap-2 border-b border-border/50 px-3 py-1.5 last:border-b-0 ${operation.type === 'add' ? 'bg-success/5' : operation.type === 'remove' ? 'bg-destructive/5' : ''}`}
          >
            <span className="select-none text-muted-foreground">
              {operation.type === 'add' ? '+' : operation.type === 'remove' ? '−' : ' '}
            </span>
            <span className="whitespace-pre-wrap break-all">{operation.line || ' '}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
