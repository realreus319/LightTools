type ImageBitmapFactory = (source: ImageBitmapSource) => Promise<ImageBitmap>

export async function withImageBitmap<T>(
  source: ImageBitmapSource,
  operation: (bitmap: ImageBitmap) => Promise<T> | T,
  factory: ImageBitmapFactory = (value) => createImageBitmap(value),
): Promise<T> {
  const bitmap = await factory(source)
  try {
    return await operation(bitmap)
  } finally {
    bitmap.close()
  }
}
