import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navigation from '@/components/nav/Navigation'
import SiteFooter from '@/components/nav/SiteFooter'
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

  const img = artwork.primaryImage

  return (
    <>
      <Navigation />
      <main className="min-h-svh bg-canvas">
        {/* Full-width artwork */}
        <div
          className="relative w-full bg-canvas-warm"
          style={{ height: 'clamp(60vh, 80vh, 90vh)', paddingTop: '4.5rem' }}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-contain p-4 md:p-8 lg:p-12"
            style={{ objectPosition: 'center top' }}
          />
        </div>

        {/* Metadata block */}
        <div className="section-gutter py-12 md:py-16">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12">
            <div className="md:col-span-7">
              <h1
                className="font-serif font-light text-ink mb-4"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '0.04em', lineHeight: '1.15' }}
              >
                {artwork.title === '[Title to be confirmed]' ? (
                  <span className="italic text-ink/40">Untitled</span>
                ) : (
                  artwork.title
                )}
              </h1>

              {artwork.story && (
                <div className="mt-6 prose prose-sm max-w-none">
                  <p className="font-sans text-ink/70 leading-relaxed text-base">{artwork.story}</p>
                </div>
              )}
            </div>

            <aside className="md:col-span-5 md:col-start-9">
              <dl className="space-y-3">
                {[
                  { label: 'Medium', value: artwork.medium.title },
                  { label: 'Year', value: artwork.year?.toString() },
                  { label: 'Dimensions', value: artwork.dimensions },
                ].map(({ label, value }) =>
                  value ? (
                    <div key={label} className="flex justify-between border-b border-canvas-deep pb-3">
                      <dt className="text-label text-ink/40">{label}</dt>
                      <dd className="font-sans text-sm text-ink/80 text-right">{value}</dd>
                    </div>
                  ) : null
                )}
              </dl>

              {artwork.instagramUrl && (
                <div className="mt-8">
                  <a
                    href={artwork.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-label text-ink/50 hover:text-ink transition-colors duration-200"
                  >
                    View on Instagram →
                  </a>
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* Prev/Next navigation */}
        <div className="section-gutter py-10 border-t border-canvas-deep flex justify-between gap-4">
          {prev ? (
            <Link
              href={`/works/${prev.slug}`}
              className="group flex items-center gap-3 text-gallery-meta hover:text-ink transition-colors duration-200"
            >
              <span>←</span>
              <span className="group-hover:opacity-100 opacity-60 transition-opacity">Previous</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/works/${next.slug}`}
              className="group flex items-center gap-3 text-gallery-meta hover:text-ink transition-colors duration-200"
            >
              <span className="group-hover:opacity-100 opacity-60 transition-opacity">Next</span>
              <span>→</span>
            </Link>
          )}
        </div>

        <SiteFooter
          instagramUrl={SITE_SETTINGS.instagramProfileUrl}
          facebookUrl={SITE_SETTINGS.facebookProfileUrl}
          email={SITE_SETTINGS.contactEmail}
        />
      </main>
    </>
  )
}
