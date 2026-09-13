import { ArtworkMutationError } from '@/lib/admin-api/artwork-mutation'
import { AdminAuthError, verifyAdminRequestWithSession } from '@/lib/admin-api/auth'
import { adminAuthError, adminError, adminOk } from '@/lib/admin-api/responses'
import { adminGetArtwork, adminSaveArtworkDraft, adminWriteConfigured, isArtworkBaseId } from '@/lib/admin-api/sanity'
import { parseArtworkFormInput, readBaseRevision } from '../form-input'

export const runtime = 'nodejs'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminRequestWithSession(request)
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return adminAuthError(error)
    }
    return adminError('Unexpected admin API error.', 500)
  }

  const { id } = await params
  if (!isArtworkBaseId(id)) {
    return adminError('Artwork not found.', 404)
  }

  try {
    const artwork = await adminGetArtwork(id)
    if (!artwork) {
      return adminError('Artwork not found.', 404)
    }
    return adminOk({ artwork })
  } catch {
    return adminError('Could not load artwork from Sanity.', 502)
  }
}

/** Čuva izmene forme u nacrt (`drafts.<id>`); javna verzija se ne menja. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminRequestWithSession(request)
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return adminAuthError(error)
    }
    return adminError('Unexpected admin API error.', 500)
  }

  if (!adminWriteConfigured()) {
    return adminError('Sanity write access is not configured.', 503)
  }

  const { id } = await params
  if (!isArtworkBaseId(id)) {
    return adminError('Artwork not found.', 404)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return adminError('Invalid JSON body.', 400)
  }

  const parsed = parseArtworkFormInput(body)
  if (!parsed.ok) {
    return adminError(parsed.error, 400)
  }
  const baseRevision = readBaseRevision(body)
  if (!baseRevision.ok) {
    return adminError(baseRevision.error, 400)
  }

  try {
    const saved = await adminSaveArtworkDraft(id, parsed.data, baseRevision.value)
    return adminOk(saved)
  } catch (error) {
    if (error instanceof ArtworkMutationError) return adminError(error.message, error.status)
    return adminError('Could not save artwork draft in Sanity.', 502)
  }
}
