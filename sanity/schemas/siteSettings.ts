import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'siteTitle', title: 'Site Title', type: 'string' }),
    defineField({ name: 'siteDescription', title: 'Site Description', type: 'text', rows: 2 }),
    defineField({ name: 'heroArtwork', title: 'Hero Artwork', type: 'reference', to: [{ type: 'artwork' }] }),
    defineField({ name: 'featuredArtworks', title: 'Featured Artworks', type: 'array', of: [{ type: 'reference', to: [{ type: 'artwork' }] }] }),
    defineField({ name: 'featuredJournalPosts', title: 'Featured Journal Posts', type: 'array', of: [{ type: 'reference', to: [{ type: 'journalPost' }] }] }),
    defineField({ name: 'instagramProfileUrl', title: 'Instagram Profile URL', type: 'url' }),
    defineField({ name: 'facebookProfileUrl', title: 'Facebook Profile URL', type: 'url' }),
    defineField({ name: 'contactEmail', title: 'Contact Email', type: 'string' }),
    defineField({ name: 'contactEnabled', title: 'Contact Form Enabled', type: 'boolean', initialValue: false }),
  ],
})
