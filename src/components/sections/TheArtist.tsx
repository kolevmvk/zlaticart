'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import KineticHeading from '@/components/ui/KineticHeading'
import type { ArtistProfile } from '@/lib/content/types'

interface TheArtistProps {
  profile: ArtistProfile
}

export default function TheArtist({ profile }: TheArtistProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const portraitRef = useRef<HTMLDivElement>(null)
  const portraitInnerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Ensure visible in reduced motion
      if (portraitRef.current) portraitRef.current.style.opacity = '1'
      if (textRef.current) {
        textRef.current.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
          el.style.opacity = '1'
        })
      }
      return
    }

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger)

        // Portrait: subtle scale reveal (no clip-path wipe)
        if (portraitRef.current) {
          gsap.fromTo(
            portraitRef.current,
            { opacity: 0, scale: 1.04 },
            {
              opacity: 1,
              scale: 1,
              duration: 1.4,
              ease: 'power2.out',
              scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
            }
          )
        }

        // Parallax on portrait image
        if (portraitRef.current && portraitInnerRef.current) {
          gsap.fromTo(
            portraitInnerRef.current,
            { yPercent: 8 },
            {
              yPercent: -8,
              ease: 'none',
              scrollTrigger: {
                trigger: portraitRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 2,
              },
            }
          )
        }

        // Text elements: staggered slide in from left with opacity
        if (textRef.current) {
          const textEls = textRef.current.querySelectorAll<HTMLElement>('[data-reveal]')
          gsap.fromTo(
            Array.from(textEls),
            { opacity: 0, x: -24 },
            {
              opacity: 1,
              x: 0,
              duration: 0.9,
              ease: 'power3.out',
              stagger: { each: 0.1 },
              scrollTrigger: { trigger: textRef.current, start: 'top 80%', once: true },
            }
          )
        }
      }
    )
  }, [])

  return (
    <section ref={sectionRef} className="section-spacing bg-ink" aria-labelledby="artist-heading">
      <div className="section-gutter">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
          {/* Portrait */}
          <div className="md:col-span-5 lg:col-span-4">
            <div
              ref={portraitRef}
              className="relative overflow-hidden aspect-[3/4] max-w-sm mx-auto md:mx-0"
              style={{ opacity: 0 }}
            >
              <div
                ref={portraitInnerRef}
                className="absolute inset-0"
                style={{ top: '-8%', bottom: '-8%' }}
              >
                <Image
                  src={profile.portrait.src}
                  alt={profile.portrait.alt}
                  fill
                  quality={85}
                  sizes="(max-width: 768px) 80vw, 35vw"
                  className="object-cover grayscale"
                />
              </div>
            </div>
          </div>

          {/* Text */}
          <div
            ref={textRef}
            className="md:col-span-7 lg:col-span-8 flex flex-col justify-center md:py-8 lg:py-16"
          >
            <p
              data-reveal
              className="text-canvas/40 text-label mb-6 md:mb-8"
              style={{ letterSpacing: '0.20em', opacity: 0 }}
            >
              The Artist
            </p>

            {/* Kinetic name reveal */}
            <div data-reveal style={{ opacity: 0, marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}>
              <KineticHeading
                as="h2"
                id="artist-heading"
                className="font-serif text-canvas font-light"
                style={{
                  fontSize: 'clamp(2rem, 5vw, 4rem)',
                  letterSpacing: '0.06em',
                  lineHeight: '1.1',
                }}
                staggerMs={40}
              >
                {profile.name}
              </KineticHeading>
            </div>

            <p
              data-reveal
              className="font-serif text-canvas/60 font-light italic mb-8 md:mb-10"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', lineHeight: '1.6', opacity: 0 }}
            >
              {profile.roleLine}
            </p>
            <p
              data-reveal
              className="text-canvas/70 font-light leading-relaxed mb-8 md:mb-10 max-w-md"
              style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', opacity: 0 }}
            >
              {profile.shortBio}
            </p>
            <Link
              data-reveal
              href="/about"
              className="text-label text-canvas/50 hover:text-canvas transition-colors duration-200"
              style={{ opacity: 0 }}
            >
              Read more →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
