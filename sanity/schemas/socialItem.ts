import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'socialItem',
  title: 'Objava',
  type: 'document',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platforma',
      type: 'string',
      options: {
        list: [
          { title: 'Instagram', value: 'instagram' },
          { title: 'Facebook', value: 'facebook' },
        ],
        layout: 'radio',
      },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'externalUrl', title: 'Link ka objavi', type: 'url', validation: (R) => R.required() }),
    defineField({
      name: 'image',
      title: 'Fotografija',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Opis slike (alt tekst)', type: 'string' })],
    }),
    defineField({ name: 'captionExcerpt', title: 'Izvod iz opisa', type: 'text', rows: 2 }),
    defineField({ name: 'publishedAt', title: 'Datum objave', type: 'date' }),
    defineField({ name: 'featured', title: 'Izdvojeno', type: 'boolean', initialValue: false }),
  ],
  orderings: [{ title: 'Najnovije prvo', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
})
