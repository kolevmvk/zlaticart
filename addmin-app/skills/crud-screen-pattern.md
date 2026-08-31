# crud-screen-pattern

## Svrha

Jedinstven Lista + Forma obrazac za sve Sanity tipove, da se 8 sekcija ne grade ad hoc.

## Kada se koristi

- Faza 2: `artwork` lista i status toggle.
- Faze 3, 5, 6, 7, 8: forme i preostali tipovi.

## Lista

- loading state
- error state sa "Pokusaj ponovo"
- empty state
- lokalna pretraga po naslovu gde postoji naslov
- status badge gde tip ima status
- `+` akcija za novi dokument
- tap otvara formu
- brza promena statusa samo za tipove koji status imaju

## Forma

- "Osnovno" uvek vidljivo.
- "Vise detalja" collapsed po default-u.
- reference se biraju iz postojecih dokumenata, ne unose se kao slobodan tekst.
- slug se generise iz naslova po Sanity-kompatibilnom pravilu.
- `Sacuvaj kao nacrt`, `Pregledaj`, `Objavi` prate isti raspored kroz app.

## Tipovi

- `artistProfile`: nema listu, dashboard otvara formu jednog dokumenta.
- `siteSettings`: nema standardni publish status; prikazati napomenu za `heroArtwork`.
- `medium`: mora moci da se kreira jer ga `artwork.medium` referencira.

## Verifikacija

- svaka lista ima loading/error/empty/uspesno stanje.
- forma ne salje dokument bez required polja.
- patch ne brise nepoznata polja.
- promena u app-u vidi se u Sanity Studio-u ili na sajtu gde je primenljivo.

