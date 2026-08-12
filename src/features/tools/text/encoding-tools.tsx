'use client'

import { useState } from 'react'
import { Button } from '@appica/ui-react/button'
import { CopyButton } from '@/components/common/copy-button'
import type { Locale } from '@/i18n/config'
import { downloadBlob } from '@/lib/files/download-blob'
import {
  base64ToBytes,
  bytesToBase64,
  decodeTextBase64,
  encodeTextBase64,
} from './shared/text-utils'

type EncodingMode = 'base64' | 'hash'
type HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512'

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function copyUint8ArrayToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

export function EncodingTool({ locale, mode }: { locale: Locale; mode: EncodingMode }) {
  const zh = locale === 'zh-CN'
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string>()
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256')
  const [decodedBytes, setDecodedBytes] = useState<Uint8Array>()

  const encode = () => {
    setError(undefined)
    setDecodedBytes(undefined)
    try {
      setOutput(encodeTextBase64(input))
    } catch (value) {
      setError(value instanceof Error ? value.message : String(value))
    }
  }

  const decode = () => {
    setError(undefined)
    try {
      const bytes = base64ToBytes(input)
      setDecodedBytes(bytes)
      try {
        setOutput(decodeTextBase64(input))
      } catch {
        setOutput(
          zh ? '二进制数据：请使用“下载解码文件”。' : 'Binary data: use “Download decoded file”.',
        )
      }
    } catch (value) {
      setError(value instanceof Error ? value.message : String(value))
    }
  }

  const digest = async (source: ArrayBuffer) => {
    setError(undefined)
    try {
      setOutput(toHex(await crypto.subtle.digest(algorithm, source)))
    } catch (value) {
      setError(value instanceof Error ? value.message : String(value))
    }
  }

  return (
    <div className="space-y-5">
      {mode === 'hash' ? (
        <label className="grid max-w-xs gap-2 text-sm font-medium">
          <span>{zh ? '算法' : 'Algorithm'}</span>
          <select
            value={algorithm}
            onChange={(event) => setAlgorithm(event.currentTarget.value as HashAlgorithm)}
            className="h-10 rounded-xl border border-border bg-background px-3"
          >
            <option>SHA-256</option>
            <option>SHA-384</option>
            <option>SHA-512</option>
          </select>
        </label>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          <span>{zh ? '输入文本' : 'Input text'}</span>
          <textarea
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            spellCheck={false}
            className="min-h-64 rounded-2xl border border-border bg-background p-4 font-mono text-sm"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span>{zh ? '结果' : 'Result'}</span>
          <textarea
            value={output}
            readOnly
            spellCheck={false}
            className="min-h-64 rounded-2xl border border-border bg-background p-4 font-mono text-sm"
          />
        </label>
      </div>

      {mode === 'base64' ? (
        <div className="flex flex-wrap gap-2">
          <Button onClick={encode}>{zh ? '编码文本' : 'Encode text'}</Button>
          <Button variant="outline" onClick={decode}>
            {zh ? '解码文本' : 'Decode text'}
          </Button>
          <label className="inline-flex cursor-pointer items-center rounded-xl border border-border px-4 py-2 text-sm font-medium">
            {zh ? '编码文件' : 'Encode file'}
            <input
              type="file"
              className="sr-only"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0]
                if (!file) return
                void file
                  .arrayBuffer()
                  .then((buffer) => setOutput(bytesToBase64(new Uint8Array(buffer))))
                event.currentTarget.value = ''
              }}
            />
          </label>
          {decodedBytes ? (
            <Button
              variant="outline"
              onClick={() =>
                downloadBlob(
                  new Blob([copyUint8ArrayToArrayBuffer(decodedBytes)]),
                  'lighttools-decoded.bin',
                )
              }
            >
              {zh ? '下载解码文件' : 'Download decoded file'}
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void digest(new TextEncoder().encode(input).buffer)}>
            {zh ? '计算文本 Hash' : 'Hash text'}
          </Button>
          <label className="inline-flex cursor-pointer items-center rounded-xl border border-border px-4 py-2 text-sm font-medium">
            {zh ? '计算文件 Hash' : 'Hash file'}
            <input
              type="file"
              className="sr-only"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0]
                if (!file) return
                void file.arrayBuffer().then(digest)
                event.currentTarget.value = ''
              }}
            />
          </label>
        </div>
      )}

      {output ? <CopyButton text={output} locale={locale} /> : null}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
