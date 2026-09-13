import 'server-only'
import type { JournalPost } from '@/lib/content/types'
import { JOURNAL_FIELDS } from '@/lib/sanity/queries'
import { adminSanityClient } from './sanity'
/** Call only after the scoped cookie and active session are verified. */
export async function adminGetJournalPreviewBySlug(slug: string): Promise<JournalPost | null> {
  const results = await adminSanityClient.fetch<JournalPost[]>(`*[_type == "journalPost" && slug.current == $slug][0..0] {${JOURNAL_FIELDS}}`, { slug }, { perspective: 'previewDrafts' })
  return results[0] ?? null
}
