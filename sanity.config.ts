import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './sanity/schemas'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'placeholder'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

export default defineConfig({
  name: 'zlaticart',
  title: 'ZlaticArt',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.documentTypeListItem('artwork').title('Artworks'),
            S.documentTypeListItem('medium').title('Media'),
            S.divider(),
            S.documentTypeListItem('journalPost').title('Journal Posts'),
            S.divider(),
            S.documentTypeListItem('exhibition').title('Exhibitions'),
            S.documentTypeListItem('educationItem').title('Education Items'),
            S.divider(),
            S.documentTypeListItem('socialItem').title('Social Items'),
            S.divider(),
            S.documentTypeListItem('artistProfile').title('Artist Profile'),
            S.documentTypeListItem('siteSettings').title('Site Settings'),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
  basePath: '/admin',
})
