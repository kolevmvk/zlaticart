'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { JournalPost } from '@/lib/content/types'

interface JournalHighlightsProps {
  posts: JournalPost[]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function JournalHighlights({ posts }: JournalHighlightsProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const leadRef = useRef<HTMLAnchorElement>(null)
  const secondaryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!headingRef.current) return

    let cleanup: (() => void) | undefined

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger)

        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 18 },
          {
            opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: headingRef.current, start: 'top 88%', once: true },
          }
        )

        if (leadRef.current) {
          const img = leadRef.current.querySelector('.lead-img')
          const meta = leadRef.current.querySelector('.lead-meta')
          const title = leadRef.current.querySelector('.lead-title')
          const excerpt = leadRef.current.querySelector('.lead-excerpt')
          gsap.fromTo(
            img,
            { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
            {
              opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'power3.inOut',
              scrollTrigger: { trigger: leadRef.current, start: 'top 82%', once: true },
            }
          )
          gsap.fromTo(
            [meta, title, excerpt],
            { opacity: 0, y: 16 },
            {
              opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1,
              scrollTrigger: { trigger: leadRef.current, start: 'top 78%', once: true },
            }
          )
        }

        if (secondaryRef.current) {
          const items = secondaryRef.current.querySelectorAll<HTMLElement>('[data-secondary]')
          gsap.fromTo(
            Array.from(items),
            { opacity: 0, x: 24 },
            {
              opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', stagger: 0.15,
              scrollTrigger: { trigger: secondaryRef.current, start: 'top 80%', once: true },
            }
          )
        }

        cleanup = () => ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    )

    return () => cleanup?.()
  }, [])

  const [lead, ...secondary] = posts

  return (
    <section
      ref={sectionRef}
      className="section-spacing bg-canvas-warm"
      aria-labelledby="journal-heading"
    >
      <div className="section-gutter">
        <div ref={headingRef} className="flex items-baseline justify-between mb-12 md:mb-16" style={{ opacity: 0 }}>
          <h2
            id="journal-heading"
            className="font-serif font-light text-ink"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)', letterSpacing: '0.05em' }}
          >
            Journal
          </h2>
          <Link href="/journal" className="text-label text-ink/50 hover:text-ink transition-colors duration-200 hidden md:block">
            All entries →
          </Link>
        </div>

        <div className="grid md:grid-cols-12 gap-8 md:gap-10 lg:gap-12">
          {/* Lead post */}
          {lead && (
            <Link
              ref={leadRef}
              href={`/journal/${lead.slug}`}
              className="group md:col-span-7 block"
            >
              <div className="lead-img relative overflow-hidden bg-canvas aspect-[4/3] mb-5" style={{ opacity: 0 }}>
                <Image
                  src={lead.coverImage.src}
                  alt={lead.coverImage.alt}
                  fill
                  quality={80}
                  sizes="(max-width: 768px) 100vw, 58vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
              <p className="lead-meta text-label text-ink/40 mb-2" style={{ opacity: 0 }}>
                {lead.category} · {formatDate(lead.publishedAt)}
              </p>
              <h3
                className="lead-title font-serif font-light text-ink mb-3 group-hover:opacity-70 transition-opacity duration-200"
                style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.875rem)', lineHeight: '1.2', letterSpacing: '0.02em', opacity: 0 }}
              >
                {lead.title}
              </h3>
              <p className="lead-excerpt text-gallery-meta leading-relaxed line-clamp-3" style={{ opacity: 0 }}>
                {lead.excerpt}
              </p>
            </Link>
          )}

          {/* Secondary posts */}
          <div ref={secondaryRef} className="md:col-span-5 flex flex-col gap-8 md:gap-10">
            {secondary.slice(0, 2).map((post) => (
              <Link
                key={post.id}
                href={`/journal/${post.slug}`}
                className="group flex gap-5"
                data-secondary
                style={{ opacity: 0 }}
              >
                <div className="relative flex-shrink-0 overflow-hidden bg-canvas w-24 h-28 md:w-28 md:h-32">
                  <Image
                    src={post.coverImage.src}
                    alt={post.coverImage.alt}
                    fill
                    quality={75}
                    sizes="120px"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-label text-ink/40 mb-2">{post.category} · {formatDate(post.publishedAt)}</p>
                  <h3
                    className="font-serif font-light text-ink group-hover:opacity-70 transition-opacity duration-200 mb-2"
                    style={{ fontSize: '1.0625rem', lineHeight: '1.3', letterSpacing: '0.02em' }}
                  >
                    {post.title}
                  </h3>
                  <p className="text-gallery-meta line-clamp-2">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 md:hidden">
          <Link href="/journal" className="text-label text-ink/60 hover:text-ink transition-colors duration-200">
            All entries →
          </Link>
        </div>
      </div>
    </section>
  )
}
