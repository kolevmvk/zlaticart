import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { AdminMediumOption } from '@/api/admin'
import { ImagePreparationError, prepareUploadImage } from '@/api/image'
import { Button, Feedback, Field } from '@/components/ui'
import { colors } from '@/theme/colors'
import { shape, spacing } from '@/theme/spacing'
import { textStyles } from '@/theme/typography'

export type ArtworkFormValues = {
  title: string; year: string; dimensions: string; shortDescription: string
  mediumId: string | null; featured: boolean; heroCandidate: boolean
}
export type PendingImage = { localUri: string | null; remoteUrl: string | null; alt: string }
/** 'draft' čuva nacrt (sajt se ne menja), 'published' čuva pa objavljuje. */
export type SubmitAction = 'draft' | 'published'
type Props = {
  values: ArtworkFormValues; onChange: (values: ArtworkFormValues) => void
  image: PendingImage; onImageChange: (image: PendingImage) => void
  mediums: AdminMediumOption[]; mediumsLoading: boolean; mediumsError?: boolean; onRetryMediums?: () => void
  submitting: boolean; submitLabel: { draft: string; publish: string }
  onSubmit: (action: SubmitAction) => void
  /** Čuva nacrt ako ima izmena, pa otvara pregled na sajtu. */
  onPreview: () => void; previewing: boolean
  /** Gde je rad: na sajtu, u nacrtu, sa neobjavljenim izmenama. */
  notice?: { title: string; message?: string }
}

export function ArtworkForm({ values, onChange, image, onImageChange, mediums, mediumsLoading,
  mediumsError, onRetryMediums, submitting, submitLabel, onSubmit, onPreview, previewing, notice }: Props) {
  const insets = useSafeAreaInsets()
  const [pickerError, setPickerError] = useState<string | null>(null)
  const [picking, setPicking] = useState(false)
  const [details, setDetails] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const busy = submitting || picking || previewing
  const hasImage = Boolean(image.localUri || image.remoteUrl)
  const canDraft = Boolean(values.title.trim()) && (!image.localUri || Boolean(image.alt.trim()))
  const canPublish = canDraft && hasImage && Boolean(image.alt.trim())
  function set<K extends keyof ArtworkFormValues>(key: K, value: ArtworkFormValues[K]) {
    onChange({ ...values, [key]: value })
  }
  async function pickImage(camera: boolean) {
    if (busy) return
    setPicking(true)
    setPickerError(null)
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync()
        if (!permission.granted) {
          setPickerError('Dozvolite pristup kameri u podešavanjima telefona ili izaberite sliku iz galerije.')
          return
        }
      }
      // Pun kvalitet pri izboru; smanjenje za slanje radi prepareUploadImage,
      // blaže od fiksne kompresije koja kvari boje i detalje slike.
      const result = camera
        ? await ImagePicker.launchCameraAsync({ quality: 1, allowsEditing: true })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, allowsEditing: true })
      if (result.canceled || !result.assets[0]) return
      const prepared = await prepareUploadImage(result.assets[0])
      setImageFailed(false)
      onImageChange({ ...image, localUri: prepared.uri })
    } catch (error) {
      setPickerError(error instanceof ImagePreparationError
        ? `${error.message} Izaberite drugu fotografiju.`
        : 'Fotografija nije otvorena. Pokušajte ponovo ili izaberite drugu fotografiju.')
    } finally { setPicking(false) }
  }
  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>VAŠ ATELJE</Text>
        <Text style={styles.heading}>Priča jednog rada</Text>
        <Text style={styles.body}>Dodajte naziv i fotografiju. Ostale podatke možete dopuniti kasnije.</Text>
      </View>
      {notice ? <Feedback title={notice.title} message={notice.message} /> : null}
      <Field label="Naziv rada" testID="artwork-title" value={values.title} onChangeText={v => set('title', v)} placeholder="Unesite naziv" editable={!busy} returnKeyType="next" />
      <View style={styles.section}>
        <Text style={styles.label}>Fotografija</Text>
        {hasImage ? <>
          <Image accessibilityLabel={image.alt || 'Fotografija rada'} source={{ uri: image.localUri ?? image.remoteUrl! }} resizeMode="contain" style={styles.preview} onError={() => setImageFailed(true)} />
          {imageFailed ? <Text style={styles.body}>Prikaz fotografije nije dostupan. Proverite vezu.</Text> : null}
        </> : <View style={styles.emptyImage}><Text style={styles.heading}>Dodajte fotografiju</Text><Text style={styles.body}>Iz galerije ili direktno kamerom.</Text></View>}
        <View style={styles.row}>
          <View style={styles.flex}><Button label="Kamera" testID="artwork-camera" variant="secondary" disabled={busy} onPress={() => pickImage(true)} /></View>
          <View style={styles.flex}><Button label="Galerija" testID="artwork-gallery" variant="secondary" disabled={busy} onPress={() => pickImage(false)} /></View>
        </View>
        {picking ? <Feedback title="Priprema fotografije…" tone="loading" /> : null}
        {pickerError ? <Feedback title="Fotografija nije dodata" message={pickerError} tone="error" /> : null}
        {image.localUri ? <Button label="Odustani od nove fotografije" variant="quiet" disabled={busy} onPress={() => { setImageFailed(false); onImageChange({ ...image, localUri: null }) }} /> : null}
        {hasImage ? <Field label="Opis fotografije" testID="artwork-alt" value={image.alt} onChangeText={alt => onImageChange({ ...image, alt })} placeholder="Šta je prikazano na slici?" hint="Kratak opis za osobe koje koriste čitač ekrana. Obavezan uz novu fotografiju i za objavu." editable={!busy} multiline /> : null}
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Tehnika</Text>
        {mediumsLoading ? <Feedback title="Učitavanje tehnika…" tone="loading" /> : mediumsError ? <Feedback title="Tehnike nisu učitane" message="Postojeći izbor je sačuvan. Pokušajte ponovo." tone="error" actionLabel="Pokušaj ponovo" onAction={onRetryMediums} /> : <>
          <View style={styles.chips}>
            {[{ _id: '', title: 'Bez tehnike' }, ...mediums].map(m => <Pressable key={m._id} testID={m._id ? `medium-${m._id}` : 'medium-none'} accessibilityRole="radio" accessibilityState={{ checked: values.mediumId === (m._id || null), disabled: busy }} disabled={busy} onPress={() => set('mediumId', m._id || null)} style={[styles.chip, values.mediumId === (m._id || null) && styles.selected]}>
              <Text style={[styles.body, values.mediumId === (m._id || null) && styles.inverse]}>{m.title}</Text>
            </Pressable>)}
          </View>
          {!mediums.length ? <Text style={styles.caption}>Još nema dodatih tehnika.</Text> : null}
        </>}
      </View>
      <Field label="Godina" testID="artwork-year" value={values.year} onChangeText={v => set('year', v.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" placeholder="Godina nastanka" editable={!busy} />
      <Field label="Dimenzije" testID="artwork-dimensions" value={values.dimensions} onChangeText={v => set('dimensions', v)} placeholder="Na primer, 60 × 80 cm" editable={!busy} />
      <Field label="Kratak opis" testID="artwork-description" value={values.shortDescription} onChangeText={v => set('shortDescription', v)} multiline style={styles.multiline} placeholder="Nekoliko rečenica o radu" editable={!busy} />
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: details }} onPress={() => setDetails(!details)} style={styles.details} testID="artwork-details">
        <Text style={styles.label}>{details ? '− Manje detalja' : '+ Više detalja'}</Text>
      </Pressable>
      {details ? <View style={styles.section}>
        <View style={styles.switchRow}><Text style={[styles.body, styles.flex]}>Izdvojeni rad</Text><Switch accessibilityLabel="Izdvojeni rad" disabled={busy} value={values.featured} onValueChange={v => set('featured', v)} trackColor={{ false: colors.canvasDeep, true: colors.ink }} /></View>
        <View style={styles.switchRow}><Text style={[styles.body, styles.flex]}>Kandidat za naslovni rad</Text><Switch accessibilityLabel="Kandidat za naslovni rad" disabled={busy} value={values.heroCandidate} onValueChange={v => set('heroCandidate', v)} trackColor={{ false: colors.canvasDeep, true: colors.ink }} /></View>
      </View> : null}
      <View style={styles.actions}>
        <Text style={styles.caption}>{canPublish ? 'Nacrt se čuva bez promene sajta. Pregled prikazuje nacrt, a sajt se menja tek objavom.' : 'Nacrt zahteva naziv. Za objavu dodajte fotografiju i njen opis.'}</Text>
        <Button label={submitLabel.draft} testID="artwork-save-draft" variant="secondary" disabled={!canDraft || busy} onPress={() => onSubmit('draft')} />
        <Button label={previewing ? 'Otvaranje pregleda…' : 'Pregledaj na sajtu'} testID="artwork-preview" variant="secondary" disabled={!canDraft || busy} loading={previewing} onPress={onPreview} />
        <Button label={submitting ? 'Čuvanje…' : submitLabel.publish} testID="artwork-publish" disabled={!canPublish || busy} loading={submitting} onPress={() => onSubmit('published')} />
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas }, content: { padding: spacing.xl, gap: spacing.xl },
  intro: { gap: spacing.sm }, eyebrow: { ...textStyles.caption, color: colors.inkMuted, letterSpacing: 2 },
  heading: { ...textStyles.heading, color: colors.ink }, body: { ...textStyles.body, color: colors.inkMuted },
  caption: { ...textStyles.caption, color: colors.inkMuted }, label: { ...textStyles.label, color: colors.ink },
  section: { gap: spacing.md }, preview: { width: '100%', aspectRatio: 1, backgroundColor: colors.canvasWarm, borderRadius: shape.cardRadius },
  emptyImage: { minHeight: 180, backgroundColor: colors.canvasWarm, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.inkFaint, borderRadius: shape.cardRadius, padding: spacing.xl, justifyContent: 'center', gap: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, flex: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, chip: { minHeight: shape.touchTarget, borderWidth: 1, borderColor: colors.inkFaint, borderRadius: shape.radius, padding: spacing.md, justifyContent: 'center' },
  selected: { backgroundColor: colors.ink }, inverse: { color: colors.canvas }, multiline: { minHeight: 100, textAlignVertical: 'top' },
  details: { minHeight: shape.touchTarget, justifyContent: 'center', borderTopWidth: 1, borderColor: colors.canvasDeep, paddingVertical: spacing.md },
  switchRow: { minHeight: shape.touchTarget, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  actions: { gap: spacing.md, borderTopWidth: 1, borderColor: colors.canvasDeep, paddingTop: spacing.xl },
})
