import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { AdminApiError } from '@/api/admin'
import { useAuth } from '@/auth/AuthProvider'
import { Button, Feedback, Field } from '@/components/ui'
import { colors } from '@/theme/colors'
import { shape, spacing } from '@/theme/spacing'
import { textStyles } from '@/theme/typography'

/**
 * Ponovna prijava PREKO otvorenog ekrana. Forma ispod ostaje montirana, pa
 * unos i izabrana fotografija nisu izgubljeni; posle prijave korisnik samo
 * ponovo pritisne dugme za čuvanje.
 */
export function SessionExpiredModal() {
  const { expired, login, logout } = useAuth()
  const queryClient = useQueryClient()
  const [pin, setPin] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (pin.length !== 6 || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await login(pin)
      setPin('')
      // Upiti koji su pali na 401 ponovo se učitavaju; forme se ne diraju.
      void queryClient.invalidateQueries()
    } catch (caught) {
      setError(
        caught instanceof AdminApiError && caught.status === 401
          ? 'Pogrešan PIN. Proverite brojeve i pokušajte ponovo.'
          : caught instanceof AdminApiError
            ? caught.message
            : 'Prijava nije uspela. Pokušajte ponovo.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal visible={expired} transparent animationType="fade" onRequestClose={() => undefined} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
          <View style={styles.sheet} accessibilityViewIsModal>
            <Text accessibilityRole="header" style={styles.title}>Sesija je istekla</Text>
            <Text style={styles.body}>
              Vaš unos je sačuvan na ovom ekranu. Unesite PIN da nastavite tamo gde ste stali.
            </Text>
            <Field
              label="Vaš PIN"
              value={pin}
              editable={!submitting}
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry
              autoComplete="off"
              autoCorrect={false}
              autoFocus
              onChangeText={(value) => { setError(null); setPin(value.replace(/\D/g, '').slice(0, 6)) }}
              onSubmitEditing={() => void submit()}
              placeholder="••••••"
              style={styles.pin}
              testID="relogin-pin"
            />
            {error ? <Feedback title="Niste prijavljeni" message={error} tone="error" /> : null}
            <Button label="Nastavi" disabled={pin.length !== 6} loading={submitting} onPress={() => void submit()} testID="relogin-submit" />
            <Button label="Odjavi se (nesačuvan unos se gubi)" variant="quiet" disabled={submitting} onPress={() => void logout()} testID="relogin-logout" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20, 17, 14, 0.55)' },
  center: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  sheet: { backgroundColor: colors.canvas, borderRadius: shape.cardRadius, padding: spacing.xl, gap: spacing.lg },
  title: { ...textStyles.heading, color: colors.ink },
  body: { ...textStyles.body, color: colors.inkMuted },
  pin: { ...textStyles.heading, textAlign: 'center', letterSpacing: 8 },
})
