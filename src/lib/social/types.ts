export type SocialPlatform = 'instagram' | 'facebook'

export interface NormalizedSocialPost {
  id: string
  platform: SocialPlatform
  externalUrl: string
  image?: {
    src: string
    alt: string
    width: number
    height: number
  }
  captionExcerpt?: string
  publishedAt?: string
  featured?: boolean
}

export interface SocialFeedResult {
  posts: NormalizedSocialPost[]
  source: 'api' | 'cms' | 'empty'
  profileUrl: string | null
}
