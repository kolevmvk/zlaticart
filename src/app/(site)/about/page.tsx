import type { Metadata } from 'next'
import Navigation from '@/components/nav/Navigation'
import SiteFooter from '@/components/nav/SiteFooter'
import AboutPageContent from './AboutPageContent'
import { getArtistProfile, getSiteSettings } from '@/lib/content/api'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Zlatica — painter, abstract artist, and art-school educator.',
}

export default async function AboutPage() {
  const [profile, settings] = await Promise.all([getArtistProfile(), getSiteSettings()])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.roleLine,
    image: profile.portrait.src,
    ...(profile.location ? { homeLocation: profile.location } : {}),
    ...(settings.instagramProfileUrl || settings.facebookProfileUrl
      ? { sameAs: [settings.instagramProfileUrl, settings.facebookProfileUrl].filter(Boolean) }
      : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation theme="light" />
      <main className="min-h-svh bg-canvas">
        <AboutPageContent profile={profile} />

        <SiteFooter
          instagramUrl={settings.instagramProfileUrl ?? null}
          facebookUrl={settings.facebookProfileUrl ?? null}
          email={settings.contactEmail ?? null}
        />
      </main>
    </>
  )
}
