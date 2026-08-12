export type ImageCropSpec =
  | { mode: 'aspect'; aspectRatio: number }
  | {
      mode: 'free'
      xPercent: number
      yPercent: number
      widthPercent: number
      heightPercent: number
    }

export type ImagePixelTransform = {
  crop?: ImageCropSpec
  rotate?: 0 | 90 | 180 | 270
  flipX?: boolean
  flipY?: boolean
}

export type CropRect = {
  x: number
  y: number
  width: number
  height: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function resolveCropRect(width: number, height: number, crop?: ImageCropSpec): CropRect {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new RangeError('Image dimensions must be positive integers')
  }

  if (!crop) return { x: 0, y: 0, width, height }

  if (crop.mode === 'aspect') {
    const aspectRatio =
      Number.isFinite(crop.aspectRatio) && crop.aspectRatio > 0 ? crop.aspectRatio : width / height
    const sourceRatio = width / height

    if (sourceRatio > aspectRatio) {
      const targetWidth = Math.max(1, Math.round(height * aspectRatio))
      return {
        x: Math.floor((width - targetWidth) / 2),
        y: 0,
        width: targetWidth,
        height,
      }
    }

    const targetHeight = Math.max(1, Math.round(width / aspectRatio))
    return {
      x: 0,
      y: Math.floor((height - targetHeight) / 2),
      width,
      height: targetHeight,
    }
  }

  const xPercent = clamp(crop.xPercent, 0, 99)
  const yPercent = clamp(crop.yPercent, 0, 99)
  const widthPercent = clamp(crop.widthPercent, 1, 100 - xPercent)
  const heightPercent = clamp(crop.heightPercent, 1, 100 - yPercent)
  const x = Math.floor((xPercent / 100) * width)
  const y = Math.floor((yPercent / 100) * height)

  return {
    x,
    y,
    width: Math.max(1, Math.min(width - x, Math.round((widthPercent / 100) * width))),
    height: Math.max(1, Math.min(height - y, Math.round((heightPercent / 100) * height))),
  }
}

function copyPixel(
  source: Uint8ClampedArray,
  sourceIndex: number,
  target: Uint8ClampedArray,
  targetIndex: number,
): void {
  target[targetIndex] = source[sourceIndex] ?? 0
  target[targetIndex + 1] = source[sourceIndex + 1] ?? 0
  target[targetIndex + 2] = source[sourceIndex + 2] ?? 0
  target[targetIndex + 3] = source[sourceIndex + 3] ?? 255
}

function cropImage(image: ImageData, rect: CropRect): ImageData {
  if (
    rect.x === 0 &&
    rect.y === 0 &&
    rect.width === image.width &&
    rect.height === image.height
  ) {
    return image
  }

  const output = new Uint8ClampedArray(rect.width * rect.height * 4)
  for (let y = 0; y < rect.height; y += 1) {
    for (let x = 0; x < rect.width; x += 1) {
      const sourceIndex = ((rect.y + y) * image.width + rect.x + x) * 4
      const targetIndex = (y * rect.width + x) * 4
      copyPixel(image.data, sourceIndex, output, targetIndex)
    }
  }

  return new ImageData(output, rect.width, rect.height)
}

function flipImage(image: ImageData, flipX: boolean, flipY: boolean): ImageData {
  if (!flipX && !flipY) return image

  const output = new Uint8ClampedArray(image.data.length)
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const targetX = flipX ? image.width - 1 - x : x
      const targetY = flipY ? image.height - 1 - y : y
      copyPixel(
        image.data,
        (y * image.width + x) * 4,
        output,
        (targetY * image.width + targetX) * 4,
      )
    }
  }

  return new ImageData(output, image.width, image.height)
}

function rotateImage(image: ImageData, rotation: 0 | 90 | 180 | 270): ImageData {
  if (rotation === 0) return image

  const outputWidth = rotation === 90 || rotation === 270 ? image.height : image.width
  const outputHeight = rotation === 90 || rotation === 270 ? image.width : image.height
  const output = new Uint8ClampedArray(outputWidth * outputHeight * 4)

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      let targetX: number
      let targetY: number

      if (rotation === 90) {
        targetX = image.height - 1 - y
        targetY = x
      } else if (rotation === 180) {
        targetX = image.width - 1 - x
        targetY = image.height - 1 - y
      } else {
        targetX = y
        targetY = image.width - 1 - x
      }

      copyPixel(
        image.data,
        (y * image.width + x) * 4,
        output,
        (targetY * outputWidth + targetX) * 4,
      )
    }
  }

  return new ImageData(output, outputWidth, outputHeight)
}

export function applyImagePixelTransform(
  image: ImageData,
  transform?: ImagePixelTransform,
): ImageData {
  if (!transform) return image

  const cropped = cropImage(image, resolveCropRect(image.width, image.height, transform.crop))
  const flipped = flipImage(cropped, Boolean(transform.flipX), Boolean(transform.flipY))
  return rotateImage(flipped, transform.rotate ?? 0)
}
