import { contentRoute } from '@/lib/admin-api/content-route'

export const runtime = 'nodejs'

export async function POST(request: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  return contentRoute(request, await params, 'discard')
}
