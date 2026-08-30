'use client'

import CommissionForm from '@/components/CommissionForm'
import { useLanguage } from '@/context/LanguageContext'

export default function PorudzbinaPageContent() {
  const { t } = useLanguage()

  return (
    <>
      <div className="section-gutter pt-32 md:pt-36 pb-12 border-b border-canvas-deep">
        <h1
          className="font-serif font-light text-ink"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', letterSpacing: '0.10em' }}
        >
          {t.commission.heading}
        </h1>
      </div>

      <div className="section-gutter section-spacing">
        <div className="max-w-md">
          <p className="font-sans text-ink/70 leading-loose mb-10 text-[0.9375rem]">
            {t.commission.intro}
          </p>

          <CommissionForm />
        </div>
      </div>
    </>
  )
}
