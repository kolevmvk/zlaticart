import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'medium',
  title: 'Medium',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (R) => R.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
    defineField({
      name: 'motionLanguage',
      title: 'Motion Language',
      type: 'string',
      options: { list: ['oil', 'watercolor', 'line', 'mosaic', 'neutral'] },
    }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
})
