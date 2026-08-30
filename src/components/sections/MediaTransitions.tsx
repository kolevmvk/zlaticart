'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ScrollTrigger } from 'gsap/ScrollTrigger'
import RevealHeading from '@/components/ui/RevealHeading'
import { useLanguage } from '@/context/LanguageContext'
import type { Artwork } from '@/lib/content/types'

interface MediaTransitionsProps {
  artworks: Artwork[]
}

// One representative work per medium. Desktop pins the section and maps
// vertical scroll to horizontal card movement — a real left-right gallery,
// not a static strip. Mobile keeps native horizontal scroll with snap.
export default function MediaTransitions({ artworks }: MediaTransitionsProps) {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const railFillRef = useRef<HTMLDivElement>(null)
  const desktopTriggerRef = useRef<ScrollTrigger | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDesktopActive, setIsDesktopActive] = useState(false)

  const mediumOrder = ['oil', 'acrylic', 'watercolor', 'graphics', 'mosaic']

  const byMedium = mediumOrder
    .map((slug) => artworks.find((a) => a.medium.slug === slug))
    .filter((a): a is Artwork => Boolean(a))

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!stripRef.current || !sectionRef.current) return

    let mm: gsap.MatchMedia | undefined

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger)
        const strip = stripRef.current
        const section = sectionRef.current
        if (!strip || !section) return

        // Parallax on the inner image — runs at every breakpoint.
        const cards = strip.querySelectorAll('[data-media-card]')
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

        mm = gsap.matchMedia()

        // Desktop / tablet-landscape: pin the section and translate the
        // strip horizontally in lockstep with vertical scroll.
        mm.add('(min-width: 768px)', () => {
          setIsDesktopActive(true)
          const distance = () => Math.max(0, strip.scrollWidth - section.clientWidth)

          const trigger = ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.6,
            anticipatePin: 1,
            onUpdate: (self) => {
              gsap.set(strip, { x: -distance() * self.progress })
              if (railFillRef.current) {
                railFillRef.current.style.transform = `scaleX(${self.progress})`
              }
              const idx = Math.round(self.progress * (byMedium.length - 1))
              setActiveIndex((prev) => (prev === idx ? prev : idx))
            },
          })
          desktopTriggerRef.current = trigger

          return () => {
            trigger.kill()
            desktopTriggerRef.current = null
            gsap.set(strip, { x: 0 })
            setIsDesktopActive(false)
          }
        })

        // Mobile: quiet entrance only, native horizontal scroll handles the rest.
        mm.add('(max-width: 767px)', () => {
          gsap.fromTo(
            strip,
            { opacity: 0, x: 40 },
            {
              opacity: 1,
              x: 0,
              duration: 1.0,
              ease: 'power3.out',
              scrollTrigger: { trigger: strip, start: 'top 85%', once: true },
            }
          )
          return () => {}
        })
      }
    )

    return () => {
      mm?.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byMedium.length])

  // Keyboard focus on a card jumps the pinned scroll position so the card
  // is brought fully into view — otherwise a tabbing keyboard user could
  // focus a card that is transformed off screen.
  const handleCardFocus = (index: number) => {
    const trigger = desktopTriggerRef.current
    if (!trigger) return
    const total = byMedium.length - 1 || 1
    const progress = index / total
    const target = trigger.start + (trigger.end - trigger.start) * progress
    window.scrollTo({ top: target, behavior: 'smooth' })
  }

  if (byMedium.length === 0) return null

  return (
    <section
      ref={sectionRef}
      className="bg-ink section-spacing overflow-hidden"
      aria-labelledby="media-heading"
    >
      <div className="section-gutter mb-8 md:mb-10">
        <p className="text-label text-canvas/30 text-xs tracking-widest uppercase mb-3">
          {t.media.eyebrow}
        </p>
        <div className="flex items-baseline justify-between gap-6">
          <RevealHeading
            as="h2"
            id="media-heading"
            className="font-serif font-light text-canvas"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)', letterSpacing: '0.05em' }}
          >
            {t.media.heading}
          </RevealHeading>

          {/* Progress rail / index — desktop-only affordance signalling the
              strip below is an interactive horizontal gallery, not a static row. */}
          {isDesktopActive && (
            <div className="hidden md:flex items-center gap-4 shrink-0" aria-hidden="true">
              <span className="text-label text-canvas/40 text-[0.65rem] tabular-nums whitespace-nowrap">
                {String(activeIndex + 1).padStart(2, '0')} / {String(byMedium.length).padStart(2, '0')}
              </span>
              <div className="relative w-24 lg:w-32 h-px bg-canvas/15 overflow-hidden">
                <div
                  ref={railFillRef}
                  className="absolute inset-y-0 left-0 w-full bg-canvas/70 origin-left"
                  style={{ transform: 'scaleX(0)' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal strip — native scroll+snap on mobile, GSAP-transform
          driven on desktop (see the ScrollTrigger above); overflow-hidden
          on the section itself prevents any accidental page-level
          horizontal overflow either way. */}
      <div
        ref={stripRef}
        className="flex gap-px overflow-x-auto md:overflow-visible pb-0"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        role="list"
        aria-label="Artwork media"
      >
        {byMedium.map((artwork, i) => (
          <Link
            key={artwork.id}
            href={`/works/${artwork.slug}`}
            className="relative flex-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canvas/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink overflow-hidden"
            style={{
              width: 'clamp(200px, 28vw, 360px)',
              scrollSnapAlign: 'start',
            }}
            role="listitem"
            aria-label={`${artwork.medium.title} — view work`}
            data-media-card
            onFocus={() => handleCardFocus(i)}
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
                  className="object-cover"
                  style={{
                    objectPosition: artwork.primaryImage.desktopFocalPoint
                      ? `${artwork.primaryImage.desktopFocalPoint.x * 100}% ${artwork.primaryImage.desktopFocalPoint.y * 100}%`
                      : 'center',
                  }}
                />
              </div>

              {/* Medium label — always visible on touch (no hover-only
                  dependency), slides up on hover for pointer devices. */}
              <div
                className="
                  absolute inset-x-0 bottom-0 px-4 py-4
                  translate-y-full group-hover:translate-y-0 group-focus-visible:translate-y-0
                  [@media(hover:none)]:translate-y-0
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
          className="text-label text-canvas/40 hover:text-canvas transition-colors duration-200 inline-flex items-center min-h-[44px]"
        >
          {t.media.viewAll}
        </Link>
      </div>
    </section>
  )
}
