import 'server-only'

import { ARTWORK_STATUSES, isArtworkStatus, type ArtworkFormInput } from '@/lib/admin-api/sanity'

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

  const status = b.status
  if (!isArtworkStatus(status)) {
    return { ok: false, error: `status must be one of: ${ARTWORK_STATUSES.join(', ')}.` }
  }

  const year = normalizeOptionalNumber(b.year)
  if (year === 'invalid') {
    return { ok: false, error: 'year must be a number or null.' }
  }

  const dimensions = normalizeOptionalString(b.dimensions)
  const shortDescription = normalizeOptionalString(b.shortDescription)
  const mediumId = normalizeOptionalString(b.mediumId)

  const featured = Boolean(b.featured)
  const heroCandidate = Boolean(b.heroCandidate)

  let primaryImage: ArtworkFormInput['primaryImage'] = null
  if (b.primaryImage && typeof b.primaryImage === 'object') {
    const img = b.primaryImage as Record<string, unknown>
    const assetId = typeof img.assetId === 'string' ? img.assetId : ''
    const alt = typeof img.alt === 'string' ? img.alt.trim() : ''
    if (!assetId || !alt) {
      return { ok: false, error: 'primaryImage requires assetId and a non-empty alt.' }
    }
    primaryImage = { assetId, alt }
  }

  return {
    ok: true,
    data: { title, status, year, dimensions, shortDescription, featured, heroCandidate, mediumId, primaryImage },
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
