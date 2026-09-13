import { Redirect, Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { contentImageUrl, fetchContents, fetchContentTypes } from '@/api/content'
import { useAuth } from '@/auth/AuthProvider'
import { Button, Feedback, Field, Screen } from '@/components/ui'
import { colors } from '@/theme/colors'
import { shape, spacing } from '@/theme/spacing'
import { textStyles } from '@/theme/typography'
const labels = { all: 'Sve', draft: 'Nacrti', changed: 'Neobjavljene izmene', published: 'Objavljeno' }
export default function ContentListScreen() {
  const { type } = useLocalSearchParams<{ type: string }>()
  const { session, loading } = useAuth()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<keyof typeof labels>('all')
  const schema = useQuery({ queryKey: ['content-types'], queryFn: () => fetchContentTypes(session!), enabled: Boolean(session) })
  const query = useQuery({ queryKey: ['contents', type], queryFn: () => fetchContents(session!, type), enabled: Boolean(session && type) })
  const { refetch } = query
  useFocusEffect(useCallback(() => { if (session) void refetch() }, [session, refetch]))
  if (loading) return <Screen scroll><Feedback title="Učitavanje…" tone="loading" /></Screen>
  if (!session) return <Redirect href="/login" />
  const description = schema.data?.find(t => t.name === type)
  const rows = (query.data ?? []).filter(item => (filter === 'all' || item.publicationStatus === filter) && String(item.title ?? item.document[description?.titleField ?? 'title'] ?? '').toLocaleLowerCase('sr').includes(search.toLocaleLowerCase('sr')))
  return <Screen scroll>
    <Stack.Screen options={{ title: description?.title ?? 'Sadržaj' }} />
    <Text accessibilityRole="header" style={styles.title}>{description?.title ?? 'Sadržaj'}</Text>
    <Button label="+ Novi unos" testID="content-new" onPress={() => router.push({ pathname: '/content/[type]/[id]', params: { type, id: 'new' } })} />
    <Field label="Pretraga po nazivu" testID="content-search" value={search} onChangeText={setSearch} />
    <View style={styles.filters}>{(Object.keys(labels) as (keyof typeof labels)[]).map(key => <Pressable key={key} accessibilityRole="radio" accessibilityState={{ checked: key === filter }} onPress={() => setFilter(key)} style={[styles.filter, key === filter && styles.selected]}><Text style={[styles.caption, key === filter && styles.inverse]}>{labels[key]}</Text></Pressable>)}</View>
    {query.isPending ? <Feedback title="Učitavanje sadržaja…" tone="loading" /> : null}
    {query.isError || schema.isError ? <Feedback title="Sadržaj nije osvežen" message="Proverite vezu i pokušajte ponovo. Prethodno učitani podaci ostaju dostupni." tone="error" actionLabel="Pokušaj ponovo" onAction={() => { void query.refetch(); void schema.refetch() }} /> : null}
    {query.data && !rows.length ? <Feedback title={query.data.length ? 'Nema rezultata' : 'Još nema unosa'} message={query.data.length ? 'Promenite pretragu ili filter.' : 'Dodajte novi unos i sačuvajte ga kao nacrt.'} /> : null}
    {rows.map(item => {
      const uri = description?.imageField ? contentImageUrl(item.document[description.imageField]) : null
      const status = description?.fields.find(f => f.name === 'status')?.options?.find(o => o.value === item.document.status)?.title
      return <Pressable key={item._id} accessibilityRole="button" accessibilityLabel={`Uredi: ${item.title || 'Bez naslova'}`} testID={`content-item-${item._id}`} onPress={() => router.push({ pathname: '/content/[type]/[id]', params: { type, id: item._id } })} style={styles.card}>
        {uri ? <Image source={{ uri }} style={styles.image} resizeMode="cover" accessible={false} /> : null}
        <View style={styles.cardBody}><Text style={styles.heading}>{item.title || 'Bez naslova'}</Text><Text style={styles.caption}>{labels[item.publicationStatus]}</Text>{status ? <Text style={styles.caption}>{type === 'artwork' ? 'Vidljivost rada' : 'Status izložbe'}: {status}</Text> : null}</View>
      </Pressable>
    })}
  </Screen>
}
const styles = StyleSheet.create({
  title: { ...textStyles.title, color: colors.ink }, heading: { ...textStyles.heading, color: colors.ink }, caption: { ...textStyles.caption, color: colors.inkMuted },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, filter: { minHeight: shape.touchTarget, borderWidth: 1, borderColor: colors.inkFaint, borderRadius: shape.radius, justifyContent: 'center', padding: spacing.md }, selected: { backgroundColor: colors.ink }, inverse: { color: colors.canvas },
  card: { backgroundColor: colors.canvasWarm, borderWidth: 1, borderColor: colors.canvasDeep, borderRadius: shape.cardRadius, overflow: 'hidden' }, cardBody: { padding: spacing.lg, gap: spacing.sm }, image: { width: '100%', aspectRatio: 1.6 },
})
