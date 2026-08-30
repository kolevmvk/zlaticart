import type { Metadata } from 'next'
import Navigation from '@/components/nav/Navigation'
import SiteFooter from '@/components/nav/SiteFooter'
import StudioPageContent from './StudioPageContent'
import { getSocialFeed } from '@/lib/social/provider'
import { getSiteSettings } from '@/lib/content/api'

export const metadata: Metadata = {
  title: 'Studio',
  description: 'From the studio — Zlatica\'s current practice, works in progress, and Instagram.',
}

export default async function StudioPage() {
  const [feed, settings] = await Promise.all([getSocialFeed(), getSiteSettings()])

  return (
    <>
      <Navigation theme="light" />
      <main className="min-h-svh bg-canvas">
        <StudioPageContent feed={feed} />

        <SiteFooter
          instagramUrl={settings.instagramProfileUrl ?? null}
          facebookUrl={settings.facebookProfileUrl ?? null}
          email={settings.contactEmail ?? null}
        />
      </main>
    </>
  )
}
