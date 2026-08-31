# image-upload-pipeline

## Svrha

Standardni tok za fotografije: kamera/galerija telefona, lokalni preview, kompresija, upload preko proxy-ja, zatim Sanity asset reference.

## Kada se koristi

- Faza 3: `artwork.primaryImage` i `artwork.detailImages`.
- Faza 5-7: slike u `journalPost`, `exhibition`, `artistProfile`, `educationItem`, `socialItem`.

## Pravila

- App nikad ne uploaduje direktno sa Sanity write tokenom.
- Proxy prima sliku i koristi Sanity Asset API server-side.
- Svaka slika mora imati alt polje kada je ono obavezno u semi.
- Upload UI mora imati progress, retry i gresku razumljivu na srpskom.
- Pre upload-a uraditi kompresiju na uredjaju kada biblioteka bude uvedena u Fazi 3.

## Tok

1. Korisnik bira kameru ili galeriju.
2. App prikazuje lokalni preview.
3. App kompresuje fajl na razumnu velicinu za mobilni signal.
4. App salje fajl proxy endpointu sa sesijskim tokenom.
5. Proxy uploaduje asset u Sanity.
6. Proxy vraca `_id`, URL i osnovne metadata vrednosti.
7. Forma cuva Sanity image reference zajedno sa alt tekstom.

## Verifikacija

- upload jedne slike radi na dobrom signalu.
- retry put radi kada proxy vrati gresku.
- UI se ne zamrzava tokom uploada.
- sacuvani Sanity dokument prikazuje sliku na pravom sajtu.

