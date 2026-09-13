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
| P3 / API + UI | TODO | Nacrti bez promene javne verzije (N1–N3) | Sanity draft → sačuvaj pre pregleda → objavi | Novi/postojeći rad, bez duplikata; proizvod: ceo preview/publish tok |
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
| N1 | TODO | Zaseban nacrt izmene objavljenog rada, usklađen sa Sanity Studio tokom | Javna verzija ostaje dostupna i nepromenjena |
| N2 | TODO | Pregled prvo čuva nacrt pa otvara njegov prikaz | Sve izmene iz forme vidljive u pregledu |
| N3 | TODO | Objava nacrta i usklađivanje mobilnog i web admina | Javna verzija se menja tek nakon objave; nema duplih stavki |

Prihvatanje: proveriti novi rad i izmenu već objavljenog rada kroz nacrt → pregled → objava.

## Etapa 3 — Prijava i pouzdanost

| ID | Status | Zadatak | Kriterijum / dokaz |
|---|---|---|---|
| A1 | U TOKU | Ograničenje pokušaja PIN-a i privremena blokada | Zaštita proverena i u serverskom okruženju sa više instanci. Kod + testovi (2a1ba43); migracija nije primenjena na Supabase |
| A2 | U TOKU | Obrada isteka sesije i ponovna prijava uz očuvanje unosa | Istek tokom uređivanja ne gubi formu. Implementirano: 401 → prozor za PIN preko otvorenog ekrana; nije provereno na Androidu |
| A3 | U TOKU | Serverski opoziv sesije pri odjavi | Opozvani token više ne daje pristup. Kod + testovi (2a1ba43), opoziv gasi i preview; nije provereno na produkcionom store-u |
| A4 | U TOKU | Timeout zahteva i razumljive mrežne greške | Prekid veze ne ostavlja beskonačan indikator učitavanja. Implementirano: 20s/120s timeout, poruke po tipu greške, retry upita samo za mrežu/5xx; nije provereno na Androidu |
| A5 | U TOKU | Upload: veličina/format, dozvole, prekid i ponovni pokušaj | Velike slike i odbijena kamera obrađeni; retry ne duplira rad. Implementirano: priprema ≤3000px/≤3.8MB, server 4MB + provera bajtova, clientId za create, keš uploada; nije provereno na Androidu |

Prihvatanje: problemi sa sesijom i mrežom ne uzrokuju tihi gubitak unosa ili zaglavljenu aplikaciju.

## Etapa 4 — Prvi Android release

| ID | Status | Zadatak | Kriterijum / dokaz |
|---|---|---|---|
| D1 | TODO | Proveriti produkcioni API URL i serversku konfiguraciju | APK koristi dostupan produkcioni API; tajne ostaju na serveru |
| D2 | TODO | Trajni release ključ, rezervna kopija i verzionisanje | Definisan vlasnik ključa; release ne koristi debug potpis |
| D3 | TODO | Samostalan APK, instalacija i ažuriranje | Radi bez Metro servera i računara; proverena nadogradnja |
| D4 | TODO | Kompletan fizički Android test | Login → unos → fotografija → nacrt → pregled → objava → izmena → sajt |
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

## Tačan sledeći korak

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
