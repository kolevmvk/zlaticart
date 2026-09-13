import {Redirect,Stack,useRouter} from 'expo-router'
import {useAuth} from '@/auth/AuthProvider'
import {Button,Feedback,Screen} from '@/components/ui'
export default function Messages(){const {session,loading}=useAuth();const router=useRouter();if(loading)return <Screen><Feedback title="Učitavanje…" tone="loading"/></Screen>;if(!session)return <Redirect href="/login"/>;return <Screen scroll><Stack.Screen options={{title:'Poruke'}}/><Button label="Kontakt poruke" onPress={()=>router.push('/messages/contact')}/><Button label="Porudžbine" onPress={()=>router.push('/messages/commission')}/></Screen>}
