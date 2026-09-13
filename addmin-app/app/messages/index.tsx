import { Redirect } from 'expo-router'
// Poruke se otvaraju direktno na upitima; porudžbine su druga kartica u istom inboksu.
export default function Messages() { return <Redirect href={{ pathname: '/messages/[kind]', params: { kind: 'contact' } }} /> }
