import { describe, expect, it } from 'vitest'
import { formatFileSize } from '../src/lib/files/format-file-size'

describe('formatFileSize', () => {
  it('formats zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 B')
  })

  it('formats binary units', () => {
    expect(formatFileSize(1024, 'en-US')).toBe('1 KiB')
    expect(formatFileSize(5 * 1024 * 1024, 'en-US')).toBe('5 MiB')
  })

  it('rejects invalid values', () => {
    expect(() => formatFileSize(-1)).toThrow(RangeError)
    expect(() => formatFileSize(Number.NaN)).toThrow(RangeError)
  })
})
