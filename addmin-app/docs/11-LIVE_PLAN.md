# ZlaticArt Admin — živi plan realizacije

Ažurirano: 2026-09-12. Zajednički plan za Codex, Claude i vlasnika projekta.

## Pravila nastavka rada

Na početku svake sesije koja nastavlja admin aplikaciju pročitaj ovaj dokument, zatim najnovije zapise u `../STATUS.md` i dokumentaciju aktivnog zadatka. Proveri stanje koda pre nego što prihvatiš ranije tvrdnje kao potvrđene.

Ovaj dokument je glavni izvor trenutnih prioriteta, statusa i sledećeg koraka. `../STATUS.md` ostaje hronološki dnevnik dokaza i provera. Raniji `07-ROADMAP.md` ostaje referenca izvornog obima; redosled isporuke iz ovog plana ima prednost nad njegovim starim redosledom. Ne prepisuj istorijske rezultate kao današnje provere.

Posle svakog smislenog koraka ažuriraj odgovarajući red, sledeći korak i dnevnik odluka. Statusi: **TODO**, **U TOKU**, **REALIZOVANO**, **IZMENJENO**, **ODBAČENO**, **BLOKIRANO**. REALIZOVANO zahteva dokaz i ispunjen kriterijum prihvatanja. Kod bez potrebnog testa ostaje U TOKU. IZMENJENO mora navesti novu specifikaciju i preostali posao; ODBAČENO razlog i eventualnu zamenu. Ne briši odbačene stavke niti prethodne odluke. BLOKIRANO mora navesti konkretan preduslov.

Uz promenu zabeleži datum, autora/agenta, šta se promenilo, zašto, proveru i relevantan fajl ili commit. Ne unositi PIN-ove, tokene, ključeve ili druge tajne. Rutinske promene unutar dogovorenog obima ne zahtevaju novo odobrenje; promene cilja ili odbacivanje obećanih funkcionalnosti potvrđuje vlasnik.

## Polazno stanje

Postoje Expo/React Native Android aplikacija, PIN prijava, lokalno čuvanje sesije, lista Radova, osnovna forma, upload fotografije, promene statusa i pregled sačuvanog rada. Ostale sekcije još nisu implementirane.

Provere 2026-09-10: mobilni typecheck i lint prolaze; typecheck glavnog projekta prolazi. Nije ponovljen Android build, test na telefonu ni provera produkcije. Ranija evidencija beleži API i delimične fizičke Android testove, ali kompletan UI submit i preview nisu potvrđeni. Postojanje koda nije dokaz spremnosti za predaju.

## Segmenti izvršenja P0–P13

Ovo je operativna mapa prihvaćenog plana. Raniji ID-jevi ostaju za praćenje pojedinačnih zadataka. Status U TOKU znači da implementacija ili obavezna provera još nije završena.

| Segment / vlasnik | Status | Cilj | Tok rada | Provera / proizvod |
|---|---|---|---|---|
| P0 / koordinator | U TOKU | Zajednički početak i pravila | Proveri stanje, učitaj skillove, utvrdi uređaje, dodeli fajlove | Jedinstven plan, baza 56390cb, dostupni test uslovi; postojeće nekomitovane izmene se čuvaju |
| P1 / UI | U TOKU | Dosledan sistem dizajna (UI1) | Tokeni → zajedničke kontrole → referentni prikaz | Android mali ekran/veći tekst/kontrast; proizvod: komponente i snimci |
| P2 / API + koordinator | U TOKU | Tačno čuvanje Radova (R1–R3) | Alt-only → null/omitted semantika → publish validacija → integracija | Testovi mutacija i ponovno učitavanje; proizvod: API i mobilni ugovor |
| P3 / API + UI | U TOKU | Nacrti bez promene javne verzije (N1–N3) | Sanity draft → sačuvaj pre pregleda → objavi | Novi/postojeći rad, bez duplikata; proizvod: ceo preview/publish tok. Kod i izolovani testovi gotovi 2026-09-13; čeka deploy, proveru na stvarnom dataset-u i Android |
| P4 / UI + koordinator | U TOKU | Početna, lista i forma (UI2/R4/R5) | Dizajn → named status actions → dirty guard → API integracija | Tastatura, Back, prazno/greška/uspeh; proizvod: referentni ekrani |
| P5 / API + UI | U TOKU | Sesije i mrežna pouzdanost (A1–A5) | Lockout/opoziv → istek → timeout/retry → upload | Neuspešni tokovi bez tihog gubitka/duplikata; proizvod: robusna aplikacija. Kod i izolovani testovi gotovi 2026-09-13; čeka primenu migracije, produkcione tajne i Android proveru |
| P6 / QA + koordinator | TODO | Android isporuka A (D1–D5) | Produkcioni API → potpis → APK → instalacija/nadogradnja | Fizički telefon bez Metro, Wi-Fi i mobilni internet; proizvod: APK Radovi i uputstvo |
| P7 / UI + CMS | TODO | Dnevnik (C1) | Lista/editor/slike/reference → nacrt/pregled/objava | Persistencija formatiranja i web prikaz; proizvod: modul Dnevnik |
| P8 / UI + CMS | TODO | Izložbe (C2) | Lista/status/datum → forma/multi-upload → objava | Redosled slika i prekid uploada; proizvod: modul Izložbe |
| P9 / UI + API | TODO | Poruke (C3) | Zaštićeno čitanje → detalji → mailto | Primalac/naslov/bez mail aplikacije; proizvod: kontakt i upiti |
| P10 / UI + CMS | TODO | Ostali sadržaj (C4) | O meni → Edukacija → Tehnike → Social | Polja i reference po šemi; proizvod: četiri modula |
| P11 / UI + CMS | TODO | Napredni Radovi (C5) | Dodatne slike/priča/redosled/Instagram link | Sačuvani sadržaj i osnovna polja; proizvod: puna forma |
| P12 / UI + CMS | TODO | Podešavanja (C6) | Učitaj → izmeni → sačuvaj → proveri sajt | Kontakt/reference/napomena za neaktivna polja; proizvod: podešavanja |
| P13 / QA + koordinator | TODO | Isporuka B (Q1–Q5) | Regresija → release → instalacija → dokumentacija | Svi moduli + web admin i sajt; proizvod: kompletan APK i evidencija |

Prvi paralelni krug: P1, P2 i priprema QA. P4 se integriše na dogovorenim ugovorima; P3 i P5 ostaju preduslovi isporuke A. P7–P12 koriste završene obrasce, P13 čeka sve module. Koordinator sam menja plan/status, zajedničke API ugovore i integriše promene. U ovom krugu koristi se postojeći checkout sa strogo nepoklopljenim fajlovima da se sačuvaju prethodne lokalne izmene; git/build mutacije se serijalizuju.

Početna provera 2026-09-10: fizički Android nije povezan (adb devices prazan); QA priprema emulator. Testovi sa izolovanim fixture API-jem nisu dokaz produkcione CMS integracije.

## Isporuke

- **Prva upotrebljiva Android verzija:** etape 1–4, upravljanje Radovima.
- **Kompletan admin:** etape 1–6.
- iOS i objava u prodavnicama nisu uslov za Android sideload isporuku.

## Etapa 1 — Ispravke Radova

| ID | Status | Zadatak | Kriterijum / dokaz |
|---|---|---|---|
| R1 | TODO | Sačuvati izmenu alt opisa bez zamene slike | Izmena opstaje nakon ponovnog učitavanja |
| R2 | TODO | Omogućiti uklanjanje postojeće tehnike | Veza uklonjena u CMS-u i prikazu |
| R3 | TODO | Serverska validacija svake objave, uključujući brzu promenu statusa; proveriti tip ciljnog dokumenta | Nepotpun ili pogrešan dokument ne može da se objavi |
| R4 | TODO | Upozorenje pri napuštanju nesačuvane forme | Android Back i navigacija ne gube unos bez odluke |
| R5 | TODO | Jasna potvrda čuvanja i greške sa ponovnim pokušajem | Provereni uspešan i neuspešan tok |

Prihvatanje: sva ponuđena polja se pravilno čuvaju; nepotpun rad ne može da se objavi.

## Etapa 2 — Nacrti i pregled

| ID | Status | Zadatak | Kriterijum / dokaz |
|---|---|---|---|
| N1 | U TOKU | Zaseban nacrt izmene objavljenog rada, usklađen sa Sanity Studio tokom | Javna verzija ostaje dostupna i nepromenjena. Produkcija 2026-09-13 (prod-drafts-smoke.sh): izmena objavljenog rada ide u nacrt, javna verzija nepromenjena, zastarela forma 409 — PROŠLO. Ostaje Android |
| N2 | U TOKU | Pregled prvo čuva nacrt pa otvara njegov prikaz | Sve izmene iz forme vidljive u pregledu. Produkcija 2026-09-13: preview link prikazuje izmenu iz nacrta i traku pregleda — PROŠLO (API). Ostaje dugme Pregledaj na Androidu |
| N3 | U TOKU | Objava nacrta i usklađivanje mobilnog i web admina | Javna verzija se menja tek nakon objave; nema duplih stavki. Produkcija 2026-09-13: novi rad samo nacrt, bez duplikata pri ponovnom create-u, objava i objava izmene menjaju sajt, nacrt uklonjen, lista jedna stavka, arhiviranje sklanja rad — PROŠLO. Ostaje Android i provera iz Sanity Studio-a |

Prihvatanje: proveriti novi rad i izmenu već objavljenog rada kroz nacrt → pregled → objava.

## Etapa 3 — Prijava i pouzdanost

| ID | Status | Zadatak | Kriterijum / dokaz |
|---|---|---|---|
| A1 | U TOKU | Ograničenje pokušaja PIN-a i privremena blokada | Zaštita proverena i u serverskom okruženju sa više instanci. Kod + testovi (2a1ba43); migracija nije primenjena na Supabase |
| A2 | U TOKU | Obrada isteka sesije i ponovna prijava uz očuvanje unosa | Istek tokom uređivanja ne gubi formu. Implementirano: 401 → prozor za PIN preko otvorenog ekrana; nije provereno na Androidu |
| A3 | U TOKU | Serverski opoziv sesije pri odjavi | Opozvani token više ne daje pristup. Kod + testovi (2a1ba43), opoziv gasi i preview. Produkcija 2026-09-13: prvi opoziv pao na prolaznom Supabase 504 (ruta vraćala 500), ponovljena odjava 200 → token 401. Dodat ograničen retry + 503 + log (čeka deploy) |
| A4 | U TOKU | Timeout zahteva i razumljive mrežne greške | Prekid veze ne ostavlja beskonačan indikator učitavanja. Implementirano: 20s/120s timeout, poruke po tipu greške, retry upita samo za mrežu/5xx; nije provereno na Androidu |
| A5 | U TOKU | Upload: veličina/format, dozvole, prekid i ponovni pokušaj | Velike slike i odbijena kamera obrađeni; retry ne duplira rad. Implementirano: priprema ≤3000px/≤3.8MB, server 4MB + provera bajtova, clientId za create, keš uploada; nije provereno na Androidu |

Prihvatanje: problemi sa sesijom i mrežom ne uzrokuju tihi gubitak unosa ili zaglavljenu aplikaciju.

## Etapa 4 — Prvi Android release

| ID | Status | Zadatak | Kriterijum / dokaz |
|---|---|---|---|
| D1 | REALIZOVANO | Proveriti produkcioni API URL i serversku konfiguraciju | APK koristi dostupan produkcioni API; tajne ostaju na serveru. 2026-09-13: `https://www.zlaticart.com`, 4 serverske tajne na Vercel Production, migracija primenjena; build skripta proverava ugrađen URL i odsustvo fixture URL-a |
| D2 | REALIZOVANO | Trajni release ključ, rezervna kopija i verzionisanje | Definisan vlasnik ključa; release ne koristi debug potpis. 2026-09-13: ključ kod vlasnika na Linuxu i Mac mini-ju (isti SHA-256), sertifikat `CN=ZlaticArt Admin` SHA-256 `2a0c24b8…d523d3`, 0.2.0/versionCode 2, `plugins/withReleaseSigning.cjs` bez debug fallback-a, uputstvo `14-ANDROID_RELEASE.md` |
| D3 | U TOKU | Samostalan APK, instalacija i ažuriranje | Radi bez Metro servera i računara; proverena nadogradnja. 2026-09-13: release APK (SHA-256 `2cffc6aa…4f10f0a`, 43 MB, arm64) instaliran na Xiaomi M2007J3SG posle deinstalacije debug 0.1.0, pokreće se na login ekran bez crash-a. Nije proverena nadogradnja (treba 0.2.1) |
| D4 | U TOKU | Kompletan fizički Android test | Login → unos → fotografija → nacrt → pregled → objava → izmena → sajt |
| D5 | TODO | Wi-Fi, mobilni internet, slab signal i ponovno pokretanje | Proverena upotreba van lokalne razvojne mreže |

Prihvatanje: Zlatica može samostalno koristiti Radove. Pre promene potpisa proveriti put prelaska sa ranije instaliranog debug-potpisanog APK-a, bez pretpostavke da će direktna nadogradnja uspeti.

## Etapa 5 — Kompletan sadržaj

| ID | Status | Oblast | Obim / kriterijum |
|---|---|---|---|
| C1 | TODO | Dnevnik | Lista, editor teksta, slike, povezani radovi, nacrt, pregled i objava |
| C2 | TODO | Izložbe | Lista, podaci, više fotografija i upravljanje objavom |
| C3 | TODO | Poruke | Kontakt/upiti, detalji, odgovor kroz mejl aplikaciju |
| C4 | TODO | O meni, Edukacija, Tehnike, Social | Upravljanje definisanim poljima i operacijama po tipu |
| C5 | TODO | Napredni Radovi | Dodatne fotografije, priča, redosled izdvajanja, Instagram link |
| C6 | TODO | Podešavanja | Kontakt, opis sajta, izdvojeni sadržaj i sva dogovorena polja |

Redosled C1–C6. Svaka oblast završava proverom na Androidu i proverom odgovarajućeg rezultata na sajtu. Koristiti postojeće specifikacije u ovom direktorijumu, bez izmišljanja sadržaja.

## Etapa 6 — Završna predaja

| ID | Status | Zadatak | Kriterijum / dokaz |
|---|---|---|---|
| Q1 | TODO | Sve funkcije na fizičkom Androidu | Evidencija prolaza i preostalih problema po oblasti |
| Q2 | TODO | Duge forme, tastatura, velike slike, slaba veza, istek sesije | Nema otvorenih problema koji blokiraju osnovnu upotrebu |
| Q3 | TODO | Regresija web admina i javnog sajta | Mobilne izmene ne kvare postojeće tokove |
| Q4 | TODO | Uskladiti README, STATUS, roadmap i ovaj plan | Dokumentacija odgovara proverenom stanju |
| Q5 | TODO | APK i kratko uputstvo | Instalacija, korišćenje, ažuriranje i oporavak pristupa objašnjeni |

## Odloženo — van ove isporuke

Instagram automatizacija/metrike, push obaveštenja, potpuni offline rad, biometrija i distribucija kroz prodavnice. Nisu odbačeni; zahtevaju zaseban obim. iOS ostaje buduća isporuka, bez blokiranja Androida.

## Dizajn i koordinacija

| ID | Status | Zadatak | Kriterijum / dokaz |
|---|---|---|---|
| S1 | REALIZOVANO | Skillovi za mobilni dizajn i paralelan rad; proširen Android QA playbook | Kanonski SKILL.md fajlovi u `.agents/skills/`, Claude veze i eksplicitno učitavanje kroz projektna uputstva |
| UI1 | TODO | Zajednički tokeni i minimalne UI komponente | Usaglašeni interfejsi i provera komponenti na Androidu |
| UI2 | TODO | Referentna Početna, Lista radova i Forma | Vizuelno provereni normalni i neuspešni tokovi, tastatura i veći tekst |

UI1 može napredovati nezavisno od serverskih ispravki. UI2 i R1/R2/R4 dele ekrane: koordinator mora serijalizovati izmene ili eksplicitno podeliti vlasništvo. Skillovi su dodati; komponente i redizajn još nisu implementirani. Aktuelni skill protokol dozvoljava nezavisan paralelan rad bez preskakanja zavisnih kriterijuma prihvatanja.

## Aktivna isporuka — potpuni Studio na Androidu (2026-09-13)

| Slice | Status | Dokaz / sledeće |
|---|---|---|
| Full S1 | REALIZOVANO | Generički API i šema svih osam tipova; 21 test mutacija + 7 ruta/autorizacije + 5 validacije/šema. Sve postojeće test datoteke prolaze (9/9), root typecheck/lint/build exit 0, mobile Node 22 typecheck/lint exit 0. Izolovane provere; produkcioni smoke čeka merge vlasnika. |
| Full S2 | U TOKU | Mobilni API ugovor, navigacija i polja se implementiraju iz završene S1 šeme; sledeće integracija i Android provere. |
| Full S3 | TODO | Portable Text editor i pregled dnevnika. |
| Full S4 | TODO | Kontakt poruke i porudžbine. |
| Full S5 | TODO | Uvoz postojećeg seed-a, font, release, fizički telefon i sajt. |

Koordinator menja plan/status i API ugovor; nezavisni radnici imaju isključivo vlasništvo nad `content-types.ts`/testom šema i `content.test.cjs`. Produkcijska objava čeka uvoz seed-a; main menja vlasnik merge-om PR-a.

## Tačan sledeći korak

**Presek 2026-09-13 (odluka vlasnika):** Aplikacija mora da ima SVE opcije Sanity Studio admin panela, ne samo Radove. Otkriveno i na produkciji: Sanity dataset je potpuno prazan (0 radova, tehnika, dnevnika, izložbi, profila); javni sajt prikazuje seed iz koda, a `getAllArtworks` prelazi na Sanity čim postoji i jedan objavljen rad — objava iz aplikacije bi sakrila svih 8 seed radova. Redosled: (S1) generički serverski content API za svih 8 tipova sa nacrtima/objavom/brisanjem i opisom polja; (S2) mobilna lista + forma iz opisa polja (tekst, broj, prekidač, izbor, datum, link, slika, galerija, reference) i početni ekran sa svim sekcijama; (S3) editor bogatog teksta (biografija, priča o radu, Dnevnik); (S4) Poruke (kontakt/porudžbine); (S5) uvoz seed sadržaja u Sanity, font dijakritika, novi APK, test na telefonu. Do S5 ne objavljivati radove iz aplikacije.

**Presek 2026-09-13 (P3):** Kod nacrta završen i izolovano testiran (30/30 serverskih testova, root typecheck/lint/build, mobile typecheck/lint, fixture smoke). Sledeće: (1) odobrenje vlasnika za produkcioni deploy grane (admin tajne su već na Vercel Production, migracija primenjena); (2) na produkciji jedan probni rad kroz novi → nacrt → pregled → objava → izmena objavljenog (javna verzija nepromenjena do objave) → brisanje probnog rada; (3) novi APK sa `https://www.zlaticart.com` i test na povezanom Xiaomi telefonu (P6). Otvoreno: odbacivanje nacrta nije implementirano (samo u Studio-u).

**Presek 2026-09-13:** P5 kod završen (preview token, istek sesije, mreža, upload) sa izolovanim testovima; P5 ostaje U TOKU do primene migracije `admin_auth_store`, postavljanja produkcionih tajni i Android provere. Sledeće: P3 (odvojeni Sanity nacrti), zatim P6. Novi native modul `expo-image-manipulator` zahteva novi APK build.

**Presek 2026-09-11:** UI komponente integrisane u dashboard, listu, login i formu. Napravljen samostalan internalTest APK; Android 35 fixture testovi login/Back/save/restart prolaze. Detalji i ograničenja u `12-ANDROID_TEST.md`. P1/P4 ostaju U TOKU zbog preostalog QA, P2 nije potvrđen na stvarnom CMS-u. Vlasnik je odobrio nastavak ka stvarnim podacima na produkcionom serveru. Sledeće: P3 (odvojeni Sanity nacrti) i P5 (zaštita prijave i opoziv sesije), zatim serverska konfiguracija i novi APK sa HTTPS API adresom. Test APK sada koristi loopback API preko adb reverse, ne javnu produkciju.

## Dnevnik odluka i izmena

| Datum | Autor | Status | Odluka / razlog / dokaz |
|---|---|---|---|
| 2026-09-10 | Codex, po zahtevu vlasnika | REALIZOVANO | Sačuvan zajednički plan i povezana uputstva za nastavak rada. Ovo označava dokumentovanje, ne realizaciju aplikacije. |
| 2026-09-10 | Vlasnik + Codex | IZMENJENO | Prioritet isporuke: prvo pouzdani Radovi i Android APK (1–4), zatim puni admin (5–6); raniji roadmap ostaje referenca obima. |
| 2026-09-10 | Codex, po zahtevu vlasnika | REALIZOVANO | S1: dodata dva projektna skilla i Android QA; povezana Codex/Claude uputstva. Redizajn ostaje TODO (UI1/UI2). |

Za naredni zapis: datum | agent | status | ID zadatka, promena, razlog, testovi, preostalo i commit/fajl.

### 2026-09-12 — P5, validacija tokena
REALIZOVANO: stroga provera tri JWT segmenta, HS256/JWT zaglavlja, numeričkih vremena, budućeg izdavanja, isteka i maksimalnog trajanja 24h. Regresioni test pokriva neispravne i izmenjene tokene; ukupno 10 serverskih testova, root typecheck i lint prolaze. Ovo ne završava P5: limiter prijave, opoziv sesije i namenski preview token tek slede. UI/Android presek poslat u commitu 31b1192.

### 2026-09-13 — P5, preview token, istek sesije, mreža i upload (Claude)
U TOKU: (1) Namenski preview token (jedan rad, 5 min link / 30 min pregled, izveden ključ, vezan za sesiju) umesto sesijskog tokena u URL-u; `/api/preview` ga menja za httpOnly cookie, a stranica rada otkriva nacrt samo uz taj cookie i aktivnu sesiju (fail closed). (2) Ispravljen propust: javni `sanityGetArtworkBySlug` nije filtrirao `status == "published"`, pa su nacrti/arhiva bili javno dostupni po slug-u. (3) Mobilni: timeout 20s/120s, tipizovane mrežne greške, 401 → ponovna prijava preko otvorenog ekrana bez gubitka forme, forma se ne menja ekranom greške pri neuspelom osvežavanju. (4) Upload: priprema fotografije (≤3000px, ≤3.8MB JPEG, izbor u punom kvalitetu), server 4MB (ispod Vercel 4.5MB) i provera JPEG/PNG/WebP po bajtovima; create sa `clientId` ne duplira rad pri retry-u, poslata fotografija se ne šalje ponovo. Provere: 26/26 serverskih testova, root typecheck/lint/build (sa javnom Sanity konfiguracijom), mobile typecheck/lint, lokalni `next start` smoke za 401/503 preview putanje. Nije provereno: Android uređaj, stvaran Supabase store, stvaran Sanity create/409.

### 2026-09-13 — P5, produkcione tajne i dozvole migracije (Claude)
U TOKU: vlasnik je na Vercel Production postavio `SUPABASE_SECRET_KEY`, `SANITY_API_WRITE_TOKEN` (Editor), `ADMIN_SESSION_SECRET` i `ADMIN_PIN_HASH` (Sensitive; vrednosti nisu prolazile kroz sesiju). Ne deluju dok grana sa P5 kodom nije deployovana. Pre primene pronađen propust u `20260911175539_admin_auth_store.sql`: nedostajali su GRANT-ovi za `service_role` (tabela `admin_sessions`, EXECUTE na funkcijama). `service_role` zaobilazi RLS ali ne i privilegije, pa bi svaka prijava na produkciji vratila `store_unavailable`. Dodati GRANT-ovi; anon/authenticated i dalje bez pristupa. Nije provereno: lokalni Postgres nije dostupan (Docker ne radi); provera upitom `has_table_privilege`/`has_function_privilege` posle primene. Sledeće: vlasnik primenjuje migraciju u SQL Editoru i dodaje `zlaticart` u Data API „Exposed schemas“.

### 2026-09-13 — P5, migracija admin_auth_store primenjena (vlasnik + Claude)
REALIZOVANO (baza): vlasnik je ispravljenu migraciju pokrenuo u SQL Editoru produkcionog Supabase-a („Success“). `zlaticart` je već bio u Integrations → Data API → Exposed schemas. Provera `has_table_privilege`/`has_function_privilege` vraća service_role insert=true, execute=true, anon select=false. P5 ostaje U TOKU: kod sa grane još nije deployovan i nije proveren na Androidu. Uočeno: `https://www.zlaticart.com` je na Vercel-u i `/api/admin/artworks` vraća 401 (ruta sa `main` postoji) — predlog za D1 je taj domen kao `EXPO_PUBLIC_ADMIN_API_URL`, čeka potvrdu vlasnika.

### 2026-09-13 — Odluke vlasnika za P6 (vlasnik + Claude)
IZMENJENO (D1/D2 preduslovi rešeni): API domen potvrđen — `EXPO_PUBLIC_ADMIN_API_URL=https://www.zlaticart.com`. Release ključ se čuva na Linux mašini i na Mac mini-ju (van repozitorijuma; lozinka van repoa i sesije). Fizički Android povezan: Xiaomi M2007J3SG, Android 12, instaliran `com.zlaticart.admin` 0.1.0 (versionCode 1) sa ranijim debug potpisom — release APK sa novim potpisom neće moći da ga nadogradi, potrebna je deinstalacija (gubi se samo lokalna sesija). Redosled ostaje: P3 pre deploy-a i P6.

### 2026-09-13 — P3, Sanity nacrti (Claude)
U TOKU (kod gotov): Model: objavljen `<id>` + opcioni `drafts.<id>`, isto kao Sanity Studio. `status` je javna vidljivost objavljene verzije; rad bez objavljene verzije je uvek `draft` (ili `archived`). API: PATCH `/api/admin/artworks/[id]` čuva nacrt (kopija objavljenog dokumenta sa svim nepoznatim poljima, crop/hotspot i referencama + polja forme), opcioni `baseRevision` → 409 na zastarelu formu; POST `/api/admin/artworks` pravi samo `drafts.<clientId>` i ne duplira pri ponovnom pokušaju ni posle objave; nova ruta POST `/api/admin/artworks/[id]/publish` validira dokument koji postaje javan i u jednoj transakciji patch(ifRevisionID) nacrta i objavljene verzije → createOrReplace/create → delete samo tog nacrta; PATCH status: `published` = objava, `archived`/`draft` skrivaju objavljenu verziju i ne diraju nacrt. ID u ruti ne sme sadržati tačku (nema direktnog `drafts.*`). Forma više ne šalje status. Lista/detalj spajaju verzije (sadržaj iz nacrta, `hasDraft`, `hasPublished`, `revision`). Pregled čita `previewDrafts` preko serverskog admin klijenta (nacrti nisu javni); javni klijent ima `perspective: 'published'` da read token nikad ne otkrije nacrte. Mobilno: Sačuvaj nacrt / Pregledaj na sajtu (čuva pa otvara) / Objavi (izmene), obaveštenje o stanju verzije, poruke kad je čuvanje uspelo a objava nije, oznaka neobjavljenih izmena u listi i na početnoj. QA fixture prati novi ugovor. Pronađeno testom i ispravljeno: ponovljen create posle objave pravio bi nov nacrt preko objavljenog rada. Provere: 30/30 serverskih testova (13 za nacrte sa lažnim datasetom koji poštuje 409/ifRevisionID/atomske transakcije), root typecheck/lint/build, mobile typecheck/lint, curl smoke fixture-a, Sanity API prihvata `published`/`previewDrafts` na v2024-01-01. Nije provereno: stvaran Sanity mutate/transakcija, pregled nacrta na sajtu, Android UI.

### 2026-09-13 — Deploy priprema (Claude, po odobrenju vlasnika)
U TOKU: uklonjen slučajno praćen `supabase/.temp/` (0d36eb4, samo verzija CLI-ja, bez tajni). Grana pushovana, otvoren PR #1 u `main` (https://github.com/kolevmvk/zlaticart/pull/1). Vercel preview build prošao, PR mergeable/CLEAN. Merge nije izvršen: alat je blokirao merge bez ljudskog pregleda — merge radi vlasnik na GitHub-u. Posle merge-a: provera produkcionog deploy-a, pa probni rad nacrt → pregled → objava.

### 2026-09-13 — Produkciona provera P3 i ispravka odjave (vlasnik + Claude)
PR #1 mergovan (vlasnik), produkcija deployovana: sajt 200, `authConfigured: true`, pogrešan PIN 401 (Supabase limiter radi). `addmin-app/scripts/prod-drafts-smoke.sh` na produkciji: 23/25 PROŠLO (ceo tok nacrt → objava → izmena → pregled → objava → arhiviranje). PALO: odjava 500 i token ostao važeći. Uzrok: Supabase API Gateway vratio 504 na PATCH `admin_sessions` (bez Postgres greške), a ruta je grešku store-a mapirala na 500 bez loga. SQL kao `service_role` potvrdio da UPDATE radi i opozvao zaostalu probnu sesiju; ponovljena prijava+odjava: 200 za 0.58s, token posle 401 → prolazna greška. Ispravke (c1bd5e5 + ovaj commit): log PostgREST koda/poruke bez tajni, logout 503 umesto 500, ograničen retry opoziva za 5xx/mrežu (3 pokušaja), 4 nova testa (34/34). Probni rad `artwork-proba17893144645816` arhiviran — vlasnik ga briše u Studio-u. Sledeće: PR #2 → merge (vlasnik) → APK sa produkcionim API-jem (P6).

### 2026-09-13 — P6, prvi potpisan Android release (Claude)
U TOKU: `scripts/build-release-apk.sh` + `plugins/withReleaseSigning.cjs` (lozinke iz `~/.gradle/gradle.properties`, van repoa; bez njih release ostaje nepotpisan i skripta pada). Prvi build pao na pogrešno upisanoj lozinci — vlasnik ju je proverio `keytool -storepass:env` i ponovo upisao; drugi build prošao. Provere: apksigner sertifikat nije debug, ugrađen `https://www.zlaticart.com`, instalacija i pokretanje na fizičkom telefonu. Uočeno (UI, P1): Cormorant Garamond na Androidu pomera dijakritik (`došli` — kvačica odvojena); tekst je ispravan precomposed U+0161, problem je u fontu/renderu. Sledeće: vlasnik na telefonu prolazi D4 (login → novi rad sa fotografijom → nacrt → pregled → objava → izmena → sajt), zatim D5 (Wi-Fi/mobilni internet, restart).

| 2026-09-13 | Vlasnik + Claude | IZMENJENO | Puna paritetnost sa Studio-om (svih 8 tipova + Poruke) postaje prioritet ispred poliranja Radova. Pristup: jedan opis polja po tipu na serveru (usklađen sa `sanity/schemas`, test protiv odstupanja) koji pokreće generički API i mobilnu formu; validacija je eksplicitna po polju/tipu, ne skrivena. Odstupa od preporuke skill-a da se izbegne univerzalna forma — razlog: zahtev vlasnika za kompletnim panelom i jedan izvor istine protiv razilaženja sa Studio-om. Postojeće `/api/admin/artworks` rute ostaju zbog APK 0.2.0. |

### 2026-09-13 — Full S1 početak (Codex)
U TOKU: nova grana od osveženog origin/main; čisto radno stablo sačuvano. API proširenje čuva postojeće artworks rute. Opis polja i nezavisni testovi odvojeni po vlasništvu. Typecheck prvog API preseka prolazi; završni S1 testovi/build još nisu pokrenuti.

### 2026-09-13 — Full S1 provereno (Codex)
REALIZOVANO (S1 kod): svih osam tipova i sva polja opisano po Studio šemama, generički CRUD sa nacrtima, obaveznom revizijom, atomskom objavom, referencama i zaštitom postojećih podataka. 33 nova testa (21 mutacija, 7 ruta, 5 šema/validacija) i postojeći testovi prolaze. Root typecheck/lint i build (34 stranice, prirodni exit 0), mobile Node 22 typecheck/lint prolaze. Prvi sandbox build pao na mrežnom čitanju dnevnika; isti build sa mrežnim pristupom prošao. Xiaomi `d6d69a7b` dostupan preko adb. Sledeće: S1 PR, S2 implementacija; produkcioni sadržaj ostaje netaknut do S5 uvoza.
