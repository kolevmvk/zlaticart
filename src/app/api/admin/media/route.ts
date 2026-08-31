import { AdminAuthError, verifyAdminRequest } from '@/lib/admin-api/auth'
import { adminAuthError, adminError, adminOk } from '@/lib/admin-api/responses'
import { adminListMediums } from '@/lib/admin-api/sanity'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    verifyAdminRequest(request)
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return adminAuthError(error)
    }
    return adminError('Unexpected admin API error.', 500)
  }

  try {
    const mediums = await adminListMediums()
    return adminOk({ mediums })
  } catch {
    return adminError('Could not load mediums from Sanity.', 502)
  }
}
