import { messagesRoute } from '@/lib/admin-api/messages'
export const runtime = 'nodejs'
export async function GET(request:Request,{params}:{params:Promise<{kind:string}>}) { return messagesRoute(request,(await params).kind) }
