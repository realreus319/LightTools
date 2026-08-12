const UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB'] as const

export function formatFileSize(bytes: number, locale = 'zh-CN'): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new RangeError('bytes must be a finite non-negative number')
  }

  if (bytes === 0) {
    return '0 B'
  }

  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1)
  const value = bytes / 1024 ** unitIndex
  const maximumFractionDigits = unitIndex === 0 ? 0 : value >= 10 ? 1 : 2

  return `${new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value)} ${UNITS[unitIndex]}`
}
