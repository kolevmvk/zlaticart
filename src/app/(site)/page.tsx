import type { Metadata } from 'next'
import HeroGL from '@/components/hero/HeroGL'
import GalleryPreparing from '@/components/hero/GalleryPreparing'
import Navigation from '@/components/nav/Navigation'
import SelectedWorks from '@/components/works/SelectedWorks'
import MediaTransitions from '@/components/sections/MediaTransitions'
import TheArtist from '@/components/sections/TheArtist'
import ArtEducationPreview from '@/components/sections/ArtEducationPreview'
import JournalHighlights from '@/components/journal/JournalHighlights'
import ExhibitionsPreview from '@/components/sections/ExhibitionsPreview'
import StudioPreview from '@/components/sections/StudioPreview'
import SiteFooter from '@/components/nav/SiteFooter'
import {
  getHeroArtwork,
  getFeaturedArtworks,
  getFeaturedJournalPosts,
  getAllExhibitions,
  getAllArtworks,
  getArtistProfile,
  getSiteSettings,
} from '@/lib/content/api'

// `||` (not `??`) deliberately: the production env var has been observed set to an
// empty string rather than unset, which `??` would not fall back on. Canonical
// production domain is `www` — the apex 308-redirects to it.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zlaticart.com'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [heroArtwork, featuredWorks, journalPosts, exhibitions, allArtworks, profile, settings] =
    await Promise.all([
      getHeroArtwork(),
      getFeaturedArtworks(),
      getFeaturedJournalPosts(),
      getAllExhibitions(),
      getAllArtworks(),
      getArtistProfile(),
      getSiteSettings(),
    ])

  // Only real, already-configured data goes into structured data — no
  // invented biography, exhibitions, or profile URLs. `sameAs` is omitted
  // entirely until Zlatica supplies verified Instagram/Facebook URLs
  // (currently null in Site Settings — see TODO_OWNER.md).
  const sameAs = [settings.instagramProfileUrl, settings.facebookProfileUrl].filter(
    (url): url is string => Boolean(url)
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: profile.name,
        jobTitle: profile.roleLine,
        description: settings.siteDescription,
        url: SITE_URL,
        ...(sameAs.length > 0 ? { sameAs } : {}),
        ...(profile.portrait ? { image: `${SITE_URL}${profile.portrait.src}` } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: settings.siteTitle,
        description: settings.siteDescription,
        inLanguage: 'sr',
        author: { '@id': `${SITE_URL}/#person` },
        publisher: { '@id': `${SITE_URL}/#person` },
      },
    ],
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 1. Fixed navigation */}
      <Navigation theme={heroArtwork ? 'dark' : 'light'} />

      {/* 2. Living Canvas hero */}
      {heroArtwork ? <HeroGL artwork={heroArtwork} /> : <GalleryPreparing />}

      {/* 3. Selected Works */}
      <SelectedWorks artworks={featuredWorks} />

      {/* 4. Practice / media transitions */}
      <MediaTransitions artworks={allArtworks} />

      {/* 5. Artist statement / About preview */}
      <TheArtist profile={profile} />

      {/* 6. Art & Education preview */}
      <ArtEducationPreview profile={profile} />

      {/* 7. Journal highlights */}
      <JournalHighlights posts={journalPosts} />

      {/* 8. Exhibitions / current activity */}
      <ExhibitionsPreview exhibitions={exhibitions} />

      {/* 9. From the Studio / Instagram */}
      <StudioPreview instagramUrl={settings.instagramProfileUrl ?? null} />

      {/* 10. Contact / footer */}
      <SiteFooter
        instagramUrl={settings.instagramProfileUrl ?? null}
        facebookUrl={settings.facebookProfileUrl ?? null}
        email={settings.contactEmail ?? null}
      />
    </main>
  )
}
