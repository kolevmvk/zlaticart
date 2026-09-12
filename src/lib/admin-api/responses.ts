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
    switch (error.code) {
      case 'missing_config':
        return adminError('Admin API is not configured.', 503)

      // Store je fail-closed: bez njega ne možemo da proverimo opoziv ni da
      // ograničimo pokušaje, pa pristup odbijamo. 503 jer je greška naša, ne
      // korisnikova — i da klijent zna da je vredno pokušati kasnije.
      case 'store_unavailable':
        return adminError('Admin session store is unavailable.', 503)

      case 'too_many_attempts':
        return adminError('Too many attempts. Try again later.', 429)

      // Opozvana sesija je namerno neodvojiva od nevalidnog tokena u odgovoru —
      // klijent treba samo da se ponovo prijavi.
      case 'session_revoked':
      case 'invalid_token':
      case 'invalid_credentials':
      default:
        return adminError('Unauthorized.', 401)
    }
  }

  return adminError('Unexpected admin API error.', 500)
}
