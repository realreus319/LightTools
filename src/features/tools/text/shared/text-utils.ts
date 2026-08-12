export type JsonErrorDetails = {
  message: string
  line?: number
  column?: number
}

export type TextStats = {
  characters: number
  graphemes: number
  nonWhitespace: number
  words: number
  lines: number
  bytes: number
}

export type TimestampDetails = {
  unixSeconds: number
  unixMilliseconds: number
  iso: string
  local: string
}

function getJsonPosition(message: string): number | undefined {
  const match = /position\s+(\d+)/i.exec(message)
  return match?.[1] ? Number.parseInt(match[1], 10) : undefined
}

export function describeJsonError(input: string, error: unknown): JsonErrorDetails {
  const message = error instanceof Error ? error.message : String(error)
  const position = getJsonPosition(message)
  if (position === undefined) return { message }
  const before = input.slice(0, position)
  const lines = before.split('\n')
  return {
    message,
    line: lines.length,
    column: (lines.at(-1)?.length ?? 0) + 1,
  }
}

export function formatJson(input: string, indent = 2): string {
  return JSON.stringify(JSON.parse(input), null, Math.max(0, Math.min(8, indent)))
}

export function minifyJson(input: string): string {
  return JSON.stringify(JSON.parse(input))
}

function getSegmentCount(input: string, granularity: 'grapheme' | 'word'): number {
  if (typeof Intl.Segmenter !== 'function') {
    return granularity === 'grapheme'
      ? Array.from(input).length
      : (input.trim().match(/\S+/g)?.length ?? 0)
  }
  const segmenter = new Intl.Segmenter(undefined, { granularity })
  if (granularity === 'word') {
    let count = 0
    for (const segment of segmenter.segment(input)) {
      if (segment.isWordLike) count += 1
    }
    return count
  }
  return Array.from(segmenter.segment(input)).length
}

export function getTextStats(input: string): TextStats {
  return {
    characters: Array.from(input).length,
    graphemes: getSegmentCount(input, 'grapheme'),
    nonWhitespace: Array.from(input).filter((character) => !/\s/u.test(character)).length,
    words: getSegmentCount(input, 'word'),
    lines: input.length === 0 ? 0 : input.split(/\r?\n/).length,
    bytes: new TextEncoder().encode(input).byteLength,
  }
}

export function cleanTextLines(
  input: string,
  options: { trim?: boolean; removeEmpty?: boolean; deduplicate?: boolean; sort?: boolean },
): string {
  let lines = input.split(/\r?\n/)
  if (options.trim) lines = lines.map((line) => line.trim())
  if (options.removeEmpty) lines = lines.filter(Boolean)
  if (options.deduplicate) lines = [...new Set(lines)]
  if (options.sort) lines = [...lines].sort((left, right) => left.localeCompare(right))
  return lines.join('\n')
}

export function bytesToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }
  return btoa(binary)
}

export function base64ToBytes(input: string): Uint8Array {
  const normalized = input.replace(/\s+/g, '')
  const binary = atob(normalized)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

export function encodeTextBase64(input: string): string {
  return bytesToBase64(new TextEncoder().encode(input))
}

export function decodeTextBase64(input: string): string {
  return new TextDecoder('utf-8', { fatal: true }).decode(base64ToBytes(input))
}

function decodeBase64Url(input: string): string {
  const padded = input
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(input.length / 4) * 4, '=')
  return decodeTextBase64(padded)
}

export function decodeJwt(input: string): { header: unknown; payload: unknown } {
  const parts = input.trim().split('.')
  if (parts.length !== 3 || !parts[0] || !parts[1]) {
    throw new RangeError('JWT must contain header, payload and signature segments')
  }
  return {
    header: JSON.parse(decodeBase64Url(parts[0])),
    payload: JSON.parse(decodeBase64Url(parts[1])),
  }
}

export function parseTimestamp(input: string): TimestampDetails {
  const trimmed = input.trim()
  let date: Date
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    const numeric = Number(trimmed)
    if (!Number.isFinite(numeric)) throw new RangeError('Invalid timestamp')
    date = new Date(Math.abs(numeric) < 100_000_000_000 ? numeric * 1000 : numeric)
  } else {
    date = new Date(trimmed)
  }
  if (Number.isNaN(date.getTime())) throw new RangeError('Invalid date or timestamp')
  return {
    unixSeconds: Math.floor(date.getTime() / 1000),
    unixMilliseconds: date.getTime(),
    iso: date.toISOString(),
    local: date.toLocaleString(),
  }
}

export function generateUuids(count: number): string[] {
  const safeCount = Math.max(1, Math.min(1000, Math.floor(count)))
  return Array.from({ length: safeCount }, () => crypto.randomUUID())
}
