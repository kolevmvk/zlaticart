import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (R) => R.required() }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['published', 'draft', 'archived'], layout: 'radio' },
      initialValue: 'draft',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'year', title: 'Year', type: 'number' }),
    defineField({ name: 'medium', title: 'Medium', type: 'reference', to: [{ type: 'medium' }] }),
    defineField({ name: 'dimensions', title: 'Dimensions', type: 'string' }),
    defineField({
      name: 'primaryImage',
      title: 'Primary Image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() })],
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'detailImages',
      title: 'Detail Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', title: 'Alt text', type: 'string' }] }],
    }),
    defineField({ name: 'shortDescription', title: 'Short Description', type: 'string' }),
    defineField({ name: 'story', title: 'Story', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'featuredOrder', title: 'Featured Order', type: 'number' }),
    defineField({ name: 'heroCandidate', title: 'Hero Candidate', type: 'boolean', initialValue: false }),
    defineField({ name: 'instagramUrl', title: 'Instagram URL', type: 'url' }),
  ],
  orderings: [{ title: 'Featured Order', name: 'featuredOrderAsc', by: [{ field: 'featuredOrder', direction: 'asc' }] }],
})
