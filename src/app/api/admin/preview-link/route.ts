import { AdminAuthError, verifyAdminRequest } from '@/lib/admin-api/auth'
import { adminAuthError, adminError, adminOk } from '@/lib/admin-api/responses'

export const runtime = 'nodejs'

// Vidi zlaticart/addmin-app/docs/04-ARCHITECTURE.md "Pregled pre objave —
// mehanizam". Mobilna app zove ovu (Bearer-autentifikovanu) rutu da dobije
// preview URL; sam preview URL zatim otvara u WebView-u bez dodatnog
// Authorization header-a (WebView navigacija ga ne salje pouzdano), zato
// nosi isti sesijski token kao query parametar — HMAC-potpisan, kratkotrajan,
// verifikovan na isti nacin na /api/preview.
export async function POST(request: Request) {
  let claims
  try {
    claims = verifyAdminRequest(request)
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
  if (type !== 'artwork' || typeof slug !== 'string' || !slug.trim()) {
    return adminError('Expected { type: "artwork", slug: string }.', 400)
  }

  const token = getBearerFromRequest(request)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const url = `${siteUrl}/api/preview?token=${encodeURIComponent(token)}&slug=${encodeURIComponent(slug)}`

  return adminOk({ url, expiresAt: claims.exp })
}

function getBearerFromRequest(request: Request) {
  const authorization = request.headers.get('authorization') ?? ''
  return authorization.slice('Bearer '.length).trim()
}
