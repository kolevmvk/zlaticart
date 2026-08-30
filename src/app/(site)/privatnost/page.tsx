import type { Metadata } from 'next'
import Navigation from '@/components/nav/Navigation'
import SiteFooter from '@/components/nav/SiteFooter'
import PrivatnostPageContent from './PrivatnostPageContent'
import { getSiteSettings } from '@/lib/content/api'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What data zlaticart.com collects and which technologies it uses.',
  alternates: { canonical: '/privatnost' },
}

export default async function PrivatnostPage() {
  const settings = await getSiteSettings()
  const { instagramProfileUrl, facebookProfileUrl, contactEmail } = settings

  return (
    <>
      <Navigation theme="light" />
      <main className="min-h-svh bg-canvas">
        <PrivatnostPageContent />

        <SiteFooter
          instagramUrl={instagramProfileUrl ?? null}
          facebookUrl={facebookProfileUrl ?? null}
          email={contactEmail ?? null}
        />
      </main>
    </>
  )
}
