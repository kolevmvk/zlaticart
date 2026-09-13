import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { fetchMessages, messageDate, type Message, type MessageKind } from '@/api/messages'
import { useAuth } from '@/auth/AuthProvider'
import { Banner, edge, IconButton, PrimaryButton, TopBar } from '@/components/atelier'
import { Feedback, Screen } from '@/components/ui'
import { colors } from '@/theme/colors'
import { textStyles } from '@/theme/typography'

const preview = (message: Message) => message.message ?? message.description ?? ''

export default function MessageList() {
  const { kind } = useLocalSearchParams<{ kind: MessageKind }>()
  const { session, loading } = useAuth()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState<string | null>(null)
  const valid = kind === 'contact' || kind === 'commission'
  const query = useInfiniteQuery({ queryKey: ['messages', kind], queryFn: ({ pageParam }) => fetchMessages(session!, kind, pageParam), initialPageParam: 0, getNextPageParam: page => page.hasMore ? page.page + 1 : undefined, enabled: Boolean(session && valid) })
  if (loading) return <Screen><Feedback title="Učitavanje…" tone="loading" /></Screen>
  if (!session) return <Redirect href="/login" />
  if (!valid) return <Redirect href={{ pathname: '/messages/[kind]', params: { kind: 'contact' } }} />
  const needle = (search ?? '').toLocaleLowerCase('sr')
  const rows = (query.data?.pages.flatMap(page => page.messages) ?? []).filter(m => `${m.name} ${m.email} ${preview(m)}`.toLocaleLowerCase('sr').includes(needle))
  const tab = (value: MessageKind, label: string) => <Pressable accessibilityRole="tab" accessibilityState={{ selected: kind === value }} onPress={() => router.setParams({ kind: value })} style={[styles.tab, kind === value && styles.tabOn]} testID={`messages-tab-${value}`}>
    <Text style={[styles.tabText, kind === value && styles.tabTextOn]}>{label}</Text>
  </Pressable>
  return <View style={[styles.screen, { paddingTop: insets.top }]}>
    <TopBar right={<IconButton icon="search" label="Pretraga poruka" onPress={() => setSearch(search === null ? '' : null)} />} />
    <FlatList data={rows} keyExtractor={m => m.id} refreshing={query.isRefetching} onRefresh={() => void query.refetch()}
      contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
      ListHeaderComponent={<View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>Poruke</Text>
        <View style={styles.tabs} accessibilityRole="tablist">{tab('contact', 'Upiti')}{tab('commission', 'Porudžbine')}</View>
        {search !== null ? <TextInput autoFocus value={search} onChangeText={setSearch} placeholder="Ime, mejl ili tekst" placeholderTextColor={colors.inkFaint} style={styles.search} /> : null}
        {query.isError ? <Banner title="Poruke nisu učitane" message="Proverite vezu." action="Pokušaj ponovo" onAction={() => void query.refetch()} /> : null}
        {query.isPending ? <Text style={styles.muted}>Učitavanje…</Text> : null}
        {!query.isPending && !query.isError && !rows.length ? <View style={styles.empty}><Text style={styles.emptyTitle}>{needle ? 'Nema rezultata' : 'Još nema poruka'}</Text><Text style={styles.muted}>{kind === 'commission' ? 'Porudžbine sa sajta stižu ovde.' : 'Upiti iz kontakt forme stižu ovde.'}</Text></View> : null}
      </View>}
      renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`Poruka od ${item.name}`} onPress={() => router.push({ pathname: '/messages/[kind]/[id]', params: { kind, id: item.id } })} style={({ pressed }) => [styles.row, pressed && styles.pressed]} testID={`message-${item.id}`}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{item.name.slice(0, 1).toLocaleUpperCase('sr')}</Text></View>
        <View style={styles.rowBody}>
          <View style={styles.rowTop}><Text style={styles.name} numberOfLines={1}>{item.name}</Text><Text style={styles.date}>{messageDate(item.created_at)}</Text></View>
          <Text style={styles.muted} numberOfLines={2}>{kind === 'commission' ? [item.technique, item.format].filter(Boolean).join(' · ') + (preview(item) ? ` — ${preview(item)}` : '') : preview(item)}</Text>
        </View>
      </Pressable>}
      ListFooterComponent={query.hasNextPage ? <PrimaryButton tone="outline" label="Učitaj starije" loading={query.isFetchingNextPage} onPress={() => void query.fetchNextPage()} /> : null}
    />
  </View>
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  pressed: { opacity: 0.75 },
  list: { paddingHorizontal: edge },
  header: { gap: 16, paddingBottom: 8 },
  title: { ...textStyles.screenTitle, color: colors.ink },
  tabs: { flexDirection: 'row', backgroundColor: colors.canvasWarm, borderRadius: 12, padding: 4 },
  tab: { flex: 1, minHeight: 42, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: colors.canvas },
  tabText: { ...textStyles.label, fontSize: 14, color: colors.inkMuted }, tabTextOn: { color: colors.ink },
  search: { ...textStyles.body, color: colors.ink, minHeight: 48, borderBottomWidth: 1, borderColor: colors.ink },
  muted: { ...textStyles.caption, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  empty: { paddingVertical: 24, gap: 6 }, emptyTitle: { ...textStyles.title, color: colors.ink },
  row: { flexDirection: 'row', gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderColor: colors.canvasDeep },
  avatar: { width: 44, height: 44, borderRadius: 999, backgroundColor: colors.canvasWarm, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...textStyles.title, fontSize: 20, lineHeight: 26, color: colors.ink },
  rowBody: { flex: 1, gap: 3 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { ...textStyles.label, color: colors.ink, flexShrink: 1 },
  date: { ...textStyles.caption, fontSize: 12, color: colors.inkFaint },
})
