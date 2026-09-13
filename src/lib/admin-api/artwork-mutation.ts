export const ARTWORK_STATUSES = ['draft', 'published', 'archived'] as const
export type ArtworkStatus = (typeof ARTWORK_STATUSES)[number]

export function isArtworkStatus(value: unknown): value is ArtworkStatus {
  return typeof value === 'string' && (ARTWORK_STATUSES as readonly string[]).includes(value)
}

// Forma više ne nosi status: čuvanje uvek ide u nacrt (`drafts.<id>`), a
// javna vidljivost se menja samo zasebnom akcijom objave ili promene statusa.
export type ArtworkFormInput = {
  title: string
  year: number | null
  dimensions: string | null
  shortDescription: string | null
  featured: boolean
  heroCandidate: boolean
  mediumId?: string | null
  primaryImageAlt?: string
  primaryImage: { assetId: string; alt: string } | null
}

export class ArtworkMutationError extends Error {
  constructor(message: string, public readonly status: 400 | 404 | 409) {
    super(message)
    this.name = 'ArtworkMutationError'
  }
}

export type ArtworkDocument = {
  _id: string
  _rev: string
  _type: string
  [key: string]: unknown
}

export function assertArtworkDocument(document: ArtworkDocument | null): asserts document is ArtworkDocument {
  if (!document || document._type !== 'artwork') {
    throw new ArtworkMutationError('Artwork not found.', 404)
  }
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : {}
}

export function assertPublishableArtwork(document: Record<string, unknown>) {
  if (document.status !== 'published') return
  const image = record(document.primaryImage)
  const asset = record(image.asset)
  if (typeof document.title !== 'string' || !document.title.trim()) {
    throw new ArtworkMutationError('A title is required to publish artwork.', 400)
  }
  if (typeof asset._ref !== 'string' || !asset._ref.trim()) {
    throw new ArtworkMutationError('A primary image is required to publish artwork.', 400)
  }
  if (typeof image.alt !== 'string' || !image.alt.trim()) {
    throw new ArtworkMutationError('A primary image alt description is required to publish artwork.', 400)
  }
}

// Only known form fields are patched. In particular an alt-only change never
// replaces the image object, so crop/hotspot and future image fields survive.
// Nacrt sme biti nepotpun: validacija objave radi se tek pri objavi.
export function artworkUpdateFields(current: ArtworkDocument, input: ArtworkFormInput) {
  assertArtworkDocument(current)
  const set: Record<string, unknown> = {
    title: input.title, year: input.year,
    dimensions: input.dimensions, shortDescription: input.shortDescription,
    featured: input.featured, heroCandidate: input.heroCandidate,
  }
  const unset: string[] = []
  if (input.mediumId === null) unset.push('medium')
  else if (input.mediumId !== undefined) set.medium = { _type: 'reference', _ref: input.mediumId }

  if (input.primaryImage) {
    set.primaryImage = {
      _type: 'image', alt: input.primaryImage.alt,
      asset: { _type: 'reference', _ref: input.primaryImage.assetId },
    }
  } else if (input.primaryImageAlt !== undefined) {
    if (typeof record(record(current.primaryImage).asset)._ref !== 'string') {
      if (input.primaryImageAlt.trim()) {
        throw new ArtworkMutationError('Upload a primary image before changing its alt description.', 400)
      }
    } else {
      set['primaryImage.alt'] = input.primaryImageAlt
    }
  }
  return { set, unset }
}

/** Primenjuje isti set/unset kao patch, ali na kopiju dokumenta (za novi nacrt). */
export function applyArtworkFields(current: ArtworkDocument, input: ArtworkFormInput) {
  const { set, unset } = artworkUpdateFields(current, input)
  const next: Record<string, unknown> = structuredClone(current)
  for (const [key, value] of Object.entries(set)) {
    if (key === 'primaryImage.alt') next.primaryImage = { ...record(next.primaryImage), alt: value }
    else next[key] = value
  }
  for (const key of unset) delete next[key]
  return next as ArtworkDocument
}
