import { Redirect, useRouter } from 'expo-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { StyleSheet, Text, View } from 'react-native'
import { fetchContentTypes, fetchContents, type ContentType } from '@/api/content'
import { useAuth } from '@/auth/AuthProvider'
import { Button, Feedback, Screen } from '@/components/ui'
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/spacing'
import { textStyles } from '@/theme/typography'

export default function DashboardScreen() {
  const { loading, logout, session } = useAuth()
  const router = useRouter()
  const [opening, setOpening] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const query = useQuery({ queryKey: ['content-types'], queryFn: () => fetchContentTypes(session!), enabled: Boolean(session) })
  async function open(type: ContentType) {
    if (!session || opening) return
    setError(null)
    if (!type.singleton) { router.push({ pathname: '/content/[type]', params: { type: type.name } }); return }
    setOpening(type.name)
    try {
      const existing = await fetchContents(session, type.name)
      router.push({ pathname: '/content/[type]/[id]', params: { type: type.name, id: existing[0]?._id ?? 'new' } })
    } catch (e) { setError(e instanceof Error ? e.message : 'Sekcija nije otvorena. Pokušajte ponovo.') }
    finally { setOpening(null) }
  }
  if (loading) return <Screen scroll><Feedback title="Učitavanje…" tone="loading" /></Screen>
  if (!session) return <Redirect href="/login" />
  return <Screen scroll>
    <View style={styles.intro}>
      <View style={styles.rule} /><Text style={styles.eyebrow}>VAŠ ATELJE</Text>
      <Text accessibilityRole="header" style={styles.title}>Vaš sajt, u vašim rukama.</Text>
      <Text style={styles.body}>Uredite radove, priče i podatke. Sačuvajte nacrt i objavite kada ste spremni.</Text>
    </View>
    {query.data?.some(t => t.name === 'artwork') ? <Button label="+ Dodaj rad" testID="dashboard-add-artwork" onPress={() => router.push({ pathname: '/content/[type]/[id]', params: { type: 'artwork', id: 'new' } })} /> : null}
    {query.isPending ? <Feedback title="Učitavanje sekcija…" tone="loading" /> : null}
    {query.isError ? <Feedback title="Sekcije nisu osvežene" message="Proverite vezu i pokušajte ponovo." tone="error" actionLabel="Pokušaj ponovo" onAction={() => void query.refetch()} /> : null}
    {error ? <Feedback title="Sekcija nije otvorena" message={error} tone="error" /> : null}
    {query.data?.map(type => <Button key={type.name} label={type.title} variant="secondary" loading={opening === type.name} disabled={Boolean(opening)} onPress={() => void open(type)} testID={`dashboard-section-${type.name}`} />)}
    <Button label="Poruke" variant="secondary" testID="dashboard-messages" onPress={() => router.push('/messages')} />
    <Button label="Odjavi se" onPress={() => void logout()} variant="quiet" testID="dashboard-logout" />
  </Screen>
}
const styles = StyleSheet.create({
  intro: { gap: spacing.md }, rule: { backgroundColor: colors.gold, width: 48, height: 3 },
  eyebrow: { ...textStyles.caption, color: colors.inkMuted, letterSpacing: 2 },
  title: { ...textStyles.display, color: colors.ink }, body: { ...textStyles.body, color: colors.inkMuted },
})
