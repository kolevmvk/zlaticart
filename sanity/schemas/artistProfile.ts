import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'artistProfile',
  title: 'O meni',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Ime', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'roleLine', title: 'Podnaslov (npr. Slikarka · Edukator)', type: 'string' }),
    defineField({
      name: 'portrait',
      title: 'Portret',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Opis slike (alt tekst)', type: 'string' })],
    }),
    defineField({
      name: 'atelierImages',
      title: 'Fotografije iz ateljea',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', title: 'Opis slike (alt tekst)', type: 'string' }] }],
    }),
    defineField({ name: 'shortBio', title: 'Kratka biografija', type: 'text', rows: 3 }),
    defineField({ name: 'biography', title: 'Puna biografija', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'artistStatement', title: 'Umetnička izjava (statement)', type: 'text', rows: 4 }),
    defineField({ name: 'educationStatement', title: 'O pedagoškom radu', type: 'text', rows: 3 }),
    defineField({ name: 'location', title: 'Lokacija', type: 'string' }),
  ],
})
