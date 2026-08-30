'use client'

import Link from 'next/link'
import ContactForm from '@/components/ContactForm'
import { useLanguage } from '@/context/LanguageContext'

interface ContactPageContentProps {
  instagramProfileUrl: string | null
  facebookProfileUrl: string | null
  contactEmail: string | null
}

export default function ContactPageContent({
  instagramProfileUrl,
  facebookProfileUrl,
  contactEmail,
}: ContactPageContentProps) {
  const { t } = useLanguage()

  return (
    <>
      <div className="section-gutter pt-32 md:pt-36 pb-12 border-b border-canvas-deep">
        <h1
          className="font-serif font-light text-ink"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', letterSpacing: '0.10em' }}
        >
          {t.contact.heading}
        </h1>
      </div>

      <div className="section-gutter section-spacing">
        <div className="max-w-md">
          <p className="font-sans text-ink/70 leading-loose mb-10 text-[0.9375rem]">
            {t.contact.intro}
          </p>

          <div className="mb-10">
            <ContactForm />
          </div>

          <div className="mb-16">
            <Link
              href="/porudzbina"
              className="nav-link text-ink/60 hover:text-ink border-b border-ink/30 hover:border-ink pb-1 transition-colors duration-200"
            >
              {t.commission.navLabel} →
            </Link>
          </div>

          <div className="space-y-6">
            {instagramProfileUrl && (
              <div>
                <p className="text-label text-ink/40 mb-1">{t.contact.labels.instagram}</p>
                <a
                  href={instagramProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-ink hover:opacity-60 transition-opacity duration-200 text-sm"
                >
                  {instagramProfileUrl}
                </a>
              </div>
            )}

            {facebookProfileUrl && (
              <div>
                <p className="text-label text-ink/40 mb-1">{t.contact.labels.facebook}</p>
                <a
                  href={facebookProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-ink hover:opacity-60 transition-opacity duration-200 text-sm"
                >
                  {facebookProfileUrl}
                </a>
              </div>
            )}

            {contactEmail && (
              <div>
                <p className="text-label text-ink/40 mb-1">{t.contact.labels.email}</p>
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-sans text-ink hover:opacity-60 transition-opacity duration-200 text-sm"
                >
                  {contactEmail}
                </a>
              </div>
            )}

            {!instagramProfileUrl && !contactEmail && (
              <p className="text-gallery-meta italic text-ink/40">
                {t.contact.comingSoon}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
