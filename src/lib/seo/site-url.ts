const LOCAL_SITE_URL = 'http://localhost:3000'
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])

function parseAbsoluteUrl(value: string): URL {
  try {
    return new URL(value)
  } catch (error) {
    throw new Error('NEXT_PUBLIC_SITE_URL must be an absolute URL', { cause: error })
  }
}

export function validateProductionSiteUrl(value: string | URL): URL {
  const url = typeof value === 'string' ? parseAbsoluteUrl(value) : new URL(value)
  if (url.protocol !== 'https:') {
    throw new Error('Production site URL must use HTTPS')
  }
  if (LOCAL_HOSTS.has(url.hostname)) {
    throw new Error('Production site URL cannot use a localhost address')
  }
  return url
}

export function getSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL

  if (configuredUrl) {
    const parsed = parseAbsoluteUrl(configuredUrl)
    return process.env.NODE_ENV === 'production' ? validateProductionSiteUrl(parsed) : parsed
  }

  if (vercelProductionUrl) {
    return validateProductionSiteUrl(`https://${vercelProductionUrl}`)
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Production builds require NEXT_PUBLIC_SITE_URL or VERCEL_PROJECT_PRODUCTION_URL for canonical metadata',
    )
  }

  return new URL(LOCAL_SITE_URL)
}

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, getSiteUrl()).toString()
}
