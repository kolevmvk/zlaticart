# 07 — Fazni plan realizacije

Nema fiksnih datuma u ovom dokumentu (van obima ove planske faze) — samo redosled zavisnosti: svaka faza je preduslov za sledeću. Android je platforma na kojoj se svaka faza stvarno testira i prihvata (vidi [`04-ARCHITECTURE.md`](04-ARCHITECTURE.md)); iOS build se pravi paralelno iz istog koda, bez posebnih faza, ali se ne distribuira dok se ne razreši Apple Developer nalog (vidi [`08-OPEN_QUESTIONS.md`](08-OPEN_QUESTIONS.md)).

**Status (2026-09-01):** Faze 0-4 su implementirane i uživo verifikovane (curl + fizički Android telefon). Detaljan trag svake faze — šta je urađeno, kako je provereno, i šta NIJE stiglo do live UI-tap testa na telefonu — u [`STATUS.md`](../STATUS.md). Sledeća faza koja čeka: Faza 5 (Dnevnik).

## Faza 0 — Odluke i priprema ✅
- Razrešiti sva otvorena pitanja iz [`08-OPEN_QUESTIONS.md`](08-OPEN_QUESTIONS.md).
- Podesiti Expo projekat, TypeScript, linting — konzistentno sa konvencijama glavnog `zlaticart` repo-a.
- Definisati i implementirati `admin-api` proxy: `/login`, `/logout`, health-check endpoint. Bez CMS mutacija još.

## Faza 1 — Autentifikacija (walking skeleton) ✅
- PIN login ekran ↔ proxy `/login` ↔ sesijski token u secure storage-u.
- Prazan dashboard posle uspešnog logina, dugme za odjavu.
- Prvi Android sideload build (`.apk` poslat i instaliran ručno na Zlaticin telefon) — cilj: proveriti da instalacija van Play Store-a stvarno radi glatko, pre nego što ima ijedan CMS podatak da se testira.
- Cilj faze: **kompletan, bezbedan auth tok radi end-to-end**, na pravom Android telefonu, pre nego što se dotakne ijedan CMS podatak.

## Faza 2 — Radovi (artwork) — read + status toggle ✅
- Lista radova (GROQ query preko proxy-ja), prikaz statusa.
- Brza promena statusa (nacrt ↔ objavljeno ↔ arhivirano) sa liste, bez pune forme.
- Cilj faze: dokazati da mutacije preko proxy-ja rade pouzdano, na najjednostavnijoj mogućoj mutaciji, pre pune forme sa uploadom slika.

## Faza 3 — Radovi — puna forma + upload fotografije ✅
- Novi rad / izmena postojećeg, sa uploadom glavne fotografije (kompresija preko Sanity Asset API-ja).
- Ovo je najsloženija faza tehnički (image upload flow, Sanity asset pipeline preko proxy-ja) — nosilac rizika za ceo projekat, namerno rano u planu.
- Namerno ograničeno na "Osnovno" polja (vidi `02-PRODUCT_SPEC.md`) — `detailImages` (multi-upload) i `story` (rich text) nisu deo ovog koraka, veće su odvojene komponente.
- Usput otkrivena dva pre-postojeća bug-a na glavnom sajtu koja bi sprečila da ijedan ovako kreiran rad ispravno prikaže na sajtu — ispravljena u istom koraku (vidi STATUS.md 2026-09-01 zapis): `medium` nije bilo obavezno polje ali je sajt pretpostavljao da uvek postoji; `next.config.ts` nikad nije dozvoljavao `cdn.sanity.io` slike.

## Faza 4 — Pregled pre objave (Preview) ✅
- Next.js Draft Mode na glavnom sajtu (`/works/[slug]` prvi dokazani slučaj).
- Preview link izdavanje kroz proxy (`/api/admin/preview-link`), otvaranje u in-app browseru mobilne app-e (`expo-web-browser`).
- Namerno odmah posle Radova (Faza 3), pre nego što se preview treba ponoviti za svaki naredni tip — dokazuje mehanizam jednom, na jednom tipu, pre množenja na ostale.
- `/api/admin/preview-link` i `/api/preview` već primaju `type` parametar (trenutno samo `"artwork"`) — Faza 5 treba samo granu za `journalPost`, ne novu infrastrukturu.

## Faza 5 — Dnevnik (journalPost)
- Lista + forma, rich-text editor sa slikama, multi-select povezanih radova.
- Preview za `/journal/[slug]` (ponovna upotreba mehanizma iz Faze 4).

## Faza 6 — Izložbe (exhibition)
- Lista (grupisana po statusu) + forma sa multi-upload fotografija.
- Najčešći stvarni slučaj upotrebe app-a (fotografije sa otvaranja izložbe iste večeri) — posebna pažnja na UX kod slabog signala.

## Faza 7 — Poruke (Contact & Commission upiti)
- Nova, van originalnog Sanity obima — čita se iz Supabase (`contact_submissions`, `commission_requests`) preko `admin-api` proxy-ja i `service_role` ključa, nikad direktno sa uređaja. Pun opis u [`09-MESSAGES.md`](09-MESSAGES.md).
- Lista poruka/porudžbina + "Odgovori" dugme koje otvara mail app (`mailto:`) — nije in-app chat.
- Relativno nizak tehnički rizik (samo čitanje, jedan novi proxy izvor podataka koji ponovo koristi već dokazan auth/proxy obrazac iz Faze 1) — zato dolazi ovde, ne ranije, ali pre ređe korišćenih CMS tipova u Fazi 8, jer poruke stižu bez najave i vrednost čitanja "sa telefona" je visoka.

## Faza 8 — O meni, Edukacija, Tehnike, Social objave
- Preostala četiri Sanity tipa iz punog obima ([`03-CONTENT_MODEL_MAPPING.md`](03-CONTENT_MODEL_MAPPING.md)): `artistProfile` (jedan dokument, bez liste), `educationItem`, `medium` (uključujući kreiranje novih tehnika), `socialItem`.
- Ovi tipovi su ređe menjani u praksi, zato dolaze kasno uprkos punoj paritetnosti u obimu — redosled realizacije prati učestalost stvarne upotrebe, ne važnost šeme.

## Faza 9 — Podešavanja (siteSettings)
- Sva polja: naziv/opis sajta, izdvojeni sadržaj, kontakt, Instagram/Facebook status.

## Faza 10 — Kaljenje pred širu upotrebu (hardening)
- Rate limiting i lockout na login endpointu (ako nije već u Fazi 1) — probno testiranje.
- Offline/slab-signal QA na svim formama sa uploadom.
- iOS build proveren barem na simulatoru (i na fizičkom uređaju ako je dostupan Apple Developer nalog do ove faze) — vidi [`08-OPEN_QUESTIONS.md`](08-OPEN_QUESTIONS.md).
- Android internal testing (Play Console) ili nastavak sideload distribucije — odluka zavisi od toga da li se ide na javni Play Store.

## Posle ovog plana (van obima MVP-a, samo evidentirano)
- **Instagram objavljivanje i metrike** — odloženo, zavisi od Meta App Review-a (spoljni, nekontrolisan proces). Pun opis, preduslovi i priprema u [`10-FUTURE_INSTAGRAM_METRICS.md`](10-FUTURE_INSTAGRAM_METRICS.md). Ne počinje pre nego što je MVP (Faze 0-10) gotov i preduslov iz tog dokumenta zadovoljen.
- Biometrijsko otključavanje (Face ID/otisak) kao dodatak PIN-u.
- Push notifikacije (npr. podsetnik da nacrt čeka objavu ili da je stigla nova poruka).
- Javno objavljivanje na App Store / Google Play (danas namerno odloženo — vidi [`01-IDEA.md`](01-IDEA.md)).
- Offline draft mode (pisanje bez signala, sinhronizacija kad se poveže).
- Status pročitano/nepročitano na porukama (zahteva izmenu šeme glavnog projekta — vidi opciju B u `09-MESSAGES.md`).

**Zašto ovaj redosled:** Faza 3 (upload fotografije) i Faza 4 (preview) su namerno rano, ne poslednje — najveći tehnički rizik i najviše vrednosti po jedinici rada (jednom dokazan mehanizam, ponovo iskorišćen za sve naredne tipove). Faza 7 (Poruke) je namerno pre ređe korišćenih CMS tipova jer nosi nizak rizik i visoku svakodnevnu vrednost. Instagram objavljivanje/metrike je namerno van MVP roadmap-a u potpunosti — jedina faza u celom projektu čije trajanje ne zavisi od nas.
