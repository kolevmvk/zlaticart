'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import type { JournalPost } from '@/lib/content/types'

const CATEGORY_VALUES = ['All', 'Atelier', 'Thoughts', 'Teaching', 'Exhibitions', 'Works'] as const

interface JournalPageContentProps {
  posts: JournalPost[]
  activeCategory: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function JournalPageContent({ posts, activeCategory }: JournalPageContentProps) {
  const { t } = useLanguage()

  const categoryLabels: Record<(typeof CATEGORY_VALUES)[number], string> = {
    All: t.journal.categories.all,
    Atelier: t.journal.categories.atelier,
    Thoughts: t.journal.categories.thoughts,
    Teaching: t.journal.categories.teaching,
    Exhibitions: t.journal.categories.exhibitions,
    Works: t.journal.categories.works,
  }

  return (
    <>
      <div className="section-gutter pt-32 md:pt-36 pb-10 border-b border-canvas-deep">
        <h1
          className="font-serif font-light text-ink"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', letterSpacing: '0.10em' }}
        >
          {t.nav.journal}
        </h1>
        <p className="text-gallery-meta mt-3">{t.journal.subtitle}</p>
      </div>

      {/* Category filter */}
      <div className="section-gutter py-5 flex flex-wrap gap-4 md:gap-6 border-b border-canvas-deep">
        {CATEGORY_VALUES.map((cat) => (
          <Link
            key={cat}
            href={cat === 'All' ? '/journal' : `/journal?category=${cat}`}
            className={`text-label whitespace-nowrap transition-colors duration-150 ${
              activeCategory === cat ? 'text-ink' : 'text-ink/40 hover:text-ink/80'
            }`}
          >
            {categoryLabels[cat]}
          </Link>
        ))}
      </div>

      {/* Posts list — editorial layout */}
      <div className="section-gutter py-12 md:py-16">
        <div className="flex flex-col divide-y divide-canvas-deep">
          {posts.length === 0 ? (
            <p className="text-gallery-meta py-16 text-center">{t.journal.noResults}</p>
          ) : (
            posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/journal/${post.slug}`}
                className={`group grid md:grid-cols-12 gap-6 md:gap-10 items-start ${
                  i === 0 ? 'pb-10 md:pb-14' : 'py-10 md:py-14'
                }`}
              >
                {/* Cover image */}
                <div className="md:col-span-4 relative overflow-hidden bg-canvas-warm aspect-[4/3]">
                  <Image
                    src={post.coverImage.src}
                    alt={post.coverImage.alt}
                    fill
                    quality={75}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                  />
                </div>

                {/* Text */}
                <div className="md:col-span-8 flex flex-col justify-center">
                  <p className="text-label text-ink/40 mb-3">
                    {post.category} · {formatDate(post.publishedAt)}
                  </p>
                  <h2
                    className="font-serif font-light text-ink mb-4 group-hover:opacity-70 transition-opacity duration-200"
                    style={{
                      fontSize: 'clamp(1.25rem, 2.8vw, 2rem)',
                      letterSpacing: '0.03em',
                      lineHeight: '1.2',
                    }}
                  >
                    {post.title}
                  </h2>
                  <p className="text-gallery-meta leading-relaxed line-clamp-3 max-w-xl">
                    {post.excerpt}
                  </p>
                  <p className="text-label text-ink/40 mt-5 group-hover:text-ink transition-colors duration-200">
                    {t.journal.readMore}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  )
}
