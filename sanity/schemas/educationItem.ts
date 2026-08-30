import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'educationItem',
  title: 'Stavka edukacije',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Naziv', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'type',
      title: 'Vrsta',
      type: 'string',
      options: {
        list: [
          { title: 'Podučavanje', value: 'teaching' },
          { title: 'Radionica', value: 'workshop' },
          { title: 'Rad učenika', value: 'student-project' },
          { title: 'Projekat', value: 'project' },
        ],
        layout: 'radio',
      },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'date', title: 'Datum', type: 'string' }),
    defineField({ name: 'description', title: 'Opis', type: 'text', rows: 4 }),
    defineField({
      name: 'images',
      title: 'Fotografije',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', title: 'Opis slike (alt tekst)', type: 'string' }] }],
    }),
    defineField({ name: 'featured', title: 'Izdvojeno', type: 'boolean', initialValue: false }),
  ],
})
