'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import RevealHeading from '@/components/ui/RevealHeading'
import { useLanguage } from '@/context/LanguageContext'

interface StudioPreviewProps {
  instagramUrl: string | null
}

const ARCHIVE_IMAGES = [
  { src: '/assets/artist-archive/zlatica-archive-02.webp', alt: 'Zlatica in the studio', w: 700, h: 692 },
  { src: '/assets/artist-archive/zlatica-archive-03-color.webp', alt: 'Zlatica at work', w: 566, h: 700 },
  { src: '/assets/artist-archive/zlatica-archive-04.webp', alt: 'The atelier', w: 700, h: 651 },
  { src: '/assets/artist-archive/zlatica-archive-05.webp', alt: 'Zlatica', w: 700, h: 1052 },
]

export default function StudioPreview({ instagramUrl }: StudioPreviewProps) {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!gridRef.current) return

    const triggers: { kill: () => void }[] = []

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger)

        if (subtitleRef.current) {
          const t = gsap.fromTo(
            subtitleRef.current,
            { opacity: 0, y: 12 },
            {
              opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
              scrollTrigger: { trigger: subtitleRef.current, start: 'top 90%', once: true },
            }
          )
          if (t.scrollTrigger) triggers.push(t.scrollTrigger)
        }

        const images = gridRef.current!.querySelectorAll<HTMLElement>('[data-studio-img]')
        if (images.length > 0) {
          const t2 = gsap.fromTo(
            Array.from(images),
            { opacity: 0, scale: 1.06 },
            {
              opacity: 1,
              scale: 1,
              duration: 1.0,
              ease: 'power2.out',
              stagger: { each: 0.1, from: 'start' },
              scrollTrigger: { trigger: gridRef.current, start: 'top 82%', once: true },
            }
          )
          if (t2.scrollTrigger) triggers.push(t2.scrollTrigger)
        }
      }
    )

    return () => { triggers.forEach((t) => t.kill()) }
  }, [])

  return (
    <section ref={sectionRef} className="section-spacing bg-ink" aria-labelledby="studio-heading">
      <div className="section-gutter">
        <div className="flex items-baseline justify-between mb-10 md:mb-14">
          <div>
            <p
              ref={subtitleRef}
              className="text-canvas/35 text-label mb-3"
              style={{ letterSpacing: '0.22em', opacity: 0 }}
            >
              {t.studio.eyebrow}
            </p>
            <RevealHeading
              as="h2"
              id="studio-heading"
              className="font-serif font-light text-canvas"
              style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)', letterSpacing: '0.05em' }}
            >
              {t.studio.heading}
            </RevealHeading>
          </div>
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-label text-canvas/50 hover:text-canvas transition-colors duration-200 hidden md:block"
            >
              {t.studio.instagram}
            </a>
          )}
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3"
        >
          {ARCHIVE_IMAGES.map((img, i) => (
            <div
              key={img.src + i}
              data-studio-img
              className="relative overflow-hidden group"
              style={{
                aspectRatio: i % 2 === 0 ? '3/4' : '3/5',
                opacity: 0,
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
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent opacity-60"
              />
            </div>
          ))}
        </div>

        {instagramUrl && (
          <div className="mt-8 md:hidden">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-label text-canvas/50 hover:text-canvas transition-colors duration-200"
            >
              {t.studio.instagram}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
