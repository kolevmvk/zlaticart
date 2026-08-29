import LivingCanvas from '@/components/hero/LivingCanvas'
import Navigation from '@/components/nav/Navigation'
import SelectedWorks from '@/components/works/SelectedWorks'
import JournalHighlights from '@/components/journal/JournalHighlights'
import TheArtist from '@/components/sections/TheArtist'
import StudioPreview from '@/components/sections/StudioPreview'
import SiteFooter from '@/components/nav/SiteFooter'
import { getHeroArtwork, getFeaturedArtworks, getFeaturedJournalPosts, ARTIST_PROFILE, SITE_SETTINGS } from '@/lib/content/seed'

export default function HomePage() {
  const heroArtwork = getHeroArtwork()
  const featuredWorks = getFeaturedArtworks()
  const journalPosts = getFeaturedJournalPosts()

  return (
    <main>
      <Navigation theme="dark" />
      <LivingCanvas artwork={heroArtwork} />
      <SelectedWorks artworks={featuredWorks} />
      <JournalHighlights posts={journalPosts} />
      <TheArtist profile={ARTIST_PROFILE} />
      <StudioPreview instagramUrl={SITE_SETTINGS.instagramProfileUrl} />
      <SiteFooter
        instagramUrl={SITE_SETTINGS.instagramProfileUrl}
        facebookUrl={SITE_SETTINGS.facebookProfileUrl}
        email={SITE_SETTINGS.contactEmail}
      />
    </main>
  )
}
