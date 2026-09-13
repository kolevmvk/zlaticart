import { AdminAuthError, verifyAdminRequest } from '@/lib/admin-api/auth'
import { AdminStoreError, revokeSession } from '@/lib/admin-api/auth-store'
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
    // Opoziv nije upisan: 503 (ne 500), da klijent zna da sesija možda i dalje važi.
    if (error instanceof AdminStoreError) return adminAuthError(new AdminAuthError('store_unavailable'))
    return adminAuthError(error)
  }
}
