import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'
import type { AdminMediumOption, ArtworkStatus } from '@/api/admin'
import { colors } from '@/theme/colors'

export type ArtworkFormValues = {
  title: string
  year: string
  dimensions: string
  shortDescription: string
  mediumId: string | null
  featured: boolean
  heroCandidate: boolean
}

export type PendingImage = {
  // localUri set kad je slika izabrana ali jos ne mora biti uploadovana;
  // remoteUrl je postojeca Sanity slika (izmena postojeceg rada).
  localUri: string | null
  remoteUrl: string | null
  alt: string
}

type Props = {
  values: ArtworkFormValues
  onChange: (values: ArtworkFormValues) => void
  image: PendingImage
  onImageChange: (image: PendingImage) => void
  mediums: AdminMediumOption[]
  mediumsLoading: boolean
  submitting: boolean
  submitLabel: { draft: string; publish: string }
  onSubmit: (status: ArtworkStatus) => void
}

export function ArtworkForm({
  values,
  onChange,
  image,
  onImageChange,
  mediums,
  mediumsLoading,
  submitting,
  submitLabel,
  onSubmit,
}: Props) {
  const [pickerError, setPickerError] = useState<string | null>(null)

  function set<K extends keyof ArtworkFormValues>(key: K, value: ArtworkFormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  async function pickImage(fromCamera: boolean) {
    setPickerError(null)

    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permission.granted) {
      setPickerError('Potrebna je dozvola za kameru/galeriju da bi se izabrala fotografija.')
      return
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsEditing: true })

    if (result.canceled || !result.assets[0]) return

    onImageChange({ ...image, localUri: result.assets[0].uri, remoteUrl: null })
  }

  const canSubmitDraft = values.title.trim().length > 0
  const canSubmitPublish = canSubmitDraft && Boolean(image.localUri || image.remoteUrl) && image.alt.trim().length > 0

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Field label="Naslov">
        <TextInput
          onChangeText={(v) => set('title', v)}
          placeholder="Naziv rada"
          placeholderTextColor={colors.inkFaint}
          style={styles.input}
          value={values.title}
        />
      </Field>

      <Field label="Godina">
        <TextInput
          keyboardType="number-pad"
          onChangeText={(v) => set('year', v.replace(/\D/g, '').slice(0, 4))}
          placeholder="npr. 2026"
          placeholderTextColor={colors.inkFaint}
          style={styles.input}
          value={values.year}
        />
      </Field>

      <Field label="Tehnika">
        {mediumsLoading ? (
          <ActivityIndicator color={colors.ink} />
        ) : (
          <View style={styles.chipRow}>
            {mediums.map((m) => (
              <Pressable
                key={m._id}
                onPress={() => set('mediumId', values.mediumId === m._id ? null : m._id)}
                style={[styles.chip, values.mediumId === m._id && styles.chipActive]}
              >
                <Text style={[styles.chipText, values.mediumId === m._id && styles.chipTextActive]}>
                  {m.title}
                </Text>
              </Pressable>
            ))}
            {mediums.length === 0 && <Text style={styles.hint}>Nema definisanih tehnika u Sanity-ju.</Text>}
          </View>
        )}
      </Field>

      <Field label="Dimenzije">
        <TextInput
          onChangeText={(v) => set('dimensions', v)}
          placeholder="npr. 60 x 80 cm"
          placeholderTextColor={colors.inkFaint}
          style={styles.input}
          value={values.dimensions}
        />
      </Field>

      <Field label="Kratak opis">
        <TextInput
          multiline
          numberOfLines={3}
          onChangeText={(v) => set('shortDescription', v)}
          placeholder="Nekoliko recenica o radu"
          placeholderTextColor={colors.inkFaint}
          style={[styles.input, styles.multiline]}
          value={values.shortDescription}
        />
      </Field>

      <Field label="Fotografija">
        {(image.localUri || image.remoteUrl) && (
          <Image source={{ uri: image.localUri ?? image.remoteUrl ?? undefined }} style={styles.preview} />
        )}
        <View style={styles.chipRow}>
          <Pressable onPress={() => pickImage(true)} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Kamera</Text>
          </Pressable>
          <Pressable onPress={() => pickImage(false)} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Galerija</Text>
          </Pressable>
        </View>
        {pickerError && <Text style={styles.errorText}>{pickerError}</Text>}
        {(image.localUri || image.remoteUrl) && (
          <TextInput
            onChangeText={(v) => onImageChange({ ...image, alt: v })}
            placeholder="Opis slike (alt tekst) — obavezno pre objave"
            placeholderTextColor={colors.inkFaint}
            style={[styles.input, styles.altInput]}
            value={image.alt}
          />
        )}
      </Field>

      <Field label="Izdvojeno">
        <Switch
          onValueChange={(v) => set('featured', v)}
          thumbColor={colors.canvas}
          trackColor={{ false: colors.canvasDeep, true: colors.gold }}
          value={values.featured}
        />
      </Field>

      <Field label="Naslovni rad (hero)">
        <Switch
          onValueChange={(v) => set('heroCandidate', v)}
          thumbColor={colors.canvas}
          trackColor={{ false: colors.canvasDeep, true: colors.gold }}
          value={values.heroCandidate}
        />
      </Field>

      <View style={styles.buttonRow}>
        <Pressable
          disabled={!canSubmitDraft || submitting}
          onPress={() => onSubmit('draft')}
          style={[styles.secondaryButton, styles.flexButton, (!canSubmitDraft || submitting) && styles.buttonDisabled]}
        >
          <Text style={styles.secondaryButtonText}>{submitLabel.draft}</Text>
        </Pressable>
        <Pressable
          disabled={!canSubmitPublish || submitting}
          onPress={() => onSubmit('published')}
          style={[styles.primaryButton, styles.flexButton, (!canSubmitPublish || submitting) && styles.buttonDisabled]}
        >
          {submitting ? <ActivityIndicator color={colors.canvas} /> : <Text style={styles.primaryButtonText}>{submitLabel.publish}</Text>}
        </Pressable>
      </View>
      {!canSubmitPublish && canSubmitDraft && (
        <Text style={styles.hint}>Za objavu je potrebna fotografija sa opisom (alt tekstom).</Text>
      )}
    </ScrollView>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.canvas,
    gap: 20,
    padding: 20,
    paddingBottom: 48,
  },
  field: {
    gap: 8,
  },
  label: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.canvasWarm,
    borderColor: colors.canvasDeep,
    borderRadius: 4,
    borderWidth: 1,
    color: colors.ink,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  altInput: {
    marginTop: 4,
  },
  hint: {
    color: colors.inkFaint,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },
  errorText: {
    color: colors.error,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.canvasWarm,
    borderColor: colors.canvasDeep,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    color: colors.ink,
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
  },
  chipTextActive: {
    color: colors.canvas,
  },
  preview: {
    backgroundColor: colors.canvasWarm,
    borderRadius: 4,
    height: 180,
    marginBottom: 4,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flexButton: {
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.canvasWarm,
    borderColor: colors.canvasDeep,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: colors.ink,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    textTransform: 'uppercase',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: colors.canvas,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    textTransform: 'uppercase',
  },
} as const)
