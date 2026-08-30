import type { Metadata } from 'next'
import Navigation from '@/components/nav/Navigation'
import SiteFooter from '@/components/nav/SiteFooter'
import PorudzbinaPageContent from './PorudzbinaPageContent'
import { getSiteSettings } from '@/lib/content/api'

export const metadata: Metadata = {
  title: 'Commission a piece',
  description: 'Commission a custom, made-to-order painting from Zlatica.',
  alternates: { canonical: '/porudzbina' },
}

export default async function PorudzbinaPage() {
  const settings = await getSiteSettings()
  const { instagramProfileUrl, facebookProfileUrl, contactEmail } = settings

  return (
    <>
      <Navigation theme="light" />
      <main className="min-h-svh bg-canvas">
        <PorudzbinaPageContent />

        <SiteFooter
          instagramUrl={instagramProfileUrl ?? null}
          facebookUrl={facebookProfileUrl ?? null}
          email={contactEmail ?? null}
        />
      </main>
    </>
  )
}
