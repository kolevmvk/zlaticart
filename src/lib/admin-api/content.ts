import 'server-only'
import type { Mutation } from 'next-sanity'
import { adminSanityClient } from './sanity'
import { baseIdOf, draftIdOf, isArtworkBaseId, withoutSystemFields } from './artwork-drafts'
import { getContentType, validateContent, type ContentType } from './content-types'

export class ContentError extends Error {
  constructor(message: string, public status: number) { super(message) }
}
export type ContentDocument = Record<string, unknown> & { _id: string; _type: string; _rev: string }
export function contentType(name: string) {
  const type = getContentType(name)
  if (!type) throw new ContentError('Sekcija nije pronađena.', 404)
  return type
}
function assertId(id: string) {
  if (!isArtworkBaseId(id)) throw new ContentError('Dokument nije pronađen.', 404)
}
async function versions(type: ContentType, id: string) {
  assertId(id)
  const rows = await adminSanityClient.fetch<ContentDocument[]>('*[_id in [$id, $draftId]]', { id, draftId: draftIdOf(id) })
  if (rows.some(row => row._type !== type.name)) throw new ContentError('Dokument nije pronađen.', 404)
  return { published: rows.find(row => row._id === id) ?? null, draft: rows.find(row => row._id === draftIdOf(id)) ?? null }
}
function detail(published: ContentDocument | null, draft: ContentDocument | null) {
  const current = draft ?? published
  if (!current) throw new ContentError('Dokument nije pronađen.', 404)
  return { _id: baseIdOf(current._id), revision: current._rev, hasDraft: Boolean(draft), hasPublished: Boolean(published),
    publicationStatus: draft ? published ? 'changed' : 'draft' : 'published', document: current }
}
export async function getContent(type: ContentType, id: string) {
  const { published, draft } = await versions(type, id)
  return detail(published, draft)
}
export async function listContent(type: ContentType) {
  const rows = await adminSanityClient.fetch<ContentDocument[]>('*[_type == $type && !(_id in path("versions.**"))] | order(_updatedAt desc)', { type: type.name })
  const groups = new Map<string, { published: ContentDocument | null; draft: ContentDocument | null }>()
  for (const row of rows) {
    const id = baseIdOf(row._id)
    const pair = groups.get(id) ?? { published: null, draft: null }
    pair[row._id.startsWith('drafts.') ? 'draft' : 'published'] = row
    groups.set(id, pair)
  }
  return [...groups.values()].map(({ published, draft }) => {
    const item = detail(published, draft)
    return { ...item, title: String(item.document[type.titleField] ?? 'Bez naslova') }
  })
}
function revision(current: ContentDocument, baseRevision: unknown) {
  if (typeof baseRevision !== 'string' || !baseRevision) throw new ContentError('Nedostaje revizija dokumenta. Učitajte ponovo.', 400)
  if (current._rev !== baseRevision) throw new ContentError('Dokument je izmenjen na drugom mestu. Učitajte ponovo.', 409)
}
function fieldsInput(type: ContentType, input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ContentError('Polja nisu ispravna.', 400)
  const fields = input as Record<string, unknown>
  for (const key of Object.keys(fields)) {
    if (!type.fields.some(field => field.name === key && field.kind !== 'info')) throw new ContentError(`Nepoznato ili zaštićeno polje: ${key}`, 400)
  }
  const error = validateContent(type, fields, false)
  if (error) throw new ContentError(error, 400)
  return fields
}
// Nested extensions from Studio survive partial image edits and keyed-array reordering.
function mergeValue(previous: unknown, value: unknown): unknown {
  if (Array.isArray(value)) {
    const old = Array.isArray(previous) ? previous : []
    return value.map(item => {
      const key = item && typeof item === 'object' ? item._key : undefined
      return mergeValue(key ? old.find(v => v && v._key === key) : undefined, item)
    })
  }
  if (value && typeof value === 'object' && previous && typeof previous === 'object' && !Array.isArray(previous)) {
    return apply(previous as Record<string, unknown>, value as Record<string, unknown>)
  }
  return structuredClone(value)
}
function apply(current: Record<string, unknown>, fields: Record<string, unknown>) {
  const next = structuredClone(current)
  for (const [key, value] of Object.entries(fields)) {
    if (value === null) delete next[key]
    else next[key] = mergeValue(next[key], value)
  }
  return next
}
function guard(document: ContentDocument) {
  return { patch: { id: document._id, ifRevisionID: document._rev } }
}
async function commit(mutations: Record<string, unknown>[]) {
  try {
    const result = await adminSanityClient.mutate(mutations as Mutation[], { returnDocuments: false, returnFirst: false })
    return result.transactionId
  } catch (error) {
    const status = error && typeof error === 'object' && 'statusCode' in error ? error.statusCode : null
    if (status === 409) throw new ContentError('Dokument je izmenjen ili se koristi u drugom sadržaju. Učitajte ponovo.', 409)
    throw error
  }
}
export async function createContent(type: ContentType, clientId: unknown, input: unknown) {
  if (typeof clientId !== 'string' || !isArtworkBaseId(clientId)) throw new ContentError('Nedostaje ispravan ID novog dokumenta.', 400)
  const fields = fieldsInput(type, input)
  if (type.singleton) {
    const existing = await listContent(type)
    if (existing.length) return { ...existing[0], existed: true }
    if (clientId !== type.singleton) throw new ContentError('Koristite jedinstveni dokument ove sekcije.', 400)
  }
  const existing = await versions(type, clientId)
  if (existing.draft || existing.published) return { ...detail(existing.published, existing.draft), existed: true }
  const defaults = Object.fromEntries(type.fields.filter(f => f.initialValue !== undefined).map(f => [f.name, f.initialValue]))
  const doc = apply({ ...defaults, _id: draftIdOf(clientId), _type: type.name }, fields)
  try { await commit([{ create: doc }]) } catch (error) {
    if (!(error instanceof ContentError) || error.status !== 409) throw error
    return { ...await getContent(type, clientId), existed: true }
  }
  return { ...await getContent(type, clientId), existed: false }
}
export async function saveContent(type: ContentType, id: string, input: unknown, baseRevision: unknown) {
  const fields = fieldsInput(type, input)
  const { published, draft } = await versions(type, id)
  const current = draft ?? published
  if (!current) throw new ContentError('Dokument nije pronađen.', 404)
  revision(current, baseRevision)
  const next = apply(current, fields)
  const error = validateContent(type, next, false)
  if (error) throw new ContentError(error, 400)
  if (draft) {
    const set = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== null).map(([key]) => [key, next[key]]))
    const unset = Object.keys(fields).filter(key => fields[key] === null)
    await commit([{ patch: { id: draft._id, ifRevisionID: draft._rev, set, ...(unset.length ? { unset } : {}) } }])
  } else {
    await commit([guard(current), { create: { ...withoutSystemFields(next), _id: draftIdOf(id) } }])
  }
  return getContent(type, id)
}
async function validateReferences(type: ContentType, document: Record<string, unknown>) {
  for (const field of type.fields.filter(f => f.referenceType)) {
    const value = document[field.name]
    const refs = (Array.isArray(value) ? value : value ? [value] : []) as { _ref: string }[]
    if (!refs.length) continue
    const ids = refs.map(ref => ref._ref)
    const found = await adminSanityClient.fetch<{ _id: string }[]>('*[_id in $ids && _type == $type]{_id}', { ids, type: field.referenceType! })
    if (ids.some(id => !found.some(row => row._id === id))) throw new ContentError(`${field.title}: prvo objavite izabrani povezani sadržaj.`, 400)
  }
  const slug = document.slug as { current?: string } | undefined
  if (slug?.current) {
    const duplicates = await adminSanityClient.fetch<{ _id: string }[]>('*[_type == $type && slug.current == $slug && !(_id in [$id, $draftId]) && !(_id in path("versions.**"))]{_id}',
      { type: type.name, slug: slug.current, id: baseIdOf(String(document._id)), draftId: draftIdOf(baseIdOf(String(document._id))) })
    if (duplicates.length) throw new ContentError('Ovu adresu već koristi drugi dokument.', 409)
  }
}
export async function publishContent(type: ContentType, id: string, baseRevision: unknown) {
  const { published, draft } = await versions(type, id)
  const current = draft ?? published
  if (!current) throw new ContentError('Dokument nije pronađen.', 404)
  revision(current, baseRevision)
  const document = { ...withoutSystemFields(current), _id: id, ...(type.name === 'artwork' ? { status: 'published' } : {}) }
  const error = validateContent(type, document, true)
  if (error) throw new ContentError(error, 400)
  await validateReferences(type, document)
  const mutations: Record<string, unknown>[] = []
  if (draft) mutations.push(guard(draft))
  if (published) mutations.push(guard(published), { createOrReplace: document })
  else mutations.push({ create: document })
  if (draft) mutations.push({ delete: { id: draft._id } })
  await commit(mutations)
  return getContent(type, id)
}
export async function removeContent(type: ContentType, id: string, baseRevision: unknown, discard: boolean) {
  const { published, draft } = await versions(type, id)
  const current = draft ?? published
  if (!current) throw new ContentError('Dokument nije pronađen.', 404)
  revision(current, baseRevision)
  const targets = discard ? draft ? [draft] : [] : [draft, published].filter((d): d is ContentDocument => Boolean(d))
  if (!targets.length) throw new ContentError('Nema nacrta za odbacivanje.', 400)
  const ids = targets.map(d => d._id)
  const references = await adminSanityClient.fetch<{ _id: string }[]>('*[!(_id in $ids) && references($ids)]{_id}', { ids })
  if (references.length) throw new ContentError('Dokument se koristi u drugom sadržaju. Najpre uklonite povezivanja.', 409)
  await commit([...targets.map(guard), ...targets.map(doc => ({ delete: { id: doc._id } }))])
  return { _id: id, deleted: !discard || !published }
}
