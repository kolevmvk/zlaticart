import type { MetadataRoute } from 'next'
import { getAllArtworks, getAllJournalPosts } from '@/lib/content/api'

// `||` (not `??`) deliberately: the production env var has been observed set to an
// empty string rather than unset, which `??` would not fall back on.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zlaticart.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [artworks, journalPosts] = await Promise.all([getAllArtworks(), getAllJournalPosts()])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/works`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/journal`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/education`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/exhibitions`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/studio`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const artworkRoutes: MetadataRoute.Sitemap = artworks
    .filter((a) => a.status === 'published')
    .map((a) => ({
      url: `${SITE_URL}/works/${a.slug}`,
      changeFrequency: 'monthly',
      priority: 0.8,
    }))

  const journalRoutes: MetadataRoute.Sitemap = journalPosts.map((p) => ({
    url: `${SITE_URL}/journal/${p.slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...artworkRoutes, ...journalRoutes]
}
