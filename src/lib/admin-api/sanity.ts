import 'server-only'

import { createClient, type MultipleMutationResult, type Mutation } from 'next-sanity'

// Separate from src/lib/sanity/client.ts (the public site's cached, read-only
// client) — admin-api needs uncached reads (an artwork status change made a
// second ago must show up immediately) and, for mutations, a write-scoped
// token that must never be reachable from the public site bundle.
export const adminSanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  // Admin mora da vidi i `drafts.*` dokumente; spajanje verzija radi kod.
  perspective: 'raw',
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN || undefined,
})

export function adminWriteConfigured() {
  return Boolean(process.env.SANITY_API_WRITE_TOKEN)
}

export { ARTWORK_STATUSES, isArtworkStatus } from './artwork-mutation'
export type { ArtworkStatus, ArtworkFormInput } from './artwork-mutation'
export { isArtworkBaseId } from './artwork-drafts'
import { ArtworkMutationError, applyArtworkFields, assertArtworkDocument, assertPublishableArtwork, artworkUpdateFields, type ArtworkStatus, type ArtworkFormInput, type ArtworkDocument } from './artwork-mutation'
import { draftIdOf, mergeArtworkVersions, publicStatusOf, publishMutations, withoutSystemFields } from './artwork-drafts'

export type AdminArtworkListItem = {
  _id: string
  title: string
  slug: string | null
  /** Javna vidljivost; vidi artwork-drafts.ts. */
  status: ArtworkStatus
  /** Postoje sačuvane izmene koje još nisu objavljene. */
  hasDraft: boolean
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
  const rows: (Omit<AdminArtworkListItem, 'hasDraft'>)[] = await adminSanityClient.fetch(
    `*[_type == "artwork"] | order(_createdAt desc) {${ADMIN_ARTWORK_LIST_FIELDS}}`
  )
  return mergeArtworkVersions(rows)
}

// Faza 3 — puna forma. Ogranicena na polja iz "Osnovno" (02-PRODUCT_SPEC.md):
// title, year, medium, dimensions, primaryImage+alt, shortDescription,
// featured, heroCandidate. `detailImages`/`story`/`featuredOrder`/`instagramUrl`
// namerno izostavljeni iz ovog koraka (rich text/multi-upload su vece komponente,
// ne mesati sa osnovnim CRUD-om) — vidi STATUS.md.

export type AdminArtworkDetail = AdminArtworkListItem & {
  dimensions: string | null
  shortDescription: string | null
  heroCandidate: boolean
  medium: { _id: string; title: string } | null
  primaryImageAlt: string | null
  /** Da li rad ima objavljenu verziju (može biti i arhivirana). */
  hasPublished: boolean
  /** Revizija verzije koja se uređuje; forma je vraća pri čuvanju/objavi. */
  revision: string
}

const ADMIN_ARTWORK_DETAIL_FIELDS = `
  _id,
  _rev,
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
  const rows: (Omit<AdminArtworkDetail, 'hasDraft' | 'hasPublished' | 'revision'> & { _rev: string })[] =
    await adminSanityClient.fetch(
      `*[_type == "artwork" && _id in [$id, $draftId]] {${ADMIN_ARTWORK_DETAIL_FIELDS}}`,
      { id, draftId: draftIdOf(id) }
    )
  const [merged] = mergeArtworkVersions(rows)
  if (!merged) return null
  const { _rev, ...artwork } = merged
  return { ...artwork, revision: _rev }
}

export type AdminMediumOption = { _id: string; title: string }

export async function adminListMediums(): Promise<AdminMediumOption[]> {
  return adminSanityClient.fetch(`*[_type == "medium" && !(_id in path("drafts.**"))] | order(order asc, title asc) {_id, title}`)
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

export type ArtworkWriteResult = { _id: string; revision: string; slug: string | null }

function transactionRevision(result: MultipleMutationResult) {
  // Sanity dodeljuje dokumentu `_rev` jednak ID-ju transakcije koja ga je promenila.
  if (typeof result.transactionId !== 'string') throw new Error('Sanity mutation returned no transaction id')
  return result.transactionId
}

/** Novi rad nastaje samo kao nacrt; javni sajt ga ne vidi dok se ne objavi. */
export async function adminCreateArtwork(input: ArtworkFormInput, clientId?: string) {
  const slug = `${slugify(input.title)}-${Date.now().toString(36)}`
  const doc: { _type: 'artwork'; _id: string; [key: string]: unknown } = {
    _type: 'artwork',
    // Završna tačka: Sanity dodaje nasumičan ID iza prefiksa.
    _id: clientId ? draftIdOf(clientId) : 'drafts.',
    title: input.title,
    slug: { _type: 'slug', current: slug },
    status: 'draft',
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

  // Ponovljen zahtev posle objave: nacrt više ne postoji, pa `create` ne bi
  // pao — bez ove provere nastao bi nov nacrt preko već objavljenog rada.
  if (clientId) {
    const existing = await findExistingCreate(clientId)
    if (existing) return existing
  }

  try {
    const result = await commitMutations([{ create: doc }])
    const createdId = result.results[0]?.id ?? doc._id
    return {
      _id: createdId.replace(/^drafts\./, ''),
      revision: transactionRevision(result),
      slug,
      existed: false,
    }
  } catch (error) {
    if (!clientId || !isConflict(error)) throw error
    // Paralelan ponovljen zahtev je stigao prvi.
    const existing = await findExistingCreate(clientId)
    if (!existing) throw error
    return existing
  }
}

/** Isti clientId već postoji (nacrt ili objavljen rad): vrati ga umesto duplikata. */
async function findExistingCreate(clientId: string) {
  const documents = await adminSanityClient.fetch<ArtworkDocument[]>(
    '*[_id in [$id, $draftId]]', { id: clientId, draftId: draftIdOf(clientId) }
  )
  if (!documents.length) return null
  // Potvrdi da je to rad, a ne slučajni sudar sa drugim tipom dokumenta.
  for (const document of documents) assertArtworkDocument(document)
  const current = documents.find(document => document._id === draftIdOf(clientId)) ?? documents[0]
  return { _id: clientId, revision: current._rev, slug: readSlug(current), existed: true }
}

function isConflict(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 409)
}

function readSlug(document: ArtworkDocument) {
  const slug = document.slug
  return slug && typeof slug === 'object' && 'current' in slug && typeof slug.current === 'string'
    ? slug.current : null
}

async function readArtworkVersions(id: string) {
  const documents = await adminSanityClient.fetch<ArtworkDocument[]>(
    '*[_id in [$id, $draftId]]', { id, draftId: draftIdOf(id) }
  )
  const published = documents.find(document => document._id === id) ?? null
  const draft = documents.find(document => document._id === draftIdOf(id)) ?? null
  if (published) assertArtworkDocument(published)
  if (draft) assertArtworkDocument(draft)
  if (!published && !draft) throw new ArtworkMutationError('Artwork not found.', 404)
  return { published, draft }
}

/**
 * `baseRevision` je revizija koju je forma učitala. Ako se rad u međuvremenu
 * promenio (Studio, drugi uređaj), čuvanje se odbija umesto da tiho prepiše tuđu izmenu.
 */
function assertBaseRevision(current: ArtworkDocument, baseRevision?: string) {
  if (baseRevision !== undefined && baseRevision !== current._rev) {
    throw new ArtworkMutationError('Artwork changed. Reload it before saving again.', 409)
  }
}

/** Čuva izmene u `drafts.<id>`. Objavljena verzija ostaje netaknuta. */
export async function adminSaveArtworkDraft(id: string, input: ArtworkFormInput, baseRevision?: string): Promise<ArtworkWriteResult> {
  const { published, draft } = await readArtworkVersions(id)

  if (draft) {
    assertBaseRevision(draft, baseRevision)
    const { set, unset } = artworkUpdateFields(draft, input)
    const result = await commitArtworkMutations([{
      patch: { id: draft._id, ifRevisionID: draft._rev, set, ...(unset.length ? { unset } : {}) },
    }])
    return { _id: id, revision: transactionRevision(result), slug: readSlug(draft) }
  }

  const source = published!
  assertBaseRevision(source, baseRevision)
  const next = applyArtworkFields(source, input)
  const document = { ...withoutSystemFields(next), _id: draftIdOf(id) }
  // `create` pada sa 409 ako je nacrt nastao u međuvremenu.
  const result = await commitArtworkMutations([{ create: document }])
  return { _id: id, revision: transactionRevision(result), slug: readSlug(source) }
}

/**
 * Objavljuje nacrt (ili ponovo objavljuje arhiviran/skriven rad bez nacrta).
 * Validacija se radi nad tačno onim dokumentom koji postaje javan.
 */
export async function adminPublishArtwork(id: string, revision?: string): Promise<ArtworkWriteResult> {
  const { published, draft } = await readArtworkVersions(id)
  assertBaseRevision((draft ?? published)!, revision)

  const { document, mutations } = publishMutations(published, draft)
  assertPublishableArtwork(document)
  const result = await commitArtworkMutations(mutations)
  return { _id: id, revision: transactionRevision(result), slug: readSlug(document as ArtworkDocument) }
}

/**
 * Promena javne vidljivosti. 'published' je objava (uključuje nacrt ako
 * postoji). 'archived'/'draft' skrivaju objavljenu verziju sa sajta i ne diraju
 * nacrt; rad koji nikad nije objavljen menja oznaku na samom nacrtu.
 */
export async function adminSetArtworkStatus(id: string, status: ArtworkStatus) {
  if (status === 'published') {
    await adminPublishArtwork(id)
    return { status: 'published' as const }
  }
  const { published, draft } = await readArtworkVersions(id)
  const target = (published ?? draft)!
  await commitArtworkMutations([{ patch: { id: target._id, ifRevisionID: target._rev, set: { status } } }])
  return {
    status: publicStatusOf(published ? { ...published, status } : null, published ? draft : { ...target, status }),
  }
}

function commitMutations(mutations: Record<string, unknown>[]) {
  // Jedan zahtev = jedna atomska Sanity transakcija.
  return adminSanityClient.mutate(mutations as Mutation[], { returnDocuments: false, returnFirst: false })
}

async function commitArtworkMutations(mutations: Record<string, unknown>[]) {
  try {
    return await commitMutations(mutations)
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
