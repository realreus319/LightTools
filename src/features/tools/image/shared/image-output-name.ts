import type { SupportedImageMime } from './image-types'

const EXTENSION_BY_MIME: Record<SupportedImageMime, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

export function createImageOutputName(fileName: string, mime: SupportedImageMime): string {
  const leafName = fileName.replace(/\\/g, '/').split('/').filter(Boolean).at(-1) ?? 'image'
  const extensionIndex = leafName.lastIndexOf('.')
  const stem = (extensionIndex > 0 ? leafName.slice(0, extensionIndex) : leafName)
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
  const safeStem = stem || 'image'
  return `${safeStem}-lighttools.${EXTENSION_BY_MIME[mime]}`
}
