import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'artistProfile',
  title: 'Artist Profile',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'roleLine', title: 'Role Line', type: 'string' }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'atelierImages',
      title: 'Atelier Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', title: 'Alt text', type: 'string' }] }],
    }),
    defineField({ name: 'shortBio', title: 'Short Bio', type: 'text', rows: 3 }),
    defineField({ name: 'biography', title: 'Biography', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'artistStatement', title: 'Artist Statement', type: 'text', rows: 4 }),
    defineField({ name: 'educationStatement', title: 'Education Statement', type: 'text', rows: 3 }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
  ],
})
