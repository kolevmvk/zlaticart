import { defineField, defineType } from 'sanity'
import { SocialConnectionGuide } from '../components/SocialConnectionGuide'

const SOCIAL_STATUS_OPTIONS = [
  { title: 'Nije povezano — samo ručni link', value: 'manual' },
  { title: 'Napravila sam Professional/Business nalog — čeka se developer', value: 'pending' },
  { title: 'Povezano automatski (API)', value: 'connected' },
]

export default defineType({
  name: 'siteSettings',
  title: 'Podešavanja sajta',
  type: 'document',
  groups: [{ name: 'social', title: 'Instagram i Facebook' }],
  fields: [
    defineField({ name: 'siteTitle', title: 'Naziv sajta', type: 'string' }),
    defineField({ name: 'siteDescription', title: 'Opis sajta', type: 'text', rows: 2 }),
    defineField({ name: 'heroArtwork', title: 'Naslovni rad (početna strana)', type: 'reference', to: [{ type: 'artwork' }] }),
    defineField({ name: 'featuredArtworks', title: 'Izdvojeni radovi', type: 'array', of: [{ type: 'reference', to: [{ type: 'artwork' }] }] }),
    defineField({ name: 'featuredJournalPosts', title: 'Izdvojene objave iz dnevnika', type: 'array', of: [{ type: 'reference', to: [{ type: 'journalPost' }] }] }),
    defineField({
      name: 'socialConnectionGuide',
      title: 'Uputstvo',
      type: 'string',
      group: 'social',
      components: { input: SocialConnectionGuide },
      readOnly: true,
    }),
    defineField({ name: 'instagramProfileUrl', title: 'Instagram profil (link)', type: 'url', group: 'social' }),
    defineField({
      name: 'instagramConnectionStatus',
      title: 'Status — Instagram',
      type: 'string',
      group: 'social',
      options: { list: SOCIAL_STATUS_OPTIONS, layout: 'radio' },
      initialValue: 'manual',
    }),
    defineField({ name: 'facebookProfileUrl', title: 'Facebook profil (link)', type: 'url', group: 'social' }),
    defineField({
      name: 'facebookConnectionStatus',
      title: 'Status — Facebook',
      type: 'string',
      group: 'social',
      options: { list: SOCIAL_STATUS_OPTIONS, layout: 'radio' },
      initialValue: 'manual',
    }),
    defineField({ name: 'contactEmail', title: 'Kontakt email', type: 'string' }),
    defineField({ name: 'contactEnabled', title: 'Kontakt forma uključena', type: 'boolean', initialValue: false }),
  ],
})
