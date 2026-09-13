import { contentRoute } from '@/lib/admin-api/content-route'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  return contentRoute(request, {}, 'schema')
}
