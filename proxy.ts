import { NextResponse, type NextRequest } from 'next/server'
import { defaultLocale, locales } from '@/i18n/config'

function hasLocalePrefix(pathname: string): boolean {
  return locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))
}

function getPreferredLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language')?.toLowerCase() ?? ''
  return acceptLanguage.startsWith('en') ? 'en' : defaultLocale
}

export function proxy(request: NextRequest) {
  if (hasLocalePrefix(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const locale = getPreferredLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${request.nextUrl.pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
}
