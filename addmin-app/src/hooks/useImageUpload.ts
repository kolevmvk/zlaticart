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

/** Objava nije uspela; `saved` znači da su izmene pre toga sačuvane u nacrt. */
export class PublishError extends Error {
  constructor(public readonly original: unknown, public readonly saved: boolean) {
    super('publish failed')
  }
}

export function publishErrorMessage(error: PublishError) {
  const prefix = error.saved ? 'Izmene su sačuvane u nacrtu, ali rad nije objavljen. ' : ''
  const original = error.original
  if (isUnknownOutcome(original)) {
    return `${prefix}${(original as AdminApiError).message} Nije potvrđeno da je rad objavljen — proverite listu radova ili pokušajte ponovo.`
  }
  if (original instanceof AdminApiError && original.status === 400) {
    return `${prefix}Za objavu su potrebni naziv, fotografija i opis fotografije.`
  }
  if (original instanceof AdminApiError && original.kind === 'unauthorized') {
    return `${prefix}Sesija je istekla. Posle ponovne prijave pritisnite objavu još jednom.`
  }
  return `${prefix}${original instanceof AdminApiError ? original.message : 'Objava trenutno ne radi. Pokušajte ponovo.'}`
}
