# 04 — Arhitektura

## Pregled sistema

```
┌─────────────────────┐        HTTPS/JSON         ┌──────────────────────────┐
│  ZlaticArt Admin App │ ─────────────────────────▶│  Mali "admin-api" proxy   │
│  (React Native/Expo) │◀───────────────────────── │  (Next.js API routes ili  │
│  Android + iOS       │      auth + mutacije      │  Vercel Edge/Serverless)  │
└─────────────────────┘                            └───────────┬──────────────┘
                                                                 │ Sanity write token
                                                                 │ (server-side only)
                                                                 ▼
                                                     ┌──────────────────────────┐
                                                     │   Sanity CMS (qm16j7ru)   │
                                                     │   isti dataset kao sajt   │
                                                     └──────────────────────────┘
                                                                 ▲
                                                                 │ čita isti sadržaj
                                                     ┌───────────┴──────────────┐
                                                     │  zlaticart.com (Next.js)  │
                                                     │  + Draft Mode preview     │◀── App otvara preview link
                                                     └──────────────────────────┘        u in-app WebView-u
```

Ključna arhitektonska odluka: **mobilna app nikad direktno ne drži Sanity write token**. Sav pristup sa write-pravima ide kroz mali server-side proxy (isti Vercel projekat kao glavni sajt, ili poseban lightweight servis) — vidi [`05-AUTH_AND_SECURITY.md`](05-AUTH_AND_SECURITY.md) za puno obrazloženje.

## Tech stack

| Sloj | Izbor | Zašto |
|---|---|---|
| Mobilna app | **React Native + Expo** (managed workflow) | Jedan kod za Android i iOS, brz razvoj, Expo upravlja native build/signing komplikacijama (posebno bitno jer nema postojeći mobile-dev pipeline u projektu). Tim već poznaje React/TypeScript iz glavnog Next.js projekta — prenosivo znanje. |
| Jezik | TypeScript | Konzistentno sa glavnim projektom; tipovi content modela mogu se deliti/preslikati iz `src/lib/content/types.ts`. |
| Navigacija | Expo Router ili React Navigation | Standardni izbor za Expo app; Expo Router preferiran ako se app strukturira slično Next.js App Router-u (poznato iz glavnog projekta). |
| Backend/proxy | Next.js API routes (novi mali projekat ili nove rute u postojećem `zlaticart` Vercel projektu) | Sanity write token ostaje server-side; ponovna upotreba postojeće Vercel/Next.js infrastrukture umesto novog servisa. |
| CMS | Sanity (postojeći projekat `qm16j7ru`) | Bez izmene — isti izvor istine kao web sajt. |
| Upload slika | Sanity Asset API (preko proxy-ja) | Iste slike, isti CDN, ista `hotspot`/`alt` polja kao na webu — bez paralelnog storage-a. |
| Lokalna app-state | React Query (TanStack Query) ili SWR | Keširanje lista (radovi/dnevnik/izložbe) i optimistic update pri promeni statusa. |
| Autentifikacija u app-u | PIN/lozinka + siguran token exchange (vidi 05) | Jednostavno korisničko iskustvo za jednog ne-tehničkog admina, bez OAuth kompleksnosti na mobilnom. |

## Platforme: Android primarna, iOS kao model za budućnost

Expo/React Native je cross-platform po prirodi — isti kod proizvodi i Android i iOS build bez dodatnog razvoja po platformi. To znači:

- **Android** je platforma na kojoj se stvarno radi prihvatanje (UAT) — build (`.apk`, ili Android App Bundle za kasniji Play Store) se šalje i instalira direktno na Zlaticin telefon ("sideload"), bez prodavnice u prvoj fazi.
- **iOS build se pravi paralelno**, iz istog koda, kao dokaz da je arhitektura zaista cross-platform i spremna za budućnost — ali se **ne** distribuira preko App Store-a u prvoj fazi. iOS instalacija van App Store-a ima tehnička ograničenja koja Android nema (vidi napomenu ispod i [`07-ROADMAP.md`](07-ROADMAP.md) / [`08-OPEN_QUESTIONS.md`](08-OPEN_QUESTIONS.md)).
- Ovo ne menja tech stack izbor — Expo je izabran upravo zato što "jedan kod, dve platforme" već postoji kao podrazumevana osobina, ne dodatni rad.

**Napomena o iOS ograničenju:** za razliku od Androida (gde se potpisan `.apk` može instalirati direktno, bez ikakvog naloga), iOS ne dozvoljava instalaciju proizvoljnog build-a na fizički uređaj bez barem jedne od: (a) Apple Developer naloga (za ad-hoc/TestFlight distribuciju), (b) direktnog povezivanja uređaja na Mac sa Xcode-om. Ovo je Apple-ovo platformsko ograničenje, ne nešto što ovaj plan može zaobići — vidi otvoreno pitanje u [`08-OPEN_QUESTIONS.md`](08-OPEN_QUESTIONS.md).

## Pregled pre objave (Preview) — mehanizam

App ne pokušava da native-om rekreira izgled sajta (fontovi, GSAP animacije, hero shader iz `docs/HERO_SPEC.md`) — to bi bilo ogromno, trajno duplirano održavanje koje uvek kasni za pravim sajtom. Umesto toga:

1. Glavni Next.js projekat dobija **Next.js Draft Mode** (`draftMode()` API) na rutama koje već postoje: `/works/[slug]`, `/journal/[slug]`, i po potrebi početnu stranu.
2. Kad je draft mode aktivan, Sanity upiti prelaze na `perspective: 'previewDrafts'` (Sanity-jeva podrška za čitanje nesačuvanih/draft verzija dokumenata) umesto samo objavljenog sadržaja.
3. `admin-api` proxy izdaje kratkotrajan, potpisan **preview link** ka pravoj stranici sajta (sadrži sesijski-vezan token koji uključuje draft mode za taj jedan zahtev).
4. App otvara taj link u **in-app WebView-u/browseru** (npr. Expo's `WebBrowser` ili ugrađeni `WebView`) — Zlatica vidi pravu, uživo renderovanu stranicu, sa upravo unetim nesačuvanim izmenama, pre nego što pritisne "Objavi".
5. Za sadržaj bez sopstvene rute (npr. `siteSettings.contactEmail`) — preview link vodi na stranicu gde se taj podatak koristi (`/contact`).

**Zašto:** ovo garantuje da je pregled uvek tačan (to je doslovno prava stranica, ne aproksimacija), bez ijedne dodatne linije UI koda po komponenti u mobilnoj app — cena je jedna, jednokratna izmena na web strani (Draft Mode + preview endpoint), ne trajni paralelni rad.

## Zašto ne direktna Sanity mobilna integracija (bez proxy-ja)

Sanity nudi klijentske SDK-ove koji rade i iz React Native-a, ali write-scope token unet direktno u mobilnu app (čak i u secure storage) je izloženiji riziku od servera koji nikad ne napušta Vercel infrastrukturu: dekompilovan APK/IPA, jailbreak/root pristup uređaju, ili gubitak telefona ne bi trebalo da znače kompromitovan CMS write pristup celom sajtu. Proxy sloj drži token van uređaja u potpunosti; app dobija samo kratkotrajni sesijski token nakon uspešnog PIN logina.

**Zašto:** ovo je jedina odluka u ovom planu koja direktno utiče na bezbednost celog javnog sajta (isti dataset), pa dobija najkonzervativniji dizajn i sopstveni dokument — vidi [`05-AUTH_AND_SECURITY.md`](05-AUTH_AND_SECURITY.md).
