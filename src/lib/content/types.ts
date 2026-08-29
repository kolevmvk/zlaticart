export type MediumSlug = 'oil' | 'acrylic' | 'watercolor' | 'graphics' | 'mosaic' | 'other'

export interface Medium {
  title: string
  slug: MediumSlug
  description?: string
  motionLanguage: 'oil' | 'watercolor' | 'line' | 'mosaic' | 'neutral'
  order: number
}

export interface FocalPoint {
  x: number // 0-1
  y: number // 0-1
}

export interface Artwork {
  id: string
  title: string
  slug: string
  status: 'published' | 'draft' | 'archived'
  year?: number
  medium: Medium
  dimensions?: string
  primaryImage: {
    src: string
    alt: string
    width: number
    height: number
    desktopFocalPoint?: FocalPoint
    mobileFocalPoint?: FocalPoint
  }
  detailImages?: Array<{ src: string; alt: string; width: number; height: number }>
  shortDescription?: string
  story?: string
  featured: boolean
  featuredOrder?: number
  heroCandidate: boolean
  journalSlugs?: string[]
  instagramUrl?: string
}

export interface JournalPost {
  id: string
  title: string
  slug: string
  excerpt: string
  publishedAt: string // ISO date string
  category: 'Atelier' | 'Thoughts' | 'Teaching' | 'Exhibitions' | 'Works'
  coverImage: {
    src: string
    alt: string
    width: number
    height: number
  }
  body: string // placeholder rich text as markdown string until CMS
  relatedArtworkSlugs?: string[]
  instagramUrl?: string
}

export interface ArtistProfile {
  name: string
  roleLine: string
  portrait: { src: string; alt: string; width: number; height: number }
  atelierImages?: Array<{ src: string; alt: string; width: number; height: number }>
  shortBio: string
  biography?: string
  artistStatement?: string
  educationStatement?: string
  location?: string
}

export interface Exhibition {
  id: string
  title: string
  venue: string
  city: string
  startDate: string
  endDate?: string
  status: 'upcoming' | 'current' | 'past'
  description?: string
  externalUrl?: string
}

export interface EducationItem {
  id: string
  title: string
  type: 'teaching' | 'workshop' | 'student-project' | 'project'
  date?: string
  description?: string
  images?: Array<{ src: string; alt: string; width: number; height: number }>
  featured: boolean
}

export interface SiteSettings {
  siteTitle: string
  siteDescription: string
  heroArtworkSlug: string
  featuredArtworkSlugs: string[]
  featuredJournalSlugs: string[]
  instagramProfileUrl: string | null
  facebookProfileUrl: string | null
  contactEmail: string | null
  contactEnabled: boolean
}
