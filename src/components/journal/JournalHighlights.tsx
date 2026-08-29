import Image from 'next/image'
import Link from 'next/link'
import type { JournalPost } from '@/lib/content/types'

interface JournalHighlightsProps {
  posts: JournalPost[]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function JournalHighlights({ posts }: JournalHighlightsProps) {
  const [lead, ...secondary] = posts

  return (
    <section className="section-spacing bg-canvas-warm" aria-labelledby="journal-heading">
      <div className="section-gutter">
        <div className="flex items-baseline justify-between mb-12 md:mb-16">
          <h2
            id="journal-heading"
            className="font-serif font-light text-ink"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)', letterSpacing: '0.05em' }}
          >
            Journal
          </h2>
          <Link href="/journal" className="text-label text-ink/50 hover:text-ink transition-colors duration-200 hidden md:block">
            All entries →
          </Link>
        </div>

        <div className="grid md:grid-cols-12 gap-8 md:gap-10 lg:gap-12">
          {/* Lead post */}
          {lead && (
            <Link
              href={`/journal/${lead.slug}`}
              className="group md:col-span-7 block"
            >
              <div className="relative overflow-hidden bg-canvas aspect-[4/3] mb-5">
                <Image
                  src={lead.coverImage.src}
                  alt={lead.coverImage.alt}
                  fill
                  quality={80}
                  sizes="(max-width: 768px) 100vw, 58vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
              <p className="text-label text-ink/40 mb-2">{lead.category} · {formatDate(lead.publishedAt)}</p>
              <h3
                className="font-serif font-light text-ink mb-3 group-hover:opacity-70 transition-opacity duration-200"
                style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.875rem)', lineHeight: '1.2', letterSpacing: '0.02em' }}
              >
                {lead.title}
              </h3>
              <p className="text-gallery-meta leading-relaxed line-clamp-3">{lead.excerpt}</p>
            </Link>
          )}

          {/* Secondary posts */}
          <div className="md:col-span-5 flex flex-col gap-8 md:gap-10">
            {secondary.slice(0, 2).map((post) => (
              <Link key={post.id} href={`/journal/${post.slug}`} className="group flex gap-5">
                <div className="relative flex-shrink-0 overflow-hidden bg-canvas w-24 h-28 md:w-28 md:h-32">
                  <Image
                    src={post.coverImage.src}
                    alt={post.coverImage.alt}
                    fill
                    quality={75}
                    sizes="120px"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-label text-ink/40 mb-2">{post.category} · {formatDate(post.publishedAt)}</p>
                  <h3
                    className="font-serif font-light text-ink group-hover:opacity-70 transition-opacity duration-200 mb-2"
                    style={{ fontSize: '1.0625rem', lineHeight: '1.3', letterSpacing: '0.02em' }}
                  >
                    {post.title}
                  </h3>
                  <p className="text-gallery-meta line-clamp-2">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 md:hidden">
          <Link href="/journal" className="text-label text-ink/60 hover:text-ink transition-colors duration-200">
            All entries →
          </Link>
        </div>
      </div>
    </section>
  )
}
