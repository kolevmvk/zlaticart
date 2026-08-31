import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 430, 768, 1024, 1280, 1920, 2560],
    imageSizes: [320, 640, 960, 1280],
    qualities: [75, 80, 85, 90, 95],
    // Never previously needed: the live Sanity dataset was empty until the
    // addmin-app Faza 3 testing, so every rendered artwork so far has used
    // local /img/ seed assets, not real cdn.sanity.io URLs — next/image
    // rejects unconfigured remote hosts, which only surfaces once real
    // Sanity-hosted images are actually pushed through the site.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },
  experimental: {
    optimizeCss: false,
  },
  async headers() {
    return [
      {
        // Excludes /admin: Sanity Studio needs broad external connections
        // (api.sanity.io, cdn.sanity.io, websockets) that aren't worth
        // hand-verifying against a strict CSP right now — a wrong header
        // there risks locking Zlatica out of the editor. Revisit once the
        // full set of required origins is confirmed against the live Studio.
        source: '/((?!admin).*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
