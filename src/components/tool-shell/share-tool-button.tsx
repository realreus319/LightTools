'use client'

import { Button } from '@appica/ui-react/button'
import { useToastManager } from '@appica/ui-react/toast'
import type { Locale } from '@/i18n/config'
import { copyText } from '@/lib/browser/copy-text'

export function ShareToolButton({ locale }: { locale: Locale }) {
  const { add } = useToastManager()
  const zh = locale === 'zh-CN'

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const shareUrl = `${window.location.origin}${window.location.pathname}`
        void copyText(shareUrl)
          .then(() =>
            add({
              title: zh ? '工具链接已复制' : 'Tool link copied',
              description: zh
                ? '分享链接不会包含输入内容、文件名或查询参数。'
                : 'The shared URL does not include input content, filenames, or query parameters.',
            }),
          )
          .catch(() =>
            add({
              title: zh ? '复制失败' : 'Copy failed',
              description: zh
                ? '请从地址栏复制当前工具地址。'
                : 'Copy the tool URL from the address bar instead.',
            }),
          )
      }}
    >
      {zh ? '分享' : 'Share'}
    </Button>
  )
}
