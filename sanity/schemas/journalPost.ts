import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'journalPost',
  title: 'Objava u dnevniku',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Naslov', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'slug', title: 'Slug (adresa u URL-u)', type: 'slug', options: { source: 'title' }, validation: (R) => R.required() }),
    defineField({ name: 'excerpt', title: 'Kratak izvod', type: 'text', rows: 3 }),
    defineField({ name: 'publishedAt', title: 'Datum objave', type: 'date', validation: (R) => R.required() }),
    defineField({
      name: 'category',
      title: 'Kategorija',
      type: 'string',
      options: {
        list: [
          { title: 'Atelje', value: 'Atelier' },
          { title: 'Razmišljanja', value: 'Thoughts' },
          { title: 'Podučavanje', value: 'Teaching' },
          { title: 'Izložbe', value: 'Exhibitions' },
          { title: 'Radovi', value: 'Works' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'coverImage',
      title: 'Naslovna fotografija',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Opis slike (alt tekst)', type: 'string' })],
    }),
    defineField({ name: 'body', title: 'Tekst', type: 'array', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'relatedArtworks', title: 'Povezani radovi', type: 'array', of: [{ type: 'reference', to: [{ type: 'artwork' }] }] }),
    defineField({ name: 'instagramUrl', title: 'Instagram URL', type: 'url' }),
  ],
  orderings: [{ title: 'Najnovije prvo', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
})
