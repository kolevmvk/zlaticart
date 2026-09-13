import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Animated, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors } from '@/theme/colors'
import { textStyles } from '@/theme/typography'
import { Icon, type IconName } from './Icon'

export { Icon } from './Icon'
export const edge = 20

// ——— Stanje objave: rečenica + oblik, nikad samo boja ———
export type Publication = 'draft' | 'changed' | 'published'
export function publicationText(status: Publication, hasPublished: boolean, hidden?: boolean) {
  if (hidden) return 'Skriveno sa sajta'
  if (status === 'published') return 'Na sajtu'
  if (status === 'changed') return 'Izmene čekaju objavu'
  return hasPublished ? 'Nacrt' : 'Nacrt — samo vi vidite'
}
export function StatusDot({ status, hidden }: { status: Publication; hidden?: boolean }) {
  if (hidden) return <View style={[styles.dot, styles.dotHidden]} />
  if (status === 'published') return <View style={[styles.dot, styles.dotOn]} />
  if (status === 'changed') return <View style={[styles.dot, styles.dotChanged]}><View style={styles.dotHalf} /></View>
  return <View style={[styles.dot, styles.dotDraft]} />
}
export function StatusLine({ status, hasPublished, hidden, style }: { status: Publication; hasPublished: boolean; hidden?: boolean; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.statusLine, style]}><StatusDot status={status} hidden={hidden} /><Text style={styles.statusText} numberOfLines={1}>{publicationText(status, hasPublished, hidden)}</Text></View>
}

// ——— Zaglavlje ekrana ———
export function IconButton({ icon, label, onPress, disabled, onImage, testID }: { icon: IconName; label: string; onPress: () => void; disabled?: boolean; onImage?: boolean; testID?: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} testID={testID} hitSlop={6}
    style={({ pressed }) => [styles.iconButton, onImage && styles.iconOnImage, pressed && styles.pressed, disabled && styles.disabled]}>
    <Icon name={icon} />
  </Pressable>
}
export function TopBar({ back = true, right, title, onImage }: { back?: boolean; right?: ReactNode; title?: string; onImage?: boolean }) {
  const router = useRouter()
  return <View style={[styles.topBar, onImage && styles.topBarOnImage]}>
    {back ? <IconButton icon="back" label="Nazad" onImage={onImage} onPress={() => router.back()} testID="nav-back" /> : <View style={styles.iconButton} />}
    {title ? <Text style={styles.topTitle} numberOfLines={1}>{title}</Text> : <View style={styles.flex} />}
    <View style={styles.topRight}>{right}</View>
  </View>
}
export function Eyebrow({ children, style }: { children: ReactNode; style?: object }) {
  return <Text style={[styles.eyebrow, style]}>{children}</Text>
}
export function GoldRule() { return <View style={styles.goldRule} /> }

// ——— Dugmad ———
export function PrimaryButton({ label, onPress, disabled, loading, tone = 'ink', testID, style }: { label: string; onPress: () => void; disabled?: boolean; loading?: boolean; tone?: 'ink' | 'danger' | 'outline'; testID?: string; style?: StyleProp<ViewStyle> }) {
  const filled = tone !== 'outline'
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: disabled || loading, busy: loading }} disabled={disabled || loading} onPress={onPress} testID={testID}
    style={({ pressed }) => [styles.primary, tone === 'danger' && styles.danger, tone === 'outline' && styles.outline, (disabled || loading) && styles.disabled, pressed && styles.pressed, style]}>
    <Text style={[styles.primaryText, !filled && styles.outlineText]}>{loading ? 'Sačekajte…' : label}</Text>
  </Pressable>
}
export function Fab({ onPress, label, testID }: { onPress: () => void; label: string; testID?: string }) {
  const insets = useSafeAreaInsets()
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} testID={testID} style={({ pressed }) => [styles.fab, { bottom: 24 + insets.bottom }, pressed && styles.pressed]}>
    <Icon name="plus" size={26} color={colors.canvas} />
  </Pressable>
}
export function Chip({ label, selected, onPress, testID }: { label: string; selected?: boolean; onPress: () => void; testID?: string }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: Boolean(selected) }} onPress={onPress} testID={testID} style={({ pressed }) => [styles.chip, selected && styles.chipOn, pressed && styles.pressed]}>
    <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
  </Pressable>
}

// ——— Meni odozdo ———
export function Sheet({ visible, onClose, children, testID }: { visible: boolean; onClose: () => void; children: ReactNode; testID?: string }) {
  const insets = useSafeAreaInsets()
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
    <View style={styles.sheetRoot}>
      <Pressable accessibilityLabel="Zatvori" style={StyleSheet.absoluteFill} onPress={onClose}><View style={styles.scrim} /></Pressable>
      <View style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]} testID={testID}>
        <View style={styles.handle} />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.sheetContent}>{children}</ScrollView>
      </View>
    </View>
  </Modal>
}
export type MenuItem = { label: string; icon?: IconName; onPress: () => void; destructive?: boolean; disabled?: boolean; hint?: string; testID?: string }
export function MenuSheet({ visible, onClose, title, items }: { visible: boolean; onClose: () => void; title?: string; items: MenuItem[] }) {
  return <Sheet visible={visible} onClose={onClose}>
    {title ? <Text style={styles.sheetTitle}>{title}</Text> : null}
    {items.map(item => <Pressable key={item.label} accessibilityRole="button" disabled={item.disabled} testID={item.testID}
      onPress={() => { onClose(); item.onPress() }} style={({ pressed }) => [styles.menuRow, pressed && styles.pressed, item.disabled && styles.disabled]}>
      {item.icon ? <Icon name={item.icon} color={item.destructive ? colors.error : colors.ink} /> : null}
      <View style={styles.flex}>
        <Text style={[styles.menuText, item.destructive && styles.menuDanger]}>{item.label}</Text>
        {item.hint ? <Text style={styles.caption}>{item.hint}</Text> : null}
      </View>
    </Pressable>)}
  </Sheet>
}

// ——— Kratka potvrda pri dnu ———
export function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  function show(text: string) {
    if (timer.current) clearTimeout(timer.current)
    setMessage(text)
    timer.current = setTimeout(() => setMessage(null), 3200)
  }
  return { message, show }
}
export function Toast({ message, bottom = 110 }: { message: string | null; bottom?: number }) {
  const [opacity] = useState(() => new Animated.Value(0))
  useEffect(() => { Animated.timing(opacity, { toValue: message ? 1 : 0, duration: 180, useNativeDriver: true }).start() }, [message, opacity])
  if (!message) return null
  return <Animated.View pointerEvents="none" accessibilityLiveRegion="polite" style={[styles.toast, { bottom, opacity }]}><Text style={styles.toastText}>{message}</Text></Animated.View>
}
export function Banner({ title, message, action, onAction }: { title: string; message?: string; action?: string; onAction?: () => void }) {
  return <View style={styles.banner} accessibilityLiveRegion="polite">
    <Text style={styles.bannerTitle}>{title}</Text>
    {message ? <Text style={styles.bannerText}>{message}</Text> : null}
    {action && onAction ? <Pressable accessibilityRole="button" onPress={onAction} style={styles.bannerAction}><Text style={styles.bannerActionText}>{action}</Text></Pressable> : null}
  </View>
}

// ——— Slika sa mekom podlogom ———
export function Artwork({ uri, style, label }: { uri: string | null; style: StyleProp<ViewStyle>; label?: string }) {
  const [failed, setFailed] = useState(false)
  return <View style={[styles.artwork, style]}>
    {uri && !failed ? <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityLabel={label} onError={() => setFailed(true)} /> : <View style={styles.artworkEmpty}><Icon name="image" color={colors.inkFaint} /></View>}
  </View>
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.7 }, disabled: { opacity: 0.45 },
  dot: { width: 9, height: 9, borderRadius: 999, overflow: 'hidden' },
  dotOn: { backgroundColor: colors.ink }, dotDraft: { borderWidth: 1.5, borderColor: colors.inkFaint },
  dotChanged: { borderWidth: 1.5, borderColor: colors.gold }, dotHalf: { width: '50%', height: '100%', backgroundColor: colors.gold },
  dotHidden: { borderWidth: 1.5, borderColor: colors.inkFaint, borderStyle: 'dashed' },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { ...textStyles.caption, color: colors.inkMuted, flexShrink: 1 },
  iconButton: { width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  iconOnImage: { backgroundColor: 'rgba(240, 237, 230, 0.92)' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, minHeight: 56, gap: 8 },
  topBarOnImage: { position: 'absolute', left: 8, right: 8, zIndex: 2, paddingHorizontal: 0 },
  topTitle: { ...textStyles.label, color: colors.ink, flex: 1, textAlign: 'center' },
  topRight: { flexDirection: 'row', gap: 4, minWidth: 44, justifyContent: 'flex-end' },
  eyebrow: { ...textStyles.eyebrow, color: colors.inkFaint },
  goldRule: { width: 40, height: 2, backgroundColor: colors.gold },
  primary: { minHeight: 50, borderRadius: 14, paddingHorizontal: 22, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  danger: { backgroundColor: colors.error }, outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.canvasDeep },
  primaryText: { ...textStyles.label, color: colors.canvas }, outlineText: { color: colors.ink },
  fab: { position: 'absolute', right: edge, width: 60, height: 60, borderRadius: 999, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  chip: { minHeight: 38, paddingHorizontal: 15, borderRadius: 999, borderWidth: 1, borderColor: colors.canvasDeep, justifyContent: 'center' },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink }, chipText: { ...textStyles.caption, color: colors.ink, fontSize: 14 }, chipTextOn: { color: colors.canvas },
  sheetRoot: { flex: 1, justifyContent: 'flex-end' }, scrim: { flex: 1, backgroundColor: 'rgba(10, 10, 9, 0.46)' },
  sheet: { backgroundColor: colors.canvas, borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '88%', paddingTop: 10 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 999, backgroundColor: colors.canvasDeep, marginBottom: 8 },
  sheetContent: { paddingHorizontal: edge, gap: 14, paddingBottom: 4 },
  sheetTitle: { ...textStyles.title, color: colors.ink },
  menuRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 14, borderBottomWidth: 1, borderColor: colors.canvasDeep },
  menuText: { ...textStyles.body, color: colors.ink }, menuDanger: { color: colors.error },
  caption: { ...textStyles.caption, color: colors.inkFaint },
  toast: { position: 'absolute', left: edge, right: edge, backgroundColor: colors.ink, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14 },
  toastText: { ...textStyles.body, color: colors.canvas, fontSize: 15 },
  banner: { backgroundColor: colors.canvasWarm, borderRadius: 12, padding: 14, gap: 4 },
  bannerTitle: { ...textStyles.label, color: colors.error }, bannerText: { ...textStyles.caption, color: colors.inkMuted, fontSize: 14, lineHeight: 20 },
  bannerAction: { alignSelf: 'flex-start', minHeight: 40, justifyContent: 'center' }, bannerActionText: { ...textStyles.label, color: colors.ink, textDecorationLine: 'underline' },
  artwork: { backgroundColor: colors.canvasWarm, overflow: 'hidden' },
  artworkEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
