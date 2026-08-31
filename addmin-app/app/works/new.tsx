import { Redirect, useRouter } from 'expo-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import {
  AdminApiError,
  type ArtworkStatus,
  createArtwork,
  fetchMediums,
  uploadArtworkImage,
} from '@/api/admin'
import { useAuth } from '@/auth/AuthProvider'
import { ArtworkForm, type ArtworkFormValues, type PendingImage } from '@/components/ArtworkForm'
import { colors } from '@/theme/colors'

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

  const mediumsQuery = useQuery({
    queryKey: ['admin-mediums'],
    queryFn: () => fetchMediums(session!),
    enabled: Boolean(session),
  })

  const mutation = useMutation({
    mutationFn: async (status: ArtworkStatus) => {
      let primaryImage: { assetId: string; alt: string } | null = null

      if (image.localUri) {
        const uploaded = await uploadArtworkImage(session!, image.localUri, 'artwork.jpg')
        primaryImage = { assetId: uploaded.assetId, alt: image.alt.trim() }
      }

      await createArtwork(session!, {
        title: values.title.trim(),
        year: values.year ? Number(values.year) : null,
        dimensions: values.dimensions.trim() || null,
        shortDescription: values.shortDescription.trim() || null,
        status,
        featured: values.featured,
        heroCandidate: values.heroCandidate,
        mediumId: values.mediumId,
        primaryImage,
      })
    },
    onError: (error) => {
      setSubmitError(
        error instanceof AdminApiError ? error.message : 'Cuvanje trenutno ne radi. Proverite vezu.',
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artworks'] })
      router.back()
    },
  })

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
        onChange={setValues}
        onImageChange={setImage}
        onSubmit={(status) => {
          setSubmitError(null)
          mutation.mutate(status)
        }}
        submitLabel={{ draft: 'Sacuvaj kao nacrt', publish: 'Objavi' }}
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
