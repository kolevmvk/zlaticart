# Codex — kompletan admin u Android aplikaciji (paritet sa Sanity Studio-om)

Datum predaje: 2026-09-13. Predaje: Claude. Vlasnik je odobrio zadatak.

## Zadatak vlasnika

Aplikacija `addmin-app/` mora da ima **sve opcije koje ima admin panel** (Sanity Studio na `/admin`), ne samo dodavanje i uređivanje rada. Sadašnja verzija (0.2.0) ume samo Radove i vlasnik je s pravom nezadovoljan. Implementiraj, ne pravi novu analizu. Pitaj vlasnika samo za stvarno nedostupan pristup ili nepovratnu odluku.

## Pre rada

1. Pročitaj `AGENTS.md`/`CODEX.md`, `addmin-app/docs/11-LIVE_PLAN.md` (posebno „Tačan sledeći korak“ i dnevnik 2026-09-13), poslednje zapise `addmin-app/STATUS.md`, `.agents/skills/zlaticart-mobile-design/SKILL.md` i po potrebi `zlaticart-parallel-delivery`.
2. `git fetch`; radna grana `docs/admin-live-plan`. `main` menja samo vlasnik merge-om PR-a. PR #2 (ispravka odjave + release alat) možda još čeka merge — proveri `gh pr view 2`.
3. Posle svakog smislenog koraka ažuriraj `11-LIVE_PLAN.md` i `STATUS.md` (status, dokaz, sledeći korak). Nikad ne upisuj PIN, tokene, ključeve, lozinke.

## Šta postoji i provereno je na produkciji

- Next.js na Vercel-u, domen `https://www.zlaticart.com`. Vercel **Production** ima `SUPABASE_SECRET_KEY`, `SANITY_API_WRITE_TOKEN` (Editor), `ADMIN_SESSION_SECRET`, `ADMIN_PIN_HASH`. **Preview okruženje nema admin tajne** — admin API radi samo na produkciji, a na nju ide samo merge u `main` (radi vlasnik).
- Supabase projekat `eujssgievuvtasvhqqcw`, šema `zlaticart`, već u Integrations → Data API → Exposed schemas. Migracija `admin_auth_store` primenjena. **Pouka:** u zasebnoj šemi `service_role` zaobilazi RLS ali NE i GRANT-ove — svaka nova tabela/funkcija mora eksplicitno `grant ... to service_role`.
- Sanity projekat `qm16j7ru`, dataset `production`.
- Admin API (`src/app/api/admin/*`, `src/lib/admin-api/*`): PIN prijava sa deljenim limiterom, evidentirane/opozive sesije, namenski preview token, upload (≤4 MB, provera bajtova), Radovi sa pravim Sanity nacrtima (`drafts.<id>`), atomska objava sa `ifRevisionID`, spajanje verzija (`hasDraft`, `revision`), 409 za zastarelu formu. Model i testovi: `artwork-drafts.ts`, `artwork-mutation.test.cjs`.
- `addmin-app/scripts/prod-drafts-smoke.sh` na produkciji: ceo tok nacrt → objava → izmena → pregled → objava → arhiviranje PROŠAO. Odjava je jednom pala na prolaznom Supabase 504 — ispravka (retry + 503 + log) je u PR #2.
- Android release: `scripts/build-release-apk.sh` + `plugins/withReleaseSigning.cjs`, verzija 0.2.0/versionCode 2, potpis trajnim ključem vlasnika, instaliran na Xiaomi M2007J3SG (Android 12). Uputstvo `docs/14-ANDROID_RELEASE.md`. Lozinka ključa je samo u `~/.gradle/gradle.properties` na Linux mašini — ne čitaj taj fajl.

## Kritično otkriće — pročitaj pre bilo kakve objave

**Sanity dataset je prazan**: 0 radova, 0 tehnika, 0 dnevnika, 0 izložbi, 0 profila, 0 podešavanja. Javni sajt prikazuje seed iz `src/lib/content/seed.ts` (8 radova sa pravim fotografijama u `public/assets/works/`, 5 tehnika, ostalo). `src/lib/content/api.ts` prelazi na Sanity **čim postoji i jedan objavljen dokument** tog tipa — jedna objava iz aplikacije sakrila bi sav seed sadržaj tog tipa sa sajta. Zato: **ne objavljuj ništa na produkciji dok seed nije uvezen u Sanity (S5 uvoz ide pre prve stvarne upotrebe)**. Na produkciji postoji arhiviran probni rad `artwork-proba17893144645816` — obrisati.

Ne izmišljaj naslove, datume, dimenzije, biografiju ni izložbe. Seed naslovi su placeholder („Untitled“) i tako se uvoze, jasno označeni; Zlatica ih menja u aplikaciji. Seed koji nije stvaran (npr. biografija/izložbe ako su izmišljeni) ne uvozi kao objavljen — proveri komentare u `seed.ts`/`api.ts`.

## Obim: sve iz Studio-a

Izvor istine su `sanity/schemas/*.ts` i struktura u `sanity.config.ts`. Svih 8 tipova, svako polje:

| Tip | Studio naziv | Polja (obavezna*) |
|---|---|---|
| `artwork` | Moji radovi | title*, slug*, status* (published/draft/archived), year, medium→ref, dimensions, primaryImage*(+alt*, hotspot), detailImages[] (+alt), shortDescription, story (block), featured, featuredOrder, heroCandidate, instagramUrl |
| `medium` | Tehnike | title*, slug*, description, motionLanguage (oil/watercolor/line/mosaic/neutral), order |
| `journalPost` | Dnevnik / Blog | title*, slug*, excerpt, publishedAt* (date), category (Atelier/Thoughts/Teaching/Exhibitions/Works), coverImage(+alt), body (block + image), relatedArtworks[]→ref, instagramUrl |
| `exhibition` | Izložbe | title*, venue*, city, startDate*, endDate, status* (upcoming/current/past), description, images[](+alt), externalUrl |
| `educationItem` | Edukacija | title*, type* (teaching/workshop/student-project/project), date (string), description, images[](+alt), featured |
| `socialItem` | Objave | platform* (instagram/facebook), externalUrl*, image(+alt), captionExcerpt, publishedAt, featured |
| `artistProfile` | O meni (singleton) | name*, roleLine, portrait(+alt), atelierImages[](+alt), shortBio, biography (block), artistStatement, educationStatement, location |
| `siteSettings` | Podešavanja (singleton) | siteTitle, siteDescription, heroArtwork→ref, featuredArtworks[]→ref, featuredJournalPosts[]→ref, instagramProfileUrl, instagramConnectionStatus (manual/pending/connected), facebookProfileUrl, facebookConnectionStatus, contactEmail, contactEnabled; `socialConnectionGuide` je samo prikaz uputstva |

Plus **Poruke** (P9): upiti iz kontakt forme i porudžbine (Supabase `zlaticart.contact_submissions`, `zlaticart.commission_requests`) — lista, detalj, odgovor preko mejl aplikacije (`mailto:` sa primaocem i naslovom). Proveri da li su te migracije primenjene na produkciji i da li `service_role` ima GRANT; ako nisu, pripremi migraciju i traži od vlasnika primenu (kao `admin_auth_store`).

Operacije kao u Studio-u: lista sa pretragom i statusom (objavljeno / nacrt / neobjavljene izmene), novi dokument, uređivanje, Sačuvaj nacrt, Pregledaj (gde sajt ima stranicu: rad, dnevnik), Objavi, **Odbaci nacrt**, **Obriši** (sa potvrdom i proverom referenci — ne ostavljati polomljene reference). Singletoni se otvaraju direktno, bez liste.

## Preporučena arhitektura

- **Server, jedan opis polja po tipu** (npr. `src/lib/admin-api/content-types.ts`): tip, srpski nazivi, singleton, polja (vrsta, obavezno, opcije, cilj reference), polje za listu/sliku, redosled. Test koji učitava `sanity/schemas` (stub `defineType`/`defineField`) i pada kad se opis razlikuje od šeme.
- **Generički content API** (npr. `/api/admin/content/[type]`, `/[id]`, `/[id]/publish`, `/[id]/discard`, DELETE) koji generalizuje postojeći model nacrta iz `artwork-drafts.ts`: `drafts.<id>`, atomska objava sa revizijama, `baseRevision` → 409, validacija svake vrste polja na čuvanju i obaveznih polja na objavi, zadržavanje nepoznatih polja, `_key` u nizovima, crop/hotspot slika. Za `artwork` vidljivost ostaje polje `status` (objava postavlja `published`). Postojeće `/api/admin/artworks*` rute ostaju zbog instaliranog APK-a 0.2.0.
- **Opis polja servira server** (`/api/admin/content/schema`), da nova polja ne traže novi APK.
- **Mobilno**: početni ekran sa svim sekcijama; generička lista i forma koje crtaju polja iz opisa, ali sa jasnom validacijom i srpskim porukama. Komponente: tekst, višelinijski tekst, broj, prekidač, izbor, datum (native picker), link, slug (auto iz naslova, izmenjiv), slika (+alt), galerija (dodaj/ukloni/redosled, alt po slici), referenca i lista referenci (izbor iz postojećih), editor bogatog teksta.
- **Bogat tekst (Portable Text)**: pasus, H2/H3, citat, liste, bold/italic, link; slike u telu dnevnika. Konverzija PT ↔ mobilni model na serveru, sa testovima povratnog puta; blok sa nepodržanim oznakama ne sme tiho da izgubi sadržaj (prikaži ga zaštićeno ili sačuvaj netaknut).
- Pregled dnevnika: proširi preview token (`type`) i `journal/[slug]` stranicu po uzoru na `works/[slug]` (nacrt samo uz cookie i aktivnu sesiju, `previewDrafts` preko serverskog klijenta). Javni klijent mora ostati `perspective: 'published'`.

Odstupanje od skill preporuke (univerzalna forma) je odobreno i zabeleženo u dnevniku odluka 2026-09-13; kompenzuj eksplicitnom validacijom po tipu.

## Redosled isporuke

- **S1** — opis polja + generički content API + testovi (lažni dataset kao u `artwork-mutation.test.cjs`: 409, `ifRevisionID`, atomske transakcije).
- **S2** — mobilna navigacija svih sekcija, generička lista i forma za sve vrste polja osim bogatog teksta; singletoni.
- **S3** — editor bogatog teksta (biografija, priča o radu, dnevnik) + pregled dnevnika.
- **S4** — Poruke.
- **S5** — uvoz seed sadržaja u Sanity (skripta kroz admin API, PIN unosi vlasnik skriveno kao u `prod-drafts-smoke.sh`; iste adrese/slugove; bez izmišljanja), ispravka fonta (Cormorant Garamond na Androidu odvaja dijakritike: „došli“, „vaše“ — tekst je ispravan U+0161, problem je font/render), podizanje verzije, `build-release-apk.sh`, instalacija na telefon, test po `skills/verification-checklist.md`.

Svaki slice: root `npm run typecheck`, `npm run lint`, `node --test src/lib/admin-api/*.test.cjs`, build (`NEXT_PUBLIC_SANITY_PROJECT_ID=qm16j7ru npm run build`), u `addmin-app` `npm run typecheck`/`lint` (Node 22: `source ~/.nvm/nvm.sh && nvm use 22`). Zatim PR u `main` sa jasnim opisom; merge radi vlasnik; posle deploy-a smoke na produkciji. QA fixture (`scripts/qa-fixture.cjs`) proširi za emulator/telefon.

## Mašine i uređaj

- Linux: `/media/ellkolle/kolle-ellco/zlaticart`, Android SDK `~/Android/Sdk`, JDK 17, release ključ i gradle.properties su ovde; telefon povezan preko USB (`adb devices`).
- Mac mini `milankolev@100.74.134.3` (Tailscale): repo `/Volumes/KoleOPS/zlaticart`, Vercel CLI, kopija ključa (bez gradle.properties).

## Gotovo znači

Zlatica na telefonu, bez računara, može da uradi sve što može u Studio-u za svih 8 tipova i da čita poruke; seed sadržaj je u Sanity-ju i sajt izgleda isto ili bolje; proveren tok na fizičkom telefonu i na sajtu; plan i STATUS odgovaraju proverenom stanju.
