import type { AdminSession } from '@/auth/session'

type AdminApiSuccess<T> = {
  ok: true
  data: T
}

type AdminApiFailure = {
  ok: false
  error: string
}

type AdminApiResponse<T> = AdminApiSuccess<T> | AdminApiFailure

const API_BASE_URL = process.env.EXPO_PUBLIC_ADMIN_API_URL ?? ''

export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
  }
}

export async function loginWithPin(pin: string): Promise<AdminSession> {
  const response = await adminFetch<{ token: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  })

  return { token: response.token }
}

export async function logoutSession(session: AdminSession): Promise<void> {
  await adminFetch<{ loggedOut: true }>('/api/admin/logout', {
    method: 'POST',
    token: session.token,
  })
}

export type ArtworkStatus = 'draft' | 'published' | 'archived'

export type AdminArtworkListItem = {
  _id: string
  title: string
  slug: string | null
  status: ArtworkStatus
  year: number | null
  featured: boolean
  thumbnailUrl: string | null
}

export async function fetchArtworks(session: AdminSession): Promise<AdminArtworkListItem[]> {
  const response = await adminFetch<{ artworks: AdminArtworkListItem[] }>('/api/admin/artworks', {
    method: 'GET',
    token: session.token,
  })

  return response.artworks
}

export async function updateArtworkStatus(
  session: AdminSession,
  id: string,
  status: ArtworkStatus,
): Promise<void> {
  await adminFetch<{ _id: string; status: ArtworkStatus }>(`/api/admin/artworks/${id}/status`, {
    method: 'PATCH',
    token: session.token,
    body: JSON.stringify({ status }),
  })
}

export type AdminArtworkDetail = AdminArtworkListItem & {
  dimensions: string | null
  shortDescription: string | null
  heroCandidate: boolean
  medium: { _id: string; title: string } | null
  primaryImageAlt: string | null
}

export type AdminMediumOption = { _id: string; title: string }

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

export async function fetchArtwork(session: AdminSession, id: string): Promise<AdminArtworkDetail> {
  const response = await adminFetch<{ artwork: AdminArtworkDetail }>(`/api/admin/artworks/${id}`, {
    method: 'GET',
    token: session.token,
  })
  return response.artwork
}

export async function fetchMediums(session: AdminSession): Promise<AdminMediumOption[]> {
  const response = await adminFetch<{ mediums: AdminMediumOption[] }>('/api/admin/media', {
    method: 'GET',
    token: session.token,
  })
  return response.mediums
}

export async function createArtwork(session: AdminSession, input: ArtworkFormInput): Promise<{ _id: string }> {
  return adminFetch<{ _id: string }>('/api/admin/artworks', {
    method: 'POST',
    token: session.token,
    body: JSON.stringify(input),
  })
}

export async function updateArtwork(session: AdminSession, id: string, input: ArtworkFormInput): Promise<void> {
  await adminFetch<{ _id: string }>(`/api/admin/artworks/${id}`, {
    method: 'PATCH',
    token: session.token,
    body: JSON.stringify(input),
  })
}

export async function getArtworkPreviewUrl(session: AdminSession, slug: string): Promise<string> {
  const response = await adminFetch<{ url: string }>('/api/admin/preview-link', {
    method: 'POST',
    token: session.token,
    body: JSON.stringify({ type: 'artwork', slug }),
  })
  return response.url
}

export async function uploadArtworkImage(
  session: AdminSession,
  localUri: string,
  filename: string,
): Promise<{ assetId: string; url: string }> {
  if (!API_BASE_URL) {
    throw new AdminApiError('Admin API URL nije podesen.')
  }

  const formData = new FormData()
  const mimeType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
  // React Native's fetch/FormData accepts this { uri, name, type } shape in
  // place of a real Blob/File — standard Expo pattern for multipart upload.
  formData.append('file', { uri: localUri, name: filename, type: mimeType } as unknown as Blob)

  const response = await fetch(`${API_BASE_URL}/api/admin/upload-image`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${session.token}`,
      // Content-Type intentionally omitted — fetch sets the multipart
      // boundary itself; forcing it manually breaks the upload.
    },
    body: formData,
  })

  const json = (await response.json()) as AdminApiResponse<{ assetId: string; url: string }>
  if (!response.ok || !json.ok) {
    throw new AdminApiError(json.ok ? 'Neocekivana greska.' : json.error, response.status)
  }

  return json.data
}

async function adminFetch<T>(
  path: string,
  init: {
    method: 'GET' | 'POST' | 'PATCH'
    body?: string
    token?: string
  },
): Promise<T> {
  if (!API_BASE_URL) {
    throw new AdminApiError('Admin API URL nije podesen.')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: init.method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
    },
    body: init.body,
  })

  const json = (await response.json()) as AdminApiResponse<T>
  if (!response.ok || !json.ok) {
    throw new AdminApiError(json.ok ? 'Neocekivana greska.' : json.error, response.status)
  }

  return json.data
}
