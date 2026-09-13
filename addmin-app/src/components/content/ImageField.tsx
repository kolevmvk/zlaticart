import { useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { uploadArtworkImage } from '@/api/admin'
import { prepareUploadImage } from '@/api/image'
import { contentImageUrl, type ContentField } from '@/api/content'
import { useAuth } from '@/auth/AuthProvider'
import { Button, Feedback, Field } from '@/components/ui'
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/spacing'
import { textStyles } from '@/theme/typography'

export const newContentKey = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
export function ImageField({ field, value, onChange, disabled, onBusyChange }: {
  field: ContentField; value: unknown; onChange: (value: unknown) => void; disabled?: boolean; onBusyChange: (busy: boolean) => void
}) {
  const { session } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState<{ uri: string; target?: number } | null>(null)
  const multiple = field.kind === 'images'
  const images: Record<string, unknown>[] = multiple ? (Array.isArray(value) ? value.map(record) : []) : value ? [record(value)] : []
  const locked = disabled || busy
  function replace(index: number, image: Record<string, unknown>) {
    setPending(null)
    onChange(multiple ? images.map((item, i) => i === index ? image : item) : image)
  }
  async function upload(uri: string, target?: number) {
    if (!session) throw new Error('Prijavite se ponovo da biste poslali fotografiju.')
    const { assetId } = await uploadArtworkImage(session, uri)
    const next = { ...(target !== undefined ? images[target] : {}), _type: 'image', asset: { ...(target !== undefined ? record(images[target]?.asset) : {}), _type: 'reference', _ref: assetId }, ...(multiple && target === undefined ? { _key: newContentKey() } : {}) }
    if (target !== undefined) replace(target, next)
    else onChange(multiple ? [...images, next] : next)
    setPending(null)
  }
  async function pick(camera: boolean, target?: number) {
    setError(''); setBusy(true); onBusyChange(true)
    try {
      const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) throw new Error(camera ? 'Dozvolite pristup kameri u podešavanjima telefona.' : 'Dozvolite pristup fotografijama u podešavanjima telefona.')
      const result = camera ? await ImagePicker.launchCameraAsync({ quality: 1 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 })
      if (result.canceled) return
      const prepared = await prepareUploadImage(result.assets[0])
      setPending({ uri: prepared.uri, target })
      await upload(prepared.uri, target)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Fotografija nije poslata. Pokušajte ponovo.') }
    finally { setBusy(false); onBusyChange(false) }
  }
  async function retry() {
    if (!pending) return
    setError(''); setBusy(true); onBusyChange(true)
    try { await upload(pending.uri, pending.target) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Fotografija nije poslata.') }
    finally { setBusy(false); onBusyChange(false) }
  }
  function move(index: number, direction: number) {
    setPending(null)
    const next = [...images]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; onChange(next)
  }
  return <View style={styles.group}>
    {images.map((image, index) => <View key={String(image._key ?? index)} style={styles.card}>
      {contentImageUrl(image) ? <Image source={{ uri: contentImageUrl(image)! }} style={styles.image} accessibilityLabel={typeof image.alt === 'string' ? image.alt : 'Izabrana fotografija'} /> : <Text style={styles.text}>Fotografija nema dostupan prikaz.</Text>}
      <Field label={`Opis fotografije${field.altRequired ? ' *' : ''}`} testID={`field-${field.name}-alt-${index}`} editable={!locked} value={typeof image.alt === 'string' ? image.alt : ''} onChangeText={alt => replace(index, { ...image, alt })} hint="Opišite ono što je na fotografiji." />
      <Button label={`Zameni fotografiju ${index + 1}`} variant="secondary" disabled={locked} onPress={() => void pick(false, index)} testID={`field-${field.name}-replace-${index}`} />
      <Button label={`Ukloni fotografiju ${index + 1}`} variant="quiet" disabled={locked} onPress={() => { setPending(null); onChange(multiple ? images.filter((_, i) => i !== index) : null) }} testID={`field-${field.name}-remove-${index}`} />
      {multiple ? <View style={styles.group}>
        <Button label={`Fotografija ${index + 1}: pomeri gore`} variant="quiet" disabled={locked || index === 0} onPress={() => move(index, -1)} testID={`field-${field.name}-up-${index}`} />
        <Button label={`Fotografija ${index + 1}: pomeri dole`} variant="quiet" disabled={locked || index === images.length - 1} onPress={() => move(index, 1)} testID={`field-${field.name}-down-${index}`} />
      </View> : null}
    </View>)}
    {multiple || !images.length ? <View style={styles.group}>
      <Button label="Dodaj iz galerije" variant="secondary" disabled={locked} onPress={() => void pick(false)} testID={`field-${field.name}-gallery`} />
      <Button label="Fotografiši" variant="secondary" disabled={locked} onPress={() => void pick(true)} testID={`field-${field.name}-camera`} />
    </View> : null}
    {busy ? <Feedback title="Priprema i slanje fotografije…" tone="loading" /> : null}
    {error ? <Feedback title="Fotografija nije poslata" message={error} tone="error" {...(pending && !locked ? { actionLabel: 'Pokušaj ponovo', onAction: () => void retry() } : {})} /> : null}
  </View>
}
const styles = StyleSheet.create({ group: { gap: spacing.sm }, card: { gap: spacing.sm, padding: spacing.md, backgroundColor: colors.canvasWarm }, image: { width: '100%', aspectRatio: 1.3, resizeMode: 'contain' }, text: { ...textStyles.body, color: colors.inkMuted } })
