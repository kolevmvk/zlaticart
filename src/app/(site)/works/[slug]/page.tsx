import type { Metadata } from 'next'
import { cookies, draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { hasArtworkPreviewAccess } from '@/lib/admin-api/auth'
import { PREVIEW_COOKIE } from '@/lib/admin-api/preview-cookie'
import Navigation from '@/components/nav/Navigation'
import SiteFooter from '@/components/nav/SiteFooter'
import ArtworkDetailView from '@/components/works/ArtworkDetailView'
import { getArtworkBySlug, getAllArtworks, getSiteSettings } from '@/lib/content/api'
import { sanityGetArtworkBySlugFresh } from '@/lib/sanity/queries'

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
    title: `${artwork.title} — Zlatica`,
    description: artwork.shortDescription ?? `${artwork.medium.title} by Zlatica`,
    openGraph: {
      images: [{ url: artwork.primaryImage.src, width: artwork.primaryImage.width, height: artwork.primaryImage.height }],
    },
    alternates: { canonical: `/works/${artwork.slug}` },
  }
}

export default async function ArtworkDetailPage({ params }: Props) {
  const { slug } = await params
  const draft = await draftMode()
  // Faza 4 (addmin-app Pregled pre objave): u pregledu se preskace Next-ov
  // static/CDN kes i ide se direktno na Sanity (useCdn:false), bez filtera
  // objave — vidi zlaticart/addmin-app/docs/04-ARCHITECTURE.md. Sam draft mode
  // nije dovoljan: nacrt se otkriva samo uz preview cookie za OVAJ rad i
  // aktivnu admin sesiju. cookies() se čita tek u draft modu, da stranica
  // ostane statička za posetioce.
  const previewing = draft.isEnabled && await hasArtworkPreviewAccess(
    (await cookies()).get(PREVIEW_COOKIE)?.value,
    slug,
  )
  const [artwork, allArtworks, settings] = await Promise.all([
    previewing ? sanityGetArtworkBySlugFresh(slug) : getArtworkBySlug(slug),
    getAllArtworks(),
    getSiteSettings(),
  ])

  if (!artwork) notFound()

  const currentIdx = allArtworks.findIndex((a) => a.slug === artwork.slug)
  const prev = currentIdx > 0 ? allArtworks[currentIdx - 1] : null
  const next = currentIdx < allArtworks.length - 1 ? allArtworks[currentIdx + 1] : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: artwork.title,
    image: artwork.primaryImage.src,
    artform: artwork.medium.title,
    ...(artwork.year ? { dateCreated: String(artwork.year) } : {}),
    ...(artwork.dimensions ? { artworkSurface: artwork.dimensions } : {}),
    creator: { '@type': 'Person', name: 'Zlatica' },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation theme="light" />
      <main className="min-h-svh bg-canvas">
        {previewing && (
          <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-ink px-4 py-2 text-center text-sm font-medium text-canvas">
            <span>PREGLED — nije još objavljeno</span>
            <a href="/api/preview/disable" className="underline underline-offset-2">
              Izađi iz pregleda
            </a>
          </div>
        )}
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
