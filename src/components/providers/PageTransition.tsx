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
      gsap.set(el, { opacity: 1, y: 0, clearProps: 'willChange' })
      return
    }

    tweenRef.current = gsap.fromTo(
      el,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
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
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
