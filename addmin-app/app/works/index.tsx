import { Redirect, useRouter } from 'expo-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  AdminApiError,
  type AdminArtworkListItem,
  type ArtworkStatus,
  fetchArtworks,
  updateArtworkStatus,
} from '@/api/admin'
import { useAuth } from '@/auth/AuthProvider'
import { colors } from '@/theme/colors'

// Faza 2, prvi korak: citanje + promena statusa, bez pune forme (vidi
// zlaticart/addmin-app/docs/07-ROADMAP.md, Faza 2).
const STATUS_CYCLE: Record<ArtworkStatus, ArtworkStatus> = {
  draft: 'published',
  published: 'archived',
  archived: 'draft',
}

const STATUS_LABEL: Record<ArtworkStatus, string> = {
  draft: 'Nacrt',
  published: 'Objavljeno',
  archived: 'Arhivirano',
}

export default function WorksScreen() {
  const { session, loading: authLoading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [pendingId, setPendingId] = useState<string | null>(null)

  const query = useQuery({
    queryKey: ['admin-artworks'],
    queryFn: () => fetchArtworks(session!),
    enabled: Boolean(session),
  })

  const mutation = useMutation({
    mutationFn: async (artwork: AdminArtworkListItem) => {
      const nextStatus = STATUS_CYCLE[artwork.status]
      await updateArtworkStatus(session!, artwork._id, nextStatus)
      return { id: artwork._id, status: nextStatus }
    },
    onMutate: (artwork) => setPendingId(artwork._id),
    onSettled: () => setPendingId(null),
    onSuccess: ({ id, status }) => {
      queryClient.setQueryData<AdminArtworkListItem[]>(['admin-artworks'], (current) =>
        current?.map((item) => (item._id === id ? { ...item, status } : item)),
      )
    },
  })

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.ink} />
      </View>
    )
  }

  if (!session) {
    return <Redirect href="/login" />
  }

  if (query.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.ink} />
      </View>
    )
  }

  if (query.isError) {
    const message =
      query.error instanceof AdminApiError ? query.error.message : 'Radovi trenutno ne mogu da se ucitaju.'

    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{message}</Text>
        <Pressable style={styles.retryButton} onPress={() => query.refetch()}>
          <Text style={styles.retryButtonText}>Pokusaj ponovo</Text>
        </Pressable>
      </View>
    )
  }

  const artworks = query.data ?? []

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={artworks}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>Jos nema radova u Sanity-ju.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable
              onPress={() => router.push({ pathname: '/works/[id]', params: { id: item._id } })}
              style={styles.cardText}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>
                {item.year ? `${item.year}` : 'Bez godine'}
                {item.featured ? ' · Izdvojeno' : ''}
              </Text>
            </Pressable>
            <Pressable
              disabled={mutation.isPending && pendingId === item._id}
              onPress={() => mutation.mutate(item)}
              style={[styles.statusBadge, statusStyle(item.status)]}
            >
              {mutation.isPending && pendingId === item._id ? (
                <ActivityIndicator color={colors.canvas} size="small" />
              ) : (
                <Text style={styles.statusBadgeText}>{STATUS_LABEL[item.status]}</Text>
              )}
            </Pressable>
          </View>
        )}
      />
      <Pressable onPress={() => router.push('/works/new')} style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  )
}

function statusStyle(status: ArtworkStatus) {
  if (status === 'published') return { backgroundColor: colors.ink }
  if (status === 'archived') return { backgroundColor: colors.error }
  return { backgroundColor: colors.inkFaint }
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 28,
    bottom: 20,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    width: 56,
  },
  fabText: {
    color: colors.canvas,
    fontFamily: 'DMSans_400Regular',
    fontSize: 28,
    lineHeight: 30,
  },
  centered: {
    alignItems: 'center',
    backgroundColor: colors.canvas,
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: colors.error,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
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
  listContent: {
    backgroundColor: colors.canvas,
    flexGrow: 1,
    gap: 10,
    padding: 16,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.canvasWarm,
    borderColor: colors.canvasDeep,
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    color: colors.ink,
    fontFamily: 'CormorantGaramond_500Medium',
    fontSize: 20,
  },
  cardMeta: {
    color: colors.inkFaint,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },
  statusBadge: {
    borderRadius: 4,
    minWidth: 96,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statusBadgeText: {
    color: colors.canvas,
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
} as const)
