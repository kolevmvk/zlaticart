import type { Artwork, JournalPost, ArtistProfile, Exhibition, SiteSettings, Medium } from './types'

// SEED DATA — provisional content until Sanity CMS is connected.
// Artwork titles, biography, and exhibition details are PLACEHOLDER only.
// Do not treat any titles, dates, or metadata here as factually verified.

export const MEDIA: Record<string, Medium> = {
  oil: {
    title: 'Oil on Canvas',
    slug: 'oil',
    description: 'Oil painting on canvas',
    motionLanguage: 'oil',
    order: 1,
  },
  acrylic: {
    title: 'Acrylic',
    slug: 'acrylic',
    description: 'Acrylic on canvas',
    motionLanguage: 'oil',
    order: 2,
  },
  watercolor: {
    title: 'Watercolor',
    slug: 'watercolor',
    description: 'Watercolor on paper',
    motionLanguage: 'watercolor',
    order: 3,
  },
  graphics: {
    title: 'Graphics / Print',
    slug: 'graphics',
    description: 'Graphic works and print',
    motionLanguage: 'line',
    order: 4,
  },
  mosaic: {
    title: 'Mosaic',
    slug: 'mosaic',
    description: 'Mosaic work',
    motionLanguage: 'mosaic',
    order: 5,
  },
}

export const ARTWORKS: Artwork[] = [
  {
    id: 'work-01',
    title: '[Title to be confirmed]',
    slug: 'untitled-oil-01',
    status: 'published',
    year: undefined,
    medium: MEDIA.oil,
    dimensions: undefined,
    primaryImage: {
      src: '/assets/works/oil/up2.jpg',
      alt: 'Abstract oil painting by Zlatica',
      width: 2009,
      height: 2015,
      desktopFocalPoint: { x: 0.5, y: 0.4 },
      mobileFocalPoint: { x: 0.5, y: 0.35 },
    },
    shortDescription: undefined,
    featured: true,
    featuredOrder: 1,
    heroCandidate: true,
  },
  {
    id: 'work-02',
    title: '[Title to be confirmed]',
    slug: 'untitled-oil-02',
    status: 'published',
    year: undefined,
    medium: MEDIA.oil,
    dimensions: undefined,
    primaryImage: {
      src: '/assets/works/oil/up5.jpg',
      alt: 'Abstract oil painting by Zlatica',
      width: 2012,
      height: 2015,
      desktopFocalPoint: { x: 0.5, y: 0.5 },
      mobileFocalPoint: { x: 0.5, y: 0.5 },
    },
    featured: true,
    featuredOrder: 2,
    heroCandidate: true,
  },
  {
    id: 'work-03',
    title: '[Title to be confirmed]',
    slug: 'untitled-oil-03',
    status: 'published',
    year: undefined,
    medium: MEDIA.oil,
    dimensions: undefined,
    primaryImage: {
      src: '/assets/works/oil/up4.jpg',
      alt: 'Oil painting by Zlatica',
      width: 1440,
      height: 1080,
    },
    featured: true,
    featuredOrder: 3,
    heroCandidate: false,
  },
  {
    id: 'work-04',
    title: '[Title to be confirmed]',
    slug: 'untitled-acrylic-01',
    status: 'published',
    year: undefined,
    medium: MEDIA.acrylic,
    dimensions: undefined,
    primaryImage: {
      src: '/assets/works/acrylic/ak1.jpg',
      alt: 'Acrylic painting by Zlatica',
      width: 705,
      height: 960,
    },
    featured: true,
    featuredOrder: 4,
    heroCandidate: false,
  },
  {
    id: 'work-05',
    title: '[Title to be confirmed]',
    slug: 'untitled-acrylic-02',
    status: 'published',
    year: undefined,
    medium: MEDIA.acrylic,
    dimensions: undefined,
    primaryImage: {
      src: '/assets/works/acrylic/ak2.jpg',
      alt: 'Acrylic painting by Zlatica',
      width: 657,
      height: 960,
    },
    featured: false,
    heroCandidate: false,
  },
  {
    id: 'work-06',
    title: '[Title to be confirmed]',
    slug: 'untitled-watercolor-01',
    status: 'published',
    year: undefined,
    medium: MEDIA.watercolor,
    dimensions: undefined,
    primaryImage: {
      src: '/assets/works/watercolor/vt1.jpg',
      alt: 'Watercolor by Zlatica',
      width: 960,
      height: 960,
    },
    featured: true,
    featuredOrder: 5,
    heroCandidate: false,
  },
  {
    id: 'work-07',
    title: '[Title to be confirmed]',
    slug: 'untitled-graphics-01',
    status: 'published',
    year: undefined,
    medium: MEDIA.graphics,
    dimensions: undefined,
    primaryImage: {
      src: '/assets/works/graphics/gr1.jpg',
      alt: 'Graphic work by Zlatica',
      width: 720,
      height: 960,
    },
    featured: true,
    featuredOrder: 6,
    heroCandidate: false,
  },
  {
    id: 'work-08',
    title: '[Title to be confirmed]',
    slug: 'untitled-mosaic-01',
    status: 'published',
    year: undefined,
    medium: MEDIA.mosaic,
    dimensions: undefined,
    primaryImage: {
      src: '/assets/works/mosaic/mz1.jpg',
      alt: 'Mosaic by Zlatica',
      width: 497,
      height: 720,
    },
    featured: true,
    featuredOrder: 7,
    heroCandidate: false,
  },
]

export const JOURNAL_POSTS: JournalPost[] = [
  {
    id: 'post-01',
    title: 'On Returning to the Canvas',
    slug: 'on-returning-to-the-canvas',
    excerpt: 'Every new canvas is an invitation — and a provocation. The blank surface holds all possibilities and refuses every shortcut.',
    publishedAt: '2026-05-12',
    category: 'Atelier',
    coverImage: {
      src: '/assets/works/oil/up1.jpg',
      alt: 'Studio detail',
      width: 1440,
      height: 1080,
    },
    body: `[Placeholder — awaiting final text from Zlatica]\n\nThis is seed content for the Journal section. Real posts will be authored in the CMS.`,
    relatedArtworkSlugs: ['untitled-oil-01'],
  },
  {
    id: 'post-02',
    title: 'Teaching as Practice',
    slug: 'teaching-as-practice',
    excerpt: 'When I teach, I paint in reverse — starting from the result and dissolving back toward the gesture that made it.',
    publishedAt: '2026-03-28',
    category: 'Teaching',
    coverImage: {
      src: '/assets/artist-archive/zlatica-archive-03-color.webp',
      alt: 'Zlatica at work',
      width: 566,
      height: 700,
    },
    body: `[Placeholder — awaiting final text from Zlatica]\n\nThis is seed content for the Journal section.`,
  },
  {
    id: 'post-03',
    title: 'Watercolor and Resistance',
    slug: 'watercolor-and-resistance',
    excerpt: 'Watercolor demands surrender. You cannot force it — you can only guide it, and sometimes step aside entirely.',
    publishedAt: '2026-01-15',
    category: 'Works',
    coverImage: {
      src: '/assets/works/watercolor/vt1.jpg',
      alt: 'Watercolor in progress',
      width: 960,
      height: 960,
    },
    body: `[Placeholder — awaiting final text from Zlatica]\n\nThis is seed content for the Journal section.`,
    relatedArtworkSlugs: ['untitled-watercolor-01'],
  },
]

export const ARTIST_PROFILE: ArtistProfile = {
  name: 'Zlatica',
  roleLine: 'Painter · Educator · Artist',
  portrait: {
    src: '/assets/artist-archive/zlatica-archive-02.webp',
    alt: 'Zlatica — portrait',
    width: 700,
    height: 692,
  },
  atelierImages: [
    { src: '/assets/artist-archive/zlatica-archive-02.webp', alt: 'Zlatica in the atelier', width: 700, height: 692 },
    { src: '/assets/artist-archive/zlatica-archive-03-color.webp', alt: 'Zlatica at work', width: 566, height: 700 },
    { src: '/assets/artist-archive/zlatica-archive-04.webp', alt: 'Studio moment', width: 700, height: 651 },
  ],
  shortBio: '[Awaiting final biography from Zlatica] — Painter working in oil, acrylic, watercolor, and mixed media. Art-school educator.',
  biography: undefined,
  artistStatement: undefined,
  educationStatement: undefined,
  location: undefined,
}

export const EXHIBITIONS: Exhibition[] = [
  // Placeholder — verified exhibition history to be supplied
]

export const SITE_SETTINGS: SiteSettings = {
  siteTitle: 'Zlatica — Painter · Educator · Artist',
  siteDescription:
    'The digital home of Zlatica\'s artistic practice: abstract painter and art-school educator.',
  heroArtworkSlug: 'untitled-oil-01',
  featuredArtworkSlugs: [
    'untitled-oil-01',
    'untitled-oil-02',
    'untitled-oil-03',
    'untitled-acrylic-01',
    'untitled-watercolor-01',
    'untitled-graphics-01',
  ],
  featuredJournalSlugs: ['on-returning-to-the-canvas', 'teaching-as-practice', 'watercolor-and-resistance'],
  instagramProfileUrl: null, // PLACEHOLDER — supply verified URL
  facebookProfileUrl: null, // PLACEHOLDER — supply verified URL
  contactEmail: null, // PLACEHOLDER — supply email
  contactEnabled: false,
}

// Convenience accessors
export function getArtworkBySlug(slug: string): Artwork | undefined {
  return ARTWORKS.find((a) => a.slug === slug)
}

export function getFeaturedArtworks(): Artwork[] {
  return ARTWORKS
    .filter((a) => a.featured && a.status === 'published')
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99))
}

export function getArtworksByMedium(mediumSlug: string): Artwork[] {
  return ARTWORKS.filter((a) => a.medium.slug === mediumSlug && a.status === 'published')
}

export function getJournalPostBySlug(slug: string): JournalPost | undefined {
  return JOURNAL_POSTS.find((p) => p.slug === slug)
}

export function getFeaturedJournalPosts(): JournalPost[] {
  return SITE_SETTINGS.featuredJournalSlugs
    .map((s) => JOURNAL_POSTS.find((p) => p.slug === s))
    .filter((p): p is JournalPost => Boolean(p))
}

export function getHeroArtwork(): Artwork {
  return getArtworkBySlug(SITE_SETTINGS.heroArtworkSlug) ?? ARTWORKS[0]
}
