'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { href: '/works', label: 'Works' },
  { href: '/journal', label: 'Journal' },
  { href: '/about', label: 'About' },
  { href: '/studio', label: 'Studio' },
  { href: '/contact', label: 'Contact' },
]

interface NavigationProps {
  theme?: 'light' | 'dark'
}

export default function Navigation({ theme = 'dark' }: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Entrance: fade + slide down on mount
  useEffect(() => {
    if (!headerRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = headerRef.current
    el.style.opacity = '0'
    el.style.transform = 'translateY(-12px)'
    const t = setTimeout(() => {
      el.style.transition = 'opacity 0.8s ease, transform 0.8s ease'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    }, 600) // after hero starts
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const isDark = theme === 'dark' && !scrolled
  const textColor = isDark ? 'text-canvas' : 'text-ink'
  const bgColor = scrolled ? 'bg-canvas/95 backdrop-blur-sm' : 'bg-transparent'

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${bgColor}`}
        role="banner"
      >
        <div className="section-gutter flex items-center justify-between py-5 md:py-6">
          <Link
            href="/"
            className={`font-serif italic font-light text-sm tracking-wide ${textColor} hover:opacity-60 transition-opacity duration-200`}
            aria-label="ZlaticArt — home"
          >
            ZlaticArt
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-8 lg:gap-10"
            aria-label="Primary navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={`nav-link ${textColor}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            ref={buttonRef}
            className={`md:hidden flex flex-col gap-[5px] p-2 -mr-2 ${textColor}`}
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span className="block w-5 h-px bg-current" />
            <span className="block w-5 h-px bg-current" />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className={`fixed inset-0 z-[60] flex flex-col bg-ink transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="section-gutter flex items-center justify-between py-5">
          <Link
            href="/"
            className="text-label text-xs tracking-brand font-light text-canvas"
            onClick={() => setMenuOpen(false)}
          >
            ZlaticArt
          </Link>
          <button
            className="text-canvas p-2 -mr-2"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <span className="block w-5 h-px bg-current rotate-45 translate-y-px" />
            <span className="block w-5 h-px bg-current -rotate-45 -translate-y-px" />
          </button>
        </div>

        <nav
          className="flex flex-col justify-center flex-1 section-gutter gap-6 pb-24"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-serif text-canvas text-4xl font-light tracking-wide hover:opacity-60 transition-opacity duration-200"
              style={{ transitionDelay: menuOpen ? `${i * 40}ms` : '0ms' }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="section-gutter pb-8">
          <p className="text-gallery-meta text-canvas/40">
            Painter · Educator · Artist
          </p>
        </div>
      </div>
    </>
  )
}
