import 'server-only'

import { createClient } from 'next-sanity'

// Separate from src/lib/sanity/client.ts (the public site's cached, read-only
// client) — admin-api needs uncached reads (an artwork status change made a
// second ago must show up immediately) and, for mutations, a write-scoped
// token that must never be reachable from the public site bundle.
export const adminSanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN || undefined,
})

export function adminWriteConfigured() {
  return Boolean(process.env.SANITY_API_WRITE_TOKEN)
}

export const ARTWORK_STATUSES = ['draft', 'published', 'archived'] as const
export type ArtworkStatus = (typeof ARTWORK_STATUSES)[number]

export function isArtworkStatus(value: unknown): value is ArtworkStatus {
  return typeof value === 'string' && (ARTWORK_STATUSES as readonly string[]).includes(value)
}

export type AdminArtworkListItem = {
  _id: string
  title: string
  slug: string | null
  status: ArtworkStatus
  year: number | null
  featured: boolean
  thumbnailUrl: string | null
}

const ADMIN_ARTWORK_LIST_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  status,
  year,
  featured,
  "thumbnailUrl": primaryImage.asset->url
`

export async function adminListArtworks(): Promise<AdminArtworkListItem[]> {
  return adminSanityClient.fetch(
    `*[_type == "artwork"] | order(_createdAt desc) {${ADMIN_ARTWORK_LIST_FIELDS}}`
  )
}

// Faza 3 — puna forma. Ogranicena na polja iz "Osnovno" (02-PRODUCT_SPEC.md):
// title, year, medium, dimensions, primaryImage+alt, shortDescription, status,
// featured, heroCandidate. `detailImages`/`story`/`featuredOrder`/`instagramUrl`
// namerno izostavljeni iz ovog koraka (rich text/multi-upload su vece komponente,
// ne mesati sa osnovnim CRUD-om) — vidi STATUS.md.

export type AdminArtworkDetail = AdminArtworkListItem & {
  dimensions: string | null
  shortDescription: string | null
  heroCandidate: boolean
  medium: { _id: string; title: string } | null
  primaryImageAlt: string | null
}

const ADMIN_ARTWORK_DETAIL_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  status,
  year,
  featured,
  heroCandidate,
  dimensions,
  shortDescription,
  "thumbnailUrl": primaryImage.asset->url,
  "primaryImageAlt": primaryImage.alt,
  "medium": medium->{_id, title}
`

export async function adminGetArtwork(id: string): Promise<AdminArtworkDetail | null> {
  const results: AdminArtworkDetail[] = await adminSanityClient.fetch(
    `*[_type == "artwork" && _id == $id][0..0] {${ADMIN_ARTWORK_DETAIL_FIELDS}}`,
    { id }
  )
  return results[0] ?? null
}

export type AdminMediumOption = { _id: string; title: string }

export async function adminListMediums(): Promise<AdminMediumOption[]> {
  return adminSanityClient.fetch(`*[_type == "medium"] | order(order asc, title asc) {_id, title}`)
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

export type ArtworkFormInput = {
  title: string
  year: number | null
  dimensions: string | null
  shortDescription: string | null
  status: ArtworkStatus
  featured: boolean
  heroCandidate: boolean
  mediumId: string | null
  primaryImage: { assetId: string; alt: string } | null
}

export async function adminCreateArtwork(input: ArtworkFormInput) {
  const doc: { _type: 'artwork'; [key: string]: unknown } = {
    _type: 'artwork',
    title: input.title,
    slug: { _type: 'slug', current: `${slugify(input.title)}-${Date.now().toString(36)}` },
    status: input.status,
    year: input.year,
    dimensions: input.dimensions,
    shortDescription: input.shortDescription,
    featured: input.featured,
    heroCandidate: input.heroCandidate,
  }

  if (input.mediumId) {
    doc.medium = { _type: 'reference', _ref: input.mediumId }
  }

  if (input.primaryImage) {
    doc.primaryImage = {
      _type: 'image',
      alt: input.primaryImage.alt,
      asset: { _type: 'reference', _ref: input.primaryImage.assetId },
    }
  }

  return adminSanityClient.create(doc)
}

export async function adminUpdateArtwork(id: string, input: ArtworkFormInput) {
  const patch: Record<string, unknown> = {
    title: input.title,
    status: input.status,
    year: input.year,
    dimensions: input.dimensions,
    shortDescription: input.shortDescription,
    featured: input.featured,
    heroCandidate: input.heroCandidate,
  }

  if (input.mediumId) {
    patch.medium = { _type: 'reference', _ref: input.mediumId }
  }

  if (input.primaryImage) {
    patch.primaryImage = {
      _type: 'image',
      alt: input.primaryImage.alt,
      asset: { _type: 'reference', _ref: input.primaryImage.assetId },
    }
  }

  // Parcijalna mutacija (samo poznata polja) — nepoznata polja (detailImages,
  // story, featuredOrder, instagramUrl...) ostaju netaknuta, po
  // sanity-proxy-mutation skill-u.
  return adminSanityClient.patch(id).set(patch).commit()
}

export async function adminUploadArtworkImage(buffer: Buffer, filename: string) {
  return adminSanityClient.assets.upload('image', buffer, { filename })
}
