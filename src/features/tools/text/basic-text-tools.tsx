'use client'

import { useMemo, useState } from 'react'
import { Button } from '@appica/ui-react/button'
import type { Locale } from '@/i18n/config'
import {
  cleanTextLines,
  describeJsonError,
  formatJson,
  getTextStats,
  minifyJson,
} from './shared/text-utils'

type BasicMode = 'json-format' | 'url-codec' | 'text-stats' | 'text-clean'

function copy(locale: Locale) {
  const zh = locale === 'zh-CN'
  return {
    input: zh ? '输入' : 'Input',
    output: zh ? '结果' : 'Output',
    format: zh ? '格式化' : 'Format',
    minify: zh ? '压缩' : 'Minify',
    validate: zh ? '校验' : 'Validate',
    valid: zh ? 'JSON 有效' : 'Valid JSON',
    encode: zh ? '编码' : 'Encode',
    decode: zh ? '解码' : 'Decode',
    trim: zh ? '去除行首尾空白' : 'Trim lines',
    empty: zh ? '删除空行' : 'Remove blank lines',
    dedupe: zh ? '按行去重' : 'Deduplicate lines',
    sort: zh ? '按行排序' : 'Sort lines',
    clean: zh ? '整理文本' : 'Clean text',
    characters: zh ? '字符' : 'Characters',
    graphemes: zh ? '可见字符' : 'Graphemes',
    nonWhitespace: zh ? '非空白字符' : 'Non-whitespace',
    words: zh ? '词数' : 'Words',
    lines: zh ? '行数' : 'Lines',
    bytes: zh ? 'UTF-8 字节' : 'UTF-8 bytes',
    copy: zh ? '复制结果' : 'Copy result',
    error: zh ? '处理失败' : 'Processing failed',
  }
}

function TextArea({
  value,
  onChange,
  readOnly = false,
  label,
}: {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  label: string
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      <textarea
        value={value}
        readOnly={readOnly}
        spellCheck={false}
        onChange={(event) => onChange?.(event.currentTarget.value)}
        className="min-h-72 w-full resize-y rounded-2xl border border-border bg-background p-4 font-mono text-sm leading-6 outline-none focus:border-[var(--lt-brand)]"
      />
    </label>
  )
}

export function BasicTextTool({ locale, mode }: { locale: Locale; mode: BasicMode }) {
  const labels = copy(locale)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [message, setMessage] = useState<string>()
  const [trim, setTrim] = useState(true)
  const [removeEmpty, setRemoveEmpty] = useState(true)
  const [dedupe, setDedupe] = useState(false)
  const [sort, setSort] = useState(false)
  const stats = useMemo(() => getTextStats(input), [input])

  const runJson = (action: 'format' | 'minify' | 'validate') => {
    setMessage(undefined)
    try {
      const result =
        action === 'format' ? formatJson(input) : action === 'minify' ? minifyJson(input) : ''
      if (action !== 'validate') setOutput(result)
      setMessage(action === 'validate' ? labels.valid : undefined)
    } catch (error) {
      const detail = describeJsonError(input, error)
      const location = detail.line && detail.column ? ` (${detail.line}:${detail.column})` : ''
      setMessage(`${labels.error}${location}: ${detail.message}`)
    }
  }

  const runUrl = (action: 'encode' | 'decode') => {
    setMessage(undefined)
    try {
      setOutput(action === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input))
    } catch (error) {
      setMessage(`${labels.error}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  if (mode === 'text-stats') {
    return (
      <div className="space-y-6">
        <TextArea value={input} onChange={setInput} label={labels.input} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            [labels.characters, stats.characters],
            [labels.graphemes, stats.graphemes],
            [labels.nonWhitespace, stats.nonWhitespace],
            [labels.words, stats.words],
            [labels.lines, stats.lines],
            [labels.bytes, stats.bytes],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <TextArea value={input} onChange={setInput} label={labels.input} />
        <TextArea value={output} readOnly label={labels.output} />
      </div>

      {mode === 'json-format' ? (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => runJson('format')}>{labels.format}</Button>
          <Button variant="outline" onClick={() => runJson('minify')}>
            {labels.minify}
          </Button>
          <Button variant="outline" onClick={() => runJson('validate')}>
            {labels.validate}
          </Button>
        </div>
      ) : mode === 'url-codec' ? (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => runUrl('encode')}>{labels.encode}</Button>
          <Button variant="outline" onClick={() => runUrl('decode')}>
            {labels.decode}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={trim}
                onChange={(event) => setTrim(event.currentTarget.checked)}
              />
              {labels.trim}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={removeEmpty}
                onChange={(event) => setRemoveEmpty(event.currentTarget.checked)}
              />
              {labels.empty}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={dedupe}
                onChange={(event) => setDedupe(event.currentTarget.checked)}
              />
              {labels.dedupe}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sort}
                onChange={(event) => setSort(event.currentTarget.checked)}
              />
              {labels.sort}
            </label>
          </div>
          <Button
            onClick={() =>
              setOutput(cleanTextLines(input, { trim, removeEmpty, deduplicate: dedupe, sort }))
            }
          >
            {labels.clean}
          </Button>
        </div>
      )}

      {output ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void navigator.clipboard.writeText(output)}
        >
          {labels.copy}
        </Button>
      ) : null}
      {message ? (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  )
}
