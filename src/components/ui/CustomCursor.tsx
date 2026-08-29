'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    // Signal to CSS that custom cursor is mounted — hides native cursor
    document.body.setAttribute('data-cursor', 'true')

    dot.style.opacity = '1'
    ring.style.opacity = '1'

    const xDot = gsap.quickTo(dot, 'x', { duration: 0.04, ease: 'none' })
    const yDot = gsap.quickTo(dot, 'y', { duration: 0.04, ease: 'none' })
    const xRing = gsap.quickTo(ring, 'x', { duration: 0.15, ease: 'power2.out' })
    const yRing = gsap.quickTo(ring, 'y', { duration: 0.15, ease: 'power2.out' })

    const onMove = (e: MouseEvent) => {
      xDot(e.clientX)
      yDot(e.clientY)
      xRing(e.clientX)
      yRing(e.clientY)
    }

    const onEnterLink = () => {
      gsap.to(ring, { scale: 2.2, opacity: 0.35, duration: 0.25, ease: 'power2.out' })
      gsap.to(dot, { scale: 0, duration: 0.2, ease: 'power2.out' })
    }
    const onLeaveLink = () => {
      gsap.to(ring, { scale: 1, opacity: 0.6, duration: 0.3, ease: 'power2.out' })
      gsap.to(dot, { scale: 1, duration: 0.2, ease: 'power2.out' })
    }

    window.addEventListener('mousemove', onMove)

    // Observe future interactive elements
    const observer = new MutationObserver(() => {
      document.querySelectorAll('a, button, [data-cursor-hover]').forEach((el) => {
        el.removeEventListener('mouseenter', onEnterLink)
        el.removeEventListener('mouseleave', onLeaveLink)
        el.addEventListener('mouseenter', onEnterLink)
        el.addEventListener('mouseleave', onLeaveLink)
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })

    // Bind existing elements
    document.querySelectorAll('a, button, [data-cursor-hover]').forEach((el) => {
      el.addEventListener('mouseenter', onEnterLink)
      el.addEventListener('mouseleave', onLeaveLink)
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
      observer.disconnect()
      document.body.removeAttribute('data-cursor')
    }
  }, [])

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: '#0A0A09',
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: 0,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'exclusion',
          willChange: 'transform',
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1px solid rgba(10,10,9,0.45)',
          pointerEvents: 'none',
          zIndex: 99998,
          opacity: 0,
          transform: 'translate(-50%, -50%)',
          willChange: 'transform',
        }}
      />
    </>
  )
}
