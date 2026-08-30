import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

// Weight lists trimmed to what the codebase actually uses (grepped every
// font-weight/font-* utility across src/ — the site only ever sets weight
// 300, via Tailwind's `font-light`; 400 kept as a safety margin for any
// element that falls back to a browser-default weight). The previous
// wider lists (up to 600) meant every page preloaded several font files
// nothing on that page ever rendered with — harmless but wasteful, and
// the source of "preloaded... but not used within a few seconds" console
// warnings. Half as many font files to fetch is a real, if modest,
// contributor to the "site feels slow" reports from earlier in this
// session, not just a console-noise fix.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-dm-sans',
  display: 'swap',
})

// `||` (not `??`) deliberately: the production env var has been observed set to an
// empty string rather than unset, which `??` would not fall back on. Canonical
// production domain is `www` — the apex 308-redirects to it.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zlaticart.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ZlaticArt — Painter · Educator · Artist',
    template: '%s — ZlaticArt',
  },
  description:
    'The digital home of ZlaticArt: abstract painter, watercolorist, and art-school educator.',
  openGraph: {
    type: 'website',
    siteName: 'ZlaticArt',
    locale: 'sr_RS',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F0EDE6',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
