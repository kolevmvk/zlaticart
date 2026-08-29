'use client'

import { useLanguage } from '@/context/LanguageContext'

// Shown instead of the Living Canvas hero when there is no hero artwork yet
// (empty CMS, first deploy before content is added).
export default function GalleryPreparing() {
  const { t } = useLanguage()
  return (
    <section className="min-h-svh flex items-center justify-center bg-canvas">
      <p
        className="font-serif font-light text-ink/40 text-center px-8"
        style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)', letterSpacing: '0.06em' }}
      >
        {t.hero.galleryPreparing}
      </p>
    </section>
  )
}
