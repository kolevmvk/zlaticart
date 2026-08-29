import type { Metadata } from 'next'
import Navigation from '@/components/nav/Navigation'
import SiteFooter from '@/components/nav/SiteFooter'
import ExhibitionsPageContent from './ExhibitionsPageContent'
import { getAllExhibitions, getSiteSettings } from '@/lib/content/api'

export const metadata: Metadata = {
  title: 'Exhibitions — Zlatica',
  description: 'Past, current, and upcoming exhibitions.',
}

export default async function ExhibitionsPage() {
  const [exhibitions, settings] = await Promise.all([getAllExhibitions(), getSiteSettings()])

  return (
    <>
      <Navigation theme="light" />
      <main className="bg-canvas min-h-screen pt-24">
        <ExhibitionsPageContent exhibitions={exhibitions} />

        <SiteFooter
          instagramUrl={settings.instagramProfileUrl ?? null}
          facebookUrl={settings.facebookProfileUrl ?? null}
          email={settings.contactEmail ?? null}
        />
      </main>
    </>
  )
}
