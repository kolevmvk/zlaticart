import 'server-only'

import { PREVIEW_VIEW_TTL_SECONDS } from './auth'

/** httpOnly cookie sa preview tokenom; bez njega draft mode ne otkriva nacrt. */
export const PREVIEW_COOKIE = 'zlaticart_preview'

export const previewCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: PREVIEW_VIEW_TTL_SECONDS,
}
