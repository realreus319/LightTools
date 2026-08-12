'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { Locale } from '@/i18n/config'

export function ImageComparisonPreview({
  original,
  result,
  locale,
}: {
  original: Blob
  result: Blob
  locale: Locale
}) {
  const [urls, setUrls] = useState<{ original: string; result: string }>()
  const zh = locale === 'zh-CN'

  useEffect(() => {
    const originalUrl = URL.createObjectURL(original)
    const resultUrl = URL.createObjectURL(result)
    setUrls({ original: originalUrl, result: resultUrl })

    return () => {
      URL.revokeObjectURL(originalUrl)
      URL.revokeObjectURL(resultUrl)
    }
  }, [original, result])

  if (!urls) return null

  return (
    <section className="rounded-3xl border border-border bg-background p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="font-semibold">{zh ? '压缩前后预览' : 'Before & after preview'}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {zh
            ? '仅预览第一条成功结果，避免批量任务同时保留过多图片内存。'
            : 'Only the first successful result is previewed to avoid retaining excessive image memory during batch jobs.'}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <figure>
          <figcaption className="mb-2 text-sm font-medium">{zh ? '原图' : 'Original'}</figcaption>
          <div className="grid min-h-48 place-items-center overflow-hidden rounded-2xl bg-background-muted p-2">
            <Image
              src={urls.original}
              alt={zh ? '原始图片预览' : 'Original image preview'}
              width={960}
              height={720}
              unoptimized
              className="max-h-80 w-auto max-w-full object-contain"
            />
          </div>
        </figure>
        <figure>
          <figcaption className="mb-2 text-sm font-medium">{zh ? '结果' : 'Result'}</figcaption>
          <div className="grid min-h-48 place-items-center overflow-hidden rounded-2xl bg-background-muted p-2">
            <Image
              src={urls.result}
              alt={zh ? '压缩结果预览' : 'Compressed image preview'}
              width={960}
              height={720}
              unoptimized
              className="max-h-80 w-auto max-w-full object-contain"
            />
          </div>
        </figure>
      </div>
    </section>
  )
}
