import { AdminAuthError, verifyAdminRequest } from '@/lib/admin-api/auth'
import { adminAuthError, adminError, adminOk } from '@/lib/admin-api/responses'
import { adminCreateArtwork, adminListArtworks, adminWriteConfigured } from '@/lib/admin-api/sanity'
import { parseArtworkFormInput } from './form-input'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    verifyAdminRequest(request)
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
    const created = await adminCreateArtwork(parsed.data)
    return adminOk({ _id: created._id }, { status: 201 })
  } catch {
    return adminError('Could not create artwork in Sanity.', 502)
  }
}
