'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import type { Artwork } from '@/lib/content/types'

interface ArtworkDetailViewProps {
  artwork: Artwork
  prev: Artwork | null
  next: Artwork | null
}

export default function ArtworkDetailView({ artwork, prev, next }: ArtworkDetailViewProps) {
  const { t } = useLanguage()
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
      if (metaEls.length > 0) gsap.fromTo(
        Array.from(metaEls),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09, delay: 0.8 }
      )
    })
  }, [])

  const img = artwork.primaryImage

  return (
    <>
      {/* Desktop: editorial two-column | Mobile: stacked */}
      <div className="md:flex md:mt-[5rem]">

        {/* LEFT — artwork column */}
        <div
          ref={imgWrapRef}
          className="relative w-full md:w-7/12 bg-canvas-warm md:h-[calc(100vh-5rem)]"
          style={{
            opacity: 0,
            height: 'clamp(60vh,80vh,90vh)',
            paddingTop: 'var(--nav-height, 4.5rem)',
          }}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            priority
            quality={95}
            sizes="(min-width: 768px) 58vw, 100vw"
            className="object-contain md:object-contain p-4 md:p-8 lg:p-12"
            style={{ objectPosition: 'center center' }}
          />
        </div>

        {/* RIGHT — metadata column: vertically centered on desktop, full-width below on mobile */}
        <div
          ref={metaRef}
          className="section-gutter py-12 md:w-5/12 md:flex md:flex-col md:justify-center md:py-16 md:px-8 md:h-[calc(100vh-5rem)] md:overflow-y-auto"
        >
          <h1
            data-meta
            className="font-serif font-light text-ink mb-4"
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 3.5rem)',
              letterSpacing: '0.04em',
              lineHeight: '1.15',
              opacity: 0,
            }}
          >
            {artwork.title === '[Title to be confirmed]' ? (
              <span className="italic text-ink/40">{t.works.untitled}</span>
            ) : (
              artwork.title
            )}
          </h1>

          <div data-meta style={{ opacity: 0 }} className="mt-6">
            <dl className="space-y-3">
              {[
                { label: t.works.medium, value: artwork.medium.title },
                { label: t.works.year, value: artwork.year?.toString() },
                { label: t.works.dimensions, value: artwork.dimensions },
              ].map(({ label, value }) =>
                value ? (
                  <div key={label} className="flex justify-between border-b border-canvas-deep pb-3">
                    <dt className="text-label text-ink/40">{label}</dt>
                    <dd className="font-sans text-sm text-ink/80 text-right">{value}</dd>
                  </div>
                ) : null
              )}
            </dl>
          </div>

          {artwork.story && (
            <div data-meta style={{ opacity: 0 }} className="mt-8">
              <p className="font-sans text-ink/70 leading-relaxed text-base">{artwork.story}</p>
            </div>
          )}

          {artwork.instagramUrl && (
            <div data-meta style={{ opacity: 0 }} className="mt-8">
              <a
                href={artwork.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-label text-ink/50 hover:text-ink transition-colors duration-200"
              >
                {t.works.viewInstagram}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Prev/Next — unchanged */}
      <div className="section-gutter py-10 border-t border-canvas-deep flex justify-between gap-4">
        {prev ? (
          <Link
            href={`/works/${prev.slug}`}
            className="group flex items-center gap-3 text-gallery-meta hover:text-ink transition-colors duration-200"
          >
            <span>←</span>
            <span className="group-hover:opacity-100 opacity-60 transition-opacity">{t.works.previous}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/works/${next.slug}`}
            className="group flex items-center gap-3 text-gallery-meta hover:text-ink transition-colors duration-200"
          >
            <span className="group-hover:opacity-100 opacity-60 transition-opacity">{t.works.next}</span>
            <span>→</span>
          </Link>
        )}
      </div>
    </>
  )
}
