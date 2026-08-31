# 06 — Ekrani

Isti obrazac ponavlja se za svaki tip sadržaja (Lista + Forma), da bi app ostao predvidiv i jednostavan uprkos punoj paritetnosti sa Studio-om.

## 1. Login
- Numerička PIN tastatura (ili lozinka polje) na celoj visini ekrana, veliki brojevi.
- Poruka o grešci jasna, na srpskom: "Pogrešan PIN, pokušajte ponovo."
- Nakon previše pokušaja: poruka o privremenom zaključavanju sa preostalim vremenom.

## 2. Početni ekran (Dashboard)
- Kartice-prečice ka svim sekcijama: **Radovi, Dnevnik, Izložbe, O meni, Edukacija, Tehnike, Social objave, Podešavanja.**
- Ispod: kratka statistika — broj nacrta koji čekaju objavu, broj predstojećih izložbi.
- Dugme za odjavu u gornjem uglu.

## 3. Lista (Radovi / Dnevnik / Izložbe / Edukacija / Tehnike / Social objave — isti obrazac za sve)
- Vertikalna lista kartica: minijatura + naslov + status badge gde tip ima status (bojom kodiran: zeleno=objavljeno, sivo=nacrt, crveno=arhivirano/prošlo).
- Filter/tab na vrhu gde ima smisla (npr. za izložbe: Predstoji / Trenutno traje / Prošla).
- Pretraga po naslovu (lokalni text filter nad već učitanom listom).
- Plutajuće **"+"** dugme dole desno za novi unos.
- Tap na karticu → forma za izmenu (isti ekran kao "novo", samo predpopunjen).
- Swipe ili dugo-pritisni na kartici → brza akcija "Promeni status" bez otvaranja pune forme (gde tip ima status).

`artistProfile` nema listu (jedan dokument) — dashboard kartica "O meni" vodi direktno na formu za izmenu.

## 4. Forma (svi tipovi)
- Sekcija "Osnovno" (uvek vidljivo): polja koja se najčešće menjaju za taj tip — vidi konkretan raspored po tipu u [`02-PRODUCT_SPEC.md`](02-PRODUCT_SPEC.md).
- Sekcija "Više detalja" (collapsed po default-u): ređe menjana polja (npr. `featuredOrder`, `motionLanguage`, puni rich-text delovi) — i dalje dostupna, samo ne u prvom planu.
- Upload fotografije: kamera ili galerija, sa preview gridom, kompresijom pre slanja, i mogućnošću brisanja pojedinačne fotografije pre slanja. Rich-text polja (`story`, `body`, `biography`): jednostavan editor sa Bold/Italic/Pasus/Ubaci sliku dugmićima.
- Reference polja (`medium`, `relatedArtworks`, `featuredArtworks`, itd.): pretraživa multi/single-select lista postojećih dokumenata, ne slobodan tekst.
- Dugmad na dnu: **Sačuvaj kao nacrt** / **Pregledaj** / **Objavi** (redosled odražava očekivan tok: prvo sačuvaj, po želji pregledaj, tek onda objavi).

## 5. Pregled pre objave (Preview)
- Otvara se dugmetom "Pregledaj" sa bilo koje forme čiji tip ima svoju rutu na sajtu (rad, dnevnik objava) ili gde se podatak koristi na postojećoj stranici (Podešavanja → `/contact` ili početna strana).
- In-app WebView koji prikazuje **pravu** stranicu sajta, uživo, sa nesačuvanim/nacrt sadržajem (vidi mehanizam u [`04-ARCHITECTURE.md`](04-ARCHITECTURE.md)) — ne native aproksimaciju.
- Traka na vrhu jasno označava "PREGLED — nije još objavljeno" da ne dođe do zabune da je ovo već živa stranica.
- Dugme "Nazad na izmenu" vraća na formu; dugme "Objavi" dostupno i direktno iz preview ekrana.

## 6. Podešavanja
- Sva polja iz `siteSettings` (vidi [`03-CONTENT_MODEL_MAPPING.md`](03-CONTENT_MODEL_MAPPING.md)): naziv/opis sajta, naslovni rad i izdvojeni sadržaj (reference liste), kontakt email, kontakt forma uključena, Instagram/Facebook linkovi i status.
- Kratka napomena uz `heroArtwork` polje da trenutno nema efekta na sajtu (vidi napomenu u `03-CONTENT_MODEL_MAPPING.md`).

## Stanja koja svaki ekran mora obraditi
- Učitavanje (skeleton/spinner, ne prazan ekran).
- Greška mreže (jasna poruka + dugme "Pokušaj ponovo" — telefon na izložbi sa slabim signalom je očekivan slučaj upotrebe, ne rub-slučaj).
- Prazna lista (npr. "Još nema izložbi — dodajte prvu").
- Upload slike u toku (progress indikator, ne zamrznut UI).
- Preview se ne učitava (npr. sajt privremeno nedostupan) — jasna poruka, opcija da se ipak objavi bez pregleda ako Zlatica to želi.
- Uspešno čuvanje (kratka, nenametljiva potvrda — toast/snackbar, ne blokirajući dijalog).

**Zašto:** loš mrežni signal na fizičkoj izložbi je verovatno **najčešći** kontekst upotrebe ove app (fotografisanje i upload sa otvaranja), pa mrežna greška i sporo učitavanje nisu rubni slučajevi — moraju biti prvoklasno dizajnirani, ne naknadna dopuna. Preview traka "nije još objavljeno" sprečava najozbiljniju moguću grešku korisnika — da pomisli da je nešto već živo na sajtu kad nije.
