import { messagesRoute } from '@/lib/admin-api/messages'
export const runtime = 'nodejs'
export async function GET(request:Request,{params}:{params:Promise<{kind:string;id:string}>}) { const {kind,id}=await params;return messagesRoute(request,kind,id) }
