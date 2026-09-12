import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native'
import { AdminApiError, type AdminArtworkListItem, type ArtworkStatus, fetchArtworks, updateArtworkStatus } from '@/api/admin'
import { useAuth } from '@/auth/AuthProvider'
import { ArtworkCard, Button, Feedback, Field, Screen, statusLabels } from '@/components/ui'
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/spacing'
import { textStyles } from '@/theme/typography'

export default function WorksScreen() {
  const { session, loading: authLoading } = useAuth()
  const router = useRouter()
  const { saved } = useLocalSearchParams<{ saved?: string }>()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ArtworkStatus | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const savedNotice = saved === 'published' ? 'Rad je objavljen.' : saved === 'draft' ? 'Nacrt je sačuvan.' : null
  const query = useQuery({ queryKey: ['admin-artworks'], queryFn: () => fetchArtworks(session!), enabled: Boolean(session) })
  const { refetch } = query
  useFocusEffect(useCallback(() => { if (session) void refetch() }, [session, refetch]))
  const mutation = useMutation({
    mutationFn: ({ artwork, status }: { artwork: AdminArtworkListItem; status: ArtworkStatus }) => updateArtworkStatus(session!, artwork._id, status),
    onMutate: () => { setNotice(null); router.setParams({ saved: undefined }) },
    onSuccess: async (_, { status }) => { setNotice(`Status je sačuvan: ${statusLabels[status]}.`); await queryClient.invalidateQueries({ queryKey: ['admin-artworks'] }) },
  })
  function chooseStatus(artwork: AdminArtworkListItem) {
    if (mutation.isPending) return
    Alert.alert('Promeni status rada', artwork.title, [
      ...(Object.keys(statusLabels) as ArtworkStatus[]).filter((status) => status !== artwork.status).map((status) => ({
        text: status === 'published' ? 'Objavi rad' : status === 'archived' ? 'Arhiviraj rad' : 'Vrati u nacrt',
        onPress: () => Alert.alert(status === 'published' ? 'Objavi na sajtu?' : 'Sačuvaj promenu statusa?', status === 'published' ? 'Rad će biti javno dostupan.' : 'Ova promena može ukloniti rad sa javnog sajta.', [{ text: 'Otkaži', style: 'cancel' }, { text: 'Potvrdi', onPress: () => mutation.mutate({ artwork, status }) }]),
      })),
      { text: 'Otkaži', style: 'cancel' },
    ])
  }
  if (authLoading) return <Screen scroll><Feedback title="Učitavanje…" tone="loading" /></Screen>
  if (!session) return <Redirect href="/login" />
  const all = query.data ?? []
  const visible = all.filter((work) => (!filter || work.status === filter) && work.title.toLocaleLowerCase('sr').includes(search.trim().toLocaleLowerCase('sr')))
  return <Screen>
    <FlatList data={visible} keyExtractor={(item) => item._id} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.list} refreshing={query.isRefetching} onRefresh={() => void query.refetch()}
      ListHeaderComponent={<View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>Vaša kolekcija</Text>
        <Text style={styles.body}>Uredite rad ili nastavite nacrt. Status se menja zasebnom akcijom.</Text>
        <Button label="+ Dodaj rad" onPress={() => router.push('/works/new')} testID="works-add-artwork" />
        <Field label="Pretraži radove" placeholder="Naslov rada" value={search} onChangeText={setSearch} autoCorrect={false} testID="works-search" />
        <View style={styles.filters}>{([null, 'draft', 'published', 'archived'] as const).map((status) => <Button key={status ?? 'all'} label={`${filter === status ? '✓ ' : ''}${status ? statusLabels[status] : 'Svi'}`} variant={filter === status ? 'primary' : 'secondary'} onPress={() => setFilter(status)} testID={`works-filter-${status ?? 'all'}`} />)}</View>
        {!query.isPending && !query.isError ? <Text style={styles.caption}>Prikazano {visible.length} od {all.length}</Text> : null}
        {query.isError ? <Feedback title="Radovi nisu osveženi" message={query.error instanceof AdminApiError && query.error.status === 401 ? 'Sesija je istekla. Prijavite se ponovo da učitate radove.' : 'Proverite internet vezu i pokušajte ponovo.'} tone="error" actionLabel="Pokušaj ponovo" onAction={() => void query.refetch()} /> : null}
        {mutation.isError ? <Feedback title="Status nije promenjen" message={mutation.error instanceof AdminApiError && mutation.error.status === 400 ? 'Pre objave proverite naslov, fotografiju i opis fotografije u formi rada.' : mutation.error instanceof AdminApiError && mutation.error.status === 401 ? 'Sesija je istekla. Prijavite se ponovo.' : 'Proverite internet vezu i pokušajte ponovo. Ako greška ostane, pokušajte kasnije.'} tone="error" /> : null}
        {notice || savedNotice ? <Feedback title={notice ?? savedNotice!} tone="success" actionLabel="U redu" onAction={() => { setNotice(null); router.setParams({ saved: undefined }) }} /> : null}
      </View>}
      ListEmptyComponent={query.isPending ? <Feedback title="Učitavanje radova…" tone="loading" /> : !query.isError ? <Feedback title={all.length ? 'Nema radova za ovaj izbor' : 'Dodajte prvi rad'} message={all.length ? 'Promenite pretragu ili izaberite drugi status.' : 'Fotografiju i podatke možete prvo sačuvati kao nacrt.'} /> : null}
      renderItem={({ item }) => <ArtworkCard artwork={item} onPress={() => router.push({ pathname: '/works/[id]', params: { id: item._id } })}><Button label="Promeni status" variant="secondary" disabled={mutation.isPending} loading={mutation.isPending && mutation.variables?.artwork._id === item._id} onPress={() => chooseStatus(item)} testID={`artwork-status-${item._id}`} /></ArtworkCard>}
    />
  </Screen>
}
const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg, flexGrow: 1 },
  header: { gap: spacing.lg, paddingBottom: spacing.sm }, filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  title: { ...textStyles.display, color: colors.ink }, body: { ...textStyles.body, color: colors.inkMuted }, caption: { ...textStyles.caption, color: colors.inkMuted },
})
