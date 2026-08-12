export type ImageDimensions = { width: number; height: number }

export function calculateFitDimensions(
  source: ImageDimensions,
  limits: { maxWidth?: number; maxHeight?: number; allowUpscale?: boolean },
): ImageDimensions {
  if (source.width < 1 || source.height < 1) {
    throw new RangeError('Source dimensions must be positive')
  }

  const widthLimit = limits.maxWidth && limits.maxWidth > 0 ? limits.maxWidth : source.width
  const heightLimit = limits.maxHeight && limits.maxHeight > 0 ? limits.maxHeight : source.height
  const widthScale = widthLimit / source.width
  const heightScale = heightLimit / source.height
  const maximumScale = limits.allowUpscale ? Number.POSITIVE_INFINITY : 1
  const scale = Math.min(widthScale, heightScale, maximumScale)

  return {
    width: Math.max(1, Math.round(source.width * scale)),
    height: Math.max(1, Math.round(source.height * scale)),
  }
}

export function calculateScaleDimensions(
  source: ImageDimensions,
  percent: number,
  allowUpscale = false,
): ImageDimensions {
  if (source.width < 1 || source.height < 1) {
    throw new RangeError('Source dimensions must be positive')
  }
  if (!Number.isFinite(percent) || percent <= 0) {
    throw new RangeError('Scale percent must be positive')
  }

  const normalizedPercent = allowUpscale ? percent : Math.min(percent, 100)
  const scale = normalizedPercent / 100

  return {
    width: Math.max(1, Math.round(source.width * scale)),
    height: Math.max(1, Math.round(source.height * scale)),
  }
}
