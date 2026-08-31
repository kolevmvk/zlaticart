import { verifyAdminRequest } from '@/lib/admin-api/auth'
import { adminAuthError, adminOk } from '@/lib/admin-api/responses'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    verifyAdminRequest(request)
    return adminOk({ loggedOut: true })
  } catch (error) {
    return adminAuthError(error)
  }
}
