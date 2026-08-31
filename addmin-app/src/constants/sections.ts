export const ADMIN_SECTIONS = [
  'artworks',
  'journal',
  'exhibitions',
  'artist-profile',
  'education',
  'mediums',
  'social',
  'messages',
  'settings',
] as const

export type AdminSection = (typeof ADMIN_SECTIONS)[number]
