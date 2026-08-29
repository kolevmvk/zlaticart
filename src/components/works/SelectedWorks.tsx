'use client'

import Link from 'next/link'
import ArtworkCard from './ArtworkCard'
import KineticHeading from '@/components/ui/KineticHeading'
import type { Artwork } from '@/lib/content/types'

interface SelectedWorksProps {
  artworks: Artwork[]
}

export default function SelectedWorks({ artworks }: SelectedWorksProps) {
  const [hero, ...rest] = artworks.slice(0, 6)

  return (
    <section
      className="section-spacing bg-canvas"
      aria-labelledby="selected-works-heading"
    >
      <div className="section-gutter">
        {/* Section header */}
        <div className="flex items-baseline justify-between mb-12 md:mb-16">
          <KineticHeading
            as="h2"
            id="selected-works-heading"
            className="font-serif font-light text-ink"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)', letterSpacing: '0.05em' }}
          >
            Selected Works
          </KineticHeading>
          <Link
            href="/works"
            className="text-label text-ink/50 hover:text-ink transition-colors duration-200 hidden md:block"
          >
            View all works →
          </Link>
        </div>

        {/* Desktop: editorial asymmetric layout */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-6 lg:gap-8">
          {hero && (
            <div className="md:col-span-7">
              <ArtworkCard artwork={hero} priority size="large" />
            </div>
          )}
          <div className="md:col-span-5 flex flex-col gap-6 lg:gap-8">
            {rest.slice(0, 2).map((aw) => (
              <div key={aw.id}>
                <ArtworkCard artwork={aw} size="medium" />
              </div>
            ))}
          </div>

          {/* Second row: 3 columns */}
          {rest.slice(2, 5).map((aw) => (
            <div key={aw.id} className="md:col-span-4">
              <ArtworkCard artwork={aw} size="small" />
            </div>
          ))}
        </div>

        {/* Mobile: vertical stack */}
        <div className="flex flex-col gap-10 md:hidden">
          {artworks.slice(0, 4).map((aw, i) => (
            <div key={aw.id}>
              <ArtworkCard artwork={aw} priority={i === 0} size={i === 0 ? 'large' : 'medium'} />
            </div>
          ))}
        </div>

        <div className="mt-10 md:hidden">
          <Link
            href="/works"
            className="text-label text-ink/60 hover:text-ink transition-colors duration-200"
          >
            View all works →
          </Link>
        </div>
      </div>
    </section>
  )
}
