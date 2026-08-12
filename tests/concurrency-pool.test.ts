import { describe, expect, it } from 'vitest'
import { ConcurrencyPool } from '../src/lib/workers/concurrency-pool'

describe('ConcurrencyPool', () => {
  it('never exceeds the configured concurrency limit', async () => {
    const pool = new ConcurrencyPool(2)
    let active = 0
    let maxActive = 0

    const tasks = Array.from({ length: 6 }, (_, value) =>
      pool.schedule(async () => {
        active += 1
        maxActive = Math.max(maxActive, active)
        await new Promise((resolve) => setTimeout(resolve, 5))
        active -= 1
        return value
      }),
    )

    await expect(Promise.all(tasks)).resolves.toEqual([0, 1, 2, 3, 4, 5])
    expect(maxActive).toBe(2)
  })
})
