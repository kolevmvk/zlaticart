import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'exhibition',
  title: 'Exhibition',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'venue', title: 'Venue', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'city', title: 'City', type: 'string' }),
    defineField({ name: 'startDate', title: 'Start Date', type: 'date', validation: (R) => R.required() }),
    defineField({ name: 'endDate', title: 'End Date', type: 'date' }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['upcoming', 'current', 'past'], layout: 'radio' },
      initialValue: 'past',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', title: 'Alt text', type: 'string' }] }],
    }),
    defineField({ name: 'externalUrl', title: 'External URL', type: 'url' }),
  ],
  orderings: [{ title: 'Newest First', name: 'startDateDesc', by: [{ field: 'startDate', direction: 'desc' }] }],
})
