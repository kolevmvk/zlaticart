# expo-scaffold

## Svrha

Standard za podizanje i prosirivanje Expo/React Native projekta unutar `addmin-app`, konzistentno sa glavnim `zlaticart` TypeScript/React navikama.

## Kada se koristi

- Faza 0: inicijalni scaffold.
- Svaki put kada se dodaje nova navigaciona grana, globalni provider, konfiguracija build-a ili TS/lint pravila.

## Pravila

- Android je primarna platforma za prihvatanje; iOS ostaje kompatibilan cilj, ali ne blokira Faze 0-8.
- Expo managed workflow je podrazumevan dok konkretan native zahtev ne dokaze suprotno.
- Koristiti TypeScript svuda.
- Ne uvoditi dependency bez jasne uloge u Fazi 0-1.
- App ne sme sadrzati Sanity write token, Supabase service role, PIN hash, JWT secret ili druge server-side tajne.
- Struktura treba da bude pogodna za Expo Router, jer mentalni model odgovara Next.js App Router-u iz glavnog projekta.

## Minimalna pocetna struktura

```text
addmin-app/
  app/
    _layout.tsx
    index.tsx
    login.tsx
  src/
    api/
    auth/
    components/
    constants/
    features/
    theme/
    types/
  assets/
  package.json
  app.json
  tsconfig.json
```

## Pocetne zavisnosti

- `expo`
- `expo-router`
- `react`
- `react-native`
- `typescript`
- `expo-secure-store`
- `@tanstack/react-query`

Dodatke za slike, WebView, rich text i upload dodavati tek u fazama koje ih stvarno koriste.

## Verifikacija

- `npm run typecheck`
- lint komanda definisana u projektu
- Expo start bez crash-a
- Android emulator ili uredjaj prikazuje pocetni ekran

