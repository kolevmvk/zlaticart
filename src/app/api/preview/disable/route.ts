import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'
import { PREVIEW_COOKIE } from '@/lib/admin-api/preview-cookie'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const draft = await draftMode()
  draft.disable()
  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.delete(PREVIEW_COOKIE)
  return response
}
