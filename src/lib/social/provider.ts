// Social feed provider abstraction.
// When Meta/Instagram API credentials become available, implement a MetaProvider
// that satisfies the same SocialFeedResult interface and register it here.
// UI components import only from this file — never from a specific provider.

import type { NormalizedSocialPost, SocialFeedResult } from './types'
import { SITE_SETTINGS } from '../content/seed'

// CMS-curated fallback posts (to be managed via Sanity once CMS is connected).
// Add real posts here or via CMS as they are curated.
const CMS_FALLBACK_POSTS: NormalizedSocialPost[] = [
  // PLACEHOLDER — add curated Instagram post links and images here
]

async function getCMSFeed(): Promise<SocialFeedResult> {
  return {
    posts: CMS_FALLBACK_POSTS,
    source: CMS_FALLBACK_POSTS.length > 0 ? 'cms' : 'empty',
    profileUrl: SITE_SETTINGS.instagramProfileUrl,
  }
}

// Future: implement MetaProvider using Meta Graph API
// async function getMetaFeed(): Promise<SocialFeedResult> { ... }

export async function getSocialFeed(): Promise<SocialFeedResult> {
  // Zlatica reports her Instagram/Facebook connection status from the CMS
  // (Podešavanja → Instagram i Facebook). When she has moved a platform to
  // "connected", the developer wires META_ACCESS_TOKEN here and implements
  // getMetaFeed() — nothing else in the UI needs to change, it already reads
  // from this single function.
  // const { SITE_SETTINGS } = await import('../content/seed')
  // if (SITE_SETTINGS.instagramConnectionStatus === 'connected' && process.env.META_ACCESS_TOKEN) {
  //   try { return await getMetaFeed() } catch { /* fall through to CMS fallback */ }
  // }
  return getCMSFeed()
}

export type { NormalizedSocialPost, SocialFeedResult }
