import { isArtworkStatus, type ArtworkDocument, type ArtworkStatus } from './artwork-mutation'

// Sanity nacrti: izmena rada živi u `drafts.<id>` dok se ne objavi, isto kao u
// Sanity Studio-u. Javni sajt čita samo `<id>` (perspective: published), pa
// čuvanje nacrta ne menja javnu verziju.
//
// Dve odvojene informacije:
// - `status` = javna vidljivost objavljenog dokumenta (published/archived/draft).
//   Rad bez objavljenog dokumenta je uvek 'draft' (ili 'archived' ako je tako
//   označen nacrt) — nikad 'published', jer ga sajt ne vidi.
// - `hasDraft` = postoje sačuvane izmene koje još nisu objavljene.

export const DRAFT_PREFIX = 'drafts.'

export function draftIdOf(id: string) {
  return `${DRAFT_PREFIX}${id}`
}

export function baseIdOf(id: string) {
  return id.startsWith(DRAFT_PREFIX) ? id.slice(DRAFT_PREFIX.length) : id
}

/**
 * ID rada u URL-u je uvek objavljeni ID. Tačka nije dozvoljena, pa klijent ne
 * može direktno da cilja `drafts.*` ili druge verzije dokumenta.
 */
export function isArtworkBaseId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(value)
}

const SYSTEM_FIELDS = ['_rev', '_createdAt', '_updatedAt'] as const

export function withoutSystemFields(document: Record<string, unknown>) {
  const copy = structuredClone(document)
  for (const field of SYSTEM_FIELDS) delete copy[field]
  return copy
}

type Versioned = { _id: string; status?: unknown }

export function publicStatusOf(published: Versioned | null, draft: Versioned | null): ArtworkStatus {
  if (published) return isArtworkStatus(published.status) ? published.status : 'draft'
  return draft?.status === 'archived' ? 'archived' : 'draft'
}

/**
 * Spaja objavljene i draft redove u jednu stavku po radu. Sadržaj (naslov,
 * slika) dolazi iz nacrta ako postoji, jer to je ono što se uređuje.
 */
export function mergeArtworkVersions<T extends Versioned>(rows: T[]) {
  const groups = new Map<string, { published: T | null; draft: T | null }>()
  for (const row of rows) {
    const id = baseIdOf(row._id)
    const group = groups.get(id) ?? { published: null, draft: null }
    if (row._id.startsWith(DRAFT_PREFIX)) group.draft = row
    else group.published = row
    groups.set(id, group)
  }
  return [...groups.entries()].map(([id, { published, draft }]) => ({
    ...(draft ?? published)!,
    _id: id,
    status: publicStatusOf(published, draft),
    hasDraft: Boolean(draft),
    hasPublished: Boolean(published),
  }))
}

type Mutation = Record<string, unknown>

/**
 * Atomska objava. Obe verzije su zaštićene revizijom pročitanom neposredno pre
 * transakcije: ako ih neko (Studio, drugi telefon) promeni u međuvremenu, cela
 * transakcija pada sa 409 i ništa se ne menja.
 */
export function publishMutations(published: ArtworkDocument | null, draft: ArtworkDocument | null): {
  document: Record<string, unknown>
  mutations: Mutation[]
} {
  if (!draft) {
    if (!published) throw new Error('publishMutations requires at least one version')
    return {
      document: { ...published, status: 'published' },
      mutations: [{ patch: { id: published._id, ifRevisionID: published._rev, set: { status: 'published' } } }],
    }
  }

  const id = baseIdOf(draft._id)
  const document = { ...withoutSystemFields(draft), _id: id, status: 'published' }
  const mutations: Mutation[] = [
    { patch: { id: draft._id, ifRevisionID: draft._rev, set: { status: 'published' } } },
  ]
  if (published) {
    mutations.push(
      { patch: { id, ifRevisionID: published._rev, set: { status: 'published' } } },
      { createOrReplace: document },
    )
  } else {
    // `create` pada ako je objavljena verzija nastala u međuvremenu.
    mutations.push({ create: document })
  }
  mutations.push({ delete: { id: draft._id } })
  return { document, mutations }
}
