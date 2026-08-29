'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Artwork } from '@/lib/content/types'

interface ArtworkCardProps {
  artwork: Artwork
  priority?: boolean
  size?: 'large' | 'medium' | 'small'
}

export default function ArtworkCard({ artwork, priority = false, size = 'medium' }: ArtworkCardProps) {
  const img = artwork.primaryImage

  return (
    <Link
      href={`/works/${artwork.slug}`}
      className="group block"
      aria-label={`View ${artwork.title}`}
    >
      <div
        className="relative overflow-hidden bg-canvas-warm"
        style={{
          aspectRatio:
            size === 'large'
              ? '3/4'
              : size === 'small'
              ? '4/5'
              : `${img.width}/${img.height}`,
        }}
      >
        <Image
          src={img.src}
          alt={img.alt}
          fill
          priority={priority}
          quality={85}
          sizes={
            size === 'large'
              ? '(max-width: 768px) 100vw, 60vw'
              : size === 'small'
              ? '(max-width: 768px) 50vw, 25vw'
              : '(max-width: 768px) 100vw, 40vw'
          }
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          style={{
            objectPosition: img.desktopFocalPoint
              ? `${img.desktopFocalPoint.x * 100}% ${img.desktopFocalPoint.y * 100}%`
              : 'center',
          }}
        />

        {/* Medium overlay — slides up from bottom on hover, desktop only */}
        <div
          className="
            absolute inset-x-0 bottom-0 px-4 py-4 md:px-5 md:py-5
            hidden md:block
            translate-y-full group-hover:translate-y-0
            transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          "
          style={{
            background: 'linear-gradient(to top, rgba(10,10,9,0.58) 0%, rgba(10,10,9,0.12) 70%, transparent 100%)',
          }}
          aria-hidden="true"
        >
          <p className="text-canvas font-sans text-xs tracking-widest uppercase">
            {artwork.medium.title}
            {artwork.year ? <span className="opacity-60"> · {artwork.year}</span> : null}
          </p>
        </div>
      </div>

      <div className="mt-3 md:mt-4">
        <p
          className="font-serif text-ink font-light leading-snug"
          style={{ fontSize: size === 'large' ? '1.125rem' : '0.9375rem' }}
        >
          {artwork.title === '[Title to be confirmed]' ? (
            <span className="text-ink/40 italic">Untitled</span>
          ) : (
            artwork.title
          )}
        </p>
        <p className="text-gallery-meta mt-1">
          {artwork.medium.title}
          {artwork.year ? ` · ${artwork.year}` : ''}
          {artwork.dimensions ? ` · ${artwork.dimensions}` : ''}
        </p>
      </div>
    </Link>
  )
}
