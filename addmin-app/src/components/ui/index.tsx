import { useState, type ReactNode } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { AdminArtworkListItem, ArtworkStatus } from '@/api/admin'
import { colors } from '@/theme/colors'
import { shape, spacing } from '@/theme/spacing'
import { textStyles } from '@/theme/typography'

export function Button({ label, onPress, variant = 'primary', disabled = false, loading = false, testID }: {
  label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'quiet' | 'danger'; disabled?: boolean; loading?: boolean; testID?: string
}) {
  const filled = variant === 'primary' || variant === 'danger'
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: disabled || loading, busy: loading }} disabled={disabled || loading} testID={testID} onPress={onPress} style={({ pressed }) => [styles.button, variant === 'primary' && styles.primary, variant === 'secondary' && styles.secondary, variant === 'danger' && styles.danger, (disabled || loading) && styles.disabled, pressed && styles.pressed]}>
    {loading ? <ActivityIndicator color={filled ? colors.canvas : colors.ink} /> : null}
    <Text style={[styles.buttonText, filled && styles.inverse]}>{label}</Text>
  </Pressable>
}

export function Field({ label, error, hint, style, ...props }: TextInputProps & { label: string; error?: string; hint?: string }) {
  const [focused, setFocused] = useState(false)
  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput {...props} accessibilityLabel={props.accessibilityLabel ?? label} placeholderTextColor={colors.inkFaint} onFocus={(event) => { setFocused(true); props.onFocus?.(event) }} onBlur={(event) => { setFocused(false); props.onBlur?.(event) }} style={[styles.input, focused && styles.inputFocused, Boolean(error) && styles.inputError, style]} />
    {error || hint ? <Text accessibilityLiveRegion={error ? 'polite' : 'none'} style={[styles.caption, Boolean(error) && styles.error]}>{error || hint}</Text> : null}
  </View>
}

export function Feedback({ title, message, tone = 'neutral', actionLabel, onAction }: {
  title: string; message?: string; tone?: 'neutral' | 'error' | 'success' | 'loading'; actionLabel?: string; onAction?: () => void
}) {
  return <View style={styles.feedback} accessibilityLiveRegion="polite">
    {tone === 'loading' ? <ActivityIndicator color={colors.ink} /> : null}
    <Text style={[styles.label, tone === 'error' && styles.error]}>{title}</Text>
    {message ? <Text style={styles.body}>{message}</Text> : null}
    {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} variant="secondary" /> : null}
  </View>
}

/** Stack headers own the top inset. This container protects bottom and landscape edges. */
export function Screen({ children, scroll = false }: { children: ReactNode; scroll?: boolean }) {
  const insets = useSafeAreaInsets()
  return <View style={[styles.screen, { paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }]}>
    {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>{children}</ScrollView> : children}
  </View>
}

export const statusLabels: Record<ArtworkStatus, string> = { draft: 'Nacrt', published: 'Objavljeno', archived: 'Arhivirano' }
export function StatusBadge({ status }: { status: ArtworkStatus }) {
  return <View style={[styles.badge, status === 'published' && styles.primary]}><Text style={[styles.badgeText, status === 'published' && styles.inverse]}>{statusLabels[status]}</Text></View>
}

export function ArtworkCard({ artwork, onPress, children }: { artwork: AdminArtworkListItem; onPress: () => void; children?: ReactNode }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  return <View style={styles.card}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Uredi rad: ${artwork.title}`} testID={`artwork-${artwork._id}`} onPress={onPress} style={({ pressed }) => [styles.cardLink, pressed && styles.pressed]}>
      {artwork.thumbnailUrl && failedUrl !== artwork.thumbnailUrl ? <Image source={{ uri: artwork.thumbnailUrl }} style={styles.image} resizeMode="cover" accessible={false} onError={() => setFailedUrl(artwork.thumbnailUrl)} /> : <View style={[styles.image, styles.imagePlaceholder]}><Text style={styles.caption}>Bez fotografije</Text></View>}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{artwork.title || 'Rad bez naslova'}</Text>
        <Text style={styles.caption}>{artwork.year ?? 'Godina nije uneta'}{artwork.featured ? ' · Izdvojeno' : ''}</Text>
        <StatusBadge status={artwork.status} />
      </View>
    </Pressable>
    {children ? <View style={styles.cardActions}>{children}</View> : null}
  </View>
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },
  button: { minHeight: shape.touchTarget, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: shape.radius, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  primary: { backgroundColor: colors.ink }, secondary: { borderColor: colors.inkFaint, borderWidth: 1 }, danger: { backgroundColor: colors.error },
  disabled: { opacity: 0.5 }, pressed: { opacity: 0.72 }, buttonText: { ...textStyles.label, color: colors.ink, textAlign: 'center', flexShrink: 1 }, inverse: { color: colors.canvas },
  field: { gap: spacing.sm }, label: { ...textStyles.label, color: colors.ink },
  input: { ...textStyles.body, color: colors.ink, backgroundColor: colors.canvasWarm, borderWidth: 1, borderColor: colors.inkFaint, borderRadius: shape.radius, minHeight: shape.touchTarget, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  inputFocused: { borderColor: colors.ink, backgroundColor: colors.canvas }, inputError: { borderColor: colors.error },
  caption: { ...textStyles.caption, color: colors.inkMuted }, body: { ...textStyles.body, color: colors.inkMuted }, error: { color: colors.error },
  feedback: { backgroundColor: colors.canvasWarm, borderRadius: shape.cardRadius, padding: spacing.lg, gap: spacing.md },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.canvasDeep, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: shape.radius }, badgeText: { ...textStyles.caption, color: colors.ink },
  card: { backgroundColor: colors.canvasWarm, borderWidth: 1, borderColor: colors.canvasDeep, borderRadius: shape.cardRadius, overflow: 'hidden' },
  cardLink: { minHeight: shape.touchTarget }, image: { width: '100%', aspectRatio: 1.6, backgroundColor: colors.canvasDeep }, imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: spacing.lg, gap: spacing.sm }, cardTitle: { ...textStyles.title, color: colors.ink }, cardActions: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.sm },
})
