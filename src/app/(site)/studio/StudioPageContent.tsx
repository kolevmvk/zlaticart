'use client'

import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import type { SocialFeedResult } from '@/lib/social/provider'

interface StudioPageContentProps {
  feed: SocialFeedResult
}

export default function StudioPageContent({ feed }: StudioPageContentProps) {
  const { t } = useLanguage()

  return (
    <>
      <div className="section-gutter pt-32 md:pt-36 pb-12 border-b border-canvas-deep">
        <h1
          className="font-serif font-light text-ink"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', letterSpacing: '0.10em' }}
        >
          {t.nav.studio}
        </h1>
        <p className="text-gallery-meta mt-3">{t.studio.subtitle}</p>
      </div>

      {/* Social feed */}
      <div className="section-gutter section-spacing">
        {feed.source === 'empty' ? (
          <div className="text-center py-16">
            <p className="font-serif font-light text-ink/40 text-xl mb-4">
              {t.studio.comingSoonTitle}
            </p>
            <p className="text-gallery-meta mb-8">
              {t.studio.comingSoonBody}
            </p>
            {feed.profileUrl ? (
              <a
                href={feed.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-label text-ink hover:opacity-60 transition-opacity duration-200"
              >
                {t.studio.instagram}
              </a>
            ) : (
              <p className="text-label text-ink/30 italic text-sm">
                {t.studio.linkComingSoon}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {feed.posts.map((post) => (
              <a
                key={post.id}
                href={post.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden bg-canvas-warm aspect-square block"
                aria-label={post.captionExcerpt ?? 'Instagram post'}
              >
                {post.image && (
                  <Image
                    src={post.image.src}
                    alt={post.image.alt}
                    fill
                    quality={80}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                )}
                {post.captionExcerpt && (
                  <div className="absolute inset-0 bg-ink/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-canvas text-xs leading-snug line-clamp-3">
                      {post.captionExcerpt}
                    </p>
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
