import { Redirect, useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { AdminApiError } from '@/api/admin'
import { useAuth } from '@/auth/AuthProvider'
import { colors } from '@/theme/colors'

export default function LoginScreen() {
  const router = useRouter()
  const { loading, login, session } = useAuth()
  const [pin, setPin] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator color={colors.ink} />
      </View>
    )
  }

  if (session) {
    return <Redirect href="/" />
  }

  async function submit() {
    if (pin.length !== 6 || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      await login(pin)
      router.replace('/')
    } catch (caughtError) {
      const message =
        caughtError instanceof AdminApiError && caughtError.status === 401
          ? 'Pogresan PIN, pokusajte ponovo.'
          : 'Prijava trenutno ne radi. Proverite vezu i pokusajte ponovo.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>ZlaticArt Admin</Text>
      <Text style={styles.title}>Unesite PIN</Text>
      <Text style={styles.subtitle}>
        Koristi se 6-cifreni PIN. Sesija se cuva u sigurnom skladistu uredjaja.
      </Text>
      <TextInput
        accessibilityLabel="PIN"
        editable={!submitting}
        keyboardType="number-pad"
        maxLength={6}
        onChangeText={(value) => {
          setError(null)
          setPin(value.replace(/\D/g, '').slice(0, 6))
        }}
        placeholder="------"
        placeholderTextColor={colors.inkFaint}
        secureTextEntry
        style={styles.input}
        value={pin}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        disabled={pin.length !== 6 || submitting}
        onPress={submit}
        style={[styles.button, (pin.length !== 6 || submitting) && styles.buttonDisabled]}
      >
        {submitting ? (
          <ActivityIndicator color={colors.canvas} />
        ) : (
          <Text style={styles.buttonText}>Prijavi se</Text>
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.canvas,
  },
  eyebrow: {
    color: colors.gold,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontFamily: 'CormorantGaramond_500Medium',
    fontSize: 40,
    fontWeight: '500',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    alignSelf: 'center',
    backgroundColor: colors.canvasWarm,
    borderColor: colors.canvasDeep,
    borderRadius: 4,
    borderWidth: 1,
    color: colors.ink,
    fontFamily: 'DMSans_700Bold',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 8,
    minWidth: 200,
    paddingHorizontal: 18,
    paddingVertical: 14,
    textAlign: 'center',
  },
  error: {
    color: colors.error,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.ink,
    borderRadius: 4,
    minHeight: 52,
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  buttonDisabled: {
    opacity: 0.4,
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
