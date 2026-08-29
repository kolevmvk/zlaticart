import Link from 'next/link'

interface SiteFooterProps {
  instagramUrl: string | null
  facebookUrl: string | null
  email: string | null
}

export default function SiteFooter({ instagramUrl, facebookUrl, email }: SiteFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ink section-gutter py-12 md:py-16" role="contentinfo">
      <div className="grid md:grid-cols-3 gap-10 md:gap-6 mb-12 md:mb-16">
        <div>
          <p className="font-serif text-canvas font-light italic text-2xl tracking-wide mb-2">
            ZlaticArt
          </p>
          <p className="text-gallery-meta text-canvas/40">
            Painter · Educator · Artist
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-col gap-3">
          {[
            { href: '/works', label: 'Works' },
            { href: '/journal', label: 'Journal' },
            { href: '/about', label: 'About' },
            { href: '/studio', label: 'Studio' },
            { href: '/contact', label: 'Contact' },
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

      <div className="border-t border-canvas/10 pt-6">
        <p className="text-gallery-meta text-canvas/25">
          © {year} Zlatica. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
