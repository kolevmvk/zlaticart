import type { Metadata } from 'next'
import Navigation from '@/components/nav/Navigation'
import SiteFooter from '@/components/nav/SiteFooter'
import PravneInformacijePageContent from './PravneInformacijePageContent'
import { getSiteSettings } from '@/lib/content/api'

export const metadata: Metadata = {
  title: 'Copyright & Terms of Use',
  description: 'Image rights, site copyright, and usage rules for zlaticart.com.',
  alternates: { canonical: '/pravne-informacije' },
}

export default async function PravneInformacijePage() {
  const settings = await getSiteSettings()
  const { instagramProfileUrl, facebookProfileUrl, contactEmail } = settings

  return (
    <>
      <Navigation theme="light" />
      <main className="min-h-svh bg-canvas">
        <PravneInformacijePageContent />

        <SiteFooter
          instagramUrl={instagramProfileUrl ?? null}
          facebookUrl={facebookProfileUrl ?? null}
          email={contactEmail ?? null}
        />
      </main>
    </>
  )
}
