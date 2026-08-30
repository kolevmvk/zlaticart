import SmoothScroll from '@/components/providers/SmoothScroll'
import PageTransition from '@/components/providers/PageTransition'
import GrainPauser from '@/components/providers/GrainPauser'
import { LanguageProvider } from '@/context/LanguageContext'

// Cinematic site chrome (smooth scroll, grain, page transitions) lives only
// here — the embedded Sanity Studio at /admin sits outside this route group
// and gets none of it, so Studio keeps native scroll. The custom cursor
// (dot + ring) that used to live here was removed per direct feedback: it
// read as impractical on desktop — visitors get the plain system cursor now.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SmoothScroll>
        <PageTransition>{children}</PageTransition>
      </SmoothScroll>
      <GrainPauser />
    </LanguageProvider>
  )
}
