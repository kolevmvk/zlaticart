import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'socialItem',
  title: 'Social Item',
  type: 'document',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: { list: ['instagram', 'facebook'], layout: 'radio' },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'externalUrl', title: 'External URL', type: 'url', validation: (R) => R.required() }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'captionExcerpt', title: 'Caption Excerpt', type: 'text', rows: 2 }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'date' }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
  ],
  orderings: [{ title: 'Newest First', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
})
