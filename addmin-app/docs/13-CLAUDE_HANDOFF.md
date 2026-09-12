# Claude — dovrši ZlaticArt Android admin

Datum predaje: 2026-09-12.

## Zadatak vlasnika

Nastavi implementaciju, ne pravi novu analizu ili novi plan. Prvo isporuči samostalnu Android aplikaciju za Radove sa stvarnim podacima na produkcionom HTTPS serveru. Potom dovrši ostale module po P7–P13. Vlasnik je odobrio nastavak rada i produkcionu integraciju. Za rutinske implementacione odluke ne traži novu potvrdu. Pitaj samo za stvarno nedostupan pristup, podatak ili nepovratnu odluku koju postojeće odobrenje ne pokriva. Komuniciraj kratko, sa rezultatima.

Ovaj fajl je predaja konteksta, ne zamena za zajednički plan. Status ažuriraj u `11-LIVE_PLAN.md` i `../STATUS.md`: REALIZOVANO / U TOKU / IZMENJENO / ODBAČENO / BLOKIRANO, uz dokaz provere i sledeći korak.

## Repozitorijum i početak

- Repo: `/Volumes/KoleOPS/zlaticart` (malo slovo z).
- Grana: `docs/admin-live-plan`; ne menjaj main.
- Origin: `https://github.com/kolevmvk/zlaticart.git`.
- Poslednji push: `3a0ab32` — stroga validacija sesijskih tokena.
- Prethodni: `31b1192` — integrisani mobilni ekrani, test APK skripte i QA dokazi.
- Proveri `git status` pre rada. Pri predaji nema izmena praćenih fajlova. Ostali su lokalni `graphify-out/.graphify_python`, `graphify-out/.graphify_root`, `supabase/.temp/` i PRAZNA `supabase/migrations/20260911175539_admin_auth_store.sql`. Migracija nije implementirana niti primenjena; ne tretiraj je kao završenu.
- Pročitaj root AGENTS.md, admin CODEX.md, `11-LIVE_PLAN.md`, poslednje zapise STATUS.md i dokument aktivne etape. Ne ponavljaj već završenu analizu celog projekta.

## Šta stvarno postoji

Expo/React Native aplikacija je u `addmin-app/`, Next.js API u `src/app/api/admin/`, serverska logika u `src/lib/admin-api/`.

Završeni su zajednički UI tokeni/kontrole, dashboard, lista sa pretragom/filterima, login, forma, upozorenje za nesačuvane izmene i potvrda čuvanja. API podržava alt-only izmenu, uklanjanje tehnike preko null, validaciju objave, proveru tipa dokumenta i revizioni konflikt. JWT sada strogo proverava strukturu, zaglavlje i vreme važenja.

Poslednje potvrđene provere: root typecheck/lint, mobilni typecheck/lint, 10 izolovanih serverskih testova. Android 35 emulator proverio je fixture login, dashboard, dirty Back, čuvanje naziva/alt/tehnike, povratak na listu i restart. Veći tekst proveravan je samo na dashboardu.

**To nije dokaz produkcione spremnosti.** Nisu završeni pravi Sanity nacrti, kompletna zaštita prijave, stvarni preview/publish tok ni kompletan fizički Android QA.

## Izvrši ovim redom

### 1. P5 — serverska zaštita i sesije

Pregledaj `src/lib/admin-api/auth.ts`, login/logout rute, preview-link rutu, `/api/preview`, `/api/preview/disable` i `src/lib/content/api.ts`.

- Implementiraj deljeni, atomski limiter pokušaja PIN-a koji radi kroz više serverskih instanci. In-memory Map nije dovoljan za Vercel.
- Uvedi serverski evidentirane sesije i opoziv pri logout-u; opozvani token mora odmah prestati da radi.
- Predviđen je privatni Supabase store sa pristupom samo sa servera. Dovrši migraciju, ograniči privilegije i proveri ponašanje kada store nije dostupan. Greška store-a ne sme da otvori pristup.
- Preview sada koristi sesijski token u URL-u: zameni ga kratkotrajnim namenskim tokenom ograničenim na konkretan rad. Ograniči i naknadno čitanje draft sadržaja, ne samo početni redirect.
- Ako verifikacija postane async, uskladi i await-uj sve pozive.
- Na mobilnom delu obradi timeout, mrežnu grešku i istek sesije bez tihog gubitka forme; proveri upload retry.

Proizvod: implementacija i testovi lockout-a, opoziva, isteka, nedostupnog store-a i preview izolacije. Postojeći JWT test nije zamena za ove provere.

### 2. P3 — pravi Sanity nacrti

Pregledaj `src/lib/admin-api/sanity.ts`, `artwork-mutation.ts`, API ugovor, `addmin-app/app/works/` i ArtworkForm.

- Trenutno čuvanje sa statusom draft može menjati javni dokument: to mora da se ispravi pre stvarne upotrebe.
- Koristi zaseban `drafts.<id>` dokument. Čuvanje izmena objavljenog rada ne menja njegovu javnu verziju.
- Lista ne sme duplirati javnu i draft verziju; detalj učitava nacrt ako postoji. Ugovori eksplicitno razlikuju javni status i postojanje nacrta.
- Pregled prvo sačuva nacrt pa prikazuje upravo te izmene. Trenutno dugme prikazuje samo sačuvanu verziju i blokirano je dok forma ima izmene.
- Objava validira dokument, atomski objavljuje nacrt i uklanja samo pripadajuću draft verziju. Zaštiti paralelne izmene revizijom. Arhiviranje ima eksplicitnu semantiku.
- Sačuvaj nepoznata polja, image crop/hotspot i postojeće reference.

Proizvod: novi i postojeći rad prolaze nacrt → pregled → objava, bez promene javne verzije pre objave, bez duplikata i bez prepisivanja konkurentne izmene. Prvo izolovani testovi; za proveru na stvarnom dataset-u ne menjaj postojeće umetničke radove naslepo.

### 3. Produkcioni server i APK — P6

Ranije otkrivena konfiguracija, OBAVEZNO ponovo proveriti trenutno stanje:

- Vercel CLI je pronalazio projekat `zlaticart`, scope `ellkolles-projects`, project id `prj_av4030xKe2L8OMeV1Oe3q04BokzC`. Repo koristi `.vercel/repo.json`; MCP lista nije bila pouzdana za ovaj projekat.
- Produkcioni env je imao javnu konfiguraciju, ali nisu bili potvrđeni admin secrets, Sanity server tokeni i Supabase service role. Ne pretpostavljaj da su u produkciji zato što postoje lokalno.
- Sanity: project `qm16j7ru`, dataset `production`.
- Supabase iz lokalne konfiguracije: `eujssgievuvtasvhqqcw` / `kolevmvk-platform`, schema `zlaticart`. Bio je neaktivan; restore zahtev vratio je success, ali dostupnost posle toga nije potvrđena. Ne koristi druge projekte iz naloga.
- Lokalni admin PIN hash/session secret potiču iz test podešavanja; ne promoviši ih nekritički. Nijednu tajnu ne ispisuj u chat, dokumentaciju, git ili APK. Nedostajući produkcioni pristup obezbedi sigurnim kanalom.

Posle završenih P3/P5: proveri konfiguraciju i migracije, izgradi i proveri server, deploy u postojeći projekat, potvrdi stabilan HTTPS domen i endpoint-e. Zatim izgradi APK sa tim URL-om. Pripremi trajni signing ključ, rezervnu kopiju i jasan put instalacije/ažuriranja; debug potpis nije konačna isporuka.

Postojeći APK je **samo testni**:
`addmin-app/android/app/build/outputs/apk/internalTest/app-internalTest.apk`
Paket `com.zlaticart.admin.test`, API `http://127.0.0.1:4317`, zahteva fixture server i adb reverse. Nije namenjen stvarnim podacima ili radu van računara. Build skripta je `addmin-app/scripts/build-internal-apk.sh`; Expo plugin `addmin-app/plugins/withInternalTest.cjs`. Dokazi i ograničenja: `12-ANDROID_TEST.md`, `qa/2026-09-11/`.

Proizvod: APK koji radi bez Metro-a i računara, sa stvarnim API-jem preko Wi-Fi i mobilnog interneta. Proveri login → fotografija → nacrt → pregled → objava → izmena → javni sajt, pa restart, logout/opoziv, slabu mrežu i istek sesije. Ako fizički telefon nije dostupan, jasno označi konkretne neproverene stavke i daj vlasniku kratko uputstvo za taj završni test.

### 4. Dovrši kompletan admin — P7–P13

Po postojećim specifikacijama: Dnevnik, Izložbe, Poruke, O meni/Edukacija/Tehnike/Social, napredna polja Radova, Podešavanja, završna regresija i predaja. Ne proglašavaj kompletan admin završenim kada rade samo Radovi. Instagram automatizacija, push, potpuni offline, biometrija i prodavnice ostaju van dogovorenog obima.

## Dizajn i paralelan rad

Koristi postojeći `.agents/skills/zlaticart-mobile-design/SKILL.md`, ne izmišljaj novi vizuelni sistem. Cilj: čitljivost, velika dodirna polja, dominantne fotografije, jasne status akcije, dobro ponašanje tastature i velikog teksta.

Za nezavisne poslove koristi `.agents/skills/zlaticart-parallel-delivery/SKILL.md`. Moguća podela: auth inženjer (auth/store), CMS inženjer (draft lifecycle), mobilni/QA inženjer (ekrani i mreža). Koordinator prvo dogovara zajedničke ugovore; agenti ne menjaju iste fajlove paralelno. Samo koordinator vodi plan i Git integraciju.

## Komande za proveru

Iz root-a:
```sh
npm run typecheck
npm run lint
node --test src/lib/admin-api/*.test.cjs
npm run build
```
Iz `addmin-app/`:
```sh
npm run typecheck
npm run lint
```

`npm run lint` u root-u koristi `next lint`; direktan ESLint 9 bez konfiguracije nije ekvivalent. Testovi `.cjs` učitavaju stvarni TS kroz postojeći compiler i koriste izolovane zavisnosti.

Na svakom završenom segmentu: proveri, ažuriraj plan/status, napravi smislen commit i push na radnu granu. Završni izveštaj treba da sadrži APK putanju, produkcioni URL, commit, šta je provereno i eventualnu stvarnu blokadu. Ne završavaj samo obećanjem da možeš da nastaviš.
