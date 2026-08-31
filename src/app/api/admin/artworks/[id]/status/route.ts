import { AdminAuthError, verifyAdminRequest } from '@/lib/admin-api/auth'
import { adminAuthError, adminError, adminOk } from '@/lib/admin-api/responses'
import { adminSanityClient, adminWriteConfigured, isArtworkStatus } from '@/lib/admin-api/sanity'

export const runtime = 'nodejs'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    verifyAdminRequest(request)
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
    await adminSanityClient.patch(id).set({ status }).commit()
    return adminOk({ _id: id, status })
  } catch {
    return adminError('Could not update artwork status in Sanity.', 502)
  }
}

function readStatus(body: unknown) {
  if (!body || typeof body !== 'object' || !('status' in body)) {
    return null
  }
  return (body as { status: unknown }).status
}
