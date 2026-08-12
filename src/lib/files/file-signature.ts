const EXTENSIONS_BY_MIME: Readonly<Record<string, readonly string[]>> = {
  'image/jpeg': ['jpg', 'jpeg', 'jfif'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/avif': ['avif'],
  'application/pdf': ['pdf'],
}

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  return signature.every((value, index) => bytes[index] === value)
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.slice(start, start + length))
}

export function sniffMimeType(bytes: Uint8Array): string | undefined {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg'
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png'
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'image/webp'
  if (ascii(bytes, 0, 5) === '%PDF-') return 'application/pdf'

  if (ascii(bytes, 4, 4) === 'ftyp') {
    const brand = ascii(bytes, 8, 4)
    if (brand === 'avif' || brand === 'avis') return 'image/avif'
  }

  return undefined
}

export function getFileExtension(fileName: string): string | undefined {
  const normalizedName = fileName.trim().toLowerCase()
  const separator = normalizedName.lastIndexOf('.')
  if (separator <= 0 || separator === normalizedName.length - 1) return undefined
  return normalizedName.slice(separator + 1)
}

export function isExtensionCompatible(fileName: string, mimeType: string): boolean {
  const expectedExtensions = EXTENSIONS_BY_MIME[mimeType]
  if (!expectedExtensions) return true
  const extension = getFileExtension(fileName)
  return extension ? expectedExtensions.includes(extension) : true
}

export async function readFileSignature(file: Blob, byteLength = 32): Promise<Uint8Array> {
  const buffer = await file.slice(0, byteLength).arrayBuffer()
  return new Uint8Array(buffer)
}
