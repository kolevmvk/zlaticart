import { Redirect, useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { fetchMessage, messageDate, replyUrl, type MessageKind } from '@/api/messages'
import { useAuth } from '@/auth/AuthProvider'
import { Banner, edge, Eyebrow, PrimaryButton, TopBar } from '@/components/atelier'
import { Feedback, Screen } from '@/components/ui'
import { colors } from '@/theme/colors'
import { textStyles } from '@/theme/typography'

export default function MessageDetail() {
  const { kind, id } = useLocalSearchParams<{ kind: MessageKind; id: string }>()
  const { session, loading } = useAuth()
  const insets = useSafeAreaInsets()
  const [error, setError] = useState('')
  const valid = kind === 'contact' || kind === 'commission'
  const query = useQuery({ queryKey: ['message', kind, id], queryFn: () => fetchMessage(session!, kind, id), enabled: Boolean(session && valid), gcTime: 0 })
  if (loading) return <Screen><Feedback title="Učitavanje…" tone="loading" /></Screen>
  if (!session) return <Redirect href="/login" />
  const m = query.data
  async function reply() {
    if (!m) return
    setError('')
    try { await Linking.openURL(replyUrl(m, kind)) } catch { setError('Mejl aplikacija se nije otvorila. Adresa je iznad — možete je kopirati dugim pritiskom.') }
  }
  const details = m ? [['Format', m.format], ['Tehnika', m.technique], ['Budžet', m.budget]].filter(([, value]) => value) as [string, string][] : []
  return <View style={[styles.screen, { paddingTop: insets.top }]}>
    <TopBar title={kind === 'commission' ? 'Porudžbina' : 'Upit'} />
    <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 120 }]}>
      {!valid ? <Banner title="Poruka nije pronađena" /> : null}
      {query.isPending && valid ? <Text style={styles.muted}>Učitavanje poruke…</Text> : null}
      {query.isError ? <Banner title="Poruka nije učitana" message="Proverite vezu." action="Pokušaj ponovo" onAction={() => void query.refetch()} /> : null}
      {m ? <>
        <View style={styles.head}>
          <Eyebrow>{messageDate(m.created_at, true).toLocaleUpperCase('sr')}</Eyebrow>
          <Text style={styles.name} selectable>{m.name}</Text>
          <Text style={styles.email} selectable>{m.email}</Text>
        </View>
        {details.length ? <View style={styles.details}>{details.map(([label, value]) => <View key={label} style={styles.detail}><Text style={styles.muted}>{label}</Text><Text style={styles.value} selectable>{value}</Text></View>)}</View> : null}
        <Text style={styles.letter} selectable>{m.message ?? m.description}</Text>
      </> : null}
      {error ? <Banner title="Odgovor nije otvoren" message={error} /> : null}
    </ScrollView>
    {m ? <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}><PrimaryButton label="Odgovori mejlom" onPress={() => void reply()} testID="message-reply" /></View> : null}
  </View>
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  body: { paddingHorizontal: edge, paddingTop: 8, gap: 24 },
  head: { gap: 4 },
  name: { ...textStyles.heading, color: colors.ink },
  email: { ...textStyles.body, color: colors.inkMuted },
  details: { borderTopWidth: 1, borderColor: colors.canvasDeep },
  detail: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, minHeight: 50, alignItems: 'center', borderBottomWidth: 1, borderColor: colors.canvasDeep },
  value: { ...textStyles.body, fontSize: 15, color: colors.ink, flexShrink: 1, textAlign: 'right' },
  letter: { ...textStyles.writing, color: colors.ink },
  muted: { ...textStyles.caption, fontSize: 14, color: colors.inkMuted },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: edge, paddingTop: 12, backgroundColor: colors.canvas, borderTopWidth: 1, borderColor: colors.canvasDeep },
})
