# supabase-proxy-read

## Svrha

Jedinstven read-only obrazac za admin API rute koje citaju ZlaticArt poruke iz Supabase-a preko server-side proxy-ja.

## Kada se koristi

- Faza 7: `contact_submissions` i `commission_requests`, opisano u `docs/09-MESSAGES.md`.
- Svaki buduci read-only Supabase admin ekran koji koristi isti auth/proxy princip.

## Tvrde granice

- Supabase `service_role` kljuc postoji samo na serveru, u Vercel environment varijabli.
- Mobilna app nikad ne cita ove tabele direktno iz Supabase-a.
- Mobilna app nikad ne sadrzi `service_role`, database password ili bilo koju server-side tajnu.
- Svaka ruta proverava admin sesijski token pre Supabase citanja.
- MVP je read-only: ne dodavati `read_at`, status, patch rute ili migracije bez eksplicitne dozvole vlasnika.

## Endpoint obrazac

1. Procitaj zahtev.
2. Verifikuj kratkotrajni admin sesijski token.
3. Kreiraj server-side Supabase client sa `service_role` kljucem i `zlaticart` schemom.
4. Procitaj dozvoljeni skup kolona iz ciljane tabele.
5. Sortiraj najnovije prvo po `created_at`.
6. Vrati mali JSON odgovor: `ok`, `data` ili `error`.
7. Ne logovati email, poruku, opis porudzbine, tokene ili privatne podatke.

## MVP rute

- `GET /api/admin/messages` cita `zlaticart.contact_submissions`.
- `GET /api/admin/commissions` cita `zlaticart.commission_requests`.

## Kontakt polja

- `id`
- `name`
- `email`
- `message`
- `created_at`

## Porudzbina polja

- `id`
- `name`
- `email`
- `format`
- `technique`
- `budget`
- `description`
- `created_at`

## App ponasanje

- Lista je uvek "sve poruke", sortirano najnovije prvo.
- "Odgovori" otvara native mail app preko `mailto:` linka.
- Ne postoji in-app chat.
- Ne postoji procitano/neprocitano status u MVP-u.

## Verifikacija

- zahtev bez tokena dobija 401.
- zahtev sa losim/isteklim tokenom dobija 401.
- zahtev sa validnim tokenom vraca poruke bez izlaganja server-side tajni.
- prazna tabela vraca praznu listu, ne gresku.
- Supabase greska vraca jasnu gresku bez privatnih detalja.
