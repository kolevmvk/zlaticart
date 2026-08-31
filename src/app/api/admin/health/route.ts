import { adminAuthConfigured } from '@/lib/admin-api/auth'
import { adminOk } from '@/lib/admin-api/responses'

export const runtime = 'nodejs'

export async function GET() {
  return adminOk({
    service: 'zlaticart-admin-api',
    status: 'ok',
    authConfigured: adminAuthConfigured(),
  })
}
