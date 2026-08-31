import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  AdminApiError,
  type AdminArtworkDetail,
  type AdminMediumOption,
  type ArtworkStatus,
  fetchArtwork,
  fetchMediums,
  getArtworkPreviewUrl,
  updateArtwork,
  uploadArtworkImage,
} from '@/api/admin'
import { useAuth } from '@/auth/AuthProvider'
import type { AdminSession } from '@/auth/session'
import { ArtworkForm, type ArtworkFormValues, type PendingImage } from '@/components/ArtworkForm'
import { colors } from '@/theme/colors'

export default function EditArtworkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { session, loading } = useAuth()

  const artworkQuery = useQuery({
    queryKey: ['admin-artwork', id],
    queryFn: () => fetchArtwork(session!, id),
    enabled: Boolean(session && id),
  })

  const mediumsQuery = useQuery({
    queryKey: ['admin-mediums'],
    queryFn: () => fetchMediums(session!),
    enabled: Boolean(session),
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

  if (artworkQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.ink} />
      </View>
    )
  }

  if (artworkQuery.isError || !artworkQuery.data) {
    const message =
      artworkQuery.error instanceof AdminApiError
        ? artworkQuery.error.message
        : 'Rad trenutno ne moze da se ucita.'

    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{message}</Text>
        <Pressable onPress={() => artworkQuery.refetch()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Pokusaj ponovo</Text>
        </Pressable>
      </View>
    )
  }

  // Mount-uje se tek kad podaci vec postoje — lokalno stanje forme se
  // inicijalizuje jednom, iz props-a, bez useEffect+setState kombinacije.
  return (
    <EditForm
      artwork={artworkQuery.data}
      id={id}
      mediums={mediumsQuery.data ?? []}
      mediumsLoading={mediumsQuery.isLoading}
      session={session}
    />
  )
}

function EditForm({
  artwork,
  id,
  mediums,
  mediumsLoading,
  session,
}: {
  artwork: AdminArtworkDetail
  id: string
  mediums: AdminMediumOption[]
  mediumsLoading: boolean
  session: AdminSession
}) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [values, setValues] = useState<ArtworkFormValues>({
    title: artwork.title,
    year: artwork.year ? String(artwork.year) : '',
    dimensions: artwork.dimensions ?? '',
    shortDescription: artwork.shortDescription ?? '',
    mediumId: artwork.medium?._id ?? null,
    featured: artwork.featured,
    heroCandidate: artwork.heroCandidate,
  })
  const [image, setImage] = useState<PendingImage>({
    localUri: null,
    remoteUrl: artwork.thumbnailUrl,
    alt: artwork.primaryImageAlt ?? '',
  })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  async function openPreview() {
    if (!artwork.slug) return
    setPreviewError(null)
    setPreviewLoading(true)
    try {
      const url = await getArtworkPreviewUrl(session, artwork.slug)
      await WebBrowser.openBrowserAsync(url)
    } catch (error) {
      setPreviewError(
        error instanceof AdminApiError ? error.message : 'Pregled trenutno ne radi. Proverite vezu.',
      )
    } finally {
      setPreviewLoading(false)
    }
  }

  const mutation = useMutation({
    mutationFn: async (status: ArtworkStatus) => {
      let primaryImage: { assetId: string; alt: string } | null = null

      if (image.localUri) {
        const uploaded = await uploadArtworkImage(session, image.localUri, 'artwork.jpg')
        primaryImage = { assetId: uploaded.assetId, alt: image.alt.trim() }
      }
      // Ako lokalna slika nije izabrana, primaryImage ostaje null i patch je
      // parcijalan — postojeca Sanity slika/alt se ne dira (vidi
      // skills/sanity-proxy-mutation.md).

      await updateArtwork(session, id, {
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
      queryClient.invalidateQueries({ queryKey: ['admin-artwork', id] })
      router.back()
    },
  })

  return (
    <View style={styles.screen}>
      {artwork.slug && (
        <Pressable disabled={previewLoading} onPress={openPreview} style={styles.previewButton}>
          {previewLoading ? (
            <ActivityIndicator color={colors.ink} size="small" />
          ) : (
            <Text style={styles.previewButtonText}>Pregledaj na sajtu</Text>
          )}
        </Pressable>
      )}
      {previewError && (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{previewError}</Text>
        </View>
      )}
      <ArtworkForm
        image={image}
        mediums={mediums}
        mediumsLoading={mediumsLoading}
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
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  previewButton: {
    alignItems: 'center',
    backgroundColor: colors.canvasWarm,
    borderColor: colors.gold,
    borderRadius: 4,
    borderWidth: 1,
    margin: 16,
    marginBottom: 0,
    paddingVertical: 12,
  },
  previewButtonText: {
    color: colors.ink,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
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
  retryButton: {
    backgroundColor: colors.ink,
    borderRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: colors.canvas,
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
  },
} as const)
