import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'
import { AdminAuthError, verifyAdminSessionToken } from '@/lib/admin-api/auth'

export const runtime = 'nodejs'

// Javna ruta (nema Authorization header — WebView je otvara kao obicnu
// navigaciju), ali "javna" ne znaci nezasticena: token u query-ju je isti
// HMAC-potpisan, kratkotrajan sesijski token kao svuda u admin-api, samo
// prenet kao URL parametar umesto header-a. Vidi /api/admin/preview-link.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token') ?? ''
  const slug = searchParams.get('slug') ?? ''

  try {
    verifyAdminSessionToken(token)
  } catch (error) {
    const message = error instanceof AdminAuthError ? error.code : 'invalid_token'
    return NextResponse.json({ ok: false, error: message }, { status: 401 })
  }

  if (!slug) {
    return NextResponse.json({ ok: false, error: 'Missing slug.' }, { status: 400 })
  }

  const draft = await draftMode()
  draft.enable()

  return NextResponse.redirect(new URL(`/works/${encodeURIComponent(slug)}`, request.url))
}
