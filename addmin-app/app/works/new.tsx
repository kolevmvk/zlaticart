import { Redirect, useRouter } from 'expo-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import {
  type ArtworkFormInput,
  type ArtworkStatus,
  createArtwork,
  fetchMediums,
  newClientArtworkId,
  updateArtwork,
} from '@/api/admin'
import { useAuth } from '@/auth/AuthProvider'
import { ArtworkForm, type ArtworkFormValues, type PendingImage } from '@/components/ArtworkForm'
import { colors } from '@/theme/colors'
import { saveErrorMessage, useImageUpload } from '@/hooks/useImageUpload'
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
  // Jedan ID za ovu formu: svaki ponovni pokušaj cilja isti rad.
  const [clientId] = useState(newClientArtworkId)
  const uploadImage = useImageUpload()

  const mediumsQuery = useQuery({
    queryKey: ['admin-mediums'],
    queryFn: () => fetchMediums(session!),
    enabled: Boolean(session),
  })

  const mutation = useMutation({
    mutationFn: async (status: ArtworkStatus) => {
      let primaryImage: { assetId: string; alt: string } | null = null

      if (image.localUri) {
        primaryImage = { assetId: await uploadImage(session!, image.localUri), alt: image.alt.trim() }
      }

      const input: ArtworkFormInput = {
        title: values.title.trim(),
        year: values.year ? Number(values.year) : null,
        dimensions: values.dimensions.trim() || null,
        shortDescription: values.shortDescription.trim() || null,
        status,
        featured: values.featured,
        heroCandidate: values.heroCandidate,
        mediumId: values.mediumId,
        primaryImage,
      }

      const created = await createArtwork(session!, input, clientId)
      if (created.existed) {
        // Prethodni pokušaj je stigao do servera; primeni trenutni unos na taj rad.
        await updateArtwork(session!, created._id, input)
      }
    },
    onError: (error) => {
      setSubmitError(saveErrorMessage(error, { creating: true }))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artworks'] })
      allowLeave()
      router.replace({ pathname: '/works', params: { saved: mutation.variables } })
    },
  })

  const [initialForm] = useState(() => JSON.stringify({ values: EMPTY_VALUES, image: EMPTY_IMAGE }))
  const dirty = JSON.stringify({ values, image }) !== initialForm
  const allowLeave = useUnsavedChanges(dirty, mutation.isPending)

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
        onSubmit={(status) => {
          setSubmitError(null)
          mutation.mutate(status)
        }}
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
