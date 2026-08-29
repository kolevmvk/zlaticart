import Link from 'next/link'
import KineticHeading from '@/components/ui/KineticHeading'
import type { ArtistProfile } from '@/lib/content/types'

interface ArtEducationPreviewProps {
  profile: ArtistProfile
}

export default function ArtEducationPreview({ profile }: ArtEducationPreviewProps) {
  return (
    <section
      className="bg-canvas-warm section-spacing"
      aria-labelledby="education-preview-heading"
    >
      <div className="section-gutter">
        <div className="max-w-3xl">
          <p className="text-label text-ink/35 text-xs tracking-widest uppercase mb-5">
            Art &amp; Education
          </p>
          <KineticHeading
            as="h2"
            id="education-preview-heading"
            className="font-serif font-light text-ink mb-6"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '0.04em', lineHeight: 1.15 }}
          >
            Teaching as a Form of Practice
          </KineticHeading>
          <p
            className="font-sans font-light text-ink/60 mb-10"
            style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.75 }}
          >
            {profile.educationStatement ?? (
              '[Placeholder — a brief statement about Zlatica\'s teaching practice and philosophy will appear here.]'
            )}
          </p>
          <Link
            href="/education"
            className="inline-block text-label text-ink/50 hover:text-ink transition-colors duration-200 text-xs tracking-widest uppercase"
          >
            Art &amp; Education →
          </Link>
        </div>
      </div>
    </section>
  )
}
