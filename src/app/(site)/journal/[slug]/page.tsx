import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navigation from '@/components/nav/Navigation'
import SiteFooter from '@/components/nav/SiteFooter'
import JournalArticleContent from './JournalArticleContent'
import { getJournalPostBySlug, getAllJournalPosts, getArtworkBySlug, getSiteSettings } from '@/lib/content/api'
import type { Artwork } from '@/lib/content/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getAllJournalPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getJournalPostBySlug(slug)
  if (!post) return { title: 'Entry not found' }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      publishedTime: post.publishedAt,
      images: [{ url: post.coverImage.src }],
    },
  }
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params
  const [post, settings] = await Promise.all([
    getJournalPostBySlug(slug),
    getSiteSettings(),
  ])

  if (!post) notFound()

  const relatedArtworks = await Promise.all(
    (post.relatedArtworkSlugs ?? []).map((s) => getArtworkBySlug(s))
  ).then((results) => results.filter((a): a is Artwork => Boolean(a)))

  return (
    <>
      <Navigation />
      <main className="min-h-svh bg-canvas">
        <JournalArticleContent post={post} relatedArtworks={relatedArtworks} />
        <SiteFooter
          instagramUrl={settings.instagramProfileUrl ?? null}
          facebookUrl={settings.facebookProfileUrl ?? null}
          email={settings.contactEmail ?? null}
        />
      </main>
    </>
  )
}
