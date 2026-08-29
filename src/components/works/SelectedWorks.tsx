'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import ArtworkCard from './ArtworkCard'
import KineticHeading from '@/components/ui/KineticHeading'
import { useLanguage } from '@/context/LanguageContext'
import type { Artwork } from '@/lib/content/types'

interface SelectedWorksProps {
  artworks: Artwork[]
}

export default function SelectedWorks({ artworks }: SelectedWorksProps) {
  const { t } = useLanguage()
  const [hero, ...rest] = artworks.slice(0, 6)
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  // Holds the GSAP context so it can be reverted on unmount
  const ctxRef = useRef<{ revert: () => void } | null>(null)

  // Eyebrow label entrance — opacity 0→1 as section scrolls into view.
  // Reduced-motion: show immediately without animation.
  useEffect(() => {
    const el = eyebrowRef.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.opacity = '1'
      return
    }

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger)
        if (!eyebrowRef.current) return
        gsap.fromTo(
          eyebrowRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: eyebrowRef.current,
              start: 'top 88%',
              once: true,
            },
          }
        )
      }
    )
  }, [])

  // Gallery-rise parallax — the section lifts from 60 px below its natural
  // position as it enters the viewport, giving the impression of a gallery
  // wall rising to present the paintings. Scrubbed so it responds linearly
  // to scroll speed; animation completes before the section top reaches
  // 60 % of the screen, leaving the rest of scroll for content discovery.
  // Skipped entirely when the user has requested reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled || !sectionRef.current) return
        gsap.registerPlugin(ScrollTrigger)

        ctxRef.current = gsap.context(() => {
          gsap.fromTo(
            sectionRef.current!,
            { y: 60 },
            {
              y: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current!,
                start: 'top bottom',
                end: 'top 60%',
                scrub: 1,
              },
            }
          )
        })
      }
    )

    return () => {
      cancelled = true
      ctxRef.current?.revert()
      ctxRef.current = null
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="section-spacing bg-canvas"
      aria-labelledby="selected-works-heading"
    >
      <div className="section-gutter">
        {/* Eyebrow — contextual bridge from the hero into the works grid.
            Appears above the main heading as a quiet editorial label. */}
        <p
          ref={eyebrowRef}
          aria-hidden="true"
          style={{
            opacity: 0,
            fontFamily: 'var(--font-sans)',
            fontWeight: 300,
            fontSize: '0.6875rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'color-mix(in srgb, var(--color-ink, #1a1a18) 35%, transparent)',
            marginBottom: '0.875rem',
          }}
        >
          {t.works.eyebrow}
        </p>

        {/* Section header */}
        <div className="flex items-baseline justify-between mb-12 md:mb-16">
          <KineticHeading
            as="h2"
            id="selected-works-heading"
            className="font-serif font-light text-ink"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)', letterSpacing: '0.05em' }}
          >
            {t.works.heading}
          </KineticHeading>
          <Link
            href="/works"
            className="text-label text-ink/50 hover:text-ink transition-colors duration-200 hidden md:block"
          >
            {t.works.viewAll}
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
            {t.works.viewAll}
          </Link>
        </div>
      </div>
    </section>
  )
}
