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
    if (!containerRef.current) return
    const chars = containerRef.current.querySelectorAll<HTMLElement>('[data-char]')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      chars.forEach((el) => { el.style.opacity = '1' })
      return
    }

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger)

        const tl = gsap.fromTo(
          Array.from(chars),
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

        return () => { tl.kill() }
      })
    })
  }, [staggerMs])

  const words = children.split(' ')

  return (
    <Tag
      ref={containerRef}
      id={id}
      className={`${className} overflow-hidden-words`}
      style={style}
      aria-label={children}
    >
      {words.map((word, wi) => (
        <span
          key={wi}
          className="inline-block mr-[0.3em] last:mr-0"
          style={{ overflow: 'hidden', verticalAlign: 'bottom' }}
          aria-hidden="true"
        >
          {word.split('').map((char, ci) => (
            <span
              key={ci}
              data-char
              className="inline-block"
              style={{ willChange: 'transform, opacity', opacity: 0 }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  )
}
