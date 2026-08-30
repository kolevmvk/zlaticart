import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'artwork',
  title: 'Rad',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Naziv', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'slug', title: 'Slug (adresa u URL-u)', type: 'slug', options: { source: 'title' }, validation: (R) => R.required() }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Objavljeno', value: 'published' },
          { title: 'Nacrt', value: 'draft' },
          { title: 'Arhivirano', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'year', title: 'Godina', type: 'number' }),
    defineField({ name: 'medium', title: 'Tehnika', type: 'reference', to: [{ type: 'medium' }] }),
    defineField({ name: 'dimensions', title: 'Dimenzije', type: 'string' }),
    defineField({
      name: 'primaryImage',
      title: 'Fotografija',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Opis slike (alt tekst)', type: 'string', validation: (R) => R.required() })],
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'detailImages',
      title: 'Detaljne fotografije',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', title: 'Opis slike (alt tekst)', type: 'string' }] }],
    }),
    defineField({ name: 'shortDescription', title: 'Kratak opis', type: 'string' }),
    defineField({ name: 'story', title: 'Opis / priča o radu', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'featured', title: 'Izdvojeno', type: 'boolean', initialValue: false }),
    defineField({ name: 'featuredOrder', title: 'Redosled prikaza (izdvojeno)', type: 'number' }),
    defineField({ name: 'heroCandidate', title: 'Naslovni rad (hero)', type: 'boolean', initialValue: false }),
    defineField({ name: 'instagramUrl', title: 'Instagram URL', type: 'url' }),
  ],
  orderings: [{ title: 'Redosled prikaza', name: 'featuredOrderAsc', by: [{ field: 'featuredOrder', direction: 'asc' }] }],
})
