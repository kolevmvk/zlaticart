export type Locale = 'sr' | 'en'

export const translations = {
  sr: {
    nav: {
      works: 'Radovi',
      journal: 'Dnevnik',
      about: 'O meni',
      education: 'Edukacija',
      exhibitions: 'Izložbe',
      contact: 'Kontakt',
      studio: 'Atelje',
    },
    hero: {
      tagline: 'Slikarka · Pedagog · Umetnica',
      cta: 'Istraži radove',
    },
    works: {
      heading: 'Odabrani radovi',
      viewAll: 'Svi radovi →',
      eyebrow: 'Radovi, 2024',
      medium: 'Tehnika',
      year: 'Godina',
      dimensions: 'Dimenzije',
      untitled: 'Bez naziva',
      previous: 'Prethodni',
      next: 'Sledeći',
      viewInstagram: 'Pogledaj na Instagramu →',
      filter: {
        all: 'Sve',
      },
    },
    journal: {
      heading: 'Iz dnevnika',
      readMore: 'Čitaj dalje →',
      eyebrow: 'Dnevnik',
    },
    artist: {
      eyebrow: 'Umetnica',
      readMore: 'Saznaj više →',
    },
    media: {
      heading: 'Kroz medije',
      eyebrow: 'Praksa',
      viewAll: 'Svi radovi →',
    },
    education: {
      heading: 'Nastava kao praksa',
      eyebrow: 'Umetnost i edukacija',
      cta: 'Umetnost i edukacija →',
      placeholder: '[Privremeni tekst — izjava o pedagoškoj praksi i filozofiji.]',
    },
    exhibitions: {
      heading: 'Izložbe',
      viewAll: 'Kompletna istorija →',
      past: 'Prošlo',
      current: 'Trenutno',
      upcoming: 'Predstojeće',
      comingSoon: '[Istorija izložbi uskoro — sadržaj potvrđuje Zlatica.]',
    },
    studio: {
      eyebrow: 'Iz ateljea',
      heading: 'Atelje',
      instagram: 'Prati na Instagramu →',
    },
    footer: {
      tagline: 'Slikarka · Pedagog · Umetnica',
      rights: (year: number) => `© ${year} Zlatica. Sva prava zadržana.`,
    },
    about: {
      heading: 'O Zlatici',
    },
    contact: {
      heading: 'Kontakt',
    },
    pages: {
      education: 'Nastava kao praksa',
      exhibitions: 'Istorija izložbi',
    },
  },

  en: {
    nav: {
      works: 'Works',
      journal: 'Journal',
      about: 'About',
      education: 'Education',
      exhibitions: 'Exhibitions',
      contact: 'Contact',
      studio: 'Studio',
    },
    hero: {
      tagline: 'Painter · Educator · Artist',
      cta: 'Explore works',
    },
    works: {
      heading: 'Selected Works',
      viewAll: 'All works →',
      eyebrow: 'Works, 2024',
      medium: 'Medium',
      year: 'Year',
      dimensions: 'Dimensions',
      untitled: 'Untitled',
      previous: 'Previous',
      next: 'Next',
      viewInstagram: 'View on Instagram →',
      filter: {
        all: 'All',
      },
    },
    journal: {
      heading: 'From the Journal',
      readMore: 'Read more →',
      eyebrow: 'Journal',
    },
    artist: {
      eyebrow: 'The Artist',
      readMore: 'Read more →',
    },
    media: {
      heading: 'Across Media',
      eyebrow: 'Practice',
      viewAll: 'All works →',
    },
    education: {
      heading: 'Teaching as a Form of Practice',
      eyebrow: 'Art & Education',
      cta: 'Art & Education →',
      placeholder: '[Placeholder — teaching philosophy statement from Zlatica.]',
    },
    exhibitions: {
      heading: 'Exhibitions',
      viewAll: 'Full history →',
      past: 'Past',
      current: 'On View',
      upcoming: 'Upcoming',
      comingSoon: '[Exhibition history coming soon — content to be confirmed with Zlatica.]',
    },
    studio: {
      eyebrow: 'From the Studio',
      heading: 'The Atelier',
      instagram: 'Follow on Instagram →',
    },
    footer: {
      tagline: 'Painter · Educator · Artist',
      rights: (year: number) => `© ${year} Zlatica. All rights reserved.`,
    },
    about: {
      heading: 'About Zlatica',
    },
    contact: {
      heading: 'Contact',
    },
    pages: {
      education: 'Teaching as Practice',
      exhibitions: 'Exhibition History',
    },
  },
} as const

export type Translations = {
  nav: { works: string; journal: string; about: string; education: string; exhibitions: string; contact: string; studio: string }
  hero: { tagline: string; cta: string }
  works: { heading: string; viewAll: string; eyebrow: string; medium: string; year: string; dimensions: string; untitled: string; previous: string; next: string; viewInstagram: string; filter: { all: string } }
  journal: { heading: string; readMore: string; eyebrow: string }
  artist: { eyebrow: string; readMore: string }
  media: { heading: string; eyebrow: string; viewAll: string }
  education: { heading: string; eyebrow: string; cta: string; placeholder: string }
  exhibitions: { heading: string; viewAll: string; past: string; current: string; upcoming: string; comingSoon: string }
  studio: { eyebrow: string; heading: string; instagram: string }
  footer: { tagline: string; rights: (year: number) => string }
  about: { heading: string }
  contact: { heading: string }
  pages: { education: string; exhibitions: string }
}
