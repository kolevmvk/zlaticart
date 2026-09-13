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
export async function removeContent(session: AdminSession, type: string, id: string, baseRevision: string, discard: boolean) {
  return adminFetch<{deleted:boolean}>(`${path(type,id)}${discard ? '/discard' : ''}`, {method:discard ? 'POST' : 'DELETE',token:session.token,body:JSON.stringify({baseRevision,confirm:true})})
}
export function newContentId(type: string) { return `${type}-${newClientArtworkId().slice(8)}` }
export function contentImageUrl(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  const asset = (value as {asset?:{_ref?:string}}).asset?._ref
  const match = asset?.match(/^image-([a-zA-Z0-9]+)-(\d+x\d+)-(jpg|jpeg|png|webp|gif|avif)$/)
  return match ? `https://cdn.sanity.io/images/qm16j7ru/production/${match[1]}-${match[2]}.${match[3]}?w=800&fit=max&auto=format` : null
}

export async function getContentPreviewUrl(session: AdminSession, type: 'artwork' | 'journalPost', slug: string) {
  return (await adminFetch<{url:string}>('/api/admin/preview-link', {method:'POST',token:session.token,body:JSON.stringify({type,slug})})).url
}
