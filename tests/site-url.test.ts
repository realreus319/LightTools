import { afterEach, describe, expect, it } from 'vitest'
import { absoluteUrl, getSiteUrl, validateProductionSiteUrl } from '../src/lib/seo/site-url'

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl
  }
})

describe('site URL', () => {
  it('uses an explicit production URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://tools.example.com'
    expect(getSiteUrl().toString()).toBe('https://tools.example.com/')
    expect(absoluteUrl('/zh-CN')).toBe('https://tools.example.com/zh-CN')
  })

  it('rejects invalid configured URLs', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'not-a-url'
    expect(() => getSiteUrl()).toThrow('NEXT_PUBLIC_SITE_URL must be an absolute URL')
  })

  it('accepts only HTTPS non-local production canonical URLs', () => {
    expect(validateProductionSiteUrl('https://lighttools.example').toString()).toBe(
      'https://lighttools.example/',
    )
    expect(() => validateProductionSiteUrl('http://lighttools.example')).toThrow(
      'Production site URL must use HTTPS',
    )
    expect(() => validateProductionSiteUrl('https://localhost:3000')).toThrow(
      'Production site URL cannot use a localhost address',
    )
  })
})
