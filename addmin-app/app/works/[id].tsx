import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  AdminApiError,
  type AdminArtworkDetail,
  type AdminMediumOption,
  fetchArtwork,
  fetchMediums,
  getArtworkPreviewUrl,
  isUnknownOutcome,
  publishArtwork,
  saveArtworkDraft,
} from '@/api/admin'
import { useAuth } from '@/auth/AuthProvider'
import type { AdminSession } from '@/auth/session'
import { ArtworkForm, type ArtworkFormValues, type PendingImage, type SubmitAction } from '@/components/ArtworkForm'
import { colors } from '@/theme/colors'
import { PublishError, publishErrorMessage, saveErrorMessage, useImageUpload } from '@/hooks/useImageUpload'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'

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

  // Samo kad podataka NEMA. Neuspelo osvežavanje (npr. 401 posle isteka
  // sesije) ne sme da zameni otvorenu formu ekranom greške i obriše unos.
  if (!artworkQuery.data) {
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
      mediumsError={mediumsQuery.isError}
      onRetryMediums={() => mediumsQuery.refetch()}
      session={session}
    />
  )
}

function versionNotice(artwork: AdminArtworkDetail, hasDraft: boolean, dirty: boolean) {
  const title = artwork.status === 'published'
    ? 'Objavljeno na sajtu'
    : artwork.status === 'archived'
      ? 'Arhivirano — nije na sajtu'
      : artwork.hasPublished ? 'Skriveno sa sajta' : 'Nacrt — još nije na sajtu'
  const parts = [
    hasDraft
      ? artwork.status === 'published'
        ? 'Sačuvane izmene još nisu na sajtu. Pregledajte ih, pa objavite.'
        : 'Izmene su sačuvane u nacrtu.'
      : artwork.status === 'published' ? 'Sajt prikazuje ovu verziju.' : null,
    dirty ? 'U formi imate i nesačuvane izmene.' : null,
  ].filter(Boolean)
  return { title, message: parts.length ? parts.join(' ') : undefined }
}

function EditForm({
  artwork,
  id,
  mediums,
  mediumsLoading,
  mediumsError,
  onRetryMediums,
  session,
}: {
  artwork: AdminArtworkDetail
  id: string
  mediums: AdminMediumOption[]
  mediumsLoading: boolean
  mediumsError: boolean
  onRetryMediums: () => void
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
  // Verzija na serveru koju ova forma poznaje. Menja se posle svakog čuvanja,
  // da sledeće čuvanje/objava ne dobije lažni konflikt sa sopstvenom izmenom.
  const [version, setVersion] = useState({ revision: artwork.revision, slug: artwork.slug, hasDraft: artwork.hasDraft })
  const [savedForm, setSavedForm] = useState(() => JSON.stringify({ values, image }))
  // Posle neizvesnog ishoda objave revizija više nije pouzdana (objava je možda prošla).
  const [publishUncertain, setPublishUncertain] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const uploadImage = useImageUpload()
  const dirty = JSON.stringify({ values, image }) !== savedForm

  /** Čuva nacrt samo ako forma ima nesačuvane izmene; vraća aktuelnu verziju. */
  async function saveDraftIfDirty() {
    if (!dirty) return version
    const snapshot = JSON.stringify({ values, image })
    let primaryImage: { assetId: string; alt: string } | null = null
    if (image.localUri) {
      primaryImage = { assetId: await uploadImage(session, image.localUri), alt: image.alt.trim() }
    }
    const saved = await saveArtworkDraft(session, id, {
      title: values.title.trim(),
      year: values.year ? Number(values.year) : null,
      dimensions: values.dimensions.trim() || null,
      shortDescription: values.shortDescription.trim() || null,
      featured: values.featured,
      heroCandidate: values.heroCandidate,
      mediumId: values.mediumId,
      primaryImage,
      ...(image.remoteUrl && !image.localUri ? { primaryImageAlt: image.alt.trim() } : {}),
    }, version.revision)
    const next = { revision: saved.revision, slug: saved.slug ?? version.slug, hasDraft: true }
    setVersion(next)
    setSavedForm(snapshot)
    queryClient.invalidateQueries({ queryKey: ['admin-artworks'] })
    return next
  }

  async function openPreview() {
    setSubmitError(null)
    setPreviewing(true)
    try {
      const current = await saveDraftIfDirty()
      if (!current.slug) {
        setSubmitError('Pregled nije dostupan jer rad nema adresu na sajtu.')
        return
      }
      const url = await getArtworkPreviewUrl(session, current.slug)
      await WebBrowser.openBrowserAsync(url)
    } catch (error) {
      setSubmitError(dirty
        ? saveErrorMessage(error, { creating: false })
        : error instanceof AdminApiError ? error.message : 'Pregled trenutno ne radi. Proverite vezu.')
    } finally {
      setPreviewing(false)
    }
  }

  const mutation = useMutation({
    mutationFn: async (action: SubmitAction) => {
      const wasDirty = dirty
      const current = await saveDraftIfDirty()
      if (action === 'draft') return
      try {
        await publishArtwork(session, id, publishUncertain ? undefined : current.revision)
      } catch (error) {
        if (isUnknownOutcome(error)) setPublishUncertain(true)
        throw new PublishError(error, wasDirty)
      }
    },
    onError: (error) => {
      setSubmitError(error instanceof PublishError
        ? publishErrorMessage(error)
        : saveErrorMessage(error, { creating: false }))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artworks'] })
      queryClient.invalidateQueries({ queryKey: ['admin-artwork', id] })
      allowLeave()
      router.replace({ pathname: '/works', params: { saved: mutation.variables } })
    },
  })

  const allowLeave = useUnsavedChanges(dirty, mutation.isPending || previewing)
  const hasUnpublished = version.hasDraft || dirty

  return (
    <View style={styles.screen}>
      <ArtworkForm
        image={image}
        mediums={mediums}
        mediumsLoading={mediumsLoading}
        mediumsError={mediumsError}
        notice={versionNotice(artwork, version.hasDraft, dirty)}
        onRetryMediums={onRetryMediums}
        onChange={setValues}
        onImageChange={setImage}
        onPreview={openPreview}
        onSubmit={(action) => {
          setSubmitError(null)
          mutation.mutate(action)
        }}
        previewing={previewing}
        submitLabel={{
          draft: 'Sačuvaj nacrt',
          publish: artwork.status === 'published' && hasUnpublished ? 'Objavi izmene' : 'Objavi',
        }}
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
