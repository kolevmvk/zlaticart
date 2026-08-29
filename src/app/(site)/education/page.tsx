import type { Metadata } from 'next'
import Navigation from '@/components/nav/Navigation'
import SiteFooter from '@/components/nav/SiteFooter'
import EducationPageContent from './EducationPageContent'
import { getAllEducationItems, getArtistProfile, getSiteSettings } from '@/lib/content/api'

export const metadata: Metadata = {
  title: 'Art & Education — Zlatica',
  description: 'Teaching philosophy, workshops, and educational practice.',
}

export default async function EducationPage() {
  const [items, profile, settings] = await Promise.all([
    getAllEducationItems(),
    getArtistProfile(),
    getSiteSettings(),
  ])

  return (
    <>
      <Navigation theme="light" />
      <main className="bg-canvas min-h-screen pt-24">
        <EducationPageContent items={items} profile={profile} />

        <SiteFooter
          instagramUrl={settings.instagramProfileUrl ?? null}
          facebookUrl={settings.facebookProfileUrl ?? null}
          email={settings.contactEmail ?? null}
        />
      </main>
    </>
  )
}
