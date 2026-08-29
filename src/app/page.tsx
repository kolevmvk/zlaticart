import HeroGL from '@/components/hero/HeroGL'
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
  ARTIST_PROFILE,
  SITE_SETTINGS,
} from '@/lib/content/seed'

export default function HomePage() {
  const heroArtwork = getHeroArtwork()
  const featuredWorks = getFeaturedArtworks()
  const journalPosts = getFeaturedJournalPosts()
  const exhibitions = getAllExhibitions()
  const allArtworks = getAllArtworks()

  return (
    <main>
      {/* 1. Fixed navigation */}
      <Navigation theme="dark" />

      {/* 2. Living Canvas hero */}
      <HeroGL artwork={heroArtwork} />

      {/* 3. Selected Works */}
      <SelectedWorks artworks={featuredWorks} />

      {/* 4. Practice / media transitions */}
      <MediaTransitions artworks={allArtworks} />

      {/* 5. Artist statement / About preview */}
      <TheArtist profile={ARTIST_PROFILE} />

      {/* 6. Art & Education preview */}
      <ArtEducationPreview profile={ARTIST_PROFILE} />

      {/* 7. Journal highlights */}
      <JournalHighlights posts={journalPosts} />

      {/* 8. Exhibitions / current activity */}
      <ExhibitionsPreview exhibitions={exhibitions} />

      {/* 9. From the Studio / Instagram */}
      <StudioPreview instagramUrl={SITE_SETTINGS.instagramProfileUrl} />

      {/* 10. Contact / footer */}
      <SiteFooter
        instagramUrl={SITE_SETTINGS.instagramProfileUrl}
        facebookUrl={SITE_SETTINGS.facebookProfileUrl}
        email={SITE_SETTINGS.contactEmail}
      />
    </main>
  )
}
