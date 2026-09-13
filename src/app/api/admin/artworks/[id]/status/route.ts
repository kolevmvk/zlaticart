import { ArtworkMutationError } from '@/lib/admin-api/artwork-mutation'
import { AdminAuthError, verifyAdminRequestWithSession } from '@/lib/admin-api/auth'
import { adminAuthError, adminError, adminOk } from '@/lib/admin-api/responses'
import { adminSetArtworkStatus, adminWriteConfigured, isArtworkBaseId, isArtworkStatus } from '@/lib/admin-api/sanity'
import { revalidateSite } from '@/lib/admin-api/site-revalidate'

export const runtime = 'nodejs'

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

  const status = readStatus(body)
  if (!isArtworkStatus(status)) {
    return adminError('status must be one of: draft, published, archived.', 400)
  }

  try {
    // Vraća stvarnu javnu vidljivost: rad bez objavljene verzije ostaje 'draft'.
    const result = await adminSetArtworkStatus(id, status)
    revalidateSite()
    return adminOk({ _id: id, status: result.status })
  } catch (error) {
    if (error instanceof ArtworkMutationError) return adminError(error.message, error.status)
    return adminError('Could not update artwork status in Sanity.', 502)
  }
}

function readStatus(body: unknown) {
  if (!body || typeof body !== 'object' || !('status' in body)) {
    return null
  }
  return (body as { status: unknown }).status
}
