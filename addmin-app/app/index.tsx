import { Redirect, useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { contentCover, fetchContents, fetchContentTypes, type ContentItem, type ContentType } from '@/api/content'
import { useAuth } from '@/auth/AuthProvider'
import { Artwork, Banner, edge, Eyebrow, Fab, GoldRule, Icon, MenuSheet, StatusLine } from '@/components/atelier'
import { Feedback, Screen } from '@/components/ui'
import { colors } from '@/theme/colors'
import { textStyles } from '@/theme/typography'

function greeting() {
  const hour = new Date().getHours()
  return hour < 11 ? 'Dobro jutro' : hour < 18 ? 'Dobar dan' : 'Dobro veče'
}
function itemImage(type: ContentType | undefined, item: ContentItem | undefined, width = 600) {
  return contentCover(type, item?.document, width)
}
function countLabel(type: ContentType, items: ContentItem[] | undefined) {
  if (type.singleton) return items?.length ? 'Uredi' : 'Popuni'
  if (!items) return ''
  if (!items.length) return 'prazno'
  return String(items.length)
}

export default function HomeScreen() {
  const { loading, logout, session } = useAuth()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [menu, setMenu] = useState<'add' | 'account' | null>(null)
  const schema = useQuery({ queryKey: ['content-types'], queryFn: () => fetchContentTypes(session!), enabled: Boolean(session) })
  const types = schema.data ?? []
  const lists = useQueries({ queries: types.map(type => ({ queryKey: ['contents', type.name], queryFn: () => fetchContents(session!, type.name), enabled: Boolean(session) })) })
  const queryClient = useQueryClient()
  // Stabilna zavisnost: useQueries vraća nov niz svakim renderom, pa bi refetch po nizu vrteo petlju.
  const refetchAll = useCallback(() => {
    if (!session) return
    void queryClient.invalidateQueries({ queryKey: ['content-types'] })
    void queryClient.invalidateQueries({ queryKey: ['contents'] })
  }, [session, queryClient])
  useFocusEffect(refetchAll)

  if (loading) return <Screen scroll><Feedback title="Učitavanje…" tone="loading" /></Screen>
  if (!session) return <Redirect href="/login" />

  const byType = new Map(types.map((type, index) => [type.name, lists[index]?.data]))
  const artworkType = types.find(type => type.name === 'artwork')
  const artworks = byType.get('artwork') ?? []
  const latest = artworks[0]
  const onSite = artworks.filter(item => item.hasPublished).length
  const waiting = artworks.filter(item => item.publicationStatus !== 'published').length
  const failed = schema.isError || lists.some(list => list.isError)

  function open(type: ContentType) {
    if (!type.singleton) { router.push({ pathname: '/content/[type]', params: { type: type.name } }); return }
    const existing = byType.get(type.name)?.[0]
    router.push({ pathname: '/content/[type]/[id]', params: { type: type.name, id: existing?._id ?? 'new' } })
  }

  return <View style={styles.screen}>
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 110 }]}>
      <View style={styles.header}>
        <View style={styles.brand}><GoldRule /><Eyebrow>ZLATICART · ATELJE</Eyebrow></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Nalog i odjava" onPress={() => setMenu('account')} style={styles.monogram} testID="dashboard-account">
          <Text style={styles.monogramText}>Z</Text>
        </Pressable>
      </View>

      <View style={styles.intro}>
        <Text accessibilityRole="header" style={styles.greeting}>{greeting()}, Zlatice.</Text>
        <Text style={styles.summary}>{artworks.length ? `Na sajtu ${onSite === 1 ? 'je 1 rad' : `je ${onSite} radova`}.${waiting ? ` ${waiting === 1 ? 'Jedan čeka' : `${waiting} čekaju`} objavu.` : ''}` : schema.isPending ? 'Učitavam vaš atelje…' : 'Dodajte prvi rad — sajt ga prikazuje tek kad ga objavite.'}</Text>
      </View>

      {failed ? <Banner title="Deo ateljea nije osvežen" message="Proverite internet vezu." action="Pokušaj ponovo" onAction={refetchAll} /> : null}

      {latest && artworkType ? <Pressable accessibilityRole="button" accessibilityLabel={`Otvori rad ${latest.title || 'bez naslova'}`} onPress={() => router.push({ pathname: '/content/[type]/[id]', params: { type: 'artwork', id: latest._id } })} style={({ pressed }) => [styles.latest, pressed && styles.pressed]} testID="dashboard-latest">
        <Artwork uri={itemImage(artworkType, latest, 900)} style={styles.latestImage} label={latest.title} />
        <View style={styles.latestMeta}>
          <View style={styles.flex}><Eyebrow>POSLEDNJE UREĐENO</Eyebrow><Text style={styles.latestTitle} numberOfLines={1}>{latest.title || 'Bez naslova'}</Text></View>
          <StatusLine status={latest.publicationStatus} hasPublished={latest.hasPublished} />
        </View>
      </Pressable> : null}

      <Eyebrow style={styles.sectionLabel}>VAŠ SAJT</Eyebrow>
      <View style={styles.grid}>
        {types.map(type => {
          const items = byType.get(type.name)
          const cover = type.singleton ? itemImage(type, items?.[0], 500) : items?.map(item => itemImage(type, item, 500)).find(Boolean) ?? null
          return <Pressable key={type.name} accessibilityRole="button" accessibilityLabel={type.title} onPress={() => open(type)} style={({ pressed }) => [styles.tile, pressed && styles.pressed]} testID={`dashboard-section-${type.name}`}>
            {cover ? <Artwork uri={cover} style={styles.tileImage} /> : <View style={[styles.tileImage, styles.tileLetter]}><Text style={styles.letter}>{type.title.slice(0, 1)}</Text></View>}
            <View style={styles.tileMeta}><Text style={styles.tileTitle} numberOfLines={1}>{type.title}</Text><Text style={styles.tileCount}>{countLabel(type, items)}</Text></View>
          </Pressable>
        })}
      </View>

      <Pressable accessibilityRole="button" onPress={() => router.push('/messages')} style={({ pressed }) => [styles.messages, pressed && styles.pressed]} testID="dashboard-messages">
        <Icon name="mail" />
        <View style={styles.flex}><Text style={styles.messagesTitle}>Poruke</Text><Text style={styles.caption}>Upiti i porudžbine sa sajta</Text></View>
        <Icon name="chevron" color={colors.inkFaint} />
      </Pressable>
    </ScrollView>

    <Fab label="Dodaj novo" onPress={() => setMenu('add')} testID="dashboard-add" />
    <MenuSheet visible={menu === 'add'} onClose={() => setMenu(null)} title="Šta dodajete?" items={types.filter(type => !type.singleton).map(type => ({
      label: type.title, icon: type.imageField ? 'image' : 'plus', testID: `dashboard-add-${type.name}`,
      onPress: () => router.push({ pathname: '/content/[type]/[id]', params: { type: type.name, id: 'new' } }),
    }))} />
    <MenuSheet visible={menu === 'account'} onClose={() => setMenu(null)} title="ZlaticArt atelje" items={[
      { label: 'Odjavi se', icon: 'back', destructive: true, onPress: () => void logout(), testID: 'dashboard-logout', hint: 'Za ponovni ulaz treba PIN.' },
    ]} />
  </View>
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: edge, gap: 22 },
  flex: { flex: 1 }, pressed: { opacity: 0.8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { gap: 6 },
  monogram: { width: 44, height: 44, borderRadius: 999, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  monogramText: { ...textStyles.title, color: colors.gold, lineHeight: 28 },
  intro: { gap: 6 },
  greeting: { ...textStyles.display, color: colors.ink },
  summary: { ...textStyles.body, fontSize: 15, lineHeight: 22, color: colors.inkMuted },
  latest: { gap: 10 },
  latestImage: { height: 300, borderRadius: 12 },
  latestMeta: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  latestTitle: { ...textStyles.title, color: colors.ink },
  sectionLabel: { marginTop: 6, marginBottom: -8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, rowGap: 18 },
  tile: { width: '47.5%', gap: 8 },
  tileImage: { height: 124, borderRadius: 12 },
  tileLetter: { backgroundColor: colors.canvasWarm, alignItems: 'center', justifyContent: 'center' },
  letter: { ...textStyles.display, fontSize: 44, lineHeight: 52, color: colors.inkFaint },
  tileMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 },
  tileTitle: { ...textStyles.label, color: colors.ink, flexShrink: 1 },
  tileCount: { ...textStyles.caption, color: colors.inkFaint },
  messages: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 64, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.canvasDeep },
  messagesTitle: { ...textStyles.label, color: colors.ink },
  caption: { ...textStyles.caption, color: colors.inkFaint },
})
