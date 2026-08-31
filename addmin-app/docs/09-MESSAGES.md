# 09 — Poruke (Contact & Commission upiti)

Dodatak na obim iz [`02-PRODUCT_SPEC.md`](02-PRODUCT_SPEC.md), van originalnog Sanity content modela — ovaj podatak živi u **Supabase**, ne u Sanity-ju.

## Zašto ovo postoji

`/contact` i `/porudzbina` forme na sajtu upisuju u `zlaticart.contact_submissions` i `zlaticart.commission_requests` (Supabase, migracije `20260829000002` i `20260830000001`). Oba fajla migracije eksplicitno kažu: *"nobody can read through the public API — messages are read via the Supabase dashboard (Table Editor) until a Studio/admin UI exists."* Ova app je taj "Studio/admin UI" — prva stvarna namena ove sekcije je da Zlatica **ne mora da otvara Supabase Table Editor** da bi videla ko joj je pisao.

## Šta app radi

- **Lista upita** (dve odvojene tab/sekcije: Kontakt poruke, Porudžbine) — sortirano najnovije prvo, sa `created_at`.
- Kontakt poruka prikazuje: ime, email, poruka, datum.
- Porudžbina prikazuje: ime, email, format, tehnika, budžet (ako je unet), opis, datum.
- **"Odgovori" dugme** — otvara nativni mail app uređaja (`mailto:` link) sa već popunjenim primaocem (email iz poruke) i, gde ima smisla, predloženim subjektom (npr. "Re: upit sa sajta"). Ovo **nije** in-app chat/messaging sistem — poruke su jednosmerne (posetilac → Zlatica), pravi odgovor ide pravim email-om, van app-a i van Sanity/Supabase toka.
- **Obeleži kao pročitano/rešeno** — lokalna oznaka (nije u trenutnoj šemi, vidi ispod) da se lista može filtrirati na "nepročitano".

## Tehnički pristup — čitanje bez izlaganja `service_role` ključa

Trenutna RLS politika na obe tabele dozvoljava **samo INSERT** za `anon` — čitanje je potpuno zatvoreno za javni API ključ, namerno (sprečava da bilo ko sa `anon` ključem pročita tuđe poruke). To znači:

- App **ne** čita direktno iz Supabase-a sa klijentske strane.
- Čitanje ide isključivo preko istog `admin-api` proxy-ja iz [`04-ARCHITECTURE.md`](04-ARCHITECTURE.md) — proxy (server-side, već autentifikovan preko PIN/sesijskog tokena) koristi Supabase **`service_role`** ključ da pročita obe tabele, isto kao što koristi Sanity write token za CMS mutacije. Isti bezbednosni princip kao [`05-AUTH_AND_SECURITY.md`](05-AUTH_AND_SECURITY.md): `service_role` ključ nikad ne napušta server, nikad ne ide u mobilni bundle.
- Nova proxy ruta: `GET /api/admin/messages` (kontakt) i `GET /api/admin/commissions` (porudžbine), zaštićene istim sesijskim tokenom kao sve ostale admin rute.

## Šta šema trenutno NE podržava (i šta to znači za app)

Ni `contact_submissions` ni `commission_requests` nemaju kolonu za status (pročitano/nepročitano/rešeno). Dve opcije:

- **(A) Jednostavnije, preporučeno za prvu verziju:** app ne pokušava da čuva status — lista je uvek "sve poruke", sortirano po datumu, bez markera pročitano/nepročitano. Nula izmena šeme.
- **(B) Kasnije, ako se pokaže potreba:** dodati kolonu (npr. `read_at timestamptz`) migracijom u glavnom projektu, i proxy `PATCH` rutu da je ažurira. Ovo je izmena glavnog repo-a van trenutno dozvoljene granice (Draft Mode) — zahteva eksplicitnu dozvolu vlasnika pre nego što se doda, isto pravilo kao svaka druga izmena van `addmin-app`.

MVP ide sa (A). Ne implementirati (B) bez pitanja — vidi tvrde ograde u `CODEX.md`.

## Gde ovo ide u roadmap

Nova faza u [`07-ROADMAP.md`](07-ROADMAP.md), posle osnovnih CRUD faza — vidi tamo tačan redosled.
