import { describe, expect, it } from 'vitest'
import { diffLines } from '../src/features/tools/text/shared/line-diff'

describe('diffLines', () => {
  it('emits same, removed and added lines', () => {
    expect(diffLines('a\nb\nc', 'a\nx\nc')).toEqual([
      { type: 'same', line: 'a' },
      { type: 'remove', line: 'b' },
      { type: 'add', line: 'x' },
      { type: 'same', line: 'c' },
    ])
  })

  it('rejects excessive line counts', () => {
    const input = Array.from({ length: 501 }, (_, index) => String(index)).join('\n')
    expect(() => diffLines(input, '')).toThrow(RangeError)
  })
})
