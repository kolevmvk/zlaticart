'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import RevealHeading from '@/components/ui/RevealHeading'
import { useLanguage } from '@/context/LanguageContext'
import type { Artwork } from '@/lib/content/types'

interface MediaTransitionsProps {
  artworks: Artwork[]
}

// One representative work per medium, shown as a native horizontal
// scroll+snap strip at every breakpoint. On desktop, a wheel listener (see
// the plain-scroll effect below) redirects vertical mouse-wheel input into
// horizontal movement while the pointer is over the gallery — so turning
// the wheel pans the gallery left/right, the way a carousel is expected to
// behave, without hijacking/pinning the whole page the way an earlier
// ScrollTrigger-pin version did (that trapped the user in a long forced
// scroll just to get through five cards).
export default function MediaTransitions({ artworks }: MediaTransitionsProps) {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const railFillRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const mediumOrder = ['oil', 'acrylic', 'watercolor', 'graphics', 'mosaic']

  const byMedium = mediumOrder
    .map((slug) => artworks.find((a) => a.medium.slug === slug))
    .filter((a): a is Artwork => Boolean(a))

  // GSAP: parallax on each card's inner image + a quiet entrance for the
  // strip as a whole. Neither depends on breakpoint any more — both simply
  // react to the section's normal position in the page.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const strip = stripRef.current
    const section = sectionRef.current
    if (!strip || !section) return

    let ctx: gsap.Context | undefined

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger)

        ctx = gsap.context(() => {
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
        }, section)
      }
    )

    return () => ctx?.revert()
  }, [])

  // Plain DOM scroll/wheel handling — the strip is a normal native
  // horizontal scroll container (overflow-x-auto + scroll-snap) at every
  // breakpoint, so touch/trackpad horizontal swipes and keyboard arrow
  // scrolling already work for free. This effect adds two things on top:
  // the progress rail (driven off real scrollLeft, not a GSAP timeline),
  // and the desktop wheel→horizontal redirect described above.
  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return

    const updateProgress = () => {
      const max = strip.scrollWidth - strip.clientWidth
      const progress = max > 0 ? strip.scrollLeft / max : 0
      if (railFillRef.current) {
        railFillRef.current.style.transform = `scaleX(${progress})`
      }
      const idx = Math.round(progress * (byMedium.length - 1))
      setActiveIndex((prev) => (prev === idx ? prev : idx))
    }
    updateProgress()
    strip.addEventListener('scroll', updateProgress, { passive: true })

    // Desktop-only (coarse pointers already get native touch scrolling,
    // which a wheel handler would only interfere with). Redirects vertical
    // wheel input into horizontal movement while hovering the strip, but
    // only while the strip actually has room left to move in that
    // direction — once it's scrolled fully to either end, the event is
    // left alone so normal page scroll continues seamlessly. That boundary
    // check is what makes this feel practical rather than like a trap.
    //
    // Advances one full card per "notch" via scrollBy(), not a 1:1 pixel
    // drag via `strip.scrollLeft +=`. That's a deliberate response to how
    // `scroll-snap-type: x mandatory` actually behaves in Chromium: a
    // direct `scrollLeft` assignment gets silently re-snapped back to the
    // nearest snap point (effectively 0) the instant it's set, because it
    // isn't part of a scroll gesture the browser's own pipeline recognises
    // — only scrollBy()/scrollTo() correctly resolve against snap points.
    // A small isAnimatingRef cooldown stops a single fast wheel gesture
    // from queuing several overlapping smooth-scrolls at once.
    let isAnimating = false
    const onWheel = (e: WheelEvent) => {
      if (window.matchMedia('(pointer: coarse)').matches) return
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      if (Math.abs(delta) < 2) return
      const max = strip.scrollWidth - strip.clientWidth
      const atStart = strip.scrollLeft <= 0
      const atEnd = strip.scrollLeft >= max - 1
      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return
      e.preventDefault()
      if (isAnimating) return
      isAnimating = true
      const cardEl = strip.querySelector('[data-media-card]')
      const step = (cardEl?.getBoundingClientRect().width ?? 360) + 1 // +1 for the gap-px between cards
      strip.scrollBy({ left: delta > 0 ? step : -step, behavior: 'smooth' })
      window.setTimeout(() => { isAnimating = false }, 500)
    }
    strip.addEventListener('wheel', onWheel, { passive: false })

    // Click-and-drag panning (desktop only — touch already drags natively
    // via the browser's own scroll). Without this, mousedown+move on an
    // <Image> inside a <Link> triggers the browser's native "drag the
    // image out" ghost-image behaviour instead of panning the gallery,
    // which is exactly the "grabs the image" problem being fixed here
    // (draggable={false} on the images, below, is the other half of that).
    //
    // Same scroll-snap complication as the wheel handler: a live drag
    // needs continuous free scrollLeft updates, but `scroll-snap-type: x
    // mandatory` re-snaps any JS-driven scrollLeft assignment straight
    // back to the nearest snap point. So snapping is switched off for the
    // duration of the drag and explicitly restored (scrollTo the nearest
    // card) on release, instead of just toggling the CSS property back.
    //
    // Deliberately NOT using setPointerCapture: capturing the pointer on
    // `strip` changes which element the browser considers the click
    // target on release, which broke plain (non-drag) clicks on the
    // artwork <Link>s entirely during testing. Instead, move/up listeners
    // are attached to `window` only while a drag is active — the standard
    // pattern for drag-to-scroll — so the strip's own children keep
    // perfectly normal click behaviour when the pointer never moves.
    if (!window.matchMedia('(pointer: coarse)').matches) {
      let isDown = false
      let dragged = false
      let startX = 0
      let startScrollLeft = 0

      const stepWidth = () => (strip.querySelector('[data-media-card]')?.getBoundingClientRect().width ?? 360) + 1

      const onWindowPointerMove = (e: PointerEvent) => {
        if (!isDown) return
        const dx = e.clientX - startX
        if (Math.abs(dx) > 4) dragged = true
        strip.scrollLeft = startScrollLeft - dx
      }

      const suppressNextClick = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        window.removeEventListener('click', suppressNextClick, true)
      }

      const onWindowPointerUp = () => {
        if (!isDown) return
        isDown = false
        strip.style.cursor = 'grab'
        strip.style.scrollSnapType = 'x mandatory'
        window.removeEventListener('pointermove', onWindowPointerMove)
        window.removeEventListener('pointerup', onWindowPointerUp)
        if (dragged) {
          // A real drag happened — swallow the click that would otherwise
          // fire on release and navigate the Link underneath the cursor.
          window.addEventListener('click', suppressNextClick, true)
          const step = stepWidth()
          const max = strip.scrollWidth - strip.clientWidth
          const nearest = Math.max(0, Math.min(Math.round(strip.scrollLeft / step) * step, max))
          strip.scrollTo({ left: nearest, behavior: 'smooth' })
        }
      }

      const onPointerDown = (e: PointerEvent) => {
        if (e.button !== 0) return
        isDown = true
        dragged = false
        startX = e.clientX
        startScrollLeft = strip.scrollLeft
        strip.style.scrollSnapType = 'none'
        strip.style.cursor = 'grabbing'
        window.addEventListener('pointermove', onWindowPointerMove)
        window.addEventListener('pointerup', onWindowPointerUp)
      }

      strip.style.cursor = 'grab'
      strip.addEventListener('pointerdown', onPointerDown)

      return () => {
        strip.removeEventListener('scroll', updateProgress)
        strip.removeEventListener('wheel', onWheel)
        strip.removeEventListener('pointerdown', onPointerDown)
        window.removeEventListener('pointermove', onWindowPointerMove)
        window.removeEventListener('pointerup', onWindowPointerUp)
        strip.style.cursor = ''
      }
    }

    return () => {
      strip.removeEventListener('scroll', updateProgress)
      strip.removeEventListener('wheel', onWheel)
    }
  }, [byMedium.length])

  // Keyboard focus on a card scrolls it into view within the strip — plain
  // native scrollIntoView now that the strip is a normal scroll container
  // at every breakpoint, not a GSAP-transformed one on desktop.
  const handleCardFocus = (index: number) => {
    const strip = stripRef.current
    if (!strip) return
    const card = strip.querySelectorAll('[data-media-card]')[index]
    card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
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

          {/* Progress rail / index — desktop-only affordance (hidden below
              md purely via CSS) signalling the strip is an interactive
              horizontal gallery, not a static row. */}
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
        </div>
      </div>

      {/* Horizontal strip — a genuine native scroll+snap container at every
          breakpoint (see the wheel-redirect effect above for how desktop's
          mouse wheel drives it left/right); overflow-hidden on the section
          itself prevents any accidental page-level horizontal overflow. */}
      <div
        ref={stripRef}
        // data-lenis-prevent: Lenis (SmoothScroll.tsx) intercepts wheel
        // events globally to drive its own virtual page scroll, and does so
        // independently of event.preventDefault() — a child's
        // preventDefault doesn't stop Lenis, because Lenis isn't relying on
        // native scroll being allowed in the first place. This attribute is
        // Lenis's own documented escape hatch: it tells Lenis to ignore
        // wheel events whose target is inside this element entirely, which
        // is what lets our own wheel handler below (and native scroll
        // generally) actually control this element instead of the page.
        data-lenis-prevent
        className="no-scrollbar select-none flex gap-px overflow-x-auto pb-0"
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
                  draggable={false}
                  sizes="(max-width: 768px) 60vw, 28vw"
                  className="object-cover"
                  style={{
                    objectPosition: artwork.primaryImage.desktopFocalPoint
                      ? `${artwork.primaryImage.desktopFocalPoint.x * 100}% ${artwork.primaryImage.desktopFocalPoint.y * 100}%`
                      : 'center',
                    WebkitUserDrag: 'none',
                  } as React.CSSProperties}
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
