import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navigation from '@/components/nav/Navigation'
import SiteFooter from '@/components/nav/SiteFooter'
import ArtworkDetailView from '@/components/works/ArtworkDetailView'
import { getArtworkBySlug, getAllArtworks, getSiteSettings } from '@/lib/content/api'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const artworks = await getAllArtworks()
  return artworks.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const artwork = await getArtworkBySlug(slug)
  if (!artwork) return { title: 'Work not found' }
  return {
    title: artwork.title === '[Title to be confirmed]' ? 'Untitled work' : artwork.title,
    description: artwork.shortDescription ?? `${artwork.medium.title} by Zlatica`,
  }
}

export default async function ArtworkDetailPage({ params }: Props) {
  const { slug } = await params
  const [artwork, allArtworks, settings] = await Promise.all([
    getArtworkBySlug(slug),
    getAllArtworks(),
    getSiteSettings(),
  ])

  if (!artwork) notFound()

  const currentIdx = allArtworks.findIndex((a) => a.slug === artwork.slug)
  const prev = currentIdx > 0 ? allArtworks[currentIdx - 1] : null
  const next = currentIdx < allArtworks.length - 1 ? allArtworks[currentIdx + 1] : null

  return (
    <>
      <Navigation />
      <main className="min-h-svh bg-canvas">
        <ArtworkDetailView artwork={artwork} prev={prev} next={next} />
        <SiteFooter
          instagramUrl={settings.instagramProfileUrl ?? null}
          facebookUrl={settings.facebookProfileUrl ?? null}
          email={settings.contactEmail ?? null}
        />
      </main>
    </>
  )
}
