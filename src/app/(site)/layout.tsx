import SmoothScroll from '@/components/providers/SmoothScroll'
import PageTransition from '@/components/providers/PageTransition'
import CustomCursor from '@/components/ui/CustomCursor'
import GrainPauser from '@/components/providers/GrainPauser'
import { LanguageProvider } from '@/context/LanguageContext'

// Cinematic site chrome (custom cursor, smooth scroll, grain, page transitions)
// lives only here — the embedded Sanity Studio at /admin sits outside this
// route group and gets none of it, so Studio keeps a normal cursor and native scroll.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SmoothScroll>
        <PageTransition>{children}</PageTransition>
      </SmoothScroll>
      <CustomCursor />
      <GrainPauser />
    </LanguageProvider>
  )
}
