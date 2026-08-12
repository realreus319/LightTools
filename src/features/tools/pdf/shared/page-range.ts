export function parsePageRange(input: string, pageCount: number): number[] {
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    throw new RangeError('Page count must be a positive integer')
  }

  const normalized = input.trim()
  if (!normalized) throw new RangeError('Page range cannot be empty')

  const pages: number[] = []
  const seen = new Set<number>()

  for (const rawToken of normalized.split(',')) {
    const token = rawToken.trim()
    const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(token)
    if (!match?.[1]) throw new RangeError(`Invalid page range token: ${token}`)

    const start = Number.parseInt(match[1], 10)
    const end = Number.parseInt(match[2] ?? match[1], 10)
    if (start < 1 || end < 1 || start > end || end > pageCount) {
      throw new RangeError(`Page range is outside 1-${pageCount}: ${token}`)
    }

    for (let page = start; page <= end; page += 1) {
      const index = page - 1
      if (seen.has(index)) throw new RangeError(`Page ${page} is selected more than once`)
      seen.add(index)
      pages.push(index)
    }
  }

  return pages
}
