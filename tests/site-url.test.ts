import { afterEach, describe, expect, it } from 'vitest'
import { absoluteUrl, getSiteUrl } from '../src/lib/seo/site-url'

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
})
