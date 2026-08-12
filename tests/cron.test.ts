import { describe, expect, it } from 'vitest'
import { explainCron } from '../src/features/tools/text/shared/cron'

describe('explainCron', () => {
  it('validates and explains a five-field cron expression', () => {
    expect(explainCron('*/5 * * * *', 'en')).toContain('every 5 minutes')
  })

  it('rejects invalid field count and ranges', () => {
    expect(() => explainCron('* * * *', 'en')).toThrow(RangeError)
    expect(() => explainCron('99 * * * *', 'en')).toThrow(RangeError)
  })
})
