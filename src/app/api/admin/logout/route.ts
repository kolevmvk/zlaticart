import { verifyAdminRequest } from '@/lib/admin-api/auth'
import { revokeSession } from '@/lib/admin-api/auth-store'
import { adminAuthError, adminOk } from '@/lib/admin-api/responses'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    // Namerno verifyAdminRequest, ne ...WithSession: već opozvanu sesiju
    // logout sme da prihvati kao uspeh (idempotentno), samo ne sme da radi
    // sa nevalidnim potpisom.
    const claims = verifyAdminRequest(request)

    await revokeSession(claims.jti)

    return adminOk({ loggedOut: true })
  } catch (error) {
    return adminAuthError(error)
  }
}
