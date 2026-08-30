'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

interface SiteFooterProps {
  instagramUrl: string | null
  facebookUrl: string | null
  email: string | null
}

export default function SiteFooter({ instagramUrl, facebookUrl, email }: SiteFooterProps) {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ink section-gutter py-12 md:py-16" role="contentinfo">
      <div className="grid md:grid-cols-3 gap-10 md:gap-6 mb-12 md:mb-16">
        <div>
          <p className="font-serif text-canvas font-light italic text-2xl tracking-wide mb-2">
            ZlaticArt
          </p>
          <p className="text-gallery-meta text-canvas/40">
            {t.footer.tagline}
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-col gap-3">
          {[
            { href: '/works', label: t.nav.works },
            { href: '/journal', label: t.nav.journal },
            { href: '/about', label: t.nav.about },
            { href: '/education', label: t.nav.education },
            { href: '/exhibitions', label: t.nav.exhibitions },
            { href: '/studio', label: t.nav.studio },
            { href: '/contact', label: t.nav.contact },
            { href: '/porudzbina', label: t.commission.navLabel },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="nav-link text-canvas/60 hover:text-canvas">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="nav-link text-canvas/60 hover:text-canvas">
              Instagram
            </a>
          )}
          {facebookUrl && (
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="nav-link text-canvas/60 hover:text-canvas">
              Facebook
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="nav-link text-canvas/60 hover:text-canvas">
              {email}
            </a>
          )}
          {!instagramUrl && !email && (
            <p className="text-gallery-meta text-canvas/30 italic">Social links coming soon</p>
          )}
        </div>
      </div>

      <div className="border-t border-canvas/10 pt-6 flex flex-col gap-2">
        <p className="text-gallery-meta text-canvas/25">
          {t.footer.rights(year)}
        </p>
        <p className="text-gallery-meta text-canvas/25">
          <Link href="/privatnost" className="hover:text-canvas/60 transition-colors duration-200">
            {t.footer.privacy}
          </Link>
          {' · '}
          <Link href="/pravne-informacije" className="hover:text-canvas/60 transition-colors duration-200">
            {t.footer.legalInfo}
          </Link>
        </p>
      </div>
    </footer>
  )
}
