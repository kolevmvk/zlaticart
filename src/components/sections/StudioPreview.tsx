'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

interface StudioPreviewProps {
  instagramUrl: string | null
}

const ARCHIVE_IMAGES = [
  { src: '/assets/artist-archive/zlatica-archive-01.webp', alt: 'Zlatica in the studio', w: 800, h: 1000 },
  { src: '/assets/artist-archive/zlatica-archive-03-color.webp', alt: 'Zlatica at work', w: 800, h: 1000 },
  { src: '/assets/artist-archive/zlatica-archive-02.webp', alt: 'Studio moment', w: 800, h: 1000 },
  { src: '/assets/artist-archive/zlatica-archive-04.webp', alt: 'The atelier', w: 800, h: 1000 },
]

export default function StudioPreview({ instagramUrl }: StudioPreviewProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!headingRef.current || !gridRef.current) return

    let cleanup: (() => void) | undefined

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger)

        const images = gridRef.current!.querySelectorAll<HTMLElement>('[data-studio-img]')

        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: headingRef.current, start: 'top 88%', once: true },
          }
        )

        /* Staggered entrance: each image wipes up from bottom */
        gsap.fromTo(
          Array.from(images),
          { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
          {
            clipPath: 'inset(0 0 0% 0)',
            opacity: 1,
            duration: 1.1,
            ease: 'power3.inOut',
            stagger: { each: 0.13, from: 'start' },
            scrollTrigger: { trigger: gridRef.current, start: 'top 82%', once: true },
          }
        )

        cleanup = () => ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    )

    return () => cleanup?.()
  }, [])

  return (
    <section ref={sectionRef} className="section-spacing bg-ink" aria-labelledby="studio-heading">
      <div className="section-gutter">
        {/* Header */}
        <div
          ref={headingRef}
          className="flex items-baseline justify-between mb-10 md:mb-14"
          style={{ opacity: 0 }}
        >
          <div>
            <p
              className="text-canvas/35 text-label mb-3"
              style={{ letterSpacing: '0.22em' }}
            >
              From the Studio
            </p>
            <h2
              id="studio-heading"
              className="font-serif font-light text-canvas"
              style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)',
                letterSpacing: '0.05em',
              }}
            >
              The Atelier
            </h2>
          </div>
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-label text-canvas/50 hover:text-canvas transition-colors duration-200 hidden md:block"
            >
              Follow on Instagram →
            </a>
          )}
        </div>

        {/* Staggered image grid — editorial 4-up layout */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3"
        >
          {ARCHIVE_IMAGES.map((img, i) => (
            <div
              key={img.src}
              data-studio-img
              className="relative overflow-hidden group"
              style={{
                aspectRatio: i === 0 ? '3/4' : i === 1 ? '3/5' : i === 2 ? '3/4' : '3/5',
              }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                quality={80}
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-[1.03]"
              />
              {/* Subtle dark vignette at bottom */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent opacity-60"
              />
            </div>
          ))}
        </div>

        {/* Mobile Instagram link */}
        {instagramUrl && (
          <div className="mt-8 md:hidden">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-label text-canvas/50 hover:text-canvas transition-colors duration-200"
            >
              Follow on Instagram →
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
