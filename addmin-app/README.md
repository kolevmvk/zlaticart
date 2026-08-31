# ZlaticArt Admin App — od ideje do realizacije

Mobilna aplikacija — **Android je primarna platforma** (prva verzija se instalira direktno na telefon, bez Play Store-a), **iOS se gradi paralelno iz istog koda kao model za budućnost** — koja Zlatici daje punu administratorsku kontrolu nad ZlaticArt CMS-om (Sanity): sve što radi web `/admin` Studio, dostupno i iz app-a, samo jednostavnije, plus pregled tačnog izgleda stranice na sajtu pre nego što se bilo šta objavi.

Ovaj direktorijum je **planski paket**, ne kod aplikacije. Sadrži kompletan put od ideje do realizacije: problem koji se rešava, proizvodnu specifikaciju, arhitekturu, tehnički stek, integraciju sa postojećim CMS-om, sigurnosni model, ekrane, i fazni plan izrade (roadmap).

## Redosled čitanja

1. [`docs/01-IDEA.md`](docs/01-IDEA.md) — zašto ova app postoji, za koga, šta rešava
2. [`docs/02-PRODUCT_SPEC.md`](docs/02-PRODUCT_SPEC.md) — funkcionalnosti, ekrani, korisnički tok
3. [`docs/03-CONTENT_MODEL_MAPPING.md`](docs/03-CONTENT_MODEL_MAPPING.md) — kako app mapira postojeći Sanity content model
4. [`docs/04-ARCHITECTURE.md`](docs/04-ARCHITECTURE.md) — sistemska arhitektura, tech stack, zašto
5. [`docs/05-AUTH_AND_SECURITY.md`](docs/05-AUTH_AND_SECURITY.md) — kako se Zlatica loguje, kako se čuva Sanity token
6. [`docs/06-SCREENS.md`](docs/06-SCREENS.md) — ekran po ekran, UI logika
7. [`docs/07-ROADMAP.md`](docs/07-ROADMAP.md) — fazni plan realizacije, milestone-ovi
8. [`docs/08-OPEN_QUESTIONS.md`](docs/08-OPEN_QUESTIONS.md) — odluke koje čekaju vlasnika projekta
9. [`docs/09-MESSAGES.md`](docs/09-MESSAGES.md) — čitanje/odgovaranje na contact i commission upite (Supabase, van Sanity obima)
10. [`docs/10-FUTURE_INSTAGRAM_METRICS.md`](docs/10-FUTURE_INSTAGRAM_METRICS.md) — Instagram objavljivanje i metrike, odloženo posle MVP-a (zavisi od Meta App Review-a)

## Veza sa glavnim projektom

Ova app **ne duplira** CMS — ona je alternativni, mobilni klijent nad **istim** Sanity projektom (`qm16j7ru`) koji već koristi `zlaticart` web sajt i njegov `/admin` Sanity Studio. Nema nove baze, nema novog izvora istine. Sve izmene napravljene iz mobilne app odmah su vidljive na sajtu, i obrnuto.

Glavni projekat: `/Volumes/KoleOPS/zlaticart` (vidi njegov `CLAUDE.md`, `docs/STATUS.md`, `sanity/schemas/`).
