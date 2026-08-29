'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import KineticHeading from '@/components/ui/KineticHeading'
import type { Artwork } from '@/lib/content/types'

interface MediaTransitionsProps {
  artworks: Artwork[]
}

// One representative work per medium shown in a horizontal editorial strip
export default function MediaTransitions({ artworks }: MediaTransitionsProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  const mediumOrder = ['oil', 'acrylic', 'watercolor', 'graphics', 'mosaic']

  const byMedium = mediumOrder
    .map((slug) => artworks.find((a) => a.medium.slug === slug))
    .filter((a): a is Artwork => Boolean(a))

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!stripRef.current) return

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger)

        // Each card: parallax on the inner image
        const cards = stripRef.current!.querySelectorAll('[data-media-card]')
        cards.forEach((card) => {
          const inner = card.querySelector('[data-media-inner]')
          if (!inner) return
          gsap.fromTo(
            inner,
            { yPercent: 10 },
            {
              yPercent: -10,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.5,
              },
            }
          )
        })

        // Horizontal slide-in on scroll (subtle, not entrance)
        gsap.fromTo(
          stripRef.current,
          { opacity: 0, x: 40 },
          {
            opacity: 1,
            x: 0,
            duration: 1.0,
            ease: 'power3.out',
            scrollTrigger: { trigger: stripRef.current, start: 'top 85%', once: true },
          }
        )
      }
    )
  }, [])

  if (byMedium.length === 0) return null

  return (
    <section
      ref={sectionRef}
      className="bg-ink section-spacing overflow-hidden"
      aria-labelledby="media-heading"
    >
      <div className="section-gutter mb-10 md:mb-14">
        <p className="text-label text-canvas/30 text-xs tracking-widest uppercase mb-3">
          Practice
        </p>
        <KineticHeading
          as="h2"
          id="media-heading"
          className="font-serif font-light text-canvas"
          style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)', letterSpacing: '0.05em' }}
        >
          Across Media
        </KineticHeading>
      </div>

      {/* Horizontal scroll strip */}
      <div
        ref={stripRef}
        className="flex gap-px overflow-x-auto md:overflow-visible pb-0"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        role="list"
        aria-label="Artwork media"
      >
        {byMedium.map((artwork) => (
          <Link
            key={artwork.id}
            href={`/works/${artwork.slug}`}
            className="relative flex-none group focus-visible:outline-none overflow-hidden"
            style={{
              width: 'clamp(200px, 28vw, 360px)',
              scrollSnapAlign: 'start',
            }}
            role="listitem"
            aria-label={`${artwork.medium.title} — view work`}
            data-media-card
          >
            <div className="relative w-full overflow-hidden bg-canvas-deep" style={{ aspectRatio: '3/4' }}>
              <div
                data-media-inner
                className="absolute inset-0"
                style={{ top: '-10%', bottom: '-10%' }}
              >
                <Image
                  src={artwork.primaryImage.src}
                  alt={artwork.primaryImage.alt}
                  fill
                  sizes="(max-width: 768px) 60vw, 28vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  style={{
                    objectPosition: artwork.primaryImage.desktopFocalPoint
                      ? `${artwork.primaryImage.desktopFocalPoint.x * 100}% ${artwork.primaryImage.desktopFocalPoint.y * 100}%`
                      : 'center',
                  }}
                />
              </div>

              {/* Medium label overlay — slides up on hover */}
              <div
                className="
                  absolute inset-x-0 bottom-0 px-4 py-4
                  translate-y-full group-hover:translate-y-0
                  transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                "
                style={{
                  background: 'linear-gradient(to top, rgba(10,10,9,0.6) 0%, transparent 100%)',
                }}
                aria-hidden="true"
              >
                <p className="text-canvas font-sans text-xs tracking-widest uppercase">
                  {artwork.medium.title}
                </p>
              </div>
            </div>
          </Link>
        ))}

        {/* Trailing spacer on mobile */}
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
