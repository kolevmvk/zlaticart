'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import type { Artwork, JournalPost } from '@/lib/content/types'

interface JournalArticleContentProps {
  post: JournalPost
  relatedArtworks: Artwork[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function JournalArticleContent({ post, relatedArtworks }: JournalArticleContentProps) {
  const { t } = useLanguage()

  return (
    <>
      {/* Hero cover */}
      <div className="relative w-full" style={{ height: 'clamp(50vh, 65vh, 75vh)' }}>
        <Image
          src={post.coverImage.src}
          alt={post.coverImage.alt}
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(10,10,9,0) 50%, rgba(10,10,9,0.55) 100%)' }}
          aria-hidden="true"
        />
      </div>

      {/* Article header */}
      <div className="section-gutter pt-10 md:pt-14 pb-8 border-b border-canvas-deep">
        <div className="max-w-2xl">
          <p className="text-label text-ink/40 mb-4">
            {post.category} · {formatDate(post.publishedAt)}
          </p>
          <h1
            className="font-serif font-light text-ink mb-5"
            style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3.25rem)', letterSpacing: '0.03em', lineHeight: '1.15' }}
          >
            {post.title}
          </h1>
          <p
            className="font-serif text-ink/60 italic font-light leading-relaxed"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.1875rem)' }}
          >
            {post.excerpt}
          </p>
        </div>
      </div>

      {/* Article body */}
      <div className="section-gutter py-12 md:py-16">
        <div className="max-w-2xl">
          <div
            className="font-sans text-ink/80 leading-loose"
            style={{ fontSize: '1rem', whiteSpace: 'pre-line' }}
          >
            {post.body}
          </div>
        </div>
      </div>

      {/* Related artworks */}
      {relatedArtworks.length > 0 && (
        <div className="section-gutter py-10 border-t border-canvas-deep">
          <p className="text-label text-ink/40 mb-6">{t.journal.relatedWorks}</p>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {relatedArtworks.map((aw) => (
              <Link
                key={aw.id}
                href={`/works/${aw.slug}`}
                className="group flex-shrink-0 w-40 md:w-52"
              >
                <div className="relative overflow-hidden bg-canvas-warm aspect-square mb-2">
                  <Image
                    src={aw.primaryImage.src}
                    alt={aw.primaryImage.alt}
                    fill
                    quality={75}
                    sizes="220px"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="font-serif text-ink text-sm font-light">
                  {aw.title === '[Title to be confirmed]' ? (
                    <span className="italic text-ink/40">{t.works.untitled}</span>
                  ) : (
                    aw.title
                  )}
                </p>
                <p className="text-gallery-meta mt-0.5">{aw.medium.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back */}
      <div className="section-gutter py-8 border-t border-canvas-deep">
        <Link href="/journal" className="text-label text-ink/50 hover:text-ink transition-colors duration-200">
          {t.journal.backToAll}
        </Link>
      </div>
    </>
  )
}
