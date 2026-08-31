# 01 — Ideja

## Problem

Zlatica trenutno upravlja sadržajem sajta isključivo kroz Sanity Studio na `zlaticart.com/admin` — web-only, desktop-orijentisan editor sa formama, tab-navigacijom i punom šemom svih polja odjednom. To je snažan alat, ali:

- Nezgodan je na telefonu (Studio nije dizajniran kao mobile-first admin iskustvo).
- Traži da se sedne za računar da bi se, na primer, dodala jedna nova fotografija sa izložbe iste večeri, ili ispravio datum izložbe koja počinje sutra.
- Puna Sanity Studio šema izlaže polja i opcije koje nisu deo svakodnevnog rada (npr. `featuredOrder`, `motionLanguage`, statusi konekcije za Instagram/Facebook) — kognitivno opterećenje za nekoga ko nije developer.

## Ideja

Mobilna aplikacija — **ZlaticArt Admin** — koja pokriva **sve** što danas može web Sanity Studio, samo pojednostavljeno za telefon: svaki tip sadržaja (radovi, dnevnik, izložbe, biografija, edukacija, tehnike, social feed, podešavanja sajta) je dostupan za pregled, izmenu, kreiranje i objavu iz app-a. Cilj nije "lakša podskupina Studio-a" nego **puna zamena** za svakodnevnu upotrebu — Zlatica ne treba nikad da mora da sedne za računar da bi nešto promenila na sajtu.

Dodatno, uz svaku izmenu: mogućnost da se **pregleda kako će stranica izgledati na sajtu pre nego što se objavi** (draft/preview pregled), ne samo forma sa poljima — vidi [`06-SCREENS.md`](06-SCREENS.md) i preview mehanizam u [`04-ARCHITECTURE.md`](04-ARCHITECTURE.md).

## Za koga

Jedan korisnik: Zlatica sama, admin/vlasnik sadržaja. Nema tima, nema uloga (rola), nema odobravanja (approval flow) — jedan nalog, puna kontrola, potpuna zamena za web `/admin` u svakodnevnoj upotrebi.

## Platforme i distribucija

- **Android je primarna platforma** — prva verzija koju Zlatica stvarno koristi, instalirana direktno na njen telefon (APK fajl poslat i instaliran ručno — "sideload" — bez Google Play prodavnice u prvoj fazi).
- **iOS se gradi paralelno, kao model/dokaz koncepta za budućnost** — isti kod (React Native/Expo je cross-platform po prirodi, pa iOS build dolazi "besplatno" uz Android rad), ali u prvoj fazi se ne objavljuje na App Store — vidi ograničenja iOS sideload-a u [`07-ROADMAP.md`](07-ROADMAP.md) i [`08-OPEN_QUESTIONS.md`](08-OPEN_QUESTIONS.md) (iOS instalacija van App Store-a ima tehnička ograničenja koja Android sideload nema).
- Store objavljivanje (Google Play / Apple App Store) je moguć **kasniji** korak, ne preduslov za prvu upotrebljivu verziju.

## Šta ova app NIJE

- Nije javna app za posetioce/kupce — to je uloga postojećeg web sajta.
- Nije novi CMS ni novi izvor podataka — čita/piše u isti Sanity dataset.
- Nije multi-user alat sa permisijama — jedan admin nalog.
- Nije redizajn sadržajnog modela — koristi postojeće Sanity šeme iz `sanity/schemas/` bez izmena (osim ako se u toku razvoja pokaže potreba, vidi [`08-OPEN_QUESTIONS.md`](08-OPEN_QUESTIONS.md)).

**Zašto:** puna paritetnost sa Studio-om znači da app postaje jedini alat koji je Zlatici zaista potreban dan za danom — web `/admin` ostaje kao rezervni/napredni pristup, ne kao mesto gde se "mora" ići za pola funkcija.
