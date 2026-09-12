import {
  AdminAuthError,
  createAdminSessionToken,
  isSixDigitPin,
  verifyAdminPin,
} from '@/lib/admin-api/auth'
import { recordSession, registerLoginAttempt } from '@/lib/admin-api/auth-store'
import { adminAuthError, adminError, adminOk } from '@/lib/admin-api/responses'

export const runtime = 'nodejs'

const SESSION_TTL_SECONDS = 24 * 60 * 60

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return adminError('Invalid JSON body.', 400)
  }

  const pin = readPin(body)
  if (!isSixDigitPin(pin)) {
    // Loše oblikovan PIN ne troši budžet pokušaja — nije pogađanje.
    return adminError('PIN must contain exactly 6 digits.', 400)
  }

  const attemptKey = readAttemptKey(request)

  // Prvo proveri PIN, pa rezultat prijavi limiteru u jednom atomskom pozivu.
  // Limiter odlučuje da li je pokušaj uopšte smeo da se desi.
  let pinValid = false
  try {
    verifyAdminPin(pin)
    pinValid = true
  } catch (error) {
    if (!(error instanceof AdminAuthError)) {
      return adminError('Unexpected admin API error.', 500)
    }
    if (error.code === 'missing_config') {
      // Nije neuspeo pokušaj korisnika — server nije konfigurisan.
      return adminAuthError(error)
    }
  }

  let allowed: boolean
  try {
    const result = await registerLoginAttempt(attemptKey, pinValid)
    allowed = result.allowed
  } catch {
    // FAIL CLOSED: bez limitera nema prijave. Da je obrnuto, ispad store-a bi
    // otvorio neograničeno pogađanje šestocifrenog PIN-a.
    return adminAuthError(new AdminAuthError('store_unavailable'))
  }

  if (!allowed) {
    return adminAuthError(new AdminAuthError('too_many_attempts'))
  }

  if (!pinValid) {
    return adminAuthError(new AdminAuthError('invalid_credentials'))
  }

  const token = createAdminSessionToken()
  const jti = readJti(token)
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS

  try {
    await recordSession(jti, expiresAt)
  } catch {
    // Bez zapisa sesije token se ne bi mogao opozvati — ne izdajemo ga.
    return adminAuthError(new AdminAuthError('store_unavailable'))
  }

  return adminOk({ token })
}

function readPin(body: unknown) {
  if (!body || typeof body !== 'object' || !('pin' in body)) {
    return null
  }

  return (body as { pin: unknown }).pin
}

/**
 * Ključ grupisanja pokušaja. Vercel postavlja x-forwarded-for; uzimamo prvi
 * unos jer su ostali proxy-ji. Bez IP-a pada na 'global', što je strože
 * (svi dele budžet) — namerno, da odsustvo zaglavlja ne ukloni ograničenje.
 */
function readAttemptKey(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for') ?? ''
  const ip = forwarded.split(',')[0]?.trim()
  return ip || request.headers.get('x-real-ip')?.trim() || 'global'
}

function readJti(token: string) {
  const payload = token.split('.')[1] ?? ''
  const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { jti?: string }
  if (!claims.jti) {
    throw new Error('Session token is missing jti')
  }
  return claims.jti
}
