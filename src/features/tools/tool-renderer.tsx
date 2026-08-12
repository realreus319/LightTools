import { ImageCompressTool } from '@/features/tools/image/image-compress/image-compress-tool'
import { ImageCropTool } from '@/features/tools/image/image-crop/image-crop-tool'
import { ImageTransformTool } from '@/features/tools/image/image-transform/image-transform-tool'
import { ImageToPdfTool } from '@/features/tools/pdf/image-to-pdf/image-to-pdf-tool'
import { PdfMergeTool } from '@/features/tools/pdf/pdf-merge/pdf-merge-tool'
import { PdfSplitTool } from '@/features/tools/pdf/pdf-split/pdf-split-tool'
import { PdfToImageTool } from '@/features/tools/pdf/pdf-to-image/pdf-to-image-tool'
import { CoreTextTool, isCoreTextToolSlug } from '@/features/tools/text/core-text-tool'
import { ExtendedTextTool, isExtendedTextToolSlug } from '@/features/tools/text/extended-text-tool'
import type { Locale } from '@/i18n/config'
import type { ToolSlug } from '@/lib/tool-registry/tools'

export function ToolRenderer({ locale, slug }: { locale: Locale; slug: ToolSlug }) {
  if (slug === 'image-compress') return <ImageCompressTool locale={locale} />
  if (slug === 'image-convert') return <ImageTransformTool locale={locale} mode="convert" />
  if (slug === 'image-resize') return <ImageTransformTool locale={locale} mode="resize" />
  if (slug === 'image-crop') return <ImageCropTool locale={locale} />
  if (slug === 'image-metadata-remove') {
    return <ImageTransformTool locale={locale} mode="metadata" />
  }
  if (slug === 'pdf-merge') return <PdfMergeTool locale={locale} />
  if (slug === 'pdf-split') return <PdfSplitTool locale={locale} />
  if (slug === 'image-to-pdf') return <ImageToPdfTool locale={locale} />
  if (slug === 'pdf-to-image') return <PdfToImageTool locale={locale} />
  if (isCoreTextToolSlug(slug)) return <CoreTextTool locale={locale} slug={slug} />
  if (isExtendedTextToolSlug(slug)) return <ExtendedTextTool locale={locale} slug={slug} />

  const exhaustive: never = slug
  return exhaustive
}
