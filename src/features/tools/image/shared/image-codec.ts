import { ToolError } from '@/lib/errors/tool-error'
import { calculateFitDimensions } from './image-dimensions'
import type { ImageProcessPayload, ImageProcessResult, SupportedImageMime } from './image-types'
import { calculateTargetResizeScale, findHighestQualityAtTarget } from './target-size-search'

const MAX_TARGET_ATTEMPTS = 18
const MAX_RESIZE_ROUNDS = 6
const MIN_TARGET_DIMENSION = 24

function normalizeQuality(quality: number): number {
  if (!Number.isFinite(quality)) return 80
  return Math.max(1, Math.min(100, Math.round(quality)))
}

function requireEightBitImageData(
  value:
    | {
        data: Uint8ClampedArray | Uint16Array
        width: number
        height: number
      }
    | null,
): ImageData {
  if (!value) {
    throw new ToolError('DECODE_FAILED', 'Image decoder returned no pixels', { stage: 'decode' })
  }
  if (!(value.data instanceof Uint8ClampedArray)) {
    throw new ToolError('DECODE_FAILED', 'Only 8-bit image data is supported', { stage: 'decode' })
  }
  if (value instanceof ImageData && value.data.buffer instanceof ArrayBuffer) return value

  // TypeScript 6 会保留 SharedArrayBuffer 的可能性；复制像素以确保 ImageData 独占普通 ArrayBuffer。
  const pixels = new Uint8ClampedArray(value.data.length)
  pixels.set(value.data)
  return new ImageData(pixels, value.width, value.height)
}

async function decodeImage(buffer: ArrayBuffer, mime: SupportedImageMime): Promise<ImageData> {
  try {
    switch (mime) {
      case 'image/jpeg': {
        const { decode } = await import('@jsquash/jpeg')
        return requireEightBitImageData(await decode(buffer, { preserveOrientation: true }))
      }
      case 'image/png': {
        const { decode } = await import('@jsquash/png')
        return requireEightBitImageData(await decode(buffer, { bitDepth: 8 }))
      }
      case 'image/webp': {
        const { decode } = await import('@jsquash/webp')
        return requireEightBitImageData(await decode(buffer))
      }
      case 'image/avif': {
        const { decode } = await import('@jsquash/avif')
        return requireEightBitImageData(await decode(buffer, { bitDepth: 8 }))
      }
    }
  } catch (error) {
    if (error instanceof ToolError) throw error
    throw new ToolError('DECODE_FAILED', 'Image decode failed', { stage: 'decode', cause: error })
  }
}

async function resizeExact(image: ImageData, width: number, height: number): Promise<ImageData> {
  if (width === image.width && height === image.height) return image
  try {
    const { default: resize } = await import('@jsquash/resize')
    return await resize(image, { width, height, method: 'lanczos3', fitMethod: 'stretch' })
  } catch (error) {
    throw new ToolError('ENCODE_FAILED', 'Image resize failed', { stage: 'transform', cause: error })
  }
}

async function resizeImage(image: ImageData, maxWidth?: number, maxHeight?: number): Promise<ImageData> {
  const dimensions = calculateFitDimensions(
    { width: image.width, height: image.height },
    { maxWidth, maxHeight },
  )
  return resizeExact(image, dimensions.width, dimensions.height)
}

function flattenAlpha(image: ImageData, background: readonly [number, number, number]): ImageData {
  const output = new Uint8ClampedArray(image.data)
  const [backgroundRed, backgroundGreen, backgroundBlue] = background

  for (let index = 0; index < output.length; index += 4) {
    const alpha = (output[index + 3] ?? 255) / 255
    if (alpha >= 1) continue
    output[index] = Math.round((output[index] ?? 0) * alpha + backgroundRed * (1 - alpha))
    output[index + 1] = Math.round((output[index + 1] ?? 0) * alpha + backgroundGreen * (1 - alpha))
    output[index + 2] = Math.round((output[index + 2] ?? 0) * alpha + backgroundBlue * (1 - alpha))
    output[index + 3] = 255
  }

  return new ImageData(output, image.width, image.height)
}

async function encodeImage(
  image: ImageData,
  mime: SupportedImageMime,
  quality: number,
  jpegBackground: readonly [number, number, number],
): Promise<ArrayBuffer> {
  try {
    switch (mime) {
      case 'image/jpeg': {
        const { encode } = await import('@jsquash/jpeg')
        return await encode(flattenAlpha(image, jpegBackground), { quality })
      }
      case 'image/png': {
        const { encode } = await import('@jsquash/png')
        return await encode(image, { bitDepth: 8 })
      }
      case 'image/webp': {
        const { encode } = await import('@jsquash/webp')
        return await encode(image, { quality })
      }
      case 'image/avif': {
        const { encode } = await import('@jsquash/avif')
        return await encode(image, { quality, lossless: false })
      }
    }
  } catch (error) {
    throw new ToolError('ENCODE_FAILED', 'Image encode failed', { stage: 'encode', cause: error })
  }
}

type TargetCandidate = {
  buffer: ArrayBuffer
  quality: number
  image: ImageData
}

async function encodeToTarget(
  initialImage: ImageData,
  mime: SupportedImageMime,
  maxQuality: number,
  targetBytes: number,
  jpegBackground: readonly [number, number, number],
): Promise<{ candidate: TargetCandidate; attempts: number; targetReached: boolean }> {
  let image = initialImage
  let attempts = 0
  let fallback: TargetCandidate | undefined

  for (let resizeRound = 0; resizeRound <= MAX_RESIZE_ROUNDS && attempts < MAX_TARGET_ATTEMPTS; resizeRound += 1) {
    if (mime === 'image/png') {
      const buffer = await encodeImage(image, mime, maxQuality, jpegBackground)
      attempts += 1
      const candidate = { buffer, quality: maxQuality, image }
      if (!fallback || buffer.byteLength < fallback.buffer.byteLength) fallback = candidate
      if (buffer.byteLength <= targetBytes) return { candidate, attempts, targetReached: true }
    } else {
      const search = await findHighestQualityAtTarget({
        targetBytes,
        maxQuality,
        maxAttempts: Math.min(8, MAX_TARGET_ATTEMPTS - attempts),
        encode: async (quality) => {
          const buffer = await encodeImage(image, mime, quality, jpegBackground)
          return { value: buffer, bytes: buffer.byteLength }
        },
      })
      attempts += search.attempts
      if (search.best) {
        return {
          candidate: { buffer: search.best.value, quality: search.best.quality, image },
          attempts,
          targetReached: true,
        }
      }
      if (search.smallest) {
        const candidate = { buffer: search.smallest.value, quality: search.smallest.quality, image }
        if (!fallback || candidate.buffer.byteLength < fallback.buffer.byteLength) fallback = candidate
      }
    }

    if (!fallback || attempts >= MAX_TARGET_ATTEMPTS) break
    const scale = calculateTargetResizeScale(targetBytes, fallback.buffer.byteLength)
    const width = Math.max(MIN_TARGET_DIMENSION, Math.floor(image.width * scale))
    const height = Math.max(MIN_TARGET_DIMENSION, Math.floor(image.height * scale))
    if (width >= image.width || height >= image.height) break
    image = await resizeExact(image, width, height)
  }

  if (!fallback) {
    throw new ToolError('TARGET_SIZE_UNREACHABLE', 'No target-size candidate was produced', { stage: 'encode' })
  }
  return { candidate: fallback, attempts, targetReached: false }
}

export async function processImage(payload: ImageProcessPayload): Promise<ImageProcessResult> {
  const quality = normalizeQuality(payload.quality)
  let image = await decodeImage(payload.buffer, payload.inputMime)
  if (image.width * image.height > 80_000_000) {
    throw new ToolError('IMAGE_TOO_LARGE', 'Decoded image exceeds pixel safety limit', { stage: 'decode' })
  }

  image = await resizeImage(image, payload.maxWidth, payload.maxHeight)
  const jpegBackground = payload.jpegBackground ?? [255, 255, 255]
  if (payload.targetBytes && payload.targetBytes > 0) {
    const targeted = await encodeToTarget(image, payload.outputMime, quality, payload.targetBytes, jpegBackground)
    return {
      buffer: targeted.candidate.buffer,
      mime: payload.outputMime,
      width: targeted.candidate.image.width,
      height: targeted.candidate.image.height,
      quality: targeted.candidate.quality,
      attempts: targeted.attempts,
      targetReached: targeted.targetReached,
    }
  }

  const outputBuffer = await encodeImage(image, payload.outputMime, quality, jpegBackground)
  return {
    buffer: outputBuffer,
    mime: payload.outputMime,
    width: image.width,
    height: image.height,
    quality,
    attempts: 1,
  }
}
