import { AdminAuthError, verifyAdminRequest } from '@/lib/admin-api/auth'
import { adminAuthError, adminError, adminOk } from '@/lib/admin-api/responses'
import { adminGetArtwork, adminUpdateArtwork, adminWriteConfigured } from '@/lib/admin-api/sanity'
import { parseArtworkFormInput } from '../form-input'

export const runtime = 'nodejs'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    verifyAdminRequest(request)
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return adminAuthError(error)
    }
    return adminError('Unexpected admin API error.', 500)
  }

  const { id } = await params

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

  const parsed = parseArtworkFormInput(body)
  if (!parsed.ok) {
    return adminError(parsed.error, 400)
  }

  try {
    await adminUpdateArtwork(id, parsed.data)
    return adminOk({ _id: id })
  } catch {
    return adminError('Could not update artwork in Sanity.', 502)
  }
}
