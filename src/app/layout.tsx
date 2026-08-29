import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
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
