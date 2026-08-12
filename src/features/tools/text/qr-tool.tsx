'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Button } from '@appica/ui-react/button'
import { Input } from '@appica/ui-react/input'
import type { Locale } from '@/i18n/config'
import { downloadBlob } from '@/lib/files/download-blob'

type ErrorLevel = 'L' | 'M' | 'Q' | 'H'

export function QrTool({ locale }: { locale: Locale }) {
  const zh = locale === 'zh-CN'
  const [value, setValue] = useState('https://example.com')
  const [level, setLevel] = useState<ErrorLevel>('M')
  const [size, setSize] = useState('320')
  const [dark, setDark] = useState('#111827')
  const [light, setLight] = useState('#ffffff')
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [svg, setSvg] = useState<string>()
  const [error, setError] = useState<string>()
  const currentUrlRef = useRef<string | undefined>(undefined)

  useEffect(
    () => () => {
      if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current)
    },
    [],
  )

  const generate = async () => {
    setError(undefined)
    try {
      if (!value) throw new RangeError(zh ? '二维码内容不能为空。' : 'QR content cannot be empty.')
      const width = Math.max(128, Math.min(2048, Number.parseInt(size, 10) || 320))
      const result = await QRCode.toString(value, {
        type: 'svg',
        width,
        margin: 4,
        errorCorrectionLevel: level,
        color: { dark, light },
      })
      const blob = new Blob([result], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current)
      currentUrlRef.current = url
      setPreviewUrl(url)
      setSvg(result)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    }
  }

  const downloadPng = async () => {
    try {
      const width = Math.max(128, Math.min(2048, Number.parseInt(size, 10) || 320))
      const dataUrl = await QRCode.toDataURL(value, {
        width,
        margin: 4,
        errorCorrectionLevel: level,
        color: { dark, light },
      })
      const response = await fetch(dataUrl)
      downloadBlob(await response.blob(), 'lighttools-qr.png')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-4">
        <label className="grid gap-2 text-sm font-medium">
          <span>{zh ? '二维码内容' : 'QR content'}</span>
          <textarea
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
            className="min-h-40 rounded-2xl border border-border bg-background p-4"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            <span>{zh ? '纠错等级' : 'Error correction'}</span>
            <select
              value={level}
              onChange={(event) => setLevel(event.currentTarget.value as ErrorLevel)}
              className="h-10 rounded-xl border border-border bg-background px-3"
            >
              <option value="L">L</option>
              <option value="M">M</option>
              <option value="Q">Q</option>
              <option value="H">H</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            <span>{zh ? '尺寸 px' : 'Size px'}</span>
            <Input
              type="number"
              min="128"
              max="2048"
              value={size}
              onChange={(event) => setSize(event.currentTarget.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            <span>{zh ? '前景色' : 'Foreground'}</span>
            <input
              type="color"
              value={dark}
              onChange={(event) => setDark(event.currentTarget.value)}
              className="h-10 w-full rounded-xl border border-border p-1"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            <span>{zh ? '背景色' : 'Background'}</span>
            <input
              type="color"
              value={light}
              onChange={(event) => setLight(event.currentTarget.value)}
              className="h-10 w-full rounded-xl border border-border p-1"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void generate()}>{zh ? '生成二维码' : 'Generate QR code'}</Button>
          {svg ? (
            <Button
              variant="outline"
              onClick={() =>
                downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'lighttools-qr.svg')
              }
            >
              {zh ? '下载 SVG' : 'Download SVG'}
            </Button>
          ) : null}
          {svg ? (
            <Button variant="outline" onClick={() => void downloadPng()}>
              {zh ? '下载 PNG' : 'Download PNG'}
            </Button>
          ) : null}
        </div>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </section>
      <section className="grid min-h-80 place-items-center rounded-3xl border border-border bg-background-muted p-6">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={zh ? '生成的二维码预览' : 'Generated QR code preview'}
            width={384}
            height={384}
            unoptimized
            className="max-h-96 max-w-full rounded-xl bg-white p-2"
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {zh ? '生成后在这里预览' : 'Preview appears here after generation'}
          </p>
        )}
      </section>
    </div>
  )
}
