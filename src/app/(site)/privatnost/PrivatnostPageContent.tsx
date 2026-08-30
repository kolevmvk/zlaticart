'use client'

import { useLanguage } from '@/context/LanguageContext'

export default function PrivatnostPageContent() {
  const { t } = useLanguage()
  const { title, updated, intro, sections } = t.legal.privacy

  return (
    <>
      <div className="section-gutter pt-32 md:pt-36 pb-12 border-b border-canvas-deep">
        <h1
          className="font-serif font-light text-ink"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', letterSpacing: '0.10em' }}
        >
          {title}
        </h1>
        <p className="text-gallery-meta text-ink/40 mt-4">{updated}</p>
      </div>

      <div className="section-gutter section-spacing">
        <div className="max-w-2xl space-y-12">
          <p className="font-sans text-ink/70 leading-loose text-[0.9375rem]">{intro}</p>

          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="font-serif font-light text-ink text-2xl mb-3">{section.heading}</h2>
              <p className="font-sans text-ink/70 leading-loose text-[0.9375rem]">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
