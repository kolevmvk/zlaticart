import {Redirect,Stack,useLocalSearchParams} from 'expo-router'
import {useQuery} from '@tanstack/react-query'
import {useState} from 'react'
import {Linking,Text} from 'react-native'
import {fetchMessage,messageTitles,replyUrl,type MessageKind} from '@/api/messages'
import {useAuth} from '@/auth/AuthProvider'
import {Button,Feedback,Screen} from '@/components/ui'
import {textStyles} from '@/theme/typography'
export default function MessageDetail(){
 const {kind,id}=useLocalSearchParams<{kind:MessageKind;id:string}>();const {session,loading}=useAuth();const [error,setError]=useState('')
 const valid=kind==='contact'||kind==='commission';const query=useQuery({queryKey:['message',kind,id],queryFn:()=>fetchMessage(session!,kind,id),enabled:Boolean(session&&valid),gcTime:0})
 if(loading)return <Screen><Feedback title="Učitavanje…" tone="loading"/></Screen>;if(!session)return <Redirect href="/login"/>
 if(!valid)return <Screen><Feedback title="Poruka nije pronađena"/></Screen>
 const m=query.data
 async function reply(){if(!m)return;setError('');try{const url=replyUrl(m,kind);await Linking.openURL(url)}catch{setError('Nije moguće otvoriti mejl aplikaciju. Instalirajte je ili kopirajte adresu prikazanu iznad.')}}
 return <Screen scroll><Stack.Screen options={{title:messageTitles[kind]}}/>{query.isPending?<Feedback title="Učitavanje poruke…" tone="loading"/>:null}{query.isError?<Feedback title="Poruka nije učitana" tone="error" actionLabel="Pokušaj ponovo" onAction={()=>void query.refetch()}/>:null}{m?<><Text style={textStyles.title} selectable>{m.name}</Text><Text style={textStyles.body} selectable>{m.email}</Text><Text style={textStyles.caption}>{new Date(m.created_at).toLocaleString('sr-Latn')}</Text>{[['Format',m.format],['Tehnika',m.technique],['Budžet',m.budget],['Poruka',m.message??m.description]].filter(([,v])=>v).map(([label,value])=><Text key={label} style={textStyles.body} selectable>{label}: {value}</Text>)}<Button label="Odgovori mejlom" onPress={()=>void reply()}/></>:null}{error?<Feedback title={error} tone="error"/>:null}</Screen>
}
