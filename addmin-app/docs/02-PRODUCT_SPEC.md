# 02 — Proizvodna specifikacija

## Korisnički tok (golden path)

1. Zlatica otvara app → unosi PIN/lozinku → ulazi na **Početni ekran** (dashboard).
2. Početni ekran prikazuje prečice ka svim sekcijama sadržaja — plus brzu statistiku (npr. "3 nacrta čekaju objavu", "1 predstojeća izložba").
3. Iz svake sekcije: lista postojećih stavki (sortirane najnovije/najvažnije prvo) + veliko **"+ Novo"** dugme.
4. Forma za novi/izmenjeni unos je **jednostavnija od Studio-a** — ista polja koja Studio nudi, ali sa jasnijim rasporedom, razumnim podrazumevanim vrednostima i grupisanjem "osnovno" vs. "napredno", bez gubljenja funkcionalnosti.
5. Upload fotografije: kamera ili galerija telefona, sa automatskom kompresijom pre slanja.
6. **Pregled pre objave**: sa svake forme, dugme "Pregledaj" otvara tačan izgled te stranice na sajtu — sa unetim/izmenjenim sadržajem, pre nego što je bilo ko drugi vidi. Vidi "Pregled pre objave" ispod.
7. Čuvanje je eksplicitno (dugme "Sačuvaj" / "Objavi"), ne auto-save u pozadini bez povratne informacije.

## Funkcionalni obim — puna paritetnost sa Sanity Studio-om

Sve što danas postoji kao Sanity dokument tip u `sanity/schemas/` ima svoju sekciju u app-u: **Radovi, Dnevnik, Izložbe, O meni (biografija), Edukacija, Tehnike, Social objave, Podešavanja sajta.** Svaka sekcija nudi listu, kreiranje, izmenu i (gde šema ima status) promenu statusa. Nijedno polje iz šeme se ne izostavlja — samo se raspoređuje čitljivije nego u generičkom Studio formu.

### Radovi (artwork)
Sva polja iz šeme: naslov, slug (auto), status, godina, tehnika (referenca), dimenzije, glavna fotografija (+ alt, obavezno), detaljne fotografije (multi-upload), kratak opis, puna priča (rich text), izdvojeno, redosled prikaza kad je izdvojeno, naslovni rad (hero), Instagram URL.

### Dnevnik (journalPost)
Naslov, slug, kratak izvod, datum objave, kategorija, naslovna fotografija, telo teksta (rich text sa slikama), povezani radovi (multi-select referenca), Instagram URL.

### Izložbe (exhibition)
Naziv, mesto, grad, datum početka/kraja, status (predstoji/traje/prošla), opis, fotografije (multi-upload), spoljni link.

### O meni (artistProfile)
Ime, podnaslov, portret, fotografije iz ateljea (multi-upload), kratka biografija, puna biografija (rich text), umetnička izjava, opis pedagoškog rada, lokacija. Jedan dokument (nema liste) — direktno se otvara forma za izmenu.

### Edukacija (educationItem)
Naziv, vrsta (podučavanje/radionica/rad učenika/projekat), datum, opis, fotografije (multi-upload), izdvojeno.

### Tehnike (medium)
Naziv, slug, opis, vizuelni jezik animacije, redosled. Malo se menja, ali dostupno — potrebno je kao referenca za polje "tehnika" na radovima, pa app mora umeti i da kreira novu tehniku, ne samo da je bira sa liste.

### Social objave (socialItem)
Platforma (Instagram/Facebook), link ka objavi, fotografija, izvod iz opisa, datum objave, izdvojeno. Koristi se kao ručni fallback dok Instagram/Facebook API konekcija nije aktivna.

### Podešavanja (siteSettings)
Naziv i opis sajta, naslovni rad (heroArtwork — sa napomenom o statusu, vidi [`03-CONTENT_MODEL_MAPPING.md`](03-CONTENT_MODEL_MAPPING.md)), izdvojeni radovi, izdvojene objave iz dnevnika, kontakt email, kontakt forma uključena, Instagram/Facebook linkovi i status konekcije (isto uputstvo kao `SocialConnectionGuide.tsx`, prevedeno u app kontekst).

## Pregled pre objave (Preview)

Ključna funkcija: pre nego što se bilo koja izmena objavi, Zlatica može da vidi **tačno** kako će ta stranica izgledati na pravom sajtu — ne aproksimaciju unutar app-a, nego pravu, uživo renderovanu stranicu sa nesačuvanim/nacrt sadržajem.

- Mehanizam: koristi se Next.js "draft mode" na postojećem sajtu — app otvara pravu stranicu sajta (`/works/[slug]`, `/journal/[slug]`, itd.) unutar app-a (in-app browser/WebView), sa privremenim pristupom koji sajtu kaže "prikaži i nesačuvani nacrt, ne samo objavljeno".
- Radi za sve tipove stranica koje imaju svoju rutu na sajtu: rad, dnevnik objava, i (posredno) početna strana kad se menja naslovni rad ili izdvojeni sadržaj.
- Za sadržaj bez sopstvene rute (npr. Podešavanja) — pregled pokazuje odgovarajuću sekciju stranice gde se taj podatak koristi (npr. izmena kontakt email-a → otvara `/contact`).
- Pregled je uvek **pre** dugmeta "Objavi" — Zlatica menja, pregleda, po potrebi se vraća na izmenu, tek onda objavljuje.

**Zašto ovako, a ne native pregled unutar app-a:** ručno rekreiranje web dizajna (fontovi, animacije, layout iz `docs/HERO_SPEC.md` i sličnih) unutar mobilne app bi bilo ogroman, trajno-duplirani posao i uvek bi kasnilo za pravim sajtom. Otvaranje **prave** sajt-stranice sa draft podacima garantuje da je pregled uvek tačan, bez ikakvog dodatnog UI rada po komponenti.

**Zašto puna paritetnost umesto ranijeg ograničenog MVP-a:** vlasnik projekta je eksplicitno tražio da app radi sve što radi admin panel, samo jednostavnije — ovaj dokument sada odražava tu odluku; ranija verzija (samo Radovi/Dnevnik/Izložbe/deo Podešavanja) je zamenjena.
