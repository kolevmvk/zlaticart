import { Redirect, useRouter } from 'expo-router'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native'
import { AdminApiError } from '@/api/admin'
import { useAuth } from '@/auth/AuthProvider'
import { Button, Feedback, Field, Screen } from '@/components/ui'
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/spacing'
import { textStyles } from '@/theme/typography'

export default function LoginScreen() {
  const router = useRouter()
  const { loading, login, session } = useAuth()
  const [pin, setPin] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  if (loading) return <Screen scroll><Feedback title="Učitavanje…" tone="loading" /></Screen>
  if (session) return <Redirect href="/" />
  async function submit() {
    if (pin.length !== 6 || submitting) return
    setSubmitting(true)
    setError(null)
    try { await login(pin); router.replace('/') } catch (caughtError) {
      setError(caughtError instanceof AdminApiError && caughtError.status === 401 ? 'Pogrešan PIN. Proverite brojeve i pokušajte ponovo.' : caughtError instanceof AdminApiError && caughtError.status === 429 ? 'Previše pokušaja prijave. Sačekajte nekoliko minuta pa pokušajte ponovo.' : 'Prijava nije uspela. Proverite internet vezu i pokušajte ponovo.')
    } finally { setSubmitting(false) }
  }
  return <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <Screen scroll>
      <View style={styles.intro}>
        <View style={styles.mark}><Text style={styles.monogram}>Z</Text></View>
        <Text style={styles.eyebrow}>ZLATICART · ATELJE</Text>
        <Text accessibilityRole="header" style={styles.title}>Dobro došli.</Text>
        <Text style={styles.body}>Vaši radovi, na jednom mestu. Unesite šestocifreni PIN da nastavite.</Text>
      </View>
      <Field label="Vaš PIN" value={pin} editable={!submitting} keyboardType="number-pad" maxLength={6} secureTextEntry autoComplete="off" autoCorrect={false} onChangeText={(value) => { setError(null); setPin(value.replace(/\D/g, '').slice(0, 6)) }} onSubmitEditing={() => void submit()} placeholder="••••••" style={styles.pin} testID="login-pin" />
      {error ? <Feedback title="Niste prijavljeni" message={error} tone="error" /> : null}
      <Button label="Uđi u atelje" disabled={pin.length !== 6} loading={submitting} onPress={() => void submit()} testID="login-submit" />
    </Screen>
  </KeyboardAvoidingView>
}
const styles = StyleSheet.create({
  keyboard: { flex: 1 }, intro: { gap: spacing.lg, paddingTop: spacing.xl },
  mark: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink, borderRadius: 12 },
  monogram: { ...textStyles.display, color: colors.gold }, eyebrow: { ...textStyles.caption, color: colors.inkMuted, letterSpacing: 2 },
  title: { ...textStyles.display, color: colors.ink }, body: { ...textStyles.body, color: colors.inkMuted },
  pin: { ...textStyles.heading, textAlign: 'center', letterSpacing: 8 },
})
