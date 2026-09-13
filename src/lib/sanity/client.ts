import { createClient } from 'next-sanity'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  // Javni sajt nikad ne sme da vidi `drafts.*`, cak ni kad je read token postavljen.
  perspective: 'published',
  token: process.env.SANITY_API_READ_TOKEN,
})
