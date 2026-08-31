import { Link, Redirect } from 'expo-router'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '@/auth/AuthProvider'
import { colors } from '@/theme/colors'

// "Radovi" je jedina sekcija sa implementiranim ekranom (Faza 2, prvi korak) —
// ostale ostaju kao placeholder kartice dok njihove faze ne dodju na red
// (vidi docs/07-ROADMAP.md), da dashboard ne vodi na prazne/nepostojece ekrane.
const sections = [
  'Dnevnik',
  'Izlozbe',
  'O meni',
  'Edukacija',
  'Tehnike',
  'Social objave',
  'Poruke',
  'Podesavanja',
]

export default function DashboardScreen() {
  const { loading, logout, session } = useAuth()

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.ink} />
      </View>
    )
  }

  if (!session) {
    return <Redirect href="/login" />
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Faza 1 auth skeleton</Text>
        <Text style={styles.title}>ZlaticArt Admin</Text>
        <Text style={styles.subtitle}>
          Sesija je sacuvana na uredjaju. CMS sekcije se dodaju kroz naredne faze.
        </Text>
      </View>

      <View style={styles.grid}>
        <Link href="/works" asChild>
          <Pressable style={styles.card}>
            <Text style={styles.cardText}>Radovi</Text>
          </Pressable>
        </Link>
        {sections.map((section) => (
          <View key={section} style={[styles.card, styles.cardDisabled]}>
            <Text style={styles.cardText}>{section}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Odjavi se</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 24,
    padding: 20,
    paddingTop: 32,
    backgroundColor: colors.canvas,
  },
  centered: {
    alignItems: 'center',
    backgroundColor: colors.canvas,
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    color: colors.gold,
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontFamily: 'CormorantGaramond_500Medium',
    fontSize: 38,
    fontWeight: '500',
  },
  subtitle: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 21,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    backgroundColor: colors.canvasWarm,
    borderColor: colors.canvasDeep,
    borderRadius: 4,
    borderWidth: 1,
    minHeight: 76,
    justifyContent: 'center',
    padding: 14,
    width: '47%',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardText: {
    color: colors.ink,
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    fontWeight: '500',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 4,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  buttonText: {
    color: colors.canvas,
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
} as const)
