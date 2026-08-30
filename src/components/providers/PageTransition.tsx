'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Kill any in-flight tween from the previous route
    tweenRef.current?.kill()

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      // Snap straight to visible — no animation
      gsap.set(el, { opacity: 1, clearProps: 'willChange' })
      return
    }

    // Opacity-only: a `y`/transform tween here would give this wrapper a CSS
    // transform, which turns it into a new containing block for any
    // `position: fixed` descendant (header, mobile menu overlay) — they'd
    // stop tracking the viewport and instead position relative to this
    // (page-tall) wrapper. Keep this fade-only to avoid breaking fixed nav.
    tweenRef.current = gsap.fromTo(
      el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.45,
        ease: 'power2.out',
        delay: 0.05,
        clearProps: 'willChange',
        onComplete: () => {
          tweenRef.current = null
        },
      }
    )

    return () => {
      tweenRef.current?.kill()
      tweenRef.current = null
    }
  }, [pathname])

  return (
    <div
      ref={ref}
      style={{
        minHeight: '100vh',
        opacity: 0,
        willChange: 'opacity',
      }}
    >
      {children}
    </div>
  )
}
