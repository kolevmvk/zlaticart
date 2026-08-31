import 'server-only'

import { AdminAuthError } from './auth'

export function adminOk<T>(data: T, init?: ResponseInit) {
  return Response.json({ ok: true, data }, init)
}

export function adminError(error: string, status: number) {
  return Response.json({ ok: false, error }, { status })
}

export function adminAuthError(error: unknown) {
  if (error instanceof AdminAuthError) {
    if (error.code === 'missing_config') {
      return adminError('Admin API is not configured.', 503)
    }

    return adminError('Unauthorized.', 401)
  }

  return adminError('Unexpected admin API error.', 500)
}
