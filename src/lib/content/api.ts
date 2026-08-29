/**
 * Content API layer — single source of truth for all UI components.
 * Falls back to local seed data when NEXT_PUBLIC_SANITY_PROJECT_ID is not set.
 * UI components must import from here, never directly from seed.ts or @sanity/*.
 */

import type { Artwork, JournalPost, ArtistProfile, Exhibition, EducationItem, SiteSettings } from './types'

const hasSanity = Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)

async function loadSanityQueries() {
  const q = await import('@/lib/sanity/queries')
  return q
}

// ---------- Artworks ----------

// Seed artworks use real photography of Zlatica's paintings (only titles/dates
// are placeholder), so — unlike bio/exhibitions — they're safe to show as a
// fallback while the Sanity artwork library is still empty.

export async function getAllArtworks(): Promise<Artwork[]> {
  if (hasSanity) {
    const { sanityGetAllArtworks } = await loadSanityQueries()
    const remote = await sanityGetAllArtworks()
    if (remote.length > 0) return remote
  }
  const { getAllArtworks: seedFn } = await import('./seed')
  return seedFn()
}

export async function getArtworkBySlug(slug: string): Promise<Artwork | undefined> {
  if (hasSanity) {
    const { sanityGetArtworkBySlug } = await loadSanityQueries()
    const remote = await sanityGetArtworkBySlug(slug)
    if (remote) return remote
  }
  const { getArtworkBySlug: seedFn } = await import('./seed')
  return seedFn(slug)
}

export async function getFeaturedArtworks(): Promise<Artwork[]> {
  if (hasSanity) {
    const { sanityGetFeaturedArtworks } = await loadSanityQueries()
    const remote = await sanityGetFeaturedArtworks()
    if (remote.length > 0) return remote
  }
  const { getFeaturedArtworks: seedFn } = await import('./seed')
  return seedFn()
}

export async function getHeroArtwork(): Promise<Artwork | undefined> {
  if (hasSanity) {
    const { sanityGetHeroArtwork, sanityGetAllArtworks } = await loadSanityQueries()
    const hero = await sanityGetHeroArtwork()
    if (hero) return hero
    const all = await sanityGetAllArtworks()
    if (all.length > 0) return all[0]
  }
  const { getHeroArtwork: seedFn } = await import('./seed')
  return seedFn()
}

export async function getArtworksByMedium(mediumSlug: string): Promise<Artwork[]> {
  const all = await getAllArtworks()
  return all.filter((a) => a.medium.slug === mediumSlug)
}

// ---------- Journal ----------

export async function getAllJournalPosts(): Promise<JournalPost[]> {
  if (hasSanity) {
    const { sanityGetAllJournalPosts } = await loadSanityQueries()
    return sanityGetAllJournalPosts()
  }
  const { JOURNAL_POSTS } = await import('./seed')
  return JOURNAL_POSTS
}

export async function getJournalPostBySlug(slug: string): Promise<JournalPost | undefined> {
  if (hasSanity) {
    const { sanityGetJournalPostBySlug } = await loadSanityQueries()
    return (await sanityGetJournalPostBySlug(slug)) ?? undefined
  }
  const { getJournalPostBySlug: seedFn } = await import('./seed')
  return seedFn(slug)
}

export async function getFeaturedJournalPosts(): Promise<JournalPost[]> {
  if (hasSanity) {
    const { sanityGetFeaturedJournalPosts } = await loadSanityQueries()
    return sanityGetFeaturedJournalPosts()
  }
  const { getFeaturedJournalPosts: seedFn } = await import('./seed')
  return seedFn()
}

// ---------- Artist ----------

export async function getArtistProfile(): Promise<ArtistProfile> {
  if (hasSanity) {
    const { sanityGetArtistProfile } = await loadSanityQueries()
    const profile = await sanityGetArtistProfile()
    if (profile) return profile
  }
  const { ARTIST_PROFILE } = await import('./seed')
  return ARTIST_PROFILE
}

// ---------- Exhibitions ----------

export async function getAllExhibitions(): Promise<Exhibition[]> {
  if (hasSanity) {
    const { sanityGetAllExhibitions } = await loadSanityQueries()
    return sanityGetAllExhibitions()
  }
  const { getAllExhibitions: seedFn } = await import('./seed')
  return seedFn()
}

// ---------- Education ----------

export async function getAllEducationItems(): Promise<EducationItem[]> {
  if (hasSanity) {
    const { sanityGetAllEducationItems } = await loadSanityQueries()
    return sanityGetAllEducationItems()
  }
  const { getAllEducationItems: seedFn } = await import('./seed')
  return seedFn()
}

// ---------- Settings ----------

export async function getSiteSettings(): Promise<SiteSettings> {
  if (hasSanity) {
    const { sanityGetSiteSettings } = await loadSanityQueries()
    const remote = await sanityGetSiteSettings()
    if (remote) return remote as SiteSettings
  }
  const { SITE_SETTINGS } = await import('./seed')
  return SITE_SETTINGS
}
