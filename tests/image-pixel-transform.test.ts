import { describe, expect, it } from 'vitest'
import { resolveCropRect } from '../src/features/tools/image/shared/image-pixel-transform'

describe('resolveCropRect', () => {
  it('creates a centered square crop', () => {
    expect(resolveCropRect(400, 300, { mode: 'aspect', aspectRatio: 1 })).toEqual({
      x: 50,
      y: 0,
      width: 300,
      height: 300,
    })
  })

  it('creates a centered 16:9 crop', () => {
    expect(resolveCropRect(400, 400, { mode: 'aspect', aspectRatio: 16 / 9 })).toEqual({
      x: 0,
      y: 87,
      width: 400,
      height: 225,
    })
  })

  it('clamps free crop percentages to the source bounds', () => {
    expect(
      resolveCropRect(1000, 500, {
        mode: 'free',
        xPercent: 90,
        yPercent: 80,
        widthPercent: 80,
        heightPercent: 90,
      }),
    ).toEqual({ x: 900, y: 400, width: 100, height: 100 })
  })

  it('rejects invalid source dimensions', () => {
    expect(() => resolveCropRect(0, 100)).toThrow(RangeError)
  })
})
