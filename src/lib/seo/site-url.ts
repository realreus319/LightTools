const LOCAL_SITE_URL = 'http://localhost:3000'

export function getSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const value = configuredUrl ?? (vercelProductionUrl ? `https://${vercelProductionUrl}` : LOCAL_SITE_URL)

  try {
    return new URL(value)
  } catch (error) {
    throw new Error('NEXT_PUBLIC_SITE_URL must be an absolute URL', { cause: error })
  }
}

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, getSiteUrl()).toString()
}
