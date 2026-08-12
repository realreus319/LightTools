import { describe, expect, it } from 'vitest'
import {
  cleanTextLines,
  decodeJwt,
  decodeTextBase64,
  encodeTextBase64,
  formatJson,
  getTextStats,
  minifyJson,
  parseTimestamp,
} from '../src/features/tools/text/shared/text-utils'

describe('JSON helpers', () => {
  it('formats and minifies JSON', () => {
    expect(formatJson('{"a":1}')).toContain('\n')
    expect(minifyJson('{\n  "a": 1\n}')).toBe('{"a":1}')
  })
})

describe('text helpers', () => {
  it('round trips UTF-8 Base64', () => {
    const source = '轻工具🙂'
    expect(decodeTextBase64(encodeTextBase64(source))).toBe(source)
  })

  it('cleans lists deterministically', () => {
    expect(cleanTextLines(' b \n\na\na\n', { trim: true, removeEmpty: true, deduplicate: true, sort: true })).toBe('a\nb')
  })

  it('counts UTF-8 bytes and lines', () => {
    const stats = getTextStats('你好\nworld')
    expect(stats.lines).toBe(2)
    expect(stats.bytes).toBeGreaterThan(stats.characters)
  })
})

describe('developer helpers', () => {
  it('parses seconds and milliseconds timestamps', () => {
    expect(parseTimestamp('0').unixMilliseconds).toBe(0)
    expect(parseTimestamp('1700000000000').unixMilliseconds).toBe(1700000000000)
  })

  it('decodes JWT header and payload without signature verification', () => {
    const token = `${encodeTextBase64('{"alg":"none"}').replace(/=/g, '')}.${encodeTextBase64('{"sub":"1"}').replace(/=/g, '')}.signature`
    expect(decodeJwt(token)).toEqual({ header: { alg: 'none' }, payload: { sub: '1' } })
  })
})
