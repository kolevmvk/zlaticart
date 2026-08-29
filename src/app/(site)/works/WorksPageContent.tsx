'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import type { Artwork, MediumSlug } from '@/lib/content/types'

interface WorksPageContentProps {
  artworks: Artwork[]
  works: Artwork[]
  activeMedium: MediumSlug | 'all'
}

export default function WorksPageContent({ artworks, works, activeMedium }: WorksPageContentProps) {
  const { t } = useLanguage()

  const filterOptions: { label: string; slug: MediumSlug | 'all' }[] = [
    { label: t.works.filter.all, slug: 'all' },
    { label: t.works.filter.oil, slug: 'oil' },
    { label: t.works.filter.acrylic, slug: 'acrylic' },
    { label: t.works.filter.watercolor, slug: 'watercolor' },
    { label: t.works.filter.graphics, slug: 'graphics' },
    { label: t.works.filter.mosaic, slug: 'mosaic' },
  ]

  return (
    <>
      {/* Page header */}
      <div className="section-gutter pt-32 md:pt-36 pb-12 md:pb-16 border-b border-canvas-deep">
        <h1
          className="font-serif font-light text-ink"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', letterSpacing: '0.10em' }}
        >
          {t.nav.works}
        </h1>
      </div>

      {/* Filter bar */}
      <div className="section-gutter py-6 flex flex-wrap gap-4 md:gap-6 border-b border-canvas-deep overflow-x-auto">
        {filterOptions.map(({ label, slug }) => (
          <Link
            key={slug}
            href={slug === 'all' ? '/works' : `/works?medium=${slug}`}
            className={`text-label whitespace-nowrap transition-colors duration-150 ${
              activeMedium === slug
                ? 'text-ink'
                : 'text-ink/40 hover:text-ink/80'
            }`}
          >
            {label}
            {slug !== 'all' && (
              <span className="ml-2 text-ink/25">
                ({artworks.filter((a) => a.medium.slug === slug).length})
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Works grid — editorial, not uniform */}
      <div className="section-gutter py-12 md:py-16">
        {works.length === 0 ? (
          <p className="text-gallery-meta text-center py-16">
            {t.works.noResults}
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {works.map((artwork) => (
              <Link
                key={artwork.id}
                href={`/works/${artwork.slug}`}
                className="group block"
              >
                <div
                  className="relative overflow-hidden bg-canvas-warm mb-3"
                  style={{ aspectRatio: `${artwork.primaryImage.width}/${artwork.primaryImage.height}` }}
                >
                  <Image
                    src={artwork.primaryImage.src}
                    alt={artwork.primaryImage.alt}
                    fill
                    quality={80}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                  />
                </div>
                <p className="font-serif text-ink font-light text-sm leading-snug">
                  {artwork.title === '[Title to be confirmed]' ? (
                    <span className="text-ink/40 italic">{t.works.untitled}</span>
                  ) : (
                    artwork.title
                  )}
                </p>
                <p className="text-gallery-meta mt-0.5">
                  {artwork.medium.title}
                  {artwork.year ? ` · ${artwork.year}` : ''}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
