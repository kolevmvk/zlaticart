# ZlaticArt Admin — živi plan realizacije

Ažurirano: 2026-09-10. Zajednički plan za Codex, Claude i vlasnika projekta.

## Pravila nastavka rada

Na početku svake sesije koja nastavlja admin aplikaciju pročitaj ovaj dokument, zatim najnovije zapise u `../STATUS.md` i dokumentaciju aktivnog zadatka. Proveri stanje koda pre nego što prihvatiš ranije tvrdnje kao potvrđene.

Ovaj dokument je glavni izvor trenutnih prioriteta, statusa i sledećeg koraka. `../STATUS.md` ostaje hronološki dnevnik dokaza i provera. Raniji `07-ROADMAP.md` ostaje referenca izvornog obima; redosled isporuke iz ovog plana ima prednost nad njegovim starim redosledom. Ne prepisuj istorijske rezultate kao današnje provere.

Posle svakog smislenog koraka ažuriraj odgovarajući red, sledeći korak i dnevnik odluka. Statusi: **TODO**, **U TOKU**, **REALIZOVANO**, **IZMENJENO**, **ODBAČENO**, **BLOKIRANO**. REALIZOVANO zahteva dokaz i ispunjen kriterijum prihvatanja. Kod bez potrebnog testa ostaje U TOKU. IZMENJENO mora navesti novu specifikaciju i preostali posao; ODBAČENO razlog i eventualnu zamenu. Ne briši odbačene stavke niti prethodne odluke. BLOKIRANO mora navesti konkretan preduslov.

Uz promenu zabeleži datum, autora/agenta, šta se promenilo, zašto, proveru i relevantan fajl ili commit. Ne unositi PIN-ove, tokene, ključeve ili druge tajne. Rutinske promene unutar dogovorenog obima ne zahtevaju novo odobrenje; promene cilja ili odbacivanje obećanih funkcionalnosti potvrđuje vlasnik.

## Polazno stanje

Postoje Expo/React Native Android aplikacija, PIN prijava, lokalno čuvanje sesije, lista Radova, osnovna forma, upload fotografije, promene statusa i pregled sačuvanog rada. Ostale sekcije još nisu implementirane.

Provere 2026-09-10: mobilni typecheck i lint prolaze; typecheck glavnog projekta prolazi. Nije ponovljen Android build, test na telefonu ni provera produkcije. Ranija evidencija beleži API i delimične fizičke Android testove, ali kompletan UI submit i preview nisu potvrđeni. Postojanje koda nije dokaz spremnosti za predaju.

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
| A1 | TODO | Ograničenje pokušaja PIN-a i privremena blokada | Zaštita proverena i u serverskom okruženju sa više instanci |
| A2 | TODO | Obrada isteka sesije i ponovna prijava uz očuvanje unosa | Istek tokom uređivanja ne gubi formu |
| A3 | TODO | Serverski opoziv sesije pri odjavi | Opozvani token više ne daje pristup |
| A4 | TODO | Timeout zahteva i razumljive mrežne greške | Prekid veze ne ostavlja beskonačan indikator učitavanja |
| A5 | TODO | Upload: veličina/format, dozvole, prekid i ponovni pokušaj | Velike slike i odbijena kamera obrađeni; retry ne duplira rad |

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

## Tačan sledeći korak

**R1:** pregledati tok postojećeg image asset-a i alt opisa, omogućiti samostalnu izmenu alt opisa, proveriti čuvanje i ponovno učitavanje. Zatim R2 i R3. Nema potvrđene spoljne blokade za početak; dostupnost uređaja i produkcije proverava se kada bude potrebna.

## Dnevnik odluka i izmena

| Datum | Autor | Status | Odluka / razlog / dokaz |
|---|---|---|---|
| 2026-09-10 | Codex, po zahtevu vlasnika | REALIZOVANO | Sačuvan zajednički plan i povezana uputstva za nastavak rada. Ovo označava dokumentovanje, ne realizaciju aplikacije. |
| 2026-09-10 | Vlasnik + Codex | IZMENJENO | Prioritet isporuke: prvo pouzdani Radovi i Android APK (1–4), zatim puni admin (5–6); raniji roadmap ostaje referenca obima. |

Za naredni zapis: datum | agent | status | ID zadatka, promena, razlog, testovi, preostalo i commit/fajl.
