import {adminFetch} from './admin'
import type {AdminSession} from '@/auth/session'
export type MessageKind='contact'|'commission'
export type Message={id:string;name:string;email:string;created_at:string;message?:string;format?:string;technique?:string;budget?:string;description?:string}
export const messageTitles={contact:'Kontakt poruke',commission:'Porudžbine'}
export function fetchMessages(session:AdminSession,kind:MessageKind,page=0){return adminFetch<{messages:Message[];hasMore:boolean;page:number}>(`/api/admin/messages/${kind}?page=${page}`,{method:'GET',token:session.token})}
export async function fetchMessage(session:AdminSession,kind:MessageKind,id:string){return(await adminFetch<{message:Message}>(`/api/admin/messages/${kind}/${encodeURIComponent(id)}`,{method:'GET',token:session.token})).message}
export function replyUrl(message:Message,kind:MessageKind){
 if(!/^[^\s@<>?,;:\r\n]+@[^\s@<>?,;:\r\n]+\.[^\s@<>?,;:\r\n]+$/.test(message.email))throw new Error('Mejl adresa nije ispravna.')
 // Adresa je već proverena regexom (bez razmaka, ?, <, >); `@` ostaje nekodiran jer ga neke mejl aplikacije ne dekodiraju.
 return `mailto:${message.email}?subject=${encodeURIComponent(kind==='commission'?'Re: Porudžbina rada — ZlaticArt':'Re: Upit sa sajta — ZlaticArt')}`
}
