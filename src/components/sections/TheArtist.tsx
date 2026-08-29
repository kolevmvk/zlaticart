'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ArtistProfile } from '@/lib/content/types'

interface TheArtistProps {
  profile: ArtistProfile
}

export default function TheArtist({ profile }: TheArtistProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const portraitRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!portraitRef.current || !textRef.current) return

    let cleanup: (() => void) | undefined

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger)

        const trigger = sectionRef.current

        gsap.fromTo(
          portraitRef.current,
          { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
          {
            opacity: 1,
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.3,
            ease: 'power3.inOut',
            scrollTrigger: { trigger, start: 'top 78%', once: true },
          }
        )

        const textEls = textRef.current!.querySelectorAll<HTMLElement>('[data-reveal]')
        gsap.fromTo(
          Array.from(textEls),
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: 'power3.out',
            stagger: { each: 0.12 },
            scrollTrigger: { trigger: textRef.current, start: 'top 82%', once: true },
          }
        )

        cleanup = () => ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    )

    return () => cleanup?.()
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
            <h2
              data-reveal
              id="artist-heading"
              className="font-serif text-canvas font-light mb-6 md:mb-8"
              style={{
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                letterSpacing: '0.06em',
                lineHeight: '1.1',
                opacity: 0,
              }}
            >
              {profile.name}
            </h2>
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
