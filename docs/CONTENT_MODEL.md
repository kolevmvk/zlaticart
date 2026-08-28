# Content Model

## `artwork`
Fields:
- `title` (required)
- `slug` (required)
- `status` / visibility
- `year`
- `medium` reference
- `dimensions`
- `primaryImage` with alt text and focal point
- `detailImages[]`
- `shortDescription`
- `story` rich text
- `featured` boolean
- `featuredOrder`
- `heroCandidate` boolean
- `mobileFocalPoint`
- `desktopFocalPoint`
- `journalPosts[]` references
- `instagramUrl`
- `instagramPostId`
- SEO/share fields

Never fabricate missing metadata. Unknown values may remain empty.

## `medium`
Examples, provisional until verified:
- Oil on canvas
- Watercolor
- Graphics / print
- Mosaic

Fields:
- `title`
- `slug`
- `description`
- `motionLanguage` enum: oil / watercolor / line / mosaic / neutral
- `order`

## `journalPost`
Fields:
- `title`
- `slug`
- `excerpt`
- `publishedAt`
- `category`: Atelier / Thoughts / Teaching / Exhibitions / Works
- `coverImage`
- `body` rich/portable content
- `relatedArtworks[]`
- `instagramUrl`
- SEO/share fields

## `artistProfile`
Singleton:
- `name`
- `roleLine`
- `portrait`
- `atelierImages[]`
- `shortBio`
- `biography`
- `artistStatement`
- `educationStatement`
- `location`

## `exhibition`
Fields:
- `title`
- `venue`
- `city`
- `startDate`
- `endDate`
- `status`: upcoming / current / past
- `description`
- `images[]`
- `externalUrl`

## `educationItem`
Fields:
- `title`
- `type`: teaching / workshop / student-project / project
- `date`
- `description`
- `images[]`
- `featured`

## `siteSettings`
Singleton:
- `siteTitle`
- `siteDescription`
- `heroArtwork` reference
- `featuredArtworks[]`
- `featuredJournalPosts[]`
- `instagramProfileUrl`
- `facebookProfileUrl`
- `contactEmail`
- `contactEnabled`
- `birthdayMarkEnabled`

## `socialItem` fallback
Used when live Instagram API is unavailable or for deliberate curation.
Fields:
- `platform`: instagram / facebook
- `externalUrl`
- `image`
- `captionExcerpt`
- `publishedAt`
- `featured`

## Data architecture rule
UI components consume normalized domain types from a content/data layer. Do not bind presentation components directly to Sanity query shapes or Meta API response shapes.

Suggested boundaries:
- `lib/content/`
- `lib/social/`
- `types/`

This allows local seed data, CMS content, and social APIs to be swapped without rewriting the UI.
