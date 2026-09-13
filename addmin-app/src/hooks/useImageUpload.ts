import { useCallback, useRef } from 'react'
import { AdminApiError, isUnknownOutcome, uploadArtworkImage } from '@/api/admin'
import type { AdminSession } from '@/auth/session'

/**
 * Pamti već poslatu fotografiju za ovu formu. Ako upload uspe a čuvanje rada
 * padne, ponovni pokušaj ne šalje istu fotografiju ponovo preko mobilne mreže.
 */
export function useImageUpload() {
  const uploaded = useRef<{ localUri: string; assetId: string } | null>(null)

  return useCallback(async (session: AdminSession, localUri: string) => {
    if (uploaded.current?.localUri === localUri) {
      return uploaded.current.assetId
    }
    const { assetId } = await uploadArtworkImage(session, localUri)
    uploaded.current = { localUri, assetId }
    return assetId
  }, [])
}

export function saveErrorMessage(error: unknown, { creating }: { creating: boolean }) {
  if (isUnknownOutcome(error)) {
    return creating
      ? `${(error as AdminApiError).message} Nije potvrđeno da je rad sačuvan — ponovni pokušaj neće napraviti duplikat.`
      : `${(error as AdminApiError).message} Nije potvrđeno da su izmene sačuvane — slobodno pokušajte ponovo.`
  }
  if (error instanceof AdminApiError && error.kind === 'unauthorized') {
    return 'Sesija je istekla. Posle ponovne prijave pritisnite čuvanje još jednom.'
  }
  return error instanceof AdminApiError ? error.message : 'Čuvanje trenutno ne radi. Pokušajte ponovo.'
}
