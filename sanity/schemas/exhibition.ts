import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'exhibition',
  title: 'Izložba',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Naziv', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'venue', title: 'Mesto održavanja (galerija/prostor)', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'city', title: 'Grad', type: 'string' }),
    defineField({ name: 'startDate', title: 'Datum početka', type: 'date', validation: (R) => R.required() }),
    defineField({ name: 'endDate', title: 'Datum završetka', type: 'date' }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Predstoji', value: 'upcoming' },
          { title: 'Trenutno traje', value: 'current' },
          { title: 'Prošla', value: 'past' },
        ],
        layout: 'radio',
      },
      initialValue: 'past',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'description', title: 'Opis', type: 'text', rows: 3 }),
    defineField({
      name: 'images',
      title: 'Fotografije',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', title: 'Opis slike (alt tekst)', type: 'string' }] }],
    }),
    defineField({ name: 'externalUrl', title: 'Spoljni link', type: 'url' }),
  ],
  orderings: [{ title: 'Najnovije prvo', name: 'startDateDesc', by: [{ field: 'startDate', direction: 'desc' }] }],
})
