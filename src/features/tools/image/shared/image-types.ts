export const SUPPORTED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const

export type SupportedImageMime = (typeof SUPPORTED_IMAGE_MIMES)[number]

export type ImageProcessPayload = {
  buffer: ArrayBuffer
  inputMime: SupportedImageMime
  outputMime: SupportedImageMime
  quality: number
  maxWidth?: number
  maxHeight?: number
  targetBytes?: number
  jpegBackground?: readonly [number, number, number]
}

export type ImageProcessResult = {
  buffer: ArrayBuffer
  mime: SupportedImageMime
  width: number
  height: number
  quality: number
  attempts: number
  targetReached?: boolean
}

export function isSupportedImageMime(value: string): value is SupportedImageMime {
  return SUPPORTED_IMAGE_MIMES.some((mime) => mime === value)
}
