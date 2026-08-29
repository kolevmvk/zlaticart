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

  return (
    <main>
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
