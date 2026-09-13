import { adminFetch, newClientArtworkId } from './admin'
import type { AdminSession } from '@/auth/session'

export type ContentField = {
  name: string; title: string;
  kind: 'string' | 'text' | 'number' | 'boolean' | 'select' | 'date' | 'url' | 'slug' | 'image' | 'images' | 'reference' | 'references' | 'portableText' | 'info';
  required?: boolean; options?: {title: string; value: string}[]; referenceType?: string;
  initialValue?: unknown; altRequired?: boolean; allowImages?: boolean;
}
export type ContentType = {name: string; title: string; singleton?: string; fields: ContentField[]; titleField: string; imageField?: string}
export type ContentItem = {
  _id: string; revision: string; hasDraft: boolean; hasPublished: boolean;
  publicationStatus: 'draft' | 'changed' | 'published'; document: Record<string, unknown>; title?: string;
}
const base = '/api/admin/content'
const path = (type: string, id?: string) => `${base}/${encodeURIComponent(type)}${id ? `/${encodeURIComponent(id)}` : ''}`
export async function fetchContentTypes(session: AdminSession) {
  return (await adminFetch<{types: ContentType[]}>(`${base}/schema`, {method:'GET',token:session.token})).types
}
export async function fetchContents(session: AdminSession, type: string) {
  return (await adminFetch<{contents: ContentItem[]}>(path(type), {method:'GET',token:session.token})).contents
}
export async function fetchContent(session: AdminSession, type: string, id: string) {
  return (await adminFetch<{content: ContentItem}>(path(type,id), {method:'GET',token:session.token})).content
}
export async function createContent(session: AdminSession, type: string, clientId: string, fields: Record<string, unknown>) {
  return (await adminFetch<{content: ContentItem & {existed?: boolean}}>(path(type), {method:'POST',token:session.token,body:JSON.stringify({clientId,fields})})).content
}
export async function saveContent(session: AdminSession, type: string, id: string, fields: Record<string, unknown>, baseRevision: string) {
  return (await adminFetch<{content: ContentItem}>(path(type,id), {method:'PATCH',token:session.token,body:JSON.stringify({fields,baseRevision})})).content
}
export async function publishContent(session: AdminSession, type: string, id: string, baseRevision: string) {
  return (await adminFetch<{content: ContentItem}>(`${path(type,id)}/publish`, {method:'POST',token:session.token,body:JSON.stringify({baseRevision})})).content
}
export async function removeContent(session: AdminSession, type: string, id: string, baseRevision: string, discard: boolean, unlinkReferences = false) {
  return adminFetch<{deleted:boolean}>(`${path(type,id)}${discard ? '/discard' : ''}`, {method:discard ? 'POST' : 'DELETE',token:session.token,body:JSON.stringify({baseRevision,confirm:true,...(unlinkReferences ? {unlinkReferences:true} : {})})})
}
/** Gde se dokument koristi (izdvojeni radovi, naslovni rad, povezani radovi…) — prikazuje se pre brisanja. */
export type ContentUsage = { _id: string; type: string; typeTitle: string; title: string; fields: string[]; unlinkable: boolean }
export async function fetchContentUsage(session: AdminSession, type: string, id: string) {
  return (await adminFetch<{usage: ContentUsage[]}>(`${path(type,id)}?usage=1`, {method:'GET',token:session.token})).usage
}
export function newContentId(type: string) { return `${type}-${newClientArtworkId().slice(8)}` }
export function contentImageUrl(value: unknown, width = 800): string | null {
  if (!value || typeof value !== 'object') return null
  // Već razrešen asset (npr. izolovani QA server) ima direktan URL.
  const direct = (value as {asset?:{url?:unknown}}).asset?.url
  if (typeof direct === 'string' && /^https?:\/\//.test(direct)) return direct
  const asset = (value as {asset?:{_ref?:string}}).asset?._ref
  const match = asset?.match(/^image-([a-zA-Z0-9]+)-(\d+x\d+)-(jpg|jpeg|png|webp|gif|avif)$/)
  return match ? `https://cdn.sanity.io/images/qm16j7ru/production/${match[1]}-${match[2]}.${match[3]}?w=${width}&fit=max&auto=format` : null
}

export async function getContentPreviewUrl(session: AdminSession, type: 'artwork' | 'journalPost', slug: string) {
  return (await adminFetch<{url:string}>('/api/admin/preview-link', {method:'POST',token:session.token,body:JSON.stringify({type,slug})})).url
}

/** Naslovna slika unosa: glavna slika tipa, inače prva fotografija iz galerije (izložbe, edukacija). */
export function contentCover(type: ContentType | undefined, document: Record<string, unknown> | undefined, width = 800): string | null {
  if (!type || !document) return null
  if (type.imageField) {
    const main = contentImageUrl(document[type.imageField], width)
    if (main) return main
  }
  const gallery = type.fields.find(field => field.kind === 'images')
  const first = gallery && Array.isArray(document[gallery.name]) ? (document[gallery.name] as unknown[])[0] : null
  return contentImageUrl(first, width)
}
