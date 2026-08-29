'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Artwork } from '@/lib/content/types'

interface MediaTransitionsProps {
  artworks: Artwork[]
}

// One representative work per medium shown in a horizontal editorial strip
export default function MediaTransitions({ artworks }: MediaTransitionsProps) {
  const mediumOrder = ['oil', 'acrylic', 'watercolor', 'graphics', 'mosaic']

  const byMedium = mediumOrder
    .map((slug) => artworks.find((a) => a.medium.slug === slug))
    .filter((a): a is Artwork => Boolean(a))

  if (byMedium.length === 0) return null

  return (
    <section
      className="bg-ink section-spacing overflow-hidden"
      aria-labelledby="media-heading"
    >
      <div className="section-gutter mb-10 md:mb-14">
        <p className="text-label text-canvas/30 text-xs tracking-widest uppercase mb-3">
          Practice
        </p>
        <h2
          id="media-heading"
          className="font-serif font-light text-canvas"
          style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)', letterSpacing: '0.05em' }}
        >
          Across Media
        </h2>
      </div>

      {/* Horizontal scroll strip — scrollable on mobile, full row on desktop */}
      <div
        className="flex gap-px overflow-x-auto md:overflow-visible pb-0"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        role="list"
        aria-label="Artwork media"
      >
        {byMedium.map((artwork) => (
          <Link
            key={artwork.id}
            href={`/works/${artwork.slug}`}
            className="relative flex-none group focus-visible:outline-none"
            style={{
              width: 'clamp(200px, 28vw, 360px)',
              scrollSnapAlign: 'start',
            }}
            role="listitem"
            aria-label={`${artwork.medium.title} — view work`}
          >
            <div className="relative w-full overflow-hidden bg-canvas-deep" style={{ aspectRatio: '3/4' }}>
              <Image
                src={artwork.primaryImage.src}
                alt={artwork.primaryImage.alt}
                fill
                sizes="(max-width: 768px) 60vw, 28vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                style={{
                  objectPosition: artwork.primaryImage.desktopFocalPoint
                    ? `${artwork.primaryImage.desktopFocalPoint.x * 100}% ${artwork.primaryImage.desktopFocalPoint.y * 100}%`
                    : 'center',
                }}
              />
              {/* Medium label overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-ink/70 to-transparent">
                <p className="text-canvas text-xs font-sans tracking-widest uppercase">
                  {artwork.medium.title}
                </p>
              </div>
            </div>
          </Link>
        ))}

        {/* Trailing spacer on mobile for breathing room */}
        <div className="flex-none w-6 md:hidden" aria-hidden />
      </div>

      <div className="section-gutter mt-10">
        <Link
          href="/works"
          className="text-label text-canvas/40 hover:text-canvas transition-colors duration-200"
        >
          All works →
        </Link>
      </div>
    </section>
  )
}
