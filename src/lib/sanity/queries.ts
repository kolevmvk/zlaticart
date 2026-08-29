import { sanityClient } from './client'
import type { Artwork, JournalPost, ArtistProfile, Exhibition, EducationItem, SiteSettings } from '@/lib/content/types'

// GROQ result shapes — normalized to domain types in api.ts

const ARTWORK_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  status,
  year,
  "medium": medium->{title, "slug": slug.current, description, motionLanguage, order},
  dimensions,
  "primaryImage": primaryImage{
    "src": asset->url,
    alt,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height,
    hotspot
  },
  detailImages[]{
    "src": asset->url,
    alt,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  },
  shortDescription,
  story,
  featured,
  featuredOrder,
  heroCandidate,
  instagramUrl
`

const JOURNAL_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  category,
  "coverImage": coverImage{
    "src": asset->url,
    alt,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  },
  body,
  instagramUrl,
  "relatedArtworkSlugs": relatedArtworks[]->slug.current
`

export async function sanityGetAllArtworks(): Promise<Artwork[]> {
  return sanityClient.fetch(
    `*[_type == "artwork" && status == "published"] | order(featuredOrder asc, _createdAt desc) {${ARTWORK_FIELDS}}`
  )
}

export async function sanityGetArtworkBySlug(slug: string): Promise<Artwork | null> {
  const results: Artwork[] = await sanityClient.fetch(
    `*[_type == "artwork" && slug.current == $slug][0..0] {${ARTWORK_FIELDS}}`,
    { slug }
  )
  return results[0] ?? null
}

export async function sanityGetFeaturedArtworks(): Promise<Artwork[]> {
  return sanityClient.fetch(
    `*[_type == "artwork" && status == "published" && featured == true] | order(featuredOrder asc) {${ARTWORK_FIELDS}}`
  )
}

export async function sanityGetHeroArtwork(): Promise<Artwork | null> {
  const results: Artwork[] = await sanityClient.fetch(
    `*[_type == "artwork" && heroCandidate == true && status == "published"] | order(featuredOrder asc)[0..0] {${ARTWORK_FIELDS}}`
  )
  return results[0] ?? null
}

export async function sanityGetAllJournalPosts(): Promise<JournalPost[]> {
  return sanityClient.fetch(
    `*[_type == "journalPost"] | order(publishedAt desc) {${JOURNAL_FIELDS}}`
  )
}

export async function sanityGetJournalPostBySlug(slug: string): Promise<JournalPost | null> {
  const results: JournalPost[] = await sanityClient.fetch(
    `*[_type == "journalPost" && slug.current == $slug][0..0] {${JOURNAL_FIELDS}}`,
    { slug }
  )
  return results[0] ?? null
}

export async function sanityGetFeaturedJournalPosts(): Promise<JournalPost[]> {
  const result: JournalPost[] | null = await sanityClient.fetch(`
    *[_type == "siteSettings"][0].featuredJournalPosts[]->{${JOURNAL_FIELDS}}
  `)
  return result ?? []
}

export async function sanityGetArtistProfile(): Promise<ArtistProfile | null> {
  return sanityClient.fetch(`
    *[_type == "artistProfile"][0] {
      name,
      roleLine,
      "portrait": portrait{"src": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height},
      "atelierImages": atelierImages[]{"src": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height},
      shortBio,
      biography,
      artistStatement,
      educationStatement,
      location
    }
  `)
}

export async function sanityGetAllExhibitions(): Promise<Exhibition[]> {
  return sanityClient.fetch(`
    *[_type == "exhibition"] | order(startDate desc) {
      _id,
      title,
      venue,
      city,
      startDate,
      endDate,
      status,
      description,
      externalUrl
    }
  `)
}

export async function sanityGetAllEducationItems(): Promise<EducationItem[]> {
  return sanityClient.fetch(`
    *[_type == "educationItem"] | order(featured desc, date desc) {
      _id,
      title,
      type,
      date,
      description,
      "images": images[]{"src": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height},
      featured
    }
  `)
}

export async function sanityGetSiteSettings(): Promise<Partial<SiteSettings> | null> {
  return sanityClient.fetch(`
    *[_type == "siteSettings"][0] {
      siteTitle,
      siteDescription,
      "heroArtworkSlug": heroArtwork->slug.current,
      "featuredArtworkSlugs": featuredArtworks[]->slug.current,
      "featuredJournalSlugs": featuredJournalPosts[]->slug.current,
      instagramProfileUrl,
      "instagramConnectionStatus": coalesce(instagramConnectionStatus, "manual"),
      facebookProfileUrl,
      "facebookConnectionStatus": coalesce(facebookConnectionStatus, "manual"),
      contactEmail,
      contactEnabled
    }
  `)
}
