import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navigation from '@/components/nav/Navigation'
import SiteFooter from '@/components/nav/SiteFooter'
import ArtworkDetailView from '@/components/works/ArtworkDetailView'
import { getArtworkBySlug, ARTWORKS, SITE_SETTINGS } from '@/lib/content/seed'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return ARTWORKS.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const artwork = getArtworkBySlug(slug)
  if (!artwork) return { title: 'Work not found' }
  return {
    title: artwork.title === '[Title to be confirmed]' ? 'Untitled work' : artwork.title,
    description: artwork.shortDescription ?? `${artwork.medium.title} by Zlatica`,
  }
}

export default async function ArtworkDetailPage({ params }: Props) {
  const { slug } = await params
  const artwork = getArtworkBySlug(slug)
  if (!artwork) notFound()

  const allPublished = ARTWORKS.filter((a) => a.status === 'published')
  const currentIdx = allPublished.findIndex((a) => a.slug === artwork.slug)
  const prev = currentIdx > 0 ? allPublished[currentIdx - 1] : null
  const next = currentIdx < allPublished.length - 1 ? allPublished[currentIdx + 1] : null

  return (
    <>
      <Navigation />
      <main className="min-h-svh bg-canvas">
        <ArtworkDetailView artwork={artwork} prev={prev} next={next} />
        <SiteFooter
          instagramUrl={SITE_SETTINGS.instagramProfileUrl}
          facebookUrl={SITE_SETTINGS.facebookProfileUrl}
          email={SITE_SETTINGS.contactEmail}
        />
      </main>
    </>
  )
}
