import type { ArtworkFormInput } from '../../../../lib/admin-api/artwork-mutation'

type ParseResult =
  | { ok: true; data: ArtworkFormInput }
  | { ok: false; error: string }

// Deljeno izmedju POST /api/admin/artworks (create) i PATCH .../[id] (update)
// — ista validacija za oba, da forma na mobilnom ne moze da posalje razlicito
// validne payloade za novi vs. postojeci rad.
export function parseArtworkFormInput(body: unknown): ParseResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid JSON body.' }
  }

  const b = body as Record<string, unknown>

  const title = typeof b.title === 'string' ? b.title.trim() : ''
  if (!title) {
    return { ok: false, error: 'title is required.' }
  }

  // `status` se namerno ignoriše: čuvanje ide u nacrt, a objava/vidljivost su
  // zasebne rute (publish, status). Stariji klijent koji ga šalje ne menja sajt.

  const year = normalizeOptionalNumber(b.year)
  if (year === 'invalid') {
    return { ok: false, error: 'year must be a number or null.' }
  }

  const dimensions = normalizeOptionalString(b.dimensions)
  const shortDescription = normalizeOptionalString(b.shortDescription)
  if (b.mediumId !== undefined && b.mediumId !== null && typeof b.mediumId !== 'string') {
    return { ok: false, error: 'mediumId must be a string or null.' }
  }
  const mediumId = b.mediumId === undefined ? undefined : normalizeOptionalString(b.mediumId)
  if (b.primaryImageAlt !== undefined && typeof b.primaryImageAlt !== 'string') {
    return { ok: false, error: 'primaryImageAlt must be a string.' }
  }
  const primaryImageAlt = typeof b.primaryImageAlt === 'string' ? b.primaryImageAlt.trim() : undefined

  const featured = Boolean(b.featured)
  const heroCandidate = Boolean(b.heroCandidate)

  let primaryImage: ArtworkFormInput['primaryImage'] = null
  if (b.primaryImage !== null && b.primaryImage !== undefined) {
    if (typeof b.primaryImage !== 'object' || Array.isArray(b.primaryImage)) {
      return { ok: false, error: 'primaryImage must be an image object or null.' }
    }
    const img = b.primaryImage as Record<string, unknown>
    const assetId = typeof img.assetId === 'string' ? img.assetId.trim() : ''
    const alt = typeof img.alt === 'string' ? img.alt.trim() : ''
    if (!assetId || !alt) {
      return { ok: false, error: 'primaryImage requires assetId and a non-empty alt.' }
    }
    primaryImage = { assetId, alt }
  }

  return {
    ok: true,
    data: { title, year, dimensions, shortDescription, featured, heroCandidate, mediumId, primaryImage, primaryImageAlt },
  }
}

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function normalizeOptionalNumber(value: unknown): number | null | 'invalid' {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : 'invalid'
}

/** Revizija koju je forma učitala; vidi adminSaveArtworkDraft. */
export function readBaseRevision(body: unknown): { ok: true; value?: string } | { ok: false; error: string } {
  const value = body && typeof body === 'object' ? (body as Record<string, unknown>).baseRevision : undefined
  if (value === undefined) return { ok: true }
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(value)) {
    return { ok: false, error: 'baseRevision must be a revision string.' }
  }
  return { ok: true, value }
}
