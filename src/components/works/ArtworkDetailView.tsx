'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Artwork } from '@/lib/content/types'

interface ArtworkDetailViewProps {
  artwork: Artwork
  prev: Artwork | null
  next: Artwork | null
}

export default function ArtworkDetailView({ artwork, prev, next }: ArtworkDetailViewProps) {
  const imgWrapRef = useRef<HTMLDivElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!imgWrapRef.current || !metaRef.current) return

    import('gsap').then(({ gsap }) => {
      gsap.fromTo(
        imgWrapRef.current,
        { opacity: 0, scale: 1.03 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out', delay: 0.15 }
      )
      const metaEls = metaRef.current!.querySelectorAll<HTMLElement>('[data-meta]')
      gsap.fromTo(
        Array.from(metaEls),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09, delay: 0.8 }
      )
    })
  }, [])

  const img = artwork.primaryImage

  return (
    <>
      {/* Full-width artwork display */}
      <div
        ref={imgWrapRef}
        className="relative w-full bg-canvas-warm"
        style={{
          height: 'clamp(60vh, 80vh, 90vh)',
          paddingTop: '4.5rem',
          opacity: 0,
        }}
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
      <div ref={metaRef} className="section-gutter py-12 md:py-16">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-7">
            <h1
              data-meta
              className="font-serif font-light text-ink mb-4"
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                letterSpacing: '0.04em',
                lineHeight: '1.15',
                opacity: 0,
              }}
            >
              {artwork.title === '[Title to be confirmed]' ? (
                <span className="italic text-ink/40">Untitled</span>
              ) : (
                artwork.title
              )}
            </h1>

            {artwork.story && (
              <div data-meta style={{ opacity: 0 }} className="mt-6">
                <p className="font-sans text-ink/70 leading-relaxed text-base">{artwork.story}</p>
              </div>
            )}
          </div>

          <aside className="md:col-span-5 md:col-start-9" data-meta style={{ opacity: 0 }}>
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

      {/* Prev/Next */}
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
    </>
  )
}
