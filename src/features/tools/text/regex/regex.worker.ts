type Request = { pattern: string; flags: string; text: string }
type Match = { value: string; index: number; groups: readonly string[] }

type Response =
  | { ok: true; matches: Match[] }
  | { ok: false; message: string }

self.onmessage = (event: MessageEvent<Request>) => {
  try {
    const { pattern, flags, text } = event.data
    if (pattern.length > 2000) throw new RangeError('Pattern is too long')
    if (text.length > 200_000) throw new RangeError('Test text is too long')
    const normalizedFlags = [...new Set(flags.replace(/[^dgimsuvy]/g, '').split(''))].join('')
    const iterationFlags = normalizedFlags.includes('g') ? normalizedFlags : `${normalizedFlags}g`
    const expression = new RegExp(pattern, iterationFlags)
    const matches: Match[] = []
    let match: RegExpExecArray | null
    while ((match = expression.exec(text)) && matches.length < 500) {
      matches.push({ value: match[0], index: match.index, groups: match.slice(1) })
      if (match[0] === '') expression.lastIndex += 1
    }
    self.postMessage({ ok: true, matches } satisfies Response)
  } catch (error) {
    self.postMessage({ ok: false, message: error instanceof Error ? error.message : String(error) } satisfies Response)
  }
}
