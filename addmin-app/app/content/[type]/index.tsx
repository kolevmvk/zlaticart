import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { contentCover, fetchContents, fetchContentTypes, type ContentItem, type ContentType } from '@/api/content'
import { useAuth } from '@/auth/AuthProvider'
import { Artwork, Banner, Chip, edge, Eyebrow, Fab, IconButton, MenuSheet, StatusLine, Toast, TopBar, useToast } from '@/components/atelier'
import { DeleteSheet, type DeleteTarget } from '@/components/atelier/DeleteSheet'
import { Feedback, Screen } from '@/components/ui'
import { colors } from '@/theme/colors'
import { textStyles } from '@/theme/typography'

const filters = { all: 'Svi', published: 'Na sajtu', draft: 'Nacrti', changed: 'Izmene čekaju' } as const
type Filter = keyof typeof filters
// Galerija za sadržaj kome je slika suština; Dnevnik je tekst sa naslovnom slikom.
const galleryTypes = new Set(['artwork', 'exhibition', 'educationItem', 'socialItem'])

function dateLabel(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value)) return null
  const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec']
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return `${day}. ${months[month - 1]} ${year}`
}
function subtitle(type: ContentType, item: ContentItem) {
  const doc = item.document
  if (type.name === 'exhibition') return [doc.venue, doc.city].filter(Boolean).join(', ') || dateLabel(doc.startDate)
  if (type.name === 'socialItem') return type.fields.find(f => f.name === 'platform')?.options?.find(o => o.value === doc.platform)?.title ?? null
  if (type.name === 'educationItem') return type.fields.find(f => f.name === 'type')?.options?.find(o => o.value === doc.type)?.title ?? null
  return null
}

export default function ContentListScreen() {
  const { type: typeName } = useLocalSearchParams<{ type: string }>()
  const { session, loading } = useAuth()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [search, setSearch] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [menuItem, setMenuItem] = useState<ContentItem | null>(null)
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null)
  const schema = useQuery({ queryKey: ['content-types'], queryFn: () => fetchContentTypes(session!), enabled: Boolean(session) })
  const query = useQuery({ queryKey: ['contents', typeName], queryFn: () => fetchContents(session!, typeName), enabled: Boolean(session && typeName) })
  const refresh = useCallback(() => { if (session) void queryClient.invalidateQueries({ queryKey: ['contents', typeName] }) }, [session, queryClient, typeName])
  useFocusEffect(refresh)

  if (loading) return <Screen scroll><Feedback title="Učitavanje…" tone="loading" /></Screen>
  if (!session) return <Redirect href="/login" />
  const type = schema.data?.find(t => t.name === typeName)
  const gallery = galleryTypes.has(typeName)
  const all = query.data ?? []
  const needle = (search ?? '').trim().toLocaleLowerCase('sr')
  const rows = all.filter(item => (filter === 'all' || item.publicationStatus === filter) && (item.title ?? '').toLocaleLowerCase('sr').includes(needle))
  const hiddenArtwork = (item: ContentItem) => typeName === 'artwork' && item.hasPublished && item.document.status !== 'published' && item.publicationStatus === 'published'
  const image = (item: ContentItem, width: number) => contentCover(type, item.document, width)
  const openItem = (item: ContentItem) => router.push({ pathname: '/content/[type]/[id]', params: { type: typeName, id: item._id } })

  const header = <View style={styles.header}>
    <View style={styles.titleRow}>
      <Text accessibilityRole="header" style={styles.title}>{type?.title ?? 'Sadržaj'}</Text>
      <Text style={styles.count}>{query.data ? `${all.length} ${all.length === 1 ? 'unos' : 'unosa'}` : ''}</Text>
    </View>
    {search !== null ? <View style={styles.search}>
      <TextInput autoFocus value={search} onChangeText={setSearch} placeholder="Pretraži po nazivu" placeholderTextColor={colors.inkFaint} style={styles.searchInput} testID="content-search" />
      <IconButton icon="close" label="Zatvori pretragu" onPress={() => setSearch(null)} />
    </View> : null}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {(Object.keys(filters) as Filter[]).map(key => <Chip key={key} label={filters[key]} selected={filter === key} onPress={() => setFilter(key)} testID={`content-filter-${key}`} />)}
    </ScrollView>
    {query.isError || schema.isError ? <Banner title="Lista nije osvežena" message="Proverite vezu. Prethodno učitano ostaje prikazano." action="Pokušaj ponovo" onAction={() => { void query.refetch(); void schema.refetch() }} /> : null}
    {query.isPending ? <Text style={styles.muted}>Učitavanje…</Text> : null}
    {query.data && !rows.length ? <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{all.length ? 'Ništa za ovaj izbor' : 'Ovde još nema ničega'}</Text>
      <Text style={styles.muted}>{all.length ? 'Promenite pretragu ili filter.' : 'Dodajte prvi unos dugmetom +. Sajt ga prikazuje tek kad ga objavite.'}</Text>
    </View> : null}
  </View>

  return <View style={[styles.screen, { paddingTop: insets.top }]}>
    <TopBar right={<IconButton icon="search" label="Pretraga" onPress={() => setSearch(search === null ? '' : null)} testID="content-search-toggle" />} />
    <FlatList
      key={gallery ? 'grid' : 'rows'}
      data={rows}
      numColumns={gallery ? 2 : 1}
      keyExtractor={item => item._id}
      ListHeaderComponent={header}
      columnWrapperStyle={gallery ? styles.column : undefined}
      contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 110 }]}
      refreshing={query.isRefetching}
      onRefresh={() => void query.refetch()}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => {
        const label = `Uredi: ${item.title || 'Bez naslova'}`
        const status = <StatusLine status={item.publicationStatus} hasPublished={item.hasPublished} hidden={hiddenArtwork(item)} />
        if (gallery) return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityHint="Dug pritisak otvara još radnji" onPress={() => openItem(item)} onLongPress={() => setMenuItem(item)} style={({ pressed }) => [styles.card, pressed && styles.pressed]} testID={`content-item-${item._id}`}>
          <Artwork uri={image(item, 600)} style={styles.cardImage} label={item.title} />
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title || 'Bez naslova'}</Text>
          {type && subtitle(type, item) ? <Text style={styles.muted} numberOfLines={1}>{subtitle(type, item)}</Text> : null}
          {status}
        </Pressable>
        const thumb = image(item, 300)
        const date = dateLabel(item.document.publishedAt)
        return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityHint="Dug pritisak otvara još radnji" onPress={() => openItem(item)} onLongPress={() => setMenuItem(item)} style={({ pressed }) => [styles.row, pressed && styles.pressed]} testID={`content-item-${item._id}`}>
          <View style={styles.rowText}>
            {date ? <Eyebrow>{date.toLocaleUpperCase('sr')}</Eyebrow> : null}
            <Text style={styles.rowTitle} numberOfLines={2}>{item.title || 'Bez naslova'}</Text>
            {typeof item.document.excerpt === 'string' && item.document.excerpt ? <Text style={styles.muted} numberOfLines={2}>{item.document.excerpt}</Text> : null}
            {status}
          </View>
          {thumb ? <Artwork uri={thumb} style={styles.rowThumb} /> : null}
        </Pressable>
      }}
    />
    <Fab label="Dodaj novi unos" onPress={() => router.push({ pathname: '/content/[type]/[id]', params: { type: typeName, id: 'new' } })} testID="content-new" />
    <MenuSheet visible={Boolean(menuItem)} onClose={() => setMenuItem(null)} title={menuItem?.title || 'Bez naslova'} items={menuItem ? [
      { label: 'Otvori', icon: 'chevron', onPress: () => openItem(menuItem) },
      { label: 'Obriši', icon: 'trash', destructive: true, testID: 'content-item-delete', onPress: () => setDeleting({ type: typeName, id: menuItem._id, revision: menuItem.revision, title: menuItem.title ?? '', imageUri: image(menuItem, 200), hasPublished: menuItem.hasPublished }) },
    ] : []} />
    <DeleteSheet target={deleting} onClose={() => setDeleting(null)}
      onDeleted={() => { setDeleting(null); refresh(); void queryClient.invalidateQueries({ queryKey: ['contents'] }); toast.show('Obrisano.') }}
      onHidden={() => { setDeleting(null); refresh(); toast.show('Rad je sklonjen sa sajta.') }} />
    <Toast message={toast.message} bottom={insets.bottom + 100} />
  </View>
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  pressed: { opacity: 0.8 },
  list: { paddingHorizontal: edge, gap: 22 },
  header: { gap: 16, paddingBottom: 6 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  title: { ...textStyles.screenTitle, color: colors.ink, flexShrink: 1 },
  count: { ...textStyles.caption, color: colors.inkFaint },
  search: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: colors.ink },
  searchInput: { ...textStyles.body, color: colors.ink, flex: 1, minHeight: 48 },
  chips: { gap: 8, paddingRight: edge },
  empty: { paddingVertical: 24, gap: 6 },
  emptyTitle: { ...textStyles.title, color: colors.ink },
  muted: { ...textStyles.caption, color: colors.inkMuted },
  column: { gap: 14 },
  card: { flex: 1, gap: 6, maxWidth: '50%' },
  cardImage: { aspectRatio: 4 / 5, borderRadius: 10 },
  cardTitle: { ...textStyles.cardTitle, color: colors.ink },
  row: { flexDirection: 'row', gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderColor: colors.canvasDeep },
  rowText: { flex: 1, gap: 5 },
  rowTitle: { ...textStyles.title, fontSize: 22, lineHeight: 27, color: colors.ink },
  rowThumb: { width: 84, height: 104, borderRadius: 8 },
})
