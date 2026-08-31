import {
  AdminAuthError,
  createAdminSessionToken,
  isSixDigitPin,
  verifyAdminPin,
} from '@/lib/admin-api/auth'
import { adminAuthError, adminError, adminOk } from '@/lib/admin-api/responses'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return adminError('Invalid JSON body.', 400)
  }

  const pin = readPin(body)
  if (!isSixDigitPin(pin)) {
    return adminError('PIN must contain exactly 6 digits.', 400)
  }

  try {
    verifyAdminPin(pin)
    return adminOk({ token: createAdminSessionToken() })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return adminAuthError(error)
    }

    return adminError('Unexpected admin API error.', 500)
  }
}

function readPin(body: unknown) {
  if (!body || typeof body !== 'object' || !('pin' in body)) {
    return null
  }

  return (body as { pin: unknown }).pin
}
