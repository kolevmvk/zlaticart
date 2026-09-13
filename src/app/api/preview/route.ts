import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  AdminAuthError,
  createPreviewToken,
  PREVIEW_VIEW_TTL_SECONDS,
  verifyPreviewTokenWithSession,
} from '@/lib/admin-api/auth'
import { PREVIEW_COOKIE, previewCookieOptions } from '@/lib/admin-api/preview-cookie'

export const runtime = 'nodejs'

const NO_STORE = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' }

// Javna ruta (in-app browser nema Authorization header), ali token u query-ju
// je namenski preview token: jedan rad, kratak rok, vezan za aktivnu sesiju.
// Link token se ovde menja za httpOnly cookie ograničen na isti rad — stranica
// rada nacrt prikazuje samo uz taj cookie, ne samo zato što je draft mode uključen.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') ?? ''

  let claims
  try {
    claims = await verifyPreviewTokenWithSession(token)
  } catch (error) {
    const status = error instanceof AdminAuthError && error.code === 'store_unavailable' ? 503 : 401
    return NextResponse.json(
      { ok: false, error: status === 503 ? 'Preview is temporarily unavailable.' : 'Preview link is invalid or expired.' },
      { status, headers: NO_STORE },
    )
  }

  const viewToken = createPreviewToken(
    { type: claims.type, slug: claims.slug, sid: claims.sid },
    PREVIEW_VIEW_TTL_SECONDS,
  )

  const draft = await draftMode()
  draft.enable()

  const response = NextResponse.redirect(
    new URL(`/${claims.type === 'journalPost' ? 'journal' : 'works'}/${encodeURIComponent(claims.slug)}`, request.url),
    { headers: NO_STORE },
  )
  response.cookies.set(PREVIEW_COOKIE, viewToken, previewCookieOptions)
  return response
}
