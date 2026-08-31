# sanity-proxy-mutation

## Svrha

Jedinstven obrazac za sve admin API rute koje citaju ili menjaju Sanity dokumente preko server-side proxy-ja.

## Kada se koristi

- Faza 0: `login`, `logout`, `health` skeleton.
- Faza 2 i dalje: Sanity read/mutation endpointi za `artwork`, zatim ostale tipove.

## Tvrde granice

- Sanity write token postoji samo na serveru, u Vercel environment varijabli.
- Mobilna app poziva samo `admin-api` rute.
- Svaka ruta osim `login` proverava kratkotrajni sesijski token.
- Mutacije su parcijalne gde god je moguce, da ne obrisu polja koja app jos ne poznaje.
- Validacija ulaza se radi pre Sanity poziva.

## Obrazac endpointa

1. Procitaj zahtev.
2. Verifikuj sesijski token.
3. Validiraj payload prema poljima iz `sanity/schemas/*`.
4. Izvrsi GROQ query, `create`, `patch` ili `delete` preko server-side Sanity klijenta.
5. Vrati mali JSON odgovor: `ok`, `data` ili `error`.
6. Ne logovati PIN, tokene, payload rich texta ili privatne kontakt podatke.

## Env varijable

- `ADMIN_PIN_HASH`
- `ADMIN_SESSION_SECRET`
- `SANITY_API_WRITE_TOKEN`
- postojece `NEXT_PUBLIC_SANITY_PROJECT_ID`
- postojece `NEXT_PUBLIC_SANITY_DATASET`

## Verifikacija

- `login` odbija los PIN.
- `login` prihvata validan PIN i vraca sesijski token.
- zasticena ruta odbija zahtev bez tokena.
- zasticena ruta prihvata validan token.
- server bundle ne iznosi tajne u klijent.

