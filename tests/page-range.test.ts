import { describe, expect, it } from 'vitest'
import { parsePageRange } from '../src/features/tools/pdf/shared/page-range'

describe('parsePageRange', () => {
  it('parses single pages and ranges into zero-based indices', () => {
    expect(parsePageRange('1-3,5,8-10', 10)).toEqual([0, 1, 2, 4, 7, 8, 9])
  })

  it('accepts whitespace around separators', () => {
    expect(parsePageRange('1 - 2, 4', 5)).toEqual([0, 1, 3])
  })

  it('rejects descending or out-of-range selections', () => {
    expect(() => parsePageRange('3-1', 5)).toThrow(RangeError)
    expect(() => parsePageRange('6', 5)).toThrow(RangeError)
  })

  it('rejects duplicate pages', () => {
    expect(() => parsePageRange('1-3,3', 5)).toThrow(RangeError)
  })
})
