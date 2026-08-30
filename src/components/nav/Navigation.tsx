'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import LanguageToggle from '@/components/ui/LanguageToggle'
import { useLanguage } from '@/context/LanguageContext'

interface NavigationProps {
  theme?: 'light' | 'dark'
}

export default function Navigation({ theme = 'dark' }: NavigationProps) {
  const { t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  const navLinks = [
    { href: '/works', label: t.nav.works },
    { href: '/journal', label: t.nav.journal },
    { href: '/about', label: t.nav.about },
    { href: '/education', label: t.nav.education },
    { href: '/exhibitions', label: t.nav.exhibitions },
    { href: '/contact', label: t.nav.contact },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    }, 600)
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
        <div
          className="section-gutter flex items-center justify-between py-5 md:py-6"
          style={{ paddingTop: 'max(1.25rem, calc(env(safe-area-inset-top) + 0.5rem))' }}
        >
          <Link
            href="/"
            className={`brand-mark font-serif italic font-light tracking-wide ${textColor} hover:opacity-60 transition-opacity duration-200`}
            style={{ fontSize: 'clamp(1rem, 1.7vw, 1.5rem)' }}
            aria-label="ZlaticArt — home"
          >
            ZlaticArt
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-8 lg:gap-10"
            aria-label="Primary navigation"
          >
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`nav-link ${textColor}`}>
                {link.label}
              </Link>
            ))}
            <LanguageToggle
              className={isDark ? 'text-canvas/60 hover:text-canvas/90' : 'text-ink/50 hover:text-ink/90'}
            />
          </nav>

          {/* Mobile: language toggle + hamburger */}
          <div className="md:hidden flex items-center gap-4">
            <LanguageToggle
              className={isDark ? 'text-canvas/60' : 'text-ink/50'}
            />

            <button
              ref={buttonRef}
              className={`flex flex-col items-center justify-center gap-[5px] min-w-[44px] min-h-[44px] -mr-2.5 ${textColor}`}
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span className="block w-5 h-px bg-current" />
              <span className="block w-5 h-px bg-current" />
            </button>
          </div>
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
        inert={!menuOpen}
      >
        <div
          className="section-gutter flex items-center justify-between py-5"
          style={{ paddingTop: 'max(1.25rem, calc(env(safe-area-inset-top) + 0.5rem))' }}
        >
          <Link
            href="/"
            className="brand-mark text-label text-sm tracking-brand font-light text-canvas"
            onClick={() => setMenuOpen(false)}
          >
            ZlaticArt
          </Link>
          <button
            className="text-canvas flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2.5"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <span className="relative block w-5 h-5" aria-hidden="true">
              <span className="absolute top-1/2 left-0 block w-5 h-px bg-current"
                style={{ transform: 'translateY(-50%) rotate(45deg)' }} />
              <span className="absolute top-1/2 left-0 block w-5 h-px bg-current"
                style={{ transform: 'translateY(-50%) rotate(-45deg)' }} />
            </span>
          </button>
        </div>

        <nav
          className="flex flex-col justify-center flex-1 section-gutter gap-6 pb-24"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link, i) => (
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

        <div
          className="section-gutter pb-8"
          style={{ paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom) + 1rem))' }}
        >
          <p className="text-gallery-meta text-canvas/40">
            {t.hero.tagline}
          </p>
        </div>
      </div>
    </>
  )
}
