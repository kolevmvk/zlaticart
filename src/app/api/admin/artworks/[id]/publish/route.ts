import { ArtworkMutationError } from '@/lib/admin-api/artwork-mutation'
import { AdminAuthError, verifyAdminRequestWithSession } from '@/lib/admin-api/auth'
import { adminAuthError, adminError, adminOk } from '@/lib/admin-api/responses'
import { adminPublishArtwork, adminWriteConfigured, isArtworkBaseId } from '@/lib/admin-api/sanity'
import { revalidateSite } from '@/lib/admin-api/site-revalidate'
import { readBaseRevision } from '../../form-input'

export const runtime = 'nodejs'

/**
 * Objavljuje nacrt atomski: javna verzija dobija sadržaj nacrta, nacrt se briše.
 * Opcioni `{ revision }` je revizija koju je klijent video; ako je rad u
 * međuvremenu promenjen, objava se odbija sa 409.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminRequestWithSession(request)
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return adminAuthError(error)
    }
    return adminError('Unexpected admin API error.', 500)
  }

  if (!adminWriteConfigured()) {
    return adminError('Sanity write access is not configured.', 503)
  }

  const { id } = await params
  if (!isArtworkBaseId(id)) {
    return adminError('Artwork not found.', 404)
  }

  let body: unknown = {}
  const text = await request.text()
  if (text.trim()) {
    try {
      body = JSON.parse(text)
    } catch {
      return adminError('Invalid JSON body.', 400)
    }
  }

  const { revision } = (body ?? {}) as Record<string, unknown>
  const parsed = readBaseRevision({ baseRevision: revision })
  if (!parsed.ok) {
    return adminError('revision must be a revision string.', 400)
  }

  try {
    const published = await adminPublishArtwork(id, parsed.value)
    revalidateSite()
    return adminOk({ ...published, status: 'published' })
  } catch (error) {
    if (error instanceof ArtworkMutationError) return adminError(error.message, error.status)
    return adminError('Could not publish artwork in Sanity.', 502)
  }
}
