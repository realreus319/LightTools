import { describe, expect, it } from 'vitest'
import {
  calculateFitDimensions,
  calculateScaleDimensions,
} from '../src/features/tools/image/shared/image-dimensions'

describe('calculateFitDimensions', () => {
  it('fits inside both limits while preserving aspect ratio', () => {
    expect(
      calculateFitDimensions({ width: 4000, height: 3000 }, { maxWidth: 1600, maxHeight: 1600 }),
    ).toEqual({
      width: 1600,
      height: 1200,
    })
  })

  it('does not upscale by default', () => {
    expect(
      calculateFitDimensions({ width: 640, height: 480 }, { maxWidth: 1920, maxHeight: 1080 }),
    ).toEqual({
      width: 640,
      height: 480,
    })
  })

  it('rejects invalid source dimensions', () => {
    expect(() => calculateFitDimensions({ width: 0, height: 100 }, {})).toThrow(RangeError)
  })
})

describe('calculateScaleDimensions', () => {
  it('scales both dimensions by percentage', () => {
    expect(calculateScaleDimensions({ width: 4000, height: 3000 }, 50)).toEqual({
      width: 2000,
      height: 1500,
    })
  })

  it('does not upscale by default', () => {
    expect(calculateScaleDimensions({ width: 640, height: 480 }, 150)).toEqual({
      width: 640,
      height: 480,
    })
  })

  it('supports explicit upscaling for future callers', () => {
    expect(calculateScaleDimensions({ width: 640, height: 480 }, 150, true)).toEqual({
      width: 960,
      height: 720,
    })
  })

  it('rejects invalid percentages', () => {
    expect(() => calculateScaleDimensions({ width: 640, height: 480 }, 0)).toThrow(RangeError)
  })
})
