'use client'

import { useLanguage } from '@/context/LanguageContext'

// Shown instead of the Living Canvas hero when there is no hero artwork yet
// (empty CMS, first deploy before content is added).
export default function GalleryPreparing() {
  const { t } = useLanguage()
  return (
    <section className="min-h-svh flex items-center justify-center bg-canvas">
      {/* Homepage must always carry exactly one h1 even when there's no hero
          artwork yet (empty CMS) — this fallback state has no natural heading
          copy of its own, so it's kept visually hidden. */}
      <h1 className="sr-only">Zlatica</h1>
      <p
        className="font-serif font-light text-ink/40 text-center px-8"
        style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)', letterSpacing: '0.06em' }}
      >
        {t.hero.galleryPreparing}
      </p>
    </section>
  )
}
