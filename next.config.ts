import type { NextConfig } from 'next'

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' blob: data:",
  "manifest-src 'self'",
  "media-src 'self' blob:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "worker-src 'self' blob:",
  "connect-src 'self'",
].join('; ')

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
] as const

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  webpack(config) {
    // Webpack can report a runtime-chunk hash cycle for the independently code-split WASM loaders.
    // This is not a source-module circular dependency. E2E separately asserts that tool WASM/PDF
    // resources are not loaded by the homepage, so keep this exception narrow to this exact warning.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { message: /Circular dependency between chunks with runtime/ },
    ]
    return config
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [...SECURITY_HEADERS],
      },
    ]
  },
}

export default nextConfig
