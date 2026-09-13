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

export { ARTWORK_STATUSES, isArtworkStatus } from './artwork-mutation'
export type { ArtworkStatus, ArtworkFormInput } from './artwork-mutation'
import { ArtworkMutationError, assertArtworkDocument, assertPublishableArtwork, artworkUpdateFields, type ArtworkStatus, type ArtworkFormInput, type ArtworkDocument } from './artwork-mutation'

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

/**
 * ID novog rada koji bira klijent, stabilan kroz ponovne pokušaje iste forme.
 * Ako je odgovor na prvi create izgubljen (timeout), ponovljeni zahtev ne pravi
 * drugi rad nego dobija `existed: true` i klijent šalje izmenu postojećeg.
 */
export function isClientArtworkId(value: unknown): value is string {
  return typeof value === 'string' && /^artwork-[A-Za-z0-9]{16,48}$/.test(value)
}

export async function adminCreateArtwork(input: ArtworkFormInput, clientId?: string) {
  const doc: { _type: 'artwork'; _id?: string; [key: string]: unknown } = {
    _type: 'artwork',
    ...(clientId ? { _id: clientId } : {}),
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

  assertPublishableArtwork(doc)
  try {
    const created = await adminSanityClient.create(doc)
    return { _id: created._id, existed: false }
  } catch (error) {
    if (!clientId || !isConflict(error)) throw error
    // Isti ID već postoji: ponovljen zahtev iste forme. Potvrdi da je to rad,
    // a ne slučajni sudar sa drugim tipom dokumenta.
    const existing = await adminSanityClient.fetch<{ _type: string } | null>(
      '*[_id == $id][0]{_type}', { id: clientId }, { perspective: 'raw' }
    )
    if (existing?._type !== 'artwork') throw error
    return { _id: clientId, existed: true }
  }
}

function isConflict(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 409)
}

async function readArtworkForMutation(id: string): Promise<ArtworkDocument> {
  const document = await adminSanityClient.fetch<ArtworkDocument | null>(
    '*[_id == $id][0]', { id }, { perspective: 'raw' }
  )
  assertArtworkDocument(document)
  return document
}

export async function adminUpdateArtwork(id: string, input: ArtworkFormInput) {
  const current = await readArtworkForMutation(id)
  const { set, unset } = artworkUpdateFields(current, input)
  let patch = adminSanityClient.patch(id).ifRevisionId(current._rev).set(set)
  if (unset.length) patch = patch.unset(unset)
  return commitArtworkPatch(() => patch.commit())
}

export async function adminSetArtworkStatus(id: string, status: ArtworkStatus) {
  const current = await readArtworkForMutation(id)
  assertPublishableArtwork({ ...current, status })
  return commitArtworkPatch(() => adminSanityClient.patch(id)
    .ifRevisionId(current._rev).set({ status }).commit())
}

async function commitArtworkPatch<T>(commit: () => Promise<T>): Promise<T> {
  try {
    return await commit()
  } catch (error) {
    if (isConflict(error)) {
      throw new ArtworkMutationError('Artwork changed. Reload it before saving again.', 409)
    }
    throw error
  }
}

export async function adminUploadArtworkImage(buffer: Buffer, filename: string) {
  return adminSanityClient.assets.upload('image', buffer, { filename })
}
