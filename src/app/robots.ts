import type { MetadataRoute } from 'next'

// `||` (not `??`) deliberately: the production env var has been observed set to an
// empty string rather than unset, which `??` would not fall back on.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zlaticart.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
