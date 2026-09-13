import { Redirect, Stack, useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { fetchContent, fetchContentTypes } from '@/api/content'
import { useAuth } from '@/auth/AuthProvider'
import { ContentForm } from '@/components/ContentForm'
import { Feedback, Screen } from '@/components/ui'
export default function ContentEditScreen() {
  const { type, id } = useLocalSearchParams<{ type: string; id: string }>()
  const { session, loading } = useAuth()
  const schema = useQuery({ queryKey: ['content-types'], queryFn: () => fetchContentTypes(session!), enabled: Boolean(session) })
  const query = useQuery({ queryKey: ['content', type, id], gcTime: 0, queryFn: () => fetchContent(session!, type, id), enabled: Boolean(session && id !== 'new') })
  if (loading) return <Screen scroll><Feedback title="Učitavanje…" tone="loading" /></Screen>
  if (!session) return <Redirect href="/login" />
  const description = schema.data?.find(t => t.name === type)
  if (!description || id !== 'new' && !query.data) return <Screen scroll>
    {schema.isPending || id !== 'new' && query.isPending ? <Feedback title="Učitavanje forme…" tone="loading" /> : <Feedback title="Forma nije učitana" message="Proverite vezu i pokušajte ponovo." tone="error" actionLabel="Pokušaj ponovo" onAction={() => { void schema.refetch(); if (id !== 'new') void query.refetch() }} />}
  </Screen>
  // Initial data is consumed once by the form. Background refetches never overwrite local edits.
  return <><Stack.Screen options={{ title: description.title }} /><ContentForm key={`${type}/${id}`} type={description} initial={id === 'new' ? undefined : query.data} /></>
}
