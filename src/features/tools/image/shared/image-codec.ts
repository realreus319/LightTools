import { ToolError } from '@/lib/errors/tool-error'
import { calculateFitDimensions } from './image-dimensions'
import type { ImageProcessPayload, ImageProcessResult, SupportedImageMime } from './image-types'

function normalizeQuality(quality: number): number {
  if (!Number.isFinite(quality)) return 80
  return Math.max(1, Math.min(100, Math.round(quality)))
}

function requireEightBitImageData(value: { data: Uint8ClampedArray | Uint16Array; width: number; height: number }): ImageData {
  if (!(value.data instanceof Uint8ClampedArray)) {
    throw new ToolError('DECODE_FAILED', 'Only 8-bit image data is supported', { stage: 'decode' })
  }
  if (value instanceof ImageData) return value
  return new ImageData(value.data, value.width, value.height)
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

async function resizeImage(image: ImageData, maxWidth?: number, maxHeight?: number): Promise<ImageData> {
  const dimensions = calculateFitDimensions(
    { width: image.width, height: image.height },
    { maxWidth, maxHeight },
  )
  if (dimensions.width === image.width && dimensions.height === image.height) return image

  try {
    const { default: resize } = await import('@jsquash/resize')
    return await resize(image, {
      width: dimensions.width,
      height: dimensions.height,
      method: 'lanczos3',
      fitMethod: 'stretch',
    })
  } catch (error) {
    throw new ToolError('ENCODE_FAILED', 'Image resize failed', { stage: 'transform', cause: error })
  }
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

export async function processImage(payload: ImageProcessPayload): Promise<ImageProcessResult> {
  const quality = normalizeQuality(payload.quality)
  let image = await decodeImage(payload.buffer, payload.inputMime)
  if (image.width * image.height > 80_000_000) {
    throw new ToolError('IMAGE_TOO_LARGE', 'Decoded image exceeds pixel safety limit', { stage: 'decode' })
  }

  image = await resizeImage(image, payload.maxWidth, payload.maxHeight)
  const outputBuffer = await encodeImage(
    image,
    payload.outputMime,
    quality,
    payload.jpegBackground ?? [255, 255, 255],
  )

  return {
    buffer: outputBuffer,
    mime: payload.outputMime,
    width: image.width,
    height: image.height,
    quality,
  }
}
