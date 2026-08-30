import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'medium',
  title: 'Tehnika',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Naziv', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'slug', title: 'Slug (adresa u URL-u)', type: 'slug', options: { source: 'title' }, validation: (R) => R.required() }),
    defineField({ name: 'description', title: 'Opis', type: 'text', rows: 2 }),
    defineField({
      name: 'motionLanguage',
      title: 'Vizuelni jezik animacije',
      type: 'string',
      options: { list: ['oil', 'watercolor', 'line', 'mosaic', 'neutral'] },
    }),
    defineField({ name: 'order', title: 'Redosled', type: 'number' }),
  ],
  orderings: [{ title: 'Redosled', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
})
