import type { Metadata } from 'next'
import Navigation from '@/components/nav/Navigation'
import SiteFooter from '@/components/nav/SiteFooter'
import WorksPageContent from './WorksPageContent'
import { getAllArtworks, getSiteSettings } from '@/lib/content/api'
import type { MediumSlug } from '@/lib/content/types'

export const metadata: Metadata = {
  title: 'Works',
  description: 'Selected works by Zlatica — oil, acrylic, watercolor, graphics, and mosaic.',
}

export default async function WorksPage({
  searchParams,
}: {
  searchParams: Promise<{ medium?: string }>
}) {
  const [{ medium }, artworks, settings] = await Promise.all([
    searchParams,
    getAllArtworks(),
    getSiteSettings(),
  ])

  const activeMedium = (medium ?? 'all') as MediumSlug | 'all'
  const works =
    activeMedium === 'all'
      ? artworks
      : artworks.filter((a) => a.medium.slug === activeMedium)

  return (
    <>
      <Navigation />
      <main className="min-h-svh bg-canvas">
        <WorksPageContent artworks={artworks} works={works} activeMedium={activeMedium} />

        <SiteFooter
          instagramUrl={settings.instagramProfileUrl ?? null}
          facebookUrl={settings.facebookProfileUrl ?? null}
          email={settings.contactEmail ?? null}
        />
      </main>
    </>
  )
}
