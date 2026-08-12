import { describe, expect, it } from 'vitest'
import {
  calculateTargetResizeScale,
  findHighestQualityAtTarget,
} from '../src/features/tools/image/shared/target-size-search'

describe('findHighestQualityAtTarget', () => {
  it('returns the highest quality that fits the target', async () => {
    const result = await findHighestQualityAtTarget({
      targetBytes: 7_000,
      maxQuality: 100,
      maxAttempts: 8,
      encode: async (quality) => ({ value: quality, bytes: quality * 100 }),
    })

    expect(result.best?.quality).toBe(70)
    expect(result.best?.bytes).toBe(7_000)
    expect(result.attempts).toBeLessThanOrEqual(8)
  })

  it('returns the smallest observed candidate when no quality fits', async () => {
    const result = await findHighestQualityAtTarget({
      targetBytes: 50,
      maxQuality: 100,
      maxAttempts: 8,
      encode: async (quality) => ({ value: quality, bytes: 100 + quality }),
    })

    expect(result.best).toBeUndefined()
    expect(result.smallest?.bytes).toBeGreaterThan(50)
  })
})

describe('calculateTargetResizeScale', () => {
  it('shrinks dimensions when encoded data is above target', () => {
    const scale = calculateTargetResizeScale(100_000, 400_000)
    expect(scale).toBeGreaterThanOrEqual(0.35)
    expect(scale).toBeLessThan(1)
  })

  it('does not enlarge a candidate already under target', () => {
    expect(calculateTargetResizeScale(100_000, 80_000)).toBe(1)
  })
})
