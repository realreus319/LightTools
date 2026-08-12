'use client'

import { CopyButton } from '@appica/ui-react/copy-button'
import { ResponsiveDialog } from '@/components/common/responsive-dialog'
import type { Locale } from '@/i18n/config'
import { getToolActionsCopy } from '@/i18n/tool-actions'

export function ToolPageActions({ locale }: { locale: Locale }) {
  const copy = getToolActionsCopy(locale)
  const getShareUrl = () => `${window.location.origin}${window.location.pathname}`

  return (
    <div className="flex flex-wrap gap-2">
      <CopyButton
        value={getShareUrl}
        variant="outline"
        size="sm"
        label={copy.share}
        copiedLabel={copy.copied}
      >
        {copy.share}
      </CopyButton>
      <ResponsiveDialog
        triggerLabel={copy.privacyTrigger}
        title={copy.privacyTitle}
        description={copy.privacyDescription}
        closeLabel={copy.close}
      >
        <ul className="grid gap-3">
          {copy.privacyPoints.map((point) => (
            <li key={point} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--lt-brand)]"
              />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </ResponsiveDialog>
    </div>
  )
}
