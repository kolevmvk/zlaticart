---
name: zlaticart-atelier-ui
description: Art-directed "Atelje" visual language for the ZlaticArt Android admin app — how screens for an artist should look and behave (image-first editing, gallery lists, calm action bar, bottom sheets, writing view, delete everywhere). Use with zlaticart-mobile-design whenever designing, building or reviewing admin screens.
---

# ZlaticArt Atelje UI

Proširuje `zlaticart-mobile-design` (tokeni, Android kvalitet, dokazi). Ovaj skill određuje **kako aplikacija izgleda i kako se oseća**. Korisnica je slikarka, ne administrator: aplikacija je njen atelje, a ne CMS forma.

## Načela

1. **Rad je interfejs.** Fotografija je najveći element svakog ekrana gde postoji. Kontrole su tihe i stoje oko nje, ne preko nje.
2. **Jedna glavna radnja po ekranu.** Primarna akcija je jedna (Objavi / Sačuvaj). Sve ostalo je sekundarno ili u meniju „⋯“. Nikad stub od pet jednakih dugmadi.
3. **Mirna tipografija umesto okvira.** Naslov se kuca direktno u velikom serifu; polja su redovi sa tankom linijom, ne sive kutije. Grupe: *Osnovno*, *Priča*, *Na sajtu*, *Detalji* (sklopljeno).
4. **Stanje je rečenica, ne tehnički status.** „Na sajtu“, „Nacrt — samo vi vidite“, „Izmene čekaju objavu“. Uz boju uvek ide oblik ili tekst.
5. **Brisanje je ravnopravna radnja.** Sve što može da se objavi mora moći i da se obriše — iz liste (dug pritisak / ⋯) i iz uređivanja (⋯). Potvrda je bottom sheet sa sličicom i jasnom posledicom. Ako je sadržaj povezan drugde (izdvojeni radovi, naslovni rad, povezani radovi), sheet nudi „Ukloni povezivanja i obriši“ umesto zabrane.
6. **Umetnički, ne dekorativno.** Bez gradijenata, senki-kartica, emoji, ikonica-šarenila. Zlatna boja samo kao tanka akcentna linija ili aktivno stanje.

## Vizuelni sistem

- **Boje** (`src/theme/colors.ts`): platno `#F0EDE6` (pozadina), topla `#E8E4DB` (površine), duboka `#D8D3C8` (linije), mastilo `#0A0A09` (tekst, primarno dugme), prigušeno `#3A3A38`, tiho `#6A6A68`, zlato `#E8C077` (akcent), greška `#9F2D20`. Status: *Na sajtu* = puna tačka mastila; *Nacrt* = prazan krug; *Izmene čekaju* = polukrug zlata.
- **Tipografija**: naslovi **EB Garamond** (Cormorant Garamond iz `@expo-google-fonts` pogrešno crta kvačice š/č/ž — ne koristiti za srpski), UI i tekst **DM Sans**. Display 36/42, naslov ekrana 30/36, naslov kartice 20/26, telo 16/24, oznaka 13/18 verzal sa razmakom 1.5 za „eyebrow“.
- **Razmak**: ivica ekrana 20, između grupa 32, unutar grupe 12. Dodirna površina ≥ 48 dp. Radijus 12 za slike/kartice, 999 za čipove, 14 za dugmad.
- **Pokret**: kratko i tiho — fade/slide 180 ms za sheet, bez skakutanja; poštovati „Ukloni animacije“.

## Obrasci ekrana

- **Početna**: pozdrav u serifu, jedna velika kartica poslednjeg rada (slika preko cele širine, naziv, stanje), zatim mreža sekcija 2×N gde svaka pločica ima sliku iz sekcije (ili tipografski znak kad nema slike), naziv i broj. Poruke kao red sa brojem novih. Plutajuće „+“ otvara sheet „Šta dodajete?“ (Rad, Zapis u dnevniku, Izložba, …).
- **Liste sa slikama** (Radovi, Izložbe, Edukacija, Objave): mreža 2 kolone, slika 4:5, ispod naziv i stanje-tačka. Filteri kao tanki čipovi u jednom horizontalnom redu. Pretraga u zaglavlju (ikona → polje).
- **Tekstualne liste** (Dnevnik): editorijalni redovi — datum eyebrow, naslov u serifu, izvod 2 reda, sličica desno.
- **Tehnike**: jednostavna lista sa ručkom za redosled.
- **Uređivanje**: slika na vrhu (tap = zameni / iseci), opis slike kao natpis ispod; naslov inline serif; grupe polja; **fiksna donja traka**: levo stanje („Nacrt · nije na sajtu“), desno „Pregled“ (ikona oko) + primarno „Objavi“. „⋯“ u zaglavlju: Sačuvaj nacrt, Odbaci izmene, Sakrij sa sajta, Obriši.
- **Pisanje** (Dnevnik, biografija, priča o radu): stranica bez okvira, veliki razmak redova, traka iznad tastature: Aa (naslov), B, I, citat, lista, link, slika.
- **Reference i galerije**: izbor preko bottom sheet-a sa mrežom slika i pretragom; galerija kao horizontalni niz sa „+“ na kraju, dug pritisak za redosled/brisanje.
- **Poruke**: inbox — ime, datum, prvi red; detalj kao pismo; jedno dugme „Odgovori mejlom“.
- **Singletoni** (O meni, Podešavanja): jedna duga stranica sa grupama, bez liste.

## Obavezno ponašanje

- Nesačuvane izmene: Back pita (postojeći `useUnsavedChanges`).
- Posle radnje kratka potvrda (snackbar pri dnu, 3 s): „Objavljeno na sajtu“, „Nacrt sačuvan“, „Obrisano“ (+ „Poništi“ samo ako je stvarno podržano).
- Greške ljudskim jezikom, bez HTTP kodova i internih naziva.
- Svaki dodir ima stanje (pritisak, onemogućeno, učitavanje); spinner samo gde se čeka mreža.
- Stabilni `testID` za automatizaciju ostaju.

## Anti-obrasci (odbiti u pregledu)

Stub istih outline dugmadi; siva input-kutija za naslov; „Obriši dokument“ kao crveno dugme usred forme; tehnički nazivi (slug, referenca, dokument, singleton) u UI tekstu — koristiti „adresa na sajtu“, „povezani radovi“; ekrani bez slike tamo gde slika postoji; emoji; gradijent.

## Provera

Snimci sa fizičkog Xiaomija za: početnu, mrežu radova, uređivanje sa tastaturom, sheet brisanja, pisanje, poruke; veći font 1.3; tamna tema sistema ne sme da pokvari kontrast (aplikacija ostaje svetla). Poredi sa odobrenim dizajn predlogom.
