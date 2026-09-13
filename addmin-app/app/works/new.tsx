import { Redirect, useRouter } from 'expo-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import {
  type ArtworkFormInput,
  type ArtworkWriteResult,
  createArtwork,
  fetchMediums,
  getArtworkPreviewUrl,
  newClientArtworkId,
  publishArtwork,
  saveArtworkDraft,
} from '@/api/admin'
import { useAuth } from '@/auth/AuthProvider'
import { ArtworkForm, type ArtworkFormValues, type PendingImage, type SubmitAction } from '@/components/ArtworkForm'
import { colors } from '@/theme/colors'
import { PublishError, publishErrorMessage, saveErrorMessage, useImageUpload } from '@/hooks/useImageUpload'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'

const EMPTY_VALUES: ArtworkFormValues = {
  title: '',
  year: '',
  dimensions: '',
  shortDescription: '',
  mediumId: null,
  featured: false,
  heroCandidate: false,
}

const EMPTY_IMAGE: PendingImage = { localUri: null, remoteUrl: null, alt: '' }

export default function NewArtworkScreen() {
  const { session, loading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [values, setValues] = useState(EMPTY_VALUES)
  const [image, setImage] = useState(EMPTY_IMAGE)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [previewing, setPreviewing] = useState(false)
  // Jedan ID za ovu formu: svaki ponovni pokušaj cilja isti rad.
  const [clientId] = useState(newClientArtworkId)
  const uploadImage = useImageUpload()

  const mediumsQuery = useQuery({
    queryKey: ['admin-mediums'],
    queryFn: () => fetchMediums(session!),
    enabled: Boolean(session),
  })

  /** Novi rad nastaje kao nacrt; sajt ga ne prikazuje dok se ne objavi. */
  async function saveNewDraft(): Promise<ArtworkWriteResult> {
    let primaryImage: { assetId: string; alt: string } | null = null

    if (image.localUri) {
      primaryImage = { assetId: await uploadImage(session!, image.localUri), alt: image.alt.trim() }
    }

    const input: ArtworkFormInput = {
      title: values.title.trim(),
      year: values.year ? Number(values.year) : null,
      dimensions: values.dimensions.trim() || null,
      shortDescription: values.shortDescription.trim() || null,
      featured: values.featured,
      heroCandidate: values.heroCandidate,
      mediumId: values.mediumId,
      primaryImage,
    }

    const created = await createArtwork(session!, input, clientId)
    // Prethodni pokušaj je stigao do servera; primeni trenutni unos na taj rad.
    return created.existed ? saveArtworkDraft(session!, created._id, input) : created
  }

  const mutation = useMutation({
    mutationFn: async (action: SubmitAction) => {
      const saved = await saveNewDraft()
      if (action === 'draft') return
      try {
        await publishArtwork(session!, saved._id, saved.revision)
      } catch (error) {
        throw new PublishError(error, true)
      }
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: ['admin-artworks'] })
      setSubmitError(error instanceof PublishError
        ? publishErrorMessage(error)
        : saveErrorMessage(error, { creating: true }))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artworks'] })
      allowLeave()
      router.replace({ pathname: '/works', params: { saved: mutation.variables } })
    },
  })

  // Pregled traži sačuvan nacrt. Posle čuvanja forma prelazi na uređivanje
  // tog rada, da naredne izmene ne pokušavaju ponovo da ga naprave.
  async function openPreview() {
    setSubmitError(null)
    setPreviewing(true)
    let saved: ArtworkWriteResult
    try {
      saved = await saveNewDraft()
    } catch (error) {
      setSubmitError(saveErrorMessage(error, { creating: true }))
      setPreviewing(false)
      return
    }
    queryClient.invalidateQueries({ queryKey: ['admin-artworks'] })
    allowLeave()
    router.replace({ pathname: '/works/[id]', params: { id: saved._id } })
    try {
      if (saved.slug) await WebBrowser.openBrowserAsync(await getArtworkPreviewUrl(session!, saved.slug))
    } catch {
      // Nacrt je sačuvan; ekran uređivanja nudi ponovni pregled.
    }
  }

  const [initialForm] = useState(() => JSON.stringify({ values: EMPTY_VALUES, image: EMPTY_IMAGE }))
  const dirty = JSON.stringify({ values, image }) !== initialForm
  const allowLeave = useUnsavedChanges(dirty, mutation.isPending || previewing)

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
      <ArtworkForm
        image={image}
        mediums={mediumsQuery.data ?? []}
        mediumsLoading={mediumsQuery.isLoading}
        mediumsError={mediumsQuery.isError}
        onRetryMediums={() => mediumsQuery.refetch()}
        onChange={setValues}
        onImageChange={setImage}
        onPreview={openPreview}
        onSubmit={(action) => {
          setSubmitError(null)
          mutation.mutate(action)
        }}
        previewing={previewing}
        submitLabel={{ draft: 'Sačuvaj nacrt', publish: 'Objavi' }}
        submitting={mutation.isPending}
        values={values}
      />
      {submitError && (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{submitError}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    backgroundColor: colors.canvas,
    flex: 1,
    justifyContent: 'center',
  },
  errorBar: {
    backgroundColor: colors.canvasWarm,
    borderTopColor: colors.canvasDeep,
    borderTopWidth: 1,
    padding: 14,
  },
  errorText: {
    color: colors.error,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
} as const)
