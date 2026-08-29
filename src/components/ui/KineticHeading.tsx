'use client'

import { useEffect, useRef } from 'react'

interface KineticHeadingProps {
  children: string
  as?: 'h1' | 'h2' | 'h3'
  id?: string
  className?: string
  style?: React.CSSProperties
  staggerMs?: number
}

/**
 * Section heading that reveals each character from its own clip-path.
 * Falls back to static visibility for reduced-motion.
 */
export default function KineticHeading({
  children,
  as: Tag = 'h2',
  id,
  className = '',
  style,
  staggerMs = 30,
}: KineticHeadingProps) {
  const containerRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!containerRef.current) return

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger)

        const chars = containerRef.current!.querySelectorAll('[data-char]')
        if (!chars.length) return

        gsap.fromTo(
          chars,
          { y: '110%', opacity: 0 },
          {
            y: '0%',
            opacity: 1,
            duration: 0.7,
            ease: 'power4.out',
            stagger: staggerMs / 1000,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 88%',
              once: true,
            },
          }
        )
      })
    })
  }, [staggerMs])

  const words = children.split(' ')

  return (
    <Tag ref={containerRef} id={id} className={`${className} overflow-hidden-words`} style={style}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block mr-[0.3em] last:mr-0" style={{ overflow: 'hidden', verticalAlign: 'bottom' }}>
          {word.split('').map((char, ci) => (
            <span
              key={ci}
              data-char
              className="inline-block"
              style={{ willChange: 'transform, opacity' }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  )
}
