import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { uploadArtworkImage } from '@/api/admin'
import { prepareUploadImage } from '@/api/image'
import { contentImageUrl, type ContentField } from '@/api/content'
import { useAuth } from '@/auth/AuthProvider'
import { Artwork, Banner, Icon, MenuSheet, PrimaryButton, Sheet } from '@/components/atelier'
import { colors } from '@/theme/colors'
import { textStyles } from '@/theme/typography'

export const newContentKey = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
type Image = Record<string, unknown>

/**
 * Izbor (galerija/kamera), priprema i slanje fotografije. Posle neuspelog slanja
 * pripremljena fotografija ostaje za „Pokušaj ponovo“ bez ponovnog biranja.
 */
function useImageUpload(onBusyChange: (busy: boolean) => void) {
  const { session } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState<{ uri: string; done: (assetId: string) => void } | null>(null)
  // null = priprema fotografije; broj = udeo poslat na server.
  const [progress, setProgress] = useState<number | null>(null)
  async function send(uri: string, done: (assetId: string) => void) {
    if (!session) throw new Error('Prijavite se ponovo da biste poslali fotografiju.')
    setProgress(0)
    const { assetId } = await uploadArtworkImage(session, uri, fraction => setProgress(fraction))
    setPending(null)
    done(assetId)
  }
  async function run(task: () => Promise<void>) {
    setError(''); setBusy(true); setProgress(null); onBusyChange(true)
    try { await task() } catch (cause) { setError(cause instanceof Error ? cause.message : 'Fotografija nije poslata. Pokušajte ponovo.') }
    finally { setBusy(false); onBusyChange(false) }
  }
  function pick(camera: boolean, done: (assetId: string) => void) {
    return run(async () => {
      const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) throw new Error(camera ? 'Dozvolite pristup kameri u podešavanjima telefona.' : 'Dozvolite pristup fotografijama u podešavanjima telefona.')
      const result = camera ? await ImagePicker.launchCameraAsync({ quality: 1 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 })
      if (result.canceled) return
      const prepared = await prepareUploadImage(result.assets[0])
      setPending({ uri: prepared.uri, done })
      await send(prepared.uri, done)
    })
  }
  const retry = pending ? () => void run(() => send(pending.uri, pending.done)) : undefined
  return { busy, error, pick, retry, progress }
}
const withAsset = (previous: Image | undefined, assetId: string, key?: string): Image => ({
  ...(previous ?? {}), _type: 'image', asset: { ...record(previous?.asset), _type: 'reference', _ref: assetId }, ...(key ? { _key: key } : {}),
})
export function uploadLabel(progress: number | null) {
  if (progress === null) return 'Pripremam fotografiju…'
  if (progress >= 1) return 'Čuvam fotografiju…'
  return `Šaljem fotografiju… ${Math.round(progress * 100)}%`
}
function UploadState({ busy, error, retry, progress }: { busy: boolean; error: string; retry?: () => void; progress: number | null }) {
  if (busy) return <View style={styles.progress}>
    <Text style={styles.muted}>{uploadLabel(progress)}</Text>
    <View style={styles.track}><View style={[styles.bar, { width: `${Math.round((progress ?? 0.03) * 100)}%` }]} /></View>
  </View>
  if (error) return <Banner title="Fotografija nije poslata" message={error} action={retry ? 'Pokušaj ponovo' : undefined} onAction={retry} />
  return null
}
function AltInput({ value, onChange, disabled, required, testID }: { value: unknown; onChange: (alt: string) => void; disabled?: boolean; required?: boolean; testID?: string }) {
  return <TextInput value={typeof value === 'string' ? value : ''} onChangeText={onChange} editable={!disabled} testID={testID}
    placeholder={`Opis slike za čitače ekrana${required ? ' (obavezno za objavu)' : ''}`} placeholderTextColor={colors.inkFaint}
    style={styles.alt} multiline accessibilityLabel="Opis fotografije" />
}

/** Velika fotografija na vrhu uređivanja (Atelje UI: rad je interfejs). */
export function HeroImage({ field, value, onChange, disabled, onBusyChange }: { field: ContentField; value: unknown; onChange: (value: unknown) => void; disabled?: boolean; onBusyChange: (busy: boolean) => void }) {
  const upload = useImageUpload(onBusyChange)
  const [menu, setMenu] = useState(false)
  const image = value ? record(value) : null
  const uri = contentImageUrl(image, 1200)
  const locked = disabled || upload.busy
  const choose = (camera: boolean) => void upload.pick(camera, assetId => onChange(withAsset(image ?? undefined, assetId)))
  return <View>
    {image?.asset ? <View style={styles.hero}>
      <Artwork uri={uri} style={StyleSheet.absoluteFill} label={typeof image.alt === 'string' ? image.alt : undefined} />
      <Pressable accessibilityRole="button" disabled={locked} onPress={() => setMenu(true)} style={styles.heroAction} testID={`field-${field.name}-replace`}>
        <Text style={styles.heroActionText}>{upload.busy ? uploadLabel(upload.progress) : 'Zameni fotografiju'}</Text>
      </Pressable>
    </View> : <View style={[styles.hero, styles.heroEmpty]}>
      <Icon name="image" size={34} color={colors.inkFaint} />
      <Text style={styles.heroEmptyTitle}>Dodajte fotografiju</Text>
      <View style={styles.row}>
        <PrimaryButton tone="outline" label="Galerija" disabled={locked} onPress={() => choose(false)} testID={`field-${field.name}-gallery`} />
        <PrimaryButton tone="outline" label="Kamera" disabled={locked} onPress={() => choose(true)} testID={`field-${field.name}-camera`} />
      </View>
    </View>}
    <View style={styles.heroBelow}>
      {image?.asset ? <AltInput value={image.alt} required={field.altRequired} disabled={locked} onChange={alt => onChange({ ...image, alt })} testID={`field-${field.name}-alt-0`} /> : null}
      <UploadState busy={upload.busy} error={upload.error} retry={upload.retry} progress={upload.progress} />
    </View>
    <MenuSheet visible={menu} onClose={() => setMenu(false)} title="Fotografija" items={[
      { label: 'Izaberi iz galerije', icon: 'image', onPress: () => choose(false) },
      { label: 'Fotografiši', icon: 'camera', onPress: () => choose(true) },
      ...(!field.required ? [{ label: 'Ukloni fotografiju', icon: 'trash' as const, destructive: true, onPress: () => onChange(null) }] : []),
    ]} />
  </View>
}

/** Pojedinačna fotografija u formi (npr. portret, slika objave). */
export function ImageField({ field, value, onChange, disabled, onBusyChange }: { field: ContentField; value: unknown; onChange: (value: unknown) => void; disabled?: boolean; onBusyChange: (busy: boolean) => void }) {
  if (field.kind === 'images') return <GalleryField field={field} value={value} onChange={onChange} disabled={disabled} onBusyChange={onBusyChange} />
  return <SingleImage field={field} value={value} onChange={onChange} disabled={disabled} onBusyChange={onBusyChange} />
}
function SingleImage({ field, value, onChange, disabled, onBusyChange }: { field: ContentField; value: unknown; onChange: (value: unknown) => void; disabled?: boolean; onBusyChange: (busy: boolean) => void }) {
  const upload = useImageUpload(onBusyChange)
  const [menu, setMenu] = useState(false)
  const image = value ? record(value) : null
  const locked = disabled || upload.busy
  const choose = (camera: boolean) => void upload.pick(camera, assetId => onChange(withAsset(image ?? undefined, assetId, image?._key as string | undefined)))
  return <View style={styles.single}>
    {image?.asset ? <Pressable accessibilityRole="button" accessibilityLabel="Promeni fotografiju" disabled={locked} onPress={() => setMenu(true)} testID={`field-${field.name}-replace-0`}>
      <Artwork uri={contentImageUrl(image, 900)} style={styles.singleImage} />
    </Pressable> : <View style={[styles.singleImage, styles.emptyTile]}>
      <Icon name="image" color={colors.inkFaint} />
      <View style={styles.row}>
        <PrimaryButton tone="outline" label="Galerija" disabled={locked} onPress={() => choose(false)} testID={`field-${field.name}-gallery`} />
        <PrimaryButton tone="outline" label="Kamera" disabled={locked} onPress={() => choose(true)} testID={`field-${field.name}-camera`} />
      </View>
    </View>}
    {image?.asset ? <AltInput value={image.alt} required={field.altRequired} disabled={locked} onChange={alt => onChange({ ...image, alt })} testID={`field-${field.name}-alt-0`} /> : null}
    <UploadState busy={upload.busy} error={upload.error} retry={upload.retry} progress={upload.progress} />
    <MenuSheet visible={menu} onClose={() => setMenu(false)} title="Fotografija" items={[
      { label: 'Izaberi iz galerije', icon: 'image', onPress: () => choose(false) },
      { label: 'Fotografiši', icon: 'camera', onPress: () => choose(true) },
      { label: 'Ukloni fotografiju', icon: 'trash', destructive: true, onPress: () => onChange(null), testID: `field-${field.name}-remove-0` },
    ]} />
  </View>
}

/** Galerija: niz sličica, dodir otvara opis, redosled, zamenu i uklanjanje. */
function GalleryField({ field, value, onChange, disabled, onBusyChange }: { field: ContentField; value: unknown; onChange: (value: unknown) => void; disabled?: boolean; onBusyChange: (busy: boolean) => void }) {
  const upload = useImageUpload(onBusyChange)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const images: Image[] = Array.isArray(value) ? value.map(record) : []
  const locked = disabled || upload.busy
  const update = (next: Image[]) => onChange(next)
  const open = openIndex !== null ? images[openIndex] : null
  function move(index: number, by: number) {
    const next = [...images]; [next[index], next[index + by]] = [next[index + by], next[index]]
    update(next); setOpenIndex(index + by)
  }
  return <View style={styles.single}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
      {images.map((image, index) => <Pressable key={String(image._key ?? index)} accessibilityRole="button" accessibilityLabel={`Fotografija ${index + 1}`} disabled={locked} onPress={() => setOpenIndex(index)} testID={`field-${field.name}-item-${index}`}>
        <Artwork uri={contentImageUrl(image, 400)} style={styles.thumb} />
        {!image.alt ? <View style={styles.noAlt}><Text style={styles.noAltText}>bez opisa</Text></View> : null}
      </Pressable>)}
      <Pressable accessibilityRole="button" accessibilityLabel="Dodaj fotografiju" disabled={locked} onPress={() => setAdding(true)} style={[styles.thumb, styles.addTile]} testID={`field-${field.name}-gallery`}>
        <Icon name="plus" color={colors.inkMuted} />
      </Pressable>
    </ScrollView>
    <UploadState busy={upload.busy} error={upload.error} retry={upload.retry} progress={upload.progress} />
    <MenuSheet visible={adding} onClose={() => setAdding(false)} title="Dodaj fotografiju" items={[
      { label: 'Izaberi iz galerije', icon: 'image', onPress: () => void upload.pick(false, assetId => update([...images, withAsset(undefined, assetId, newContentKey())])) },
      { label: 'Fotografiši', icon: 'camera', onPress: () => void upload.pick(true, assetId => update([...images, withAsset(undefined, assetId, newContentKey())])), testID: `field-${field.name}-camera` },
    ]} />
    <Sheet visible={open !== null} onClose={() => setOpenIndex(null)}>
      {open && openIndex !== null ? <>
        <Artwork uri={contentImageUrl(open, 900)} style={styles.sheetImage} />
        <AltInput value={open.alt} disabled={locked} onChange={alt => update(images.map((item, i) => i === openIndex ? { ...item, alt } : item))} testID={`field-${field.name}-alt-${openIndex}`} />
        <View style={styles.row}>
          <PrimaryButton tone="outline" label="← Ranije" disabled={locked || openIndex === 0} onPress={() => move(openIndex, -1)} testID={`field-${field.name}-up-${openIndex}`} style={styles.flex} />
          <PrimaryButton tone="outline" label="Kasnije →" disabled={locked || openIndex === images.length - 1} onPress={() => move(openIndex, 1)} testID={`field-${field.name}-down-${openIndex}`} style={styles.flex} />
        </View>
        <PrimaryButton tone="outline" label="Zameni fotografiju" disabled={locked} onPress={() => { const index = openIndex; void upload.pick(false, assetId => update(images.map((item, i) => i === index ? withAsset(item, assetId, item._key as string) : item))) }} testID={`field-${field.name}-replace-${openIndex}`} />
        <PrimaryButton tone="danger" label="Ukloni iz galerije" disabled={locked} onPress={() => { update(images.filter((_, i) => i !== openIndex)); setOpenIndex(null) }} testID={`field-${field.name}-remove-${openIndex}`} />
        <PrimaryButton tone="outline" label="Gotovo" onPress={() => setOpenIndex(null)} style={styles.plain} />
      </> : null}
    </Sheet>
  </View>
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: 10 },
  muted: { ...textStyles.caption, color: colors.inkMuted },
  progress: { gap: 6 },
  track: { height: 3, borderRadius: 999, backgroundColor: colors.canvasDeep, overflow: 'hidden' },
  bar: { height: 3, backgroundColor: colors.gold },
  hero: { height: 400, backgroundColor: colors.canvasWarm },
  heroEmpty: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 20 },
  heroEmptyTitle: { ...textStyles.title, color: colors.ink },
  heroAction: { position: 'absolute', right: 16, bottom: 16, backgroundColor: 'rgba(10, 10, 9, 0.78)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  heroActionText: { ...textStyles.caption, color: colors.canvas, fontSize: 14 },
  heroBelow: { paddingHorizontal: 20, paddingTop: 10, gap: 8 },
  alt: { ...textStyles.caption, fontSize: 14, fontStyle: 'italic', color: colors.inkMuted, paddingVertical: 6, borderBottomWidth: 1, borderColor: colors.canvasDeep },
  single: { gap: 10 },
  singleImage: { height: 240, borderRadius: 12 },
  emptyTile: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.inkFaint, alignItems: 'center', justifyContent: 'center', gap: 14, backgroundColor: 'transparent' },
  strip: { gap: 10, paddingRight: 20 },
  thumb: { width: 104, height: 130, borderRadius: 10 },
  addTile: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.inkFaint, alignItems: 'center', justifyContent: 'center' },
  noAlt: { position: 'absolute', left: 6, bottom: 6, backgroundColor: 'rgba(240, 237, 230, 0.92)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  noAltText: { ...textStyles.caption, fontSize: 11, color: colors.inkMuted },
  sheetImage: { height: 280, borderRadius: 12 },
  plain: { borderWidth: 0 },
})
