'use client'

import { CopyButton } from '@appica/ui-react/copy-button'
import type { Locale } from '@/i18n/config'
import { getCommonActionCopy } from '@/i18n/common-actions'

export function ResultCopyButton({ locale, value }: { locale: Locale; value: string }) {
  const copy = getCommonActionCopy(locale)

  return (
    <CopyButton
      value={value}
      variant="ghost"
      size="sm"
      label={copy.copy}
      copiedLabel={copy.copied}
    >
      {copy.copy}
    </CopyButton>
  )
}
