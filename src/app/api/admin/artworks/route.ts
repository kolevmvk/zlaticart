import { ArtworkMutationError } from '@/lib/admin-api/artwork-mutation'
import { AdminAuthError, verifyAdminRequestWithSession } from '@/lib/admin-api/auth'
import { adminAuthError, adminError, adminOk } from '@/lib/admin-api/responses'
import { adminCreateArtwork, adminListArtworks, adminWriteConfigured, isClientArtworkId } from '@/lib/admin-api/sanity'
import { parseArtworkFormInput } from './form-input'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    await verifyAdminRequestWithSession(request)
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return adminAuthError(error)
    }
    return adminError('Unexpected admin API error.', 500)
  }

  try {
    const artworks = await adminListArtworks()
    return adminOk({ artworks })
  } catch {
    return adminError('Could not load artworks from Sanity.', 502)
  }
}

export async function POST(request: Request) {
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

  const { clientId } = body as Record<string, unknown>
  if (clientId !== undefined && !isClientArtworkId(clientId)) {
    return adminError('clientId must look like "artwork-<16-48 letters/digits>".', 400)
  }

  try {
    const created = await adminCreateArtwork(parsed.data, clientId)
    return adminOk(created, { status: created.existed ? 200 : 201 })
  } catch (error) {
    if (error instanceof ArtworkMutationError) return adminError(error.message, error.status)
    return adminError('Could not create artwork in Sanity.', 502)
  }
}
