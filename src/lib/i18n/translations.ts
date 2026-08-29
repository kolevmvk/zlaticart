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
      galleryPreparing: 'Galerija se priprema.',
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
        oil: 'Ulje na platnu',
        acrylic: 'Akril',
        watercolor: 'Akvarel',
        graphics: 'Grafika / Print',
        mosaic: 'Mozaik',
      },
      noResults: 'Trenutno nema radova u ovoj kategoriji.',
    },
    journal: {
      heading: 'Iz dnevnika',
      readMore: 'Čitaj dalje →',
      eyebrow: 'Dnevnik',
      subtitle: 'Beleške iz ateljea · Razmišljanja · Nastava',
      categories: {
        all: 'Sve',
        atelier: 'Atelje',
        thoughts: 'Razmišljanja',
        teaching: 'Nastava',
        exhibitions: 'Izložbe',
        works: 'Radovi',
      },
      noResults: 'Trenutno nema zapisa u ovoj kategoriji.',
      relatedWorks: 'Povezani radovi',
      backToAll: '← Svi zapisi iz dnevnika',
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
      types: {
        teaching: 'Nastava',
        workshop: 'Radionica',
        studentProject: 'Studentski projekat',
        project: 'Projekat',
      },
      featured: 'Izdvojeno',
      noItems: '[Stavke iz edukacije uskoro — sadržaj se dodaje putem CMS-a.]',
    },
    exhibitions: {
      heading: 'Izložbe',
      viewAll: 'Kompletna istorija →',
      past: 'Prošlo',
      current: 'Trenutno',
      upcoming: 'Predstojeće',
      comingSoon: '[Istorija izložbi uskoro — sadržaj potvrđuje Zlatica.]',
      pastSection: 'Prošle izložbe',
      upcomingAnnounced: '[Predstojeće izložbe biće naknadno objavljene — privremeni sadržaj.]',
      moreInfo: 'Više informacija →',
    },
    studio: {
      eyebrow: 'Iz ateljea',
      heading: 'Atelje',
      instagram: 'Prati na Instagramu →',
      subtitle: 'Iz ateljea — radovi u nastajanju i trenutne aktivnosti.',
      comingSoonTitle: 'Sadržaj sa Instagrama uskoro',
      comingSoonBody: 'Prati Zlaticinu ateljersku praksu direktno na Instagramu.',
      linkComingSoon: 'Link ka Instagramu biće uskoro dodat — svratite kasnije.',
    },
    footer: {
      tagline: 'Slikarka · Pedagog · Umetnica',
      rights: (year: number) => `© ${year} Zlatica. Sva prava zadržana.`,
    },
    about: {
      heading: 'O Zlatici',
      roles: {
        painter: 'Slikarka',
        educator: 'Pedagog',
        artist: 'Umetnica',
      },
      biographyLabel: 'Biografija',
      bioComingSoon: 'Kompletna biografija uskoro.',
      statementLabel: 'Izjava',
      archiveLabel: 'Arhiva',
    },
    contact: {
      heading: 'Kontakt',
      intro: 'Za upite o radovima, izložbama i saradnji — javite se direktno.',
      labels: {
        instagram: 'Instagram',
        facebook: 'Facebook',
        email: 'Email',
      },
      comingSoon: 'Kontakt informacije biće uskoro dodate.',
      form: {
        name: 'Ime',
        email: 'Email',
        message: 'Poruka',
        sending: 'Slanje…',
        send: 'Pošalji poruku',
        success: 'Hvala — vaša poruka je poslata.',
      },
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
      galleryPreparing: 'The gallery is being prepared.',
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
        oil: 'Oil on Canvas',
        acrylic: 'Acrylic',
        watercolor: 'Watercolor',
        graphics: 'Graphics / Print',
        mosaic: 'Mosaic',
      },
      noResults: 'No works in this category yet.',
    },
    journal: {
      heading: 'From the Journal',
      readMore: 'Read more →',
      eyebrow: 'Journal',
      subtitle: 'Studio Notes · Thoughts · Teaching',
      categories: {
        all: 'All',
        atelier: 'Atelier',
        thoughts: 'Thoughts',
        teaching: 'Teaching',
        exhibitions: 'Exhibitions',
        works: 'Works',
      },
      noResults: 'No entries in this category yet.',
      relatedWorks: 'Related Works',
      backToAll: '← All journal entries',
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
      types: {
        teaching: 'Teaching',
        workshop: 'Workshop',
        studentProject: 'Student Project',
        project: 'Project',
      },
      featured: 'Featured',
      noItems: '[No education items yet — content will be added via CMS.]',
    },
    exhibitions: {
      heading: 'Exhibitions',
      viewAll: 'Full history →',
      past: 'Past',
      current: 'On View',
      upcoming: 'Upcoming',
      comingSoon: '[Exhibition history coming soon — content to be confirmed with Zlatica.]',
      pastSection: 'Past Exhibitions',
      upcomingAnnounced: '[Upcoming exhibitions to be announced — placeholder content only]',
      moreInfo: 'More information →',
    },
    studio: {
      eyebrow: 'From the Studio',
      heading: 'The Atelier',
      instagram: 'Follow on Instagram →',
      subtitle: 'From the atelier — works in progress and current activity.',
      comingSoonTitle: 'Instagram content coming soon',
      comingSoonBody: "Follow Zlatica's studio practice directly on Instagram.",
      linkComingSoon: 'Instagram link will be added soon — check back later.',
    },
    footer: {
      tagline: 'Painter · Educator · Artist',
      rights: (year: number) => `© ${year} Zlatica. All rights reserved.`,
    },
    about: {
      heading: 'About Zlatica',
      roles: {
        painter: 'Painter',
        educator: 'Educator',
        artist: 'Artist',
      },
      biographyLabel: 'Biography',
      bioComingSoon: 'Full biography coming soon.',
      statementLabel: 'Statement',
      archiveLabel: 'Archive',
    },
    contact: {
      heading: 'Contact',
      intro: 'For inquiries about works, exhibitions, and collaborations — reach out directly.',
      labels: {
        instagram: 'Instagram',
        facebook: 'Facebook',
        email: 'Email',
      },
      comingSoon: 'Contact information will be added soon.',
      form: {
        name: 'Name',
        email: 'Email',
        message: 'Message',
        sending: 'Sending…',
        send: 'Send message',
        success: 'Thank you — your message has been sent.',
      },
    },
    pages: {
      education: 'Teaching as Practice',
      exhibitions: 'Exhibition History',
    },
  },
} as const

export type Translations = {
  nav: { works: string; journal: string; about: string; education: string; exhibitions: string; contact: string; studio: string }
  hero: { tagline: string; cta: string; galleryPreparing: string }
  works: {
    heading: string
    viewAll: string
    eyebrow: string
    medium: string
    year: string
    dimensions: string
    untitled: string
    previous: string
    next: string
    viewInstagram: string
    filter: { all: string; oil: string; acrylic: string; watercolor: string; graphics: string; mosaic: string }
    noResults: string
  }
  journal: {
    heading: string
    readMore: string
    eyebrow: string
    subtitle: string
    categories: { all: string; atelier: string; thoughts: string; teaching: string; exhibitions: string; works: string }
    noResults: string
    relatedWorks: string
    backToAll: string
  }
  artist: { eyebrow: string; readMore: string }
  media: { heading: string; eyebrow: string; viewAll: string }
  education: {
    heading: string
    eyebrow: string
    cta: string
    placeholder: string
    types: { teaching: string; workshop: string; studentProject: string; project: string }
    featured: string
    noItems: string
  }
  exhibitions: {
    heading: string
    viewAll: string
    past: string
    current: string
    upcoming: string
    comingSoon: string
    pastSection: string
    upcomingAnnounced: string
    moreInfo: string
  }
  studio: {
    eyebrow: string
    heading: string
    instagram: string
    subtitle: string
    comingSoonTitle: string
    comingSoonBody: string
    linkComingSoon: string
  }
  footer: { tagline: string; rights: (year: number) => string }
  about: {
    heading: string
    roles: { painter: string; educator: string; artist: string }
    biographyLabel: string
    bioComingSoon: string
    statementLabel: string
    archiveLabel: string
  }
  contact: {
    heading: string
    intro: string
    labels: { instagram: string; facebook: string; email: string }
    comingSoon: string
    form: { name: string; email: string; message: string; sending: string; send: string; success: string }
  }
  pages: { education: string; exhibitions: string }
}
