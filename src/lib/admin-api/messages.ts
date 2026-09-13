import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { AdminAuthError, verifyAdminRequestWithSession } from './auth'
import { adminAuthError, adminError, adminOk } from './responses'
const tables = {contact:'contact_submissions',commission:'commission_requests'} as const
export type MessageKind = keyof typeof tables
export const messageColumns = {contact:'id,name,email,message,created_at',commission:'id,name,email,format,technique,budget,description,created_at'} as const
export function isMessageKind(value: string): value is MessageKind { return value === 'contact' || value === 'commission' }
export async function messagesRoute(request:Request,kind:string,id?:string) {
  try {
    await verifyAdminRequestWithSession(request)
    if(!isMessageKind(kind)) return adminError('Vrsta poruke nije pronađena.',404)
    if(id&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return adminError('Poruka nije pronađena.',404)
    const url=process.env.SUPABASE_URL??process.env.NEXT_PUBLIC_SUPABASE_URL
    const key=process.env.SUPABASE_SERVICE_ROLE_KEY??process.env.SUPABASE_SECRET_KEY
    if(!url||!key)return adminError('Poruke trenutno nisu dostupne.',503)
    const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},db:{schema:'zlaticart'}})
    if(id){
      const {data,error}=await client.from(tables[kind]).select(messageColumns[kind]).eq('id',id).maybeSingle()
      if(error)return adminError('Poruka nije učitana. Pokušajte ponovo.',503)
      return data?adminOk({message:data}):adminError('Poruka nije pronađena.',404)
    }
    const raw=new URL(request.url).searchParams.get('page')??'0'
    if(!/^\d{1,6}$/.test(raw))return adminError('Stranica nije ispravna.',400)
    const page=Number(raw),size=30
    const {data,error}=await client.from(tables[kind]).select(messageColumns[kind]).order('created_at',{ascending:false}).order('id',{ascending:false}).range(page*size,(page+1)*size)
    if(error)return adminError('Poruke nisu učitane. Pokušajte ponovo.',503)
    return adminOk({messages:(data??[]).slice(0,size),hasMore:(data??[]).length>size,page})
  }catch(error){
    if(error instanceof AdminAuthError)return adminAuthError(error)
    return adminError('Poruke trenutno nisu dostupne. Pokušajte ponovo.',503)
  }
}
