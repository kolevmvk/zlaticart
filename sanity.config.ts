import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './sanity/schemas'
import { zlaticartStudioTheme } from './sanity/theme'
import { StudioLogo } from './sanity/components/StudioLogo'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'placeholder'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

export default defineConfig({
  name: 'zlaticart',
  title: 'ZlaticArt',
  projectId,
  dataset,
  theme: zlaticartStudioTheme,
  studio: {
    components: {
      logo: StudioLogo,
    },
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('ZlaticArt Studio')
          .items([
            S.documentTypeListItem('artwork').title('Moji radovi'),
            S.documentTypeListItem('medium').title('Tehnike'),
            S.divider(),
            S.documentTypeListItem('journalPost').title('Dnevnik / Blog'),
            S.divider(),
            S.documentTypeListItem('exhibition').title('Izložbe'),
            S.documentTypeListItem('educationItem').title('Edukacija'),
            S.divider(),
            S.documentTypeListItem('socialItem').title('Objave'),
            S.divider(),
            S.documentTypeListItem('artistProfile').title('O meni'),
            S.documentTypeListItem('siteSettings').title('Podešavanja'),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
  basePath: '/admin',
})
