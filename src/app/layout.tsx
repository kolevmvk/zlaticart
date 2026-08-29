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

export const metadata: Metadata = {
  title: {
    default: 'Zlatica — Painter · Educator · Artist',
    template: '%s — Zlatica',
  },
  description:
    'The digital home of Zlatica\'s artistic practice: abstract painter, watercolorist, and art-school educator.',
  openGraph: {
    type: 'website',
    siteName: 'ZlaticArt',
    locale: 'sr_RS',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F0EDE6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="sr"
      className={`${cormorant.variable} ${dmSans.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
