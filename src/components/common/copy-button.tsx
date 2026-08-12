'use client'

import { Button } from '@appica/ui-react/button'
import { useToastManager } from '@appica/ui-react/toast'
import type { Locale } from '@/i18n/config'
import { copyText } from '@/lib/browser/copy-text'

export function CopyButton({
  text,
  locale,
  size = 'sm',
  variant = 'ghost',
}: {
  text: string
  locale: Locale
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'outline' | 'primary'
}) {
  const { add } = useToastManager()
  const zh = locale === 'zh-CN'

  return (
    <Button
      variant={variant}
      size={size}
      disabled={!text}
      onClick={() => {
        void copyText(text)
          .then(() =>
            add({
              title: zh ? '已复制' : 'Copied',
              description: zh ? '结果已复制到剪贴板。' : 'The result is now on your clipboard.',
            }),
          )
          .catch(() =>
            add({
              title: zh ? '复制失败' : 'Copy failed',
              description: zh ? '浏览器未允许访问剪贴板。' : 'The browser did not allow clipboard access.',
            }),
          )
      }}
    >
      {zh ? '复制结果' : 'Copy result'}
    </Button>
  )
}
