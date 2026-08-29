'use client'

import { useEffect, useRef } from 'react'

interface RevealHeadingProps {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3'
  id?: string
  className?: string
  style?: React.CSSProperties
}

// Simple fade+lift reveal for secondary section headings.
// KineticHeading (per-char) is reserved for the homepage hero section only.
export default function RevealHeading({
  children,
  as: Tag = 'h2',
  id,
  className = '',
  style,
}: RevealHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!ref.current) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ref.current.style.opacity = '1'
      ref.current.style.transform = 'none'
      return
    }

    let killed = false
    let killFn: (() => void) | null = null

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (killed || !ref.current) return
        gsap.registerPlugin(ScrollTrigger)

        const tl = gsap.fromTo(
          ref.current,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 88%',
              once: true,
            },
          }
        )
        killFn = () => tl.kill()
      }
    )

    return () => {
      killed = true
      killFn?.()
    }
  }, [])

  return (
    <Tag
      ref={ref}
      id={id}
      className={className}
      style={{ ...style, opacity: 0 }}
    >
      {children}
    </Tag>
  )
}
