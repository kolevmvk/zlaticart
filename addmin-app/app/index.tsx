import { Redirect, useFocusEffect, useRouter } from 'expo-router'
import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { StyleSheet, Text, View } from 'react-native'
import { fetchArtworks } from '@/api/admin'
import { useAuth } from '@/auth/AuthProvider'
import { ArtworkCard, Button, Feedback, Screen } from '@/components/ui'
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/spacing'
import { textStyles } from '@/theme/typography'

export default function DashboardScreen() {
  const { loading, logout, session } = useAuth()
  const router = useRouter()
  const query = useQuery({ queryKey: ['admin-artworks'], queryFn: () => fetchArtworks(session!), enabled: Boolean(session) })
  const { refetch } = query
  useFocusEffect(useCallback(() => { if (session) void refetch() }, [session, refetch]))
  if (loading) return <Screen scroll><Feedback title="Učitavanje…" tone="loading" /></Screen>
  if (!session) return <Redirect href="/login" />
  const works = query.data ?? []
  const drafts = works.filter((work) => work.status === 'draft')
  return <Screen scroll>
    <View style={styles.intro}>
      <View style={styles.rule} />
      <Text style={styles.eyebrow}>VAŠ ATELJE</Text>
      <Text accessibilityRole="header" style={styles.title}>Prostor za vaše radove.</Text>
      <Text style={styles.body}>Sačuvajte novu ideju, pripremite fotografije i objavite kada ste spremni.</Text>
    </View>
    <Button label="+ Dodaj rad" onPress={() => router.push('/works/new')} testID="dashboard-add-artwork" />
    <Button label="Otvori sve radove" onPress={() => router.push('/works')} variant="secondary" testID="dashboard-open-artworks" />
    {query.isPending ? <Feedback title="Učitavanje radova…" tone="loading" /> : query.isError ? <Feedback title="Radovi nisu osveženi" message="Proverite internet vezu i pokušajte ponovo." tone="error" actionLabel="Pokušaj ponovo" onAction={() => void query.refetch()} /> : <>
      <View style={styles.counts}><Text style={styles.label}>Ukupno radova: {works.length}</Text><Text style={styles.body}>Nacrti: {drafts.length}</Text></View>
      <Text accessibilityRole="header" style={styles.heading}>{drafts.length ? 'Nastavite započeto' : 'Vaši radovi'}</Text>
      {works.length === 0 ? <Feedback title="Vaša kolekcija počinje ovde" message="Dodajte prvi rad i sačuvajte ga kao nacrt." /> : (drafts.length ? drafts : works).slice(0, 3).map((work) => <ArtworkCard key={work._id} artwork={work} onPress={() => router.push({ pathname: '/works/[id]', params: { id: work._id } })} />)}
    </>}
    <View style={styles.later}><Text style={styles.label}>U pripremi</Text><Text style={styles.body}>Dnevnik, izložbe, poruke i ostali sadržaj biće dostupni u narednim verzijama.</Text></View>
    <Button label="Odjavi se" onPress={() => void logout()} variant="quiet" testID="dashboard-logout" />
  </Screen>
}
const styles = StyleSheet.create({
  intro: { gap: spacing.md }, rule: { backgroundColor: colors.gold, width: 48, height: 3 },
  eyebrow: { ...textStyles.caption, color: colors.inkMuted, letterSpacing: 2 },
  title: { ...textStyles.display, color: colors.ink }, heading: { ...textStyles.heading, color: colors.ink },
  body: { ...textStyles.body, color: colors.inkMuted }, label: { ...textStyles.label, color: colors.ink },
  counts: { gap: spacing.xs, paddingVertical: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.canvasDeep },
  later: { gap: spacing.sm, paddingTop: spacing.lg, borderTopWidth: 1, borderColor: colors.canvasDeep },
})
