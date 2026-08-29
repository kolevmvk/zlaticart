'use client'

import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import type { ArtistProfile } from '@/lib/content/types'

interface AboutPageContentProps {
  profile: ArtistProfile
}

export default function AboutPageContent({ profile }: AboutPageContentProps) {
  const { t } = useLanguage()

  return (
    <>
      {/* Page header */}
      <div className="section-gutter pt-32 md:pt-36 pb-12 md:pb-16">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
          {/* Primary portrait — full editorial scale */}
          <div className="md:col-span-5 lg:col-span-4">
            <div
              className="relative overflow-hidden"
              style={{ aspectRatio: '3/4' }}
            >
              <Image
                src={profile.portrait.src}
                alt={profile.portrait.alt}
                fill
                priority
                quality={90}
                sizes="(max-width: 768px) 90vw, 40vw"
                className="object-cover grayscale"
              />
            </div>
          </div>

          {/* Identity */}
          <div className="md:col-span-7 lg:col-span-8 md:pt-4">
            <p className="text-label text-ink/40 mb-6" style={{ letterSpacing: '0.20em' }}>
              Zlatica
            </p>
            <h1
              className="font-serif font-light text-ink mb-4"
              style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', letterSpacing: '0.06em', lineHeight: '1.1' }}
            >
              {t.about.roles.painter}<br />{t.about.roles.educator}<br />{t.about.roles.artist}
            </h1>
            {profile.location && (
              <p className="text-gallery-meta mt-4">{profile.location}</p>
            )}
          </div>
        </div>
      </div>

      {/* Biography */}
      <div className="section-gutter section-spacing border-t border-canvas-deep">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-3">
            <p className="text-label text-ink/40 sticky top-32" style={{ letterSpacing: '0.18em' }}>
              {t.about.biographyLabel}
            </p>
          </div>
          <div className="md:col-span-7">
            {profile.biography || profile.shortBio ? (
              <p className="font-sans text-ink/70 leading-loose text-[0.9375rem]">
                {profile.biography ?? profile.shortBio}
              </p>
            ) : (
              <p className="text-gallery-meta italic text-ink/30">
                {t.about.bioComingSoon}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Artist statement */}
      {profile.artistStatement && (
        <div className="section-gutter section-spacing border-t border-canvas-deep bg-canvas-warm">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12">
            <div className="md:col-span-3">
              <p className="text-label text-ink/40 sticky top-32" style={{ letterSpacing: '0.18em' }}>
                {t.about.statementLabel}
              </p>
            </div>
            <div className="md:col-span-7">
              <blockquote
                className="font-serif font-light text-ink/80 italic"
                style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)', lineHeight: '1.6', letterSpacing: '0.01em' }}
              >
                {profile.artistStatement}
              </blockquote>
            </div>
          </div>
        </div>
      )}

      {/* Archive photographs */}
      {profile.atelierImages && profile.atelierImages.length > 0 && (
        <div className="section-gutter section-spacing border-t border-canvas-deep">
          <p className="text-label text-ink/40 mb-10 md:mb-14" style={{ letterSpacing: '0.20em' }}>
            {t.about.archiveLabel}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {profile.atelierImages.map((img, i) => (
              <div
                key={i}
                className={`relative overflow-hidden ${
                  i === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-[3/4]'
                } ${i === 2 ? 'col-span-1' : ''}`}
                style={i === 0 ? { aspectRatio: '1/1' } : {}}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  quality={80}
                  sizes={i === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                  className={`object-cover ${i === 2 ? '' : 'grayscale'}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
