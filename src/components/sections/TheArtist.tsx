import Image from 'next/image'
import Link from 'next/link'
import type { ArtistProfile } from '@/lib/content/types'

interface TheArtistProps {
  profile: ArtistProfile
}

export default function TheArtist({ profile }: TheArtistProps) {
  return (
    <section className="section-spacing bg-ink" aria-labelledby="artist-heading">
      <div className="section-gutter">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
          {/* Portrait */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="relative overflow-hidden aspect-[3/4] max-w-sm mx-auto md:mx-0">
              <Image
                src={profile.portrait.src}
                alt={profile.portrait.alt}
                fill
                quality={85}
                sizes="(max-width: 768px) 80vw, 35vw"
                className="object-cover grayscale"
              />
            </div>
          </div>

          {/* Text */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-center md:py-8 lg:py-16">
            <p
              className="text-canvas/40 text-label mb-6 md:mb-8"
              style={{ letterSpacing: '0.20em' }}
            >
              The Artist
            </p>
            <h2
              id="artist-heading"
              className="font-serif text-canvas font-light mb-6 md:mb-8"
              style={{
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                letterSpacing: '0.06em',
                lineHeight: '1.1',
              }}
            >
              {profile.name}
            </h2>
            <p
              className="font-serif text-canvas/60 font-light italic mb-8 md:mb-10"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', lineHeight: '1.6' }}
            >
              {profile.roleLine}
            </p>
            <p
              className="text-canvas/70 font-light leading-relaxed mb-8 md:mb-10 max-w-md"
              style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9375rem' }}
            >
              {profile.shortBio}
            </p>
            <Link
              href="/about"
              className="text-label text-canvas/50 hover:text-canvas transition-colors duration-200"
            >
              Read more →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
