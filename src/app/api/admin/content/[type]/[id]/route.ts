import { contentRoute } from '@/lib/admin-api/content-route'

export const runtime = 'nodejs'

export async function GET(request: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  return contentRoute(request, await params)
}
export async function PATCH(request: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  return contentRoute(request, await params)
}
export async function DELETE(request: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  return contentRoute(request, await params)
}
