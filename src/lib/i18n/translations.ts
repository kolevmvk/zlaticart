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
      privacy: 'Privatnost',
      legalInfo: 'Autorska prava i uslovi korišćenja',
    },
    commission: {
      navLabel: 'Naruči rad',
      heading: 'Naruči custom rad',
      intro:
        'Zainteresovani ste za sliku rađenu po meri? Opišite šta zamišljate — format, tehniku, okvirni budžet — i javićemo se sa predlogom i rokom izrade.',
      form: {
        name: 'Ime i prezime',
        email: 'Email',
        format: 'Format / dimenzije',
        formatPlaceholder: 'npr. 60×80 cm, portret, pejzaž…',
        technique: 'Tehnika',
        techniquePlaceholder: 'npr. ulje na platnu, akril, akvarel…',
        budget: 'Okvirni cenovni raspon',
        budgetPlaceholder: 'npr. 100–200 €',
        description: 'Opis onoga što zamišljate',
        descriptionPlaceholder: 'Motiv, boje, inspiracija, prostor u kom će slika stajati…',
        sending: 'Slanje…',
        send: 'Pošalji upit',
        success: 'Hvala — vaš upit je poslat. Javićemo se uskoro na navedeni email.',
      },
    },
    legal: {
      privacy: {
        title: 'Privatnost',
        updated: 'Poslednje ažurirano: avgust 2026.',
        intro:
          'Ova stranica objašnjava koji se podaci prikupljaju na zlaticart.com sajtu, zašto, i koje tehnologije sajt koristi. Cilj je da bude jasno i bez pravnog žargona.',
        sections: [
          {
            heading: 'Šta ovaj sajt ne radi',
            body: 'Sajt ne koristi kolačiće za praćenje, analitiku (npr. Google Analytics) niti oglašivačke mreže. Ne postoji profilisanje posetilaca niti prodaja/deljenje podataka trećim stranama u marketinške svrhe.',
          },
          {
            heading: 'Podaci koje unosite sami',
            body: 'Kada pošaljete poruku preko Kontakt forme ili upit za custom izradu, unosite ime, email i sadržaj poruke (i, kod upita za izradu, format/tehniku/budžet koje navedete). Ti podaci se čuvaju isključivo radi odgovora na vaš upit, u bazi (Supabase) kojoj pristup ima samo vlasnica sajta.',
          },
          {
            heading: 'Tehničke informacije',
            body: 'Sadržaj sajta (radovi, tekstovi, fotografije) se učitava preko Sanity CMS platforme. Sajt je hostovan na Vercel infrastrukturi, koja iz tehničkih razloga (bezbednost, sprečavanje zloupotrebe) može privremeno beležiti standardne server-log podatke (IP adresa, vreme pristupa) — ti podaci se ne koriste za identifikaciju posetilaca niti se ukrštaju sa formama koje popunite.',
          },
          {
            heading: 'Vaša prava',
            body: 'Možete zatražiti uvid, izmenu ili brisanje podataka koje ste poslali putem formi na sajtu — javite se na kontakt email naveden na Kontakt strani.',
          },
        ],
      },
      terms: {
        title: 'Autorska prava i uslovi korišćenja',
        updated: 'Poslednje ažurirano: avgust 2026.',
        intro: 'Pravila korišćenja sadržaja objavljenog na zlaticart.com sajtu.',
        sections: [
          {
            heading: 'Autorska prava na radove',
            body: 'Sve slike, fotografije umetničkih radova i tekstovi objavljeni na ovom sajtu autorsko su delo i vlasništvo Zlatice, osim gde je izričito drugačije navedeno. Nije dozvoljeno kopiranje, reprodukovanje, štampanje ili komercijalno korišćenje ovog sadržaja bez prethodne pisane saglasnosti.',
          },
          {
            heading: 'Izrada sajta',
            body: 'Dizajn, kod i vizuelni efekti sajta razvijeni su za potrebe ZlaticArt brenda. Preuzimanje ili kopiranje strukture, dizajna ili programskog koda sajta u celini ili delovima nije dozvoljeno bez odobrenja.',
          },
          {
            heading: 'Korišćenje sajta',
            body: 'Sadržaj sajta je namenjen ličnom, nekomercijalnom pregledu. Automatizovano preuzimanje sadržaja (scraping), pokušaji neovlašćenog pristupa ili ometanje rada sajta nisu dozvoljeni.',
          },
          {
            heading: 'Prijava problema',
            body: 'Ako primetite tehnički problem, netačan sadržaj ili smatrate da su vaša prava povređena, javite se na kontakt email naveden na Kontakt strani.',
          },
        ],
      },
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
      privacy: 'Privacy',
      legalInfo: 'Copyright & Terms of Use',
    },
    commission: {
      navLabel: 'Commission a piece',
      heading: 'Commission a custom piece',
      intro:
        "Interested in a made-to-order painting? Describe what you have in mind — format, technique, rough budget — and we'll follow up with a proposal and timeline.",
      form: {
        name: 'Full name',
        email: 'Email',
        format: 'Format / dimensions',
        formatPlaceholder: 'e.g. 60×80 cm, portrait, landscape…',
        technique: 'Technique',
        techniquePlaceholder: 'e.g. oil on canvas, acrylic, watercolor…',
        budget: 'Rough price range',
        budgetPlaceholder: 'e.g. €100–200',
        description: 'Describe what you have in mind',
        descriptionPlaceholder: 'Subject, colours, inspiration, where the piece will hang…',
        sending: 'Sending…',
        send: 'Send inquiry',
        success: "Thank you — your inquiry has been sent. We'll follow up at the email you provided.",
      },
    },
    legal: {
      privacy: {
        title: 'Privacy',
        updated: 'Last updated: August 2026.',
        intro:
          'This page explains what data zlaticart.com collects, why, and which technologies the site uses — kept plain, without legal jargon.',
        sections: [
          {
            heading: 'What this site does not do',
            body: 'This site does not use tracking cookies, analytics (e.g. Google Analytics), or advertising networks. There is no visitor profiling, and no data is sold or shared with third parties for marketing purposes.',
          },
          {
            heading: 'Data you provide yourself',
            body: "When you send a message through the Contact form or a custom-artwork inquiry, you provide your name, email, and message content (and, for commission inquiries, whatever format/technique/budget you enter). That data is stored solely to respond to your inquiry, in a database (Supabase) accessible only to the site's owner.",
          },
          {
            heading: 'Technical information',
            body: 'Site content (artworks, text, photos) is served via the Sanity CMS platform. The site is hosted on Vercel infrastructure, which may briefly log standard server data (IP address, access time) for technical reasons such as security and abuse prevention — this data is not used to identify visitors and is never cross-referenced with anything you submit through a form.',
          },
          {
            heading: 'Your rights',
            body: 'You may request access to, correction of, or deletion of any data you submitted through a form on this site — reach out via the contact email listed on the Contact page.',
          },
        ],
      },
      terms: {
        title: 'Copyright & Terms of Use',
        updated: 'Last updated: August 2026.',
        intro: 'Rules governing the use of content published on zlaticart.com.',
        sections: [
          {
            heading: 'Copyright in the artworks',
            body: "All paintings, artwork photography, and text published on this site are the copyrighted work and property of Zlatica, unless explicitly stated otherwise. Copying, reproducing, printing, or commercially using this content without prior written consent is not permitted.",
          },
          {
            heading: 'Site build',
            body: "The site's design, code, and visual effects were developed for the ZlaticArt brand. Copying or reproducing the site's structure, design, or source code, in whole or in part, is not permitted without permission.",
          },
          {
            heading: 'Use of this site',
            body: "Site content is intended for personal, non-commercial viewing. Automated content scraping, unauthorized access attempts, or interference with the site's operation are not permitted.",
          },
          {
            heading: 'Reporting an issue',
            body: 'If you notice a technical problem, inaccurate content, or believe your rights have been infringed, please reach out via the contact email listed on the Contact page.',
          },
        ],
      },
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
  footer: { tagline: string; rights: (year: number) => string; privacy: string; legalInfo: string }
  commission: {
    navLabel: string
    heading: string
    intro: string
    form: {
      name: string
      email: string
      format: string
      formatPlaceholder: string
      technique: string
      techniquePlaceholder: string
      budget: string
      budgetPlaceholder: string
      description: string
      descriptionPlaceholder: string
      sending: string
      send: string
      success: string
    }
  }
  legal: {
    privacy: {
      title: string
      updated: string
      intro: string
      sections: readonly { heading: string; body: string }[]
    }
    terms: {
      title: string
      updated: string
      intro: string
      sections: readonly { heading: string; body: string }[]
    }
  }
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
