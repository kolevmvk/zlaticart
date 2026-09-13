import {Redirect,Stack,useLocalSearchParams,useRouter} from 'expo-router'
import {useInfiniteQuery} from '@tanstack/react-query'
import {useState} from 'react'
import {Text} from 'react-native'
import {fetchMessages,messageTitles,type MessageKind} from '@/api/messages'
import {useAuth} from '@/auth/AuthProvider'
import {Button,Feedback,Field,Screen} from '@/components/ui'
import {textStyles} from '@/theme/typography'
export default function MessageList(){
 const {kind}=useLocalSearchParams<{kind:MessageKind}>();const {session,loading}=useAuth();const router=useRouter();const [search,setSearch]=useState('')
 const valid=kind==='contact'||kind==='commission'
 const query=useInfiniteQuery({queryKey:['messages',kind],queryFn:({pageParam})=>fetchMessages(session!,kind,pageParam),initialPageParam:0,getNextPageParam:page=>page.hasMore?page.page+1:undefined,enabled:Boolean(session&&valid)})
 if(loading)return <Screen><Feedback title="Učitavanje…" tone="loading"/></Screen>
 if(!session)return <Redirect href="/login"/>
 if(!valid)return <Screen><Feedback title="Poruke nisu pronađene"/></Screen>
 const rows=(query.data?.pages.flatMap(p=>p.messages)??[]).filter(m=>`${m.name} ${m.email} ${m.message??m.description??''}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
 return <Screen scroll><Stack.Screen options={{title:messageTitles[kind]}}/><Field label="Pretraži učitane poruke" value={search} onChangeText={setSearch}/><Button label="Osveži poruke" variant="secondary" onPress={()=>void query.refetch()} loading={query.isRefetching}/>{query.isPending?<Feedback title="Učitavanje poruka…" tone="loading"/>:null}{query.isError?<Feedback title="Poruke nisu učitane" message="Proverite vezu i pokušajte ponovo." tone="error" actionLabel="Pokušaj ponovo" onAction={()=>void query.refetch()}/>:null}{!query.isPending&&!query.isError&&!rows.length?<Feedback title="Nema poruka"/>:null}{rows.map(m=><Button key={m.id} label={`${m.name} · ${new Date(m.created_at).toLocaleDateString('sr-Latn')}\n${m.message??m.description??''}`} variant="secondary" onPress={()=>router.push({pathname:'/messages/[kind]/[id]',params:{kind,id:m.id}})}/>)}{query.hasNextPage?<Button label="Učitaj starije poruke" onPress={()=>void query.fetchNextPage()} loading={query.isFetchingNextPage}/>:null}<Text style={textStyles.caption}>Odgovor se šalje iz mejl aplikacije na telefonu.</Text></Screen>
}
