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

const JSON_TIMEOUT_MS = 20_000
const UPLOAD_TIMEOUT_MS = 120_000

/**
 * `network` / `timeout` znače da ishod na serveru NIJE poznat — zahtev je možda
 * stigao. Ponovni pokušaj mora biti bezbedan (vidi clientId kod createArtwork).
 */
export type AdminApiErrorKind = 'config' | 'network' | 'timeout' | 'unauthorized' | 'http'

export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly kind: AdminApiErrorKind = 'http',
  ) {
    super(message)
  }
}

export function isUnknownOutcome(error: unknown) {
  return error instanceof AdminApiError && (error.kind === 'network' || error.kind === 'timeout')
}

type UnauthorizedListener = (token: string) => void
let unauthorizedListener: UnauthorizedListener | null = null

/**
 * AuthProvider se prijavljuje ovde: 401 na zahtevu sa tokenom znači da je
 * sesija istekla ili opozvana. Aplikacija tada traži ponovnu prijavu preko
 * otvorenog ekrana, bez napuštanja forme.
 */
export function setUnauthorizedListener(listener: UnauthorizedListener | null) {
  unauthorizedListener = listener
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
  /** Javna vidljivost rada na sajtu. */
  status: ArtworkStatus
  /** Postoje sačuvane izmene koje još nisu objavljene. */
  hasDraft: boolean
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

/** 'published' objavljuje i sačuvani nacrt; 'draft'/'archived' skrivaju rad sa sajta. */
export async function updateArtworkStatus(
  session: AdminSession,
  id: string,
  status: ArtworkStatus,
): Promise<void> {
  await adminFetch<{ _id: string; status: ArtworkStatus }>(`/api/admin/artworks/${encodeURIComponent(id)}/status`, {
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
  /** Rad ima objavljenu verziju (može biti skrivena ili arhivirana). */
  hasPublished: boolean
  /** Revizija verzije koja se uređuje; šalje se pri čuvanju i objavi. */
  revision: string
}

export type AdminMediumOption = { _id: string; title: string }

export type ArtworkFormInput = {
  title: string
  year: number | null
  dimensions: string | null
  shortDescription: string | null
  featured: boolean
  heroCandidate: boolean
  mediumId: string | null
  primaryImage: { assetId: string; alt: string } | null
  primaryImageAlt?: string
}

export async function fetchArtwork(session: AdminSession, id: string): Promise<AdminArtworkDetail> {
  const response = await adminFetch<{ artwork: AdminArtworkDetail }>(`/api/admin/artworks/${encodeURIComponent(id)}`, {
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

export type ArtworkWriteResult = { _id: string; revision: string; slug: string | null }

/**
 * Novi rad nastaje kao nacrt i nije na sajtu dok se ne objavi.
 * `clientId` je stabilan za jednu formu. Ako je prvi pokušaj stigao do servera
 * a odgovor se izgubio, ponovni pokušaj dobija `existed: true` umesto duplikata.
 */
export async function createArtwork(
  session: AdminSession,
  input: ArtworkFormInput,
  clientId: string,
): Promise<ArtworkWriteResult & { existed: boolean }> {
  return adminFetch<ArtworkWriteResult & { existed: boolean }>('/api/admin/artworks', {
    method: 'POST',
    token: session.token,
    body: JSON.stringify({ ...input, clientId }),
  })
}

export function newClientArtworkId() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let suffix = ''
  for (let index = 0; index < 24; index += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `artwork-${suffix}`
}

/**
 * Čuva izmene u nacrt; javna verzija na sajtu se ne menja. `baseRevision` je
 * revizija koju je forma učitala — ako je rad u međuvremenu izmenjen, server vraća 409.
 */
export async function saveArtworkDraft(
  session: AdminSession,
  id: string,
  input: ArtworkFormInput,
  baseRevision?: string,
): Promise<ArtworkWriteResult> {
  return adminFetch<ArtworkWriteResult>(`/api/admin/artworks/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    token: session.token,
    body: JSON.stringify({ ...input, ...(baseRevision ? { baseRevision } : {}) }),
  })
}

/** Objavljuje sačuvani nacrt na sajtu. */
export async function publishArtwork(session: AdminSession, id: string, revision?: string): Promise<ArtworkWriteResult> {
  return adminFetch<ArtworkWriteResult>(`/api/admin/artworks/${encodeURIComponent(id)}/publish`, {
    method: 'POST',
    token: session.token,
    body: JSON.stringify(revision ? { revision } : {}),
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

/** Fotografija mora prethodno proći `prepareUploadImage` (JPEG, ispod limita). */
export async function uploadArtworkImage(
  session: AdminSession,
  localUri: string,
): Promise<{ assetId: string; url: string }> {
  const formData = new FormData()
  // React Native's fetch/FormData accepts this { uri, name, type } shape in
  // place of a real Blob/File — standard Expo pattern for multipart upload.
  formData.append('file', { uri: localUri, name: 'artwork.jpg', type: 'image/jpeg' } as unknown as Blob)

  return adminRequest<{ assetId: string; url: string }>('/api/admin/upload-image', {
    method: 'POST',
    token: session.token,
    // Content-Type intentionally omitted — fetch sets the multipart
    // boundary itself; forcing it manually breaks the upload.
    body: formData,
    timeoutMs: UPLOAD_TIMEOUT_MS,
  })
}

export async function adminFetch<T>(
  path: string,
  init: {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    body?: string
    token?: string
  },
): Promise<T> {
  return adminRequest<T>(path, {
    ...init,
    headers: { 'Content-Type': 'application/json' },
    timeoutMs: JSON_TIMEOUT_MS,
  })
}

async function adminRequest<T>(
  path: string,
  init: {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    body?: string | FormData
    token?: string
    headers?: Record<string, string>
    timeoutMs: number
  },
): Promise<T> {
  if (!API_BASE_URL) {
    throw new AdminApiError('Adresa servera nije podešena u ovoj verziji aplikacije.', undefined, 'config')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), init.timeoutMs)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: init.method,
      headers: {
        Accept: 'application/json',
        ...init.headers,
        ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
      },
      body: init.body,
      signal: controller.signal,
    })
  } catch {
    throw controller.signal.aborted
      ? new AdminApiError('Server ne odgovara. Proverite vezu i pokušajte ponovo.', undefined, 'timeout')
      : new AdminApiError('Nema internet veze. Proverite Wi-Fi ili mobilne podatke.', undefined, 'network')
  } finally {
    clearTimeout(timer)
  }

  if (response.status === 401 && init.token) {
    unauthorizedListener?.(init.token)
    throw new AdminApiError('Sesija je istekla. Prijavite se ponovo.', 401, 'unauthorized')
  }

  // Proxy/Vercel greške (413, 502, 504) često nisu JSON — ne sme da se sruši parsiranje.
  let json: AdminApiResponse<T> | null = null
  try {
    json = (await response.json()) as AdminApiResponse<T>
  } catch {
    json = null
  }

  if (!response.ok || !json?.ok) {
    throw new AdminApiError(httpMessage(response.status, json && !json.ok ? json.error : null), response.status)
  }

  return json.data
}

function httpMessage(status: number, serverError: string | null) {
  if (status === 429) return 'Previše pokušaja. Sačekajte nekoliko minuta pa pokušajte ponovo.'
  if (status === 409) return serverError ?? 'Sadržaj je izmenjen. Učitajte ponovo pre čuvanja.'
  if (status === 413) return 'Fotografija je prevelika. Izaberite manju fotografiju.'
  if (status === 415) return 'Format fotografije nije podržan. Koristite JPEG ili PNG.'
  if (status === 503) return 'Server je trenutno nedostupan. Pokušajte ponovo za nekoliko minuta.'
  if (status >= 500) return 'Greška na serveru. Pokušajte ponovo.'
  return serverError ?? 'Neočekivana greška. Pokušajte ponovo.'
}
