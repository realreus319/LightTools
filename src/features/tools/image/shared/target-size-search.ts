export type SizedCandidate<T> = {
  value: T
  bytes: number
  quality: number
}

export type QualitySearchResult<T> = {
  best?: SizedCandidate<T>
  smallest?: SizedCandidate<T>
  attempts: number
}

export async function findHighestQualityAtTarget<T>({
  targetBytes,
  maxQuality,
  maxAttempts,
  encode,
}: {
  targetBytes: number
  maxQuality: number
  maxAttempts: number
  encode(quality: number): Promise<{ value: T; bytes: number }>
}): Promise<QualitySearchResult<T>> {
  if (!Number.isFinite(targetBytes) || targetBytes < 1)
    throw new RangeError('targetBytes must be positive')
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1)
    throw new RangeError('maxAttempts must be positive')

  let low = 1
  let high = Math.max(1, Math.min(100, Math.round(maxQuality)))
  let attempts = 0
  let best: SizedCandidate<T> | undefined
  let smallest: SizedCandidate<T> | undefined

  while (low <= high && attempts < maxAttempts) {
    const quality = Math.floor((low + high) / 2)
    const encoded = await encode(quality)
    attempts += 1
    const candidate = { ...encoded, quality }

    if (!smallest || candidate.bytes < smallest.bytes) smallest = candidate
    if (candidate.bytes <= targetBytes) {
      if (!best || candidate.quality > best.quality) best = candidate
      low = quality + 1
    } else {
      high = quality - 1
    }
  }

  return { best, smallest, attempts }
}

export function calculateTargetResizeScale(targetBytes: number, currentBytes: number): number {
  if (
    !Number.isFinite(targetBytes) ||
    !Number.isFinite(currentBytes) ||
    targetBytes <= 0 ||
    currentBytes <= 0
  ) {
    throw new RangeError('Target and current byte sizes must be positive')
  }
  if (currentBytes <= targetBytes) return 1

  // 编码体积近似随像素面积变化，平方根可把字节比例映射到宽高比例；额外留 8% 安全余量。
  const estimated = Math.sqrt(targetBytes / currentBytes) * 0.92
  return Math.max(0.35, Math.min(0.9, estimated))
}
