import type { Metadata } from 'next'
import Navigation from '@/components/nav/Navigation'
import SiteFooter from '@/components/nav/SiteFooter'
import JournalPageContent from './JournalPageContent'
import { getAllJournalPosts, getSiteSettings } from '@/lib/content/api'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Studio notes, thoughts, and reflections by Zlatica — painter and educator.',
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const [{ category }, allPosts, settings] = await Promise.all([
    searchParams,
    getAllJournalPosts(),
    getSiteSettings(),
  ])

  const activeCategory = category ?? 'All'
  const posts =
    activeCategory === 'All'
      ? allPosts
      : allPosts.filter((p) => p.category === activeCategory)

  return (
    <>
      <Navigation theme="light" />
      <main className="min-h-svh bg-canvas">
        <JournalPageContent posts={posts} activeCategory={activeCategory} />

        <SiteFooter
          instagramUrl={settings.instagramProfileUrl ?? null}
          facebookUrl={settings.facebookProfileUrl ?? null}
          email={settings.contactEmail ?? null}
        />
      </main>
    </>
  )
}
