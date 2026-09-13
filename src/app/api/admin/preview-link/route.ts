import {
  AdminAuthError,
  createPreviewToken,
  isPreviewSlug,
  isPreviewType,
  PREVIEW_LINK_TTL_SECONDS,
  verifyAdminRequestWithSession,
} from '@/lib/admin-api/auth'
import { adminAuthError, adminError, adminOk } from '@/lib/admin-api/responses'

export const runtime = 'nodejs'

// Vidi zlaticart/addmin-app/docs/04-ARCHITECTURE.md "Pregled pre objave —
// mehanizam". Mobilna app zove ovu (Bearer-autentifikovanu) rutu da dobije
// preview URL, koji zatim otvara u in-app browseru bez Authorization header-a.
// URL zato nosi token — ali NAMENSKI preview token (jedan rad, 5 min, vezan za
// sesiju), nikad sesijski token koji bi u istoriji browsera značio pun admin.
export async function POST(request: Request) {
  let claims
  try {
    claims = await verifyAdminRequestWithSession(request)
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return adminAuthError(error)
    }
    return adminError('Unexpected admin API error.', 500)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return adminError('Invalid JSON body.', 400)
  }

  const { type, slug } = (body ?? {}) as Record<string, unknown>
  if (!isPreviewType(type) || !isPreviewSlug(slug)) {
    return adminError('Izaberite rad ili dnevnik i ispravnu adresu.', 400)
  }

  const now = Math.floor(Date.now() / 1000)
  const token = createPreviewToken({ type, slug, sid: claims.jti }, PREVIEW_LINK_TTL_SECONDS, now)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const url = `${siteUrl}/api/preview?token=${encodeURIComponent(token)}`

  return adminOk({ url, expiresAt: now + PREVIEW_LINK_TTL_SECONDS })
}
