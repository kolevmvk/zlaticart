# 03 — Mapiranje na postojeći Sanity content model

Ova app **ne uvodi nove tipove dokumenata**. Sve što čita/piše mapira se 1:1 na postojeće šeme u `/Volumes/KoleOPS/zlaticart/sanity/schemas/`. Ako se šema promeni na web strani, ovaj dokument treba osvežiti u istom koraku.

Puna paritetnost sa Studio-om (vidi [`02-PRODUCT_SPEC.md`](02-PRODUCT_SPEC.md)) znači da **svaki** tip dokumenta ispod ima svoju sekciju u app-u — nema više razlike između "MVP" i "van obima" tipova.

| Sanity tip | Fajl šeme | App sekcija | Polja pokrivena u app-u |
|---|---|---|---|
| `artwork` | `artwork.ts` | Radovi | sva: `title`, `slug` (auto), `status`, `year`, `medium` (ref), `dimensions`, `primaryImage`+`alt`, `detailImages`, `shortDescription`, `story` (rich text), `featured`, `featuredOrder`, `heroCandidate`, `instagramUrl` |
| `medium` | `medium.ts` | Tehnike | sva: `title`, `slug`, `description`, `motionLanguage`, `order` — app kreira nove, ne samo bira postojeće (potrebno jer je referenca na `artwork.medium`) |
| `journalPost` | `journalPost.ts` | Dnevnik | sva: `title`, `slug`, `excerpt`, `publishedAt`, `category`, `coverImage`, `body` (rich text sa slikama), `relatedArtworks` (ref, multi), `instagramUrl` |
| `exhibition` | `exhibition.ts` | Izložbe | sva: `title`, `venue`, `city`, `startDate`, `endDate`, `status`, `description`, `images` (multi), `externalUrl` |
| `artistProfile` | `artistProfile.ts` | O meni | sva: `name`, `roleLine`, `portrait`, `atelierImages`, `shortBio`, `biography` (rich text), `artistStatement`, `educationStatement`, `location` — jedan dokument, nema listu |
| `educationItem` | `educationItem.ts` | Edukacija | sva: `title`, `type`, `date`, `description`, `images` (multi), `featured` |
| `socialItem` | `socialItem.ts` | Social objave | sva: `platform`, `externalUrl`, `image`, `captionExcerpt`, `publishedAt`, `featured` |
| `siteSettings` | `siteSettings.ts` | Podešavanja | sva: `siteTitle`, `siteDescription`, `heroArtwork` (ref — vidi napomenu), `featuredArtworks` (ref, multi), `featuredJournalPosts` (ref, multi), `instagramProfileUrl`/`instagramConnectionStatus`, `facebookProfileUrl`/`facebookConnectionStatus`, `contactEmail`, `contactEnabled` |

## Napomena: `siteSettings.heroArtwork`

Ovo polje je trenutno **mrtvo/neiskorišćeno** na web strani — sajt stvarno bira naslovni rad preko `artwork.heroCandidate`, ne preko ovog polja (vidi `docs/STATUS.md` u glavnom projektu, update 8). App ga i dalje prikazuje (puna paritetnost sa Studio-om znači da se ne krije nijedno postojeće polje), ali sa kratkim objašnjenjem u UI-ju da trenutno nema efekta na sajtu, dok se ne razreši na web strani. Ne treba ga app-om "popraviti" mimo web koda — vidi [`08-OPEN_QUESTIONS.md`](08-OPEN_QUESTIONS.md).

## Pravila konzistentnosti

- **Slug generisanje**: `artwork`, `journalPost` i `medium` slugovi se generišu isto kao u Studio-u (iz `title`, preko Sanity-jevog standardnog slugify pravila) — app ne izmišlja sopstvenu logiku.
- **Validacija**: obavezna polja u app formama ostaju obavezna (npr. `primaryImage.alt`, `title`, `status` na `artwork`) — app ne sme sačuvati dokument koji bi bio nevalidan u Studio-u.
- **Reference polja**: `medium` (na artwork), `relatedArtworks` (na journalPost), `heroArtwork`/`featuredArtworks`/`featuredJournalPosts` (na siteSettings) — biraju se iz postojećih dokumenata preko GROQ upita, ne slobodnim tekstom. Jedini izuzetak je `medium` sekcija sama — tamo se nove tehnike kreiraju direktno.
- **Nepoznata/nova polja**: ako se šema u glavnom projektu proširi posle početka rada na app-u, app to polje jednostavno ne prikazuje dok se ne doda — Sanity `patch` mutacije su parcijalne, pa se ne gube postojeće vrednosti tog polja niti se ruši dokument.

**Zašto:** app je namerno tanji klijent nad istim izvorom istine — puna paritetnost polja ne znači paralelnu logiku; svaka nova validacija ili generisanje koje se razlikuje od Studio-a bi vremenom proizvelo nekonzistentne dokumente između web i mobilnog puta izmene.
