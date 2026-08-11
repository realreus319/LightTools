export function sanitizeArchiveName(name: string, fallback: string): string {
  const baseName = name
    .replace(/[\\/]+/g, '-')
    .replace(/[\u0000-\u001f\u007f]+/g, '')
    .replace(/^\.+/, '')
    .trim()

  if (!baseName || baseName === '.' || baseName === '..') return fallback
  return baseName.slice(0, 180)
}

export function createUniqueArchiveNames(names: readonly string[]): string[] {
  const used = new Set<string>()
  return names.map((name, index) => {
    const safeName = sanitizeArchiveName(name, `file-${index + 1}`)
    if (!used.has(safeName)) {
      used.add(safeName)
      return safeName
    }

    const dot = safeName.lastIndexOf('.')
    const stem = dot > 0 ? safeName.slice(0, dot) : safeName
    const extension = dot > 0 ? safeName.slice(dot) : ''
    let suffix = 2
    let candidate = `${stem}-${suffix}${extension}`
    while (used.has(candidate)) {
      suffix += 1
      candidate = `${stem}-${suffix}${extension}`
    }
    used.add(candidate)
    return candidate
  })
}
