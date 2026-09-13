import 'server-only'

import type { Artwork } from '@/lib/content/types'
import { ARTWORK_FIELDS } from '@/lib/sanity/queries'
import { adminSanityClient } from './sanity'

/**
 * Pregled pre objave: nacrt (`drafts.<id>`) preko objavljene verzije. Nacrti
 * nisu javno čitljivi, pa ide preko serverskog admin klijenta sa tokenom —
 * poziva se samo kad je `hasArtworkPreviewAccess` potvrdio pristup ovom radu.
 */
export async function adminGetArtworkPreviewBySlug(slug: string): Promise<Artwork | null> {
  const results: Artwork[] = await adminSanityClient.fetch(
    `*[_type == "artwork" && slug.current == $slug][0..0] {${ARTWORK_FIELDS}}`,
    { slug },
    { perspective: 'previewDrafts' }
  )
  return results[0] ?? null
}
