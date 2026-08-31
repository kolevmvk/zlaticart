# 08 — Otvorena pitanja (čekaju vlasnika projekta)

Ovaj plan namerno ne pretpostavlja odgovore na sledeće — svaka pretpostavka ovde bi bila izmišljena, ne odluka.

## Razrešeno (2026-08-31, odluka vlasnika)

- **`admin-api` proxy živi unutar postojećeg `zlaticart` Vercel projekta.** Ne pravi se odvojen servis — deli env varijable i deploy pipeline.
- **PIN: 6 cifara.** Fiksiran format za login ekran (vidi `06-SCREENS.md`).
- **Više uređaja istovremeno dozvoljeno.** Sesijski token nije single-device — nema logike za invalidaciju drugih aktivnih sesija pri novom loginu.
- **`siteSettings.heroArtwork` ostaje prikazano u app-u sa napomenom "trenutno nema efekta na sajtu"** (vidi napomenu u `03-CONTENT_MODEL_MAPPING.md`). App ga ne krije i ne pokušava da ga "popravi" mimo web koda — eventualno povezivanje tog polja na web strani je odvojena odluka, van obima ove app.

Ova četiri pitanja više ne blokiraju Fazu 0 iz [`07-ROADMAP.md`](07-ROADMAP.md).

## Još otvoreno

- **iOS instalacija bez App Store-a** — Android sideload (`.apk`, poslat i instaliran ručno) radi bez ikakvog naloga, ali iOS **ne** dozvoljava to na fizičkom uređaju bez barem jedne od: (a) Apple Developer Program naloga (99 USD/god — omogućava ad-hoc ili TestFlight internal distribuciju, instalaciju bez kabla), (b) direktnog povezivanja telefona na Mac sa Xcode-om (besplatno, ali build ističe posle ~7 dana i mora se ponovo instalirati preko kabla). Da li postoji Apple Developer nalog, ili se u prvoj fazi ide na (b) kao privremeno rešenje dok se ne odluči da li iOS ide dalje od "modela za budućnost"?
- **Google Play Console nalog** (jednokratna naknada, potreban samo ako/kada se ide na javni Play Store) — za sada nije preduslov jer je prva faza sideload, ali vredi znati da li već postoji na ime Zlatice/studija za kasnije.

Ovo iOS/Play Store pitanje **ne blokira** Faze 0–10 (te faze rade na Android sideload buildu) — blokira samo iOS/store deo Faze 10, vidi `07-ROADMAP.md`.

## Odloženo pitanje (ne blokira MVP)

- **Status Meta App Review-a** za Instagram objavljivanje/metrike (vidi [`10-FUTURE_INSTAGRAM_METRICS.md`](10-FUTURE_INSTAGRAM_METRICS.md)) — kad se preduslov iz tog dokumenta (Business nalog, Facebook Page, Meta Developer App, odobrene permisije) bude ispunjavao, treba pratiti status ovde. Ne blokira ni jednu MVP fazu (0-10).
