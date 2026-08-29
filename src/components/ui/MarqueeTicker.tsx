'use client'

import { useEffect, useRef } from 'react'

interface MarqueeTickerProps {
  items?: string[]
  speed?: number /** seconds for one full cycle */
  className?: string
}

const DEFAULT_ITEMS = [
  'Oil on Canvas',
  'Watercolor',
  'Acrylic',
  'Mosaic',
  'Graphics',
  'Abstract',
  'Educator',
  'Painter',
]

export default function MarqueeTicker({
  items = DEFAULT_ITEMS,
  speed = 38,
  className = '',
}: MarqueeTickerProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  /* Pause on reduced motion */
  useEffect(() => {
    if (!trackRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      trackRef.current.style.animationPlayState = 'paused'
    }
  }, [])

  /* Duplicate items so the loop is seamless */
  const repeated = [...items, ...items, ...items]

  return (
    <div
      className={`overflow-hidden border-y border-ink/8 py-4 md:py-5 select-none ${className}`}
      aria-hidden="true"
    >
      <div
        ref={trackRef}
        className="flex whitespace-nowrap"
        style={{
          animation: `marquee-scroll ${speed}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-5 md:gap-7 px-4 md:px-6"
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 'clamp(0.8125rem, 1.5vw, 1.0625rem)',
                letterSpacing: '0.06em',
                color: 'var(--color-ink)',
                opacity: 0.55,
              }}
            >
              {item}
            </span>
            <span
              style={{
                display: 'inline-block',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'var(--color-ink)',
                opacity: 0.2,
                flexShrink: 0,
              }}
            />
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  )
}
