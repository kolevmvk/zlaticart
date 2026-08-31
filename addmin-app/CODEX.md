# CODEX.md — Master Orchestration za realizaciju ZlaticArt Admin App

Ovaj fajl je **operativni mozak** za autonoman/poluautonoman rad na `addmin-app` projektu. Namenjen je Codex-u (ili bilo kom agentskom coding alatu koji ovaj repo pokrene) kao trajna instrukcija: šta da pročita, koje "skillove" (playbook-ove) da sam sebi izgradi, koje uloge/agente da angažuje po fazi, kako da radi petlju verifikacije, i kako da racionalno troši svoj dnevni budžet u okviru limita korisničkog plana.

Ne piše proizvodni kod — piše **kako** se proizvodni kod treba raditi, fazu po fazu, počevši od već gotovog plana u `docs/01-08`.

---

## 0.1 Autonoman rad — od sada bez posrednika između sesija

Dosadašnje faze (Faza 0, prva dva-tri koraka) su rađene uz spoljnu reviziju (drugi AI alat je čitao svaki izveštaj i vraćao potvrdu/ispravku pre sledećeg koraka). **Ta revizija se od sada ukida.** Codex je sam sebi dovoljna kontrola kvaliteta — koristi petlju iz odeljka 1 i `skills/verification-checklist.md` kao zamenu za spoljnu reviziju, ne kao dodatak njoj.

To znači, konkretno:

- Posle svakog verifikovanog koraka, Codex **ne čeka** poruku tipa "postupi"/"nastavi"/potvrdu sadržaja izveštaja da bi krenuo na sledeći korak. Sledeća sesija počinje, čita `STATUS.md`, i **odmah** nastavlja na "Sledeće" polje iz poslednjeg zapisa — bez traženja odobrenja za rutinski korak koji je već gate-ovan ovim dokumentom.
- Jedini legitiman razlog da se stane i traži unos od vlasnika projekta je **stvarna blokada**: nerazrešeno pitanje u `08-OPEN_QUESTIONS.md`, gate kriterijum iz odeljka 4 koji ne prolazi i ne može se lokalno popraviti, ili situacija koja pogađa tvrde ograde iz odeljka 6. Sve ostalo — uključujući "da li je ovaj korak dovoljno dobar" — Codex ocenjuje sam, prema kriterijumima već napisanim u ovom fajlu i u `docs/`.
- Vlasnik projekta (Milan) i dalje periodično čita `STATUS.md` i `docs/08-OPEN_QUESTIONS.md` da vidi napredak i odgovori na stvarne blokade — ali to je **povlačenje** informacije od strane vlasnika, ne čekanje na odobrenje pre svakog koraka.
- Ako se pojavi nešto što ovaj dokument ili `docs/` ne pokrivaju (nova vrsta odluke, nejasnoća u šemi, konflikt između dva dokumenta) — to ide u `STATUS.md` pod "ČEKA VLASNIKA" tačno kao i do sada, i Codex prelazi na sledeći nezavisan korak (ako postoji) umesto da stane potpuno, ili zatvara sesiju ako nema nezavisnog koraka.

**Zašto:** svrha `CODEX.md` je upravo da bude dovoljno precizan da spoljna revizija više nije potrebna za rutinski napredak — ako se pokaže da nešto u ovom dokumentu nije bilo dovoljno jasno da Codex samostalno odluči, to je signal da treba doraditi **ovaj fajl** (zabeležiti u STATUS.md šta je nedostajalo), ne da se vrati stalna spoljna revizija.

---

## 0. Obavezno prvo čitanje (svaka nova sesija, ako je STATUS.md prazan ili ne postoji)

Redosled je bitan — svaki naredni dokument pretpostavlja prethodni:

1. `addmin-app/README.md` — orijentacija
2. `addmin-app/docs/01-IDEA.md` → `08-OPEN_QUESTIONS.md` — kompletan plan (ideja, spec, content model, arhitektura, auth/sigurnost, ekrani, roadmap, otvorena pitanja)
3. `addmin-app/STATUS.md` — **ako postoji**, ovo je stvarna trenutna tačka (šta je urađeno, šta je sledeće) — pouzdanije od pamćenja prethodne sesije. Ako STATUS.md postoji, čitanje 1-2 se može preskočiti i osloniti se samo na STATUS.md + dokument aktivne faze.
4. Glavni projekat `/Volumes/KoleOPS/zlaticart/CLAUDE.md` — legacy boundary i mission control pravila **glavnog** sajta (addmin-app ih ne krši: ne dira glavni kod osim gde je eksplicitno predviđeno — Draft Mode preview endpoint iz Faze 4).

**Pravilo:** ako `08-OPEN_QUESTIONS.md` ima nerazrešeno pitanje koje blokira sledeći korak (obeleženo u tom dokumentu), STANI i pitaj vlasnika projekta — ne pretpostavljaj odgovor, ne biraj "razumnu" vrednost bez naznake da je pretpostavka.

---

## 1. Osnovna petlja rada (važi za SVAKI korak, bez izuzetka)

```
PLANIRAJ → IZGRADI → PROVERI → ANALIZIRAJ → ODLUČI → ZABELEŽI → NASTAVI ili STANI
```

- **Planiraj** — pre pisanja koda, jednom rečenicom u sebi (i u commit poruci) definiši šta se u ovom koraku menja i zašto, referencirajući fazu iz `07-ROADMAP.md`.
- **Izgradi** — implementiraj **najmanji smisleni korak**, ne celu fazu odjednom. Faza 3 (upload fotografije), na primer, nije jedan korak — deli se na: forma bez upload-a → upload jedne slike → upload sa kompresijom → error handling.
- **Proveri** — obavezna, mehanička provera pre nego što se korak proglasi gotovim:
  - `npm run typecheck` (ili ekvivalent u Expo/RN projektu) — nula grešaka.
  - Lint — nula novih upozorenja.
  - Build (Expo build/prebuild ili barem `expo start` bez crash-a) — app se pokreće.
  - Za svaki ekran/formu: ručna ili automatizovana provera na Android emulatoru/uređaju (ovo je primarna platforma — vidi `04-ARCHITECTURE.md`).
  - Za mrežne pozive: provera i uspešnog i neuspešnog puta (slab signal, proxy vraća grešku) — vidi "Stanja koja svaki ekran mora obraditi" u `06-SCREENS.md`.
- **Analiziraj** — pre nego što se pređe dalje, kratko pitaj: da li ovaj korak zaista zadovoljava kriterijum te faze iz `07-ROADMAP.md`? Da li nešto od onoga što je upravo urađeno krši granice iz `05-AUTH_AND_SECURITY.md` (npr. token slučajno završio u app kodu)?
- **Odluči** — tri moguća ishoda: (a) korak je gotov, idi na sledeći, (b) korak nije gotov, popravi pre nastavka, (c) naišao si na otvoreno pitanje van tvoje nadležnosti — stani, zapiši u STATUS.md pod "ČEKA VLASNIKA", ne nagađaj.
- **Zabeleži** — svaki završen korak dobija liniju u `STATUS.md` (format ispod). Ovo je **jedini** način da naredna sesija (koja možda nema tvoju trenutnu memoriju) zna gde je stala.
- **Nastavi ili stani** — nastavi na sledeći korak SAMO ako dnevni budžet (odeljak 5) to dozvoljava. Inače, zaustavi se čisto (radni kod u konzistentnom, buildable stanju — nikad ne ostavljaj pola-napisanu funkciju preko noći).

**Zašto ovako strogo:** ovo je dugotrajan, višesesijski, delom autonoman rad — jedina odbrana od nagomilavanja tihih grešaka (loš auth, nevalidan Sanity dokument, slomljen build koji niko nije primetio tri faze unazad) je da se verifikacija nikad ne preskoči "da se uštedi vreme".

---

## 2. Skillovi koje treba sam sebi izgraditi (Faza 0, jednom, pre ostatka)

Pre nego što se krene na Fazu 1 iz `07-ROADMAP.md`, napraviti (kao dokumentovane playbook-ove, npr. `addmin-app/skills/*.md`, ili ekvivalentan mehanizam ako alat koji izvršava ovo podržava prave "skills"/"agents") sledeće ponovo-upotrebljive procedure — svaka se koristi više puta kroz faze, pa se isplati formalizovati jednom:

| Skill | Svrha | Prva upotreba |
|---|---|---|
| `expo-scaffold` | Kako se podiže/proširuje Expo projekat u ovom repo-u — struktura foldera, navigacija, TS config, konzistentno sa konvencijama glavnog `zlaticart` repo-a | Faza 0 |
| `sanity-proxy-mutation` | Standardni obrazac za: proxy endpoint prima autentifikovan zahtev → validira → izvršava Sanity `patch`/`create` mutaciju → vraća rezultat. Jednom napisan obrazac, ponovo se koristi za svaki od 8 tipova sadržaja | Faza 2, ponovo Faze 5-8 |
| `image-upload-pipeline` | Kamera/galerija → kompresija na uređaju → upload preko proxy-ja → Sanity asset reference. Najrizičniji deo sistema (vidi `07-ROADMAP.md` Faza 3) — vredi ga rešiti jednom, temeljno, i ponovo koristiti | Faza 3 |
| `draft-preview-link` | Kako se izdaje i konzumira preview link (Next.js Draft Mode + `previewDrafts` perspective + in-app WebView) — vidi mehanizam u `04-ARCHITECTURE.md` | Faza 4 |
| `crud-screen-pattern` | Standardni par ekrana Lista+Forma opisan u `06-SCREENS.md` — jednom kodiran kao template/komponenta, primenjen na sve tipove sadržaja umesto pisanja svakog od nule | Faza 2, ponovo za svaki tip |
| `supabase-proxy-read` | Standardni obrazac za: proxy endpoint čita iz Supabase preko `service_role` ključa (nikad sa uređaja), vraća listu poruka/porudžbina — paralelan `sanity-proxy-mutation`, ali read-only i drugi izvor podataka. Vidi `09-MESSAGES.md` | Faza 7 |
| `verification-checklist` | Konkretna, izvršiva verzija petlje iz odeljka 1 — checklist fajl koji se prolazi na kraju svakog koraka pre upisa u STATUS.md | Faza 0, koristi se svuda |

**Zašto skillovi, ne ad-hoc rad:** 8 tipova sadržaja sa istim CRUD obrascem (vidi `03-CONTENT_MODEL_MAPPING.md`) znači da se isti posao ponavlja 8 puta — bez formalizovanog obrasca, svaka naredna faza troši budžet na ponovno smišljanje istog rešenja umesto na stvarne razlike (koja polja, koji upload).

---

## 3. Uloge/agenti koje treba angažovati po fazi

Ako izvršni alat podržava prave sub-agente (kao `.claude/agents/` u glavnom projektu), formalizovati sledeće uloge kao odvojene agente. Ako ne podržava, tretirati kao **eksplicitne interne "šešire"** — pre svakog koraka jasno odrediti u kojoj si ulozi, da se ne meša sigurnosna pažnja sa UI odlukama u istom prolazu:

- **Mobile Architect** — Expo/React Native struktura, navigacija, state management (React Query/SWR). Vodi Fazu 0-1 i svaki `crud-screen-pattern` rad.
- **Auth/Security Engineer** — isključivo `admin-api` proxy auth tok, secure storage, rate limiting, i pristup bilo kom drugom "tajnom" ključu (Sanity write token, Supabase `service_role`). Vodi Fazu 1, i **jedini** koji sme dirati bilo šta vezano za token/ključ rukovanje (vidi `05-AUTH_AND_SECURITY.md` i `09-MESSAGES.md`) — ni jedna druga uloga ne improvizuje oko toga.
- **CMS Integration Engineer** — Sanity mutacije, GROQ upiti, validacija polja prema `sanity/schemas/`. Vodi `sanity-proxy-mutation` skill i sve CRUD faze (2, 5-6, 8).
- **Preview/Web Integration Engineer** — Next.js Draft Mode izmene na **glavnom** sajtu, in-app WebView integracija. Vodi Fazu 4. Radi na glavnom repo-u samo unutar granice koju `04-ARCHITECTURE.md` eksplicitno dozvoljava (Draft Mode + preview endpoint) — ne dira ništa drugo u glavnom projektu (poštuje `CLAUDE.md` legacy/mission-control pravila glavnog repo-a).
- **QA/Release Engineer** — verifikacioni checklist iz odeljka 1, Android sideload build proces, kasnije iOS build. Vodi Fazu 9 i učestvuje na kraju svake faze kao "gate" pre nego što se STATUS.md označi kao gotovo.

Svaka uloga, pre nego što nešto menja van svoje nadležnosti (npr. Mobile Architect dirne auth kod), staje i ili prebacuje na odgovarajuću ulogu ili eksplicitno beleži zašto je izuzetak opravdan.

---

## 4. Fazno izvršenje — gate kriterijumi

Mapira se 1:1 na faze iz `07-ROADMAP.md`. Svaka faza ima jasan **gate**: uslov koji mora biti tačan pre prelaska na sledeću. Ne preskakati faze; ne raditi dve faze paralelno u istoj sesiji (jedna kontaminira verifikaciju druge).

| Faza | Gate za prelazak dalje |
|---|---|
| 0 — Priprema | Sve iz `08-OPEN_QUESTIONS.md` razrešeno ILI eksplicitno odloženo uz zapisan razlog; Expo projekat se pokreće prazan, bez grešaka. |
| 1 — Auth | Login → sesijski token → dashboard radi end-to-end na pravom Android telefonu (sideload build); token se ne pojavljuje nigde u app kodu/bundle-u (ručna provera). |
| 2 — Radovi (read+status) | Lista radova učitava se sa Sanity-ja preko proxy-ja; promena statusa se odmah vidi i na webu (`/admin` ili sajtu) — dokaz da mutacija stvarno pogađa isti dataset. |
| 3 — Radovi (puna forma+upload) | Nova/izmenjena umetnina sa fotografijom vidljiva na pravom sajtu posle objave; upload testiran i na dobrom i na lošem signalu. |
| 4 — Preview | "Pregledaj" dugme otvara pravu, uživo renderovanu stranicu sajta sa nesačuvanim izmenama; jasno obeleženo da nije objavljeno. |
| 5 — Dnevnik | Isto kao Faza 3, za `journalPost`, uz preview iz Faze 4. |
| 6 — Izložbe | Isto, za `exhibition`, uz multi-upload fotografija. |
| 7 — Poruke | Lista kontakt poruka i porudžbina učitava se iz Supabase preko proxy-ja (`service_role` ključ nikad na uređaju); "Odgovori" dugme otvara mail app sa ispravno popunjenim primaocem. |
| 8 — Ostali tipovi | `artistProfile`, `educationItem`, `medium`, `socialItem` rade puni CRUD. |
| 9 — Podešavanja | Sva `siteSettings` polja izmenljiva i vidljiva na sajtu. |
| 10 — Kaljenje | Rate limiting testiran; iOS build barem na simulatoru radi; odluka o Play Store/App Store distribuciji zapisana (ili eksplicitno odložena). |

Ako gate nije zadovoljen, **ne prelazi se dalje** — vrati se u petlju iz odeljka 1 dok gate ne prođe, ili zapiši blokadu u STATUS.md pod "ČEKA VLASNIKA" ako je uzrok van tvoje kontrole.

---

## 5. Dnevno/sesijsko angažovanje u okviru limita korisničkog plana

**Popuni pre početka rada** (vlasnik treba da unese stvarne brojeve svog plana — bez ovoga, budžetiranje ispod je samo okvir, ne stvarni limit):

```
Plan: ____________________  (npr. ChatGPT Plus / Pro / API sa mesečnim budžetom)
Dnevni/nedeljni limit poruka ili budžeta: ____________________
Poznat prozor obnavljanja limita (npr. reset u ponoć, ili rolling 5h prozor): ____________________
```

### Principi rada u okviru limita (važe nezavisno od tačnih brojeva)

1. **Jedan fokusiran korak po sesiji, ne cela faza.** Manji, verifikovan korak koji se sigurno završi je bolji od velikog koraka koji pojede ceo dnevni budžet i ostane nedovršen na pola.
2. **STATUS.md je jedina memorija između sesija koja se sme koristiti kao izvor istine.** Na početku svake sesije: pročitaj SAMO `STATUS.md` + dokument aktivne faze (ne ceo plan od 01 do 08 iznova) — štedi budžet na ponovnom čitanju već poznatog.
3. **Ostavi rezervu, ne troši do poslednjeg tokena/poruke.** Kad se proceni da je preostalo ~20% dnevnog/sesijskog budžeta, ne započinji novi korak — završi trenutni, zapiši STATUS.md, stani. Ulazak u "budžet je nula usred nedovršene mutacije" je gori ishod od jednog kraćeg radnog dana.
4. **Ne ponavljaj istraživanje.** Skillovi iz odeljka 2 postoje upravo zato da se isto pitanje ("kako se ovde radi upload slike") ne rešava iznova svaki put — pozovi se na skill dokument, ne rekonstruiši ga.
5. **Prioritet kad je budžet mali:** radije završi i verifikuj jedan mali CRUD tip do kraja (npr. samo `medium`) nego da započneš dva veća zadatka koja oba ostanu nedovršena.
6. **Ako se limit potroši usred koraka:** ne ostavljaj build slomljen. Poslednja radnja pre stopa mora biti "kod je u stanju koje prolazi `typecheck`/build", čak i ako to znači da se nedovršena funkcija privremeno isključi/komentariše sa jasnom TODO napomenom u STATUS.md, ne u kodu (kod ostaje bez marker-komentara po pravilima glavnog projekta — status ide u STATUS.md).

### Granica dužine sesije — nova sesija po delu plana (obavezno, nezavisno od preostalog budžeta)

Dug kontekst unutar jedne sesije je sam po sebi rizik (degradacija kvaliteta odgovora, veća šansa da se izgubi nit, veća šansa da se pregazi granica iz odeljka 6) — ne samo pitanje potrošenog budžeta poruka. Zato važi tvrdo pravilo, odvojeno od budžetskog računanja iznad:

- **Svaki korak iz odeljka 1 (Planiraj→Izgradi→Proveri→Analiziraj→Odluči→Zabeleži) ide u sopstvenu, novu sesiju.** Ne nastavljati na sledeći korak u istoj, već dugoj sesiji, čak i ako bi budžet to dozvolio — dužina sesije se ograničava nezavisno od preostalog budžeta.
- Sesija se zatvara **odmah** nakon što je "Zabeleži" korak upisan u `STATUS.md` — ne dodavati "još samo jednu sitnicu" na kraju, to je najčešći način da se sesija neprimetno oduži i poveća rizik greške.
- Izuzetak dozvoljen samo za trivijalne, nerizične potpotez koji direktno i neposredno zatvaraju baš započeti korak (npr. ispravka tipfelera koju je `typecheck` odmah prijavio) — svaki novi *korak* (novi red u tabeli faza, novi skill, novi tip sadržaja) ide u novu sesiju, bez izuzetka.
- **Plansko zatvaranje sesije, ne "kad se pojavi problem".** Pre početka koraka, unapred proceni da li stane u jednu razumno kratku sesiju (npr. jedan CRUD ekran, jedna mutacija, jedan skill dokument) — ako procena kaže da je korak prevelik, podeli ga na manje pot-korake **pre** početka, svaki u svojoj sesiji, umesto da se to otkrije usred rada kad je već kasno da se čisto zaustavi.
- Na početku svake nove sesije, prva radnja je uvek čitanje `STATUS.md` (odeljak 5, princip 2) — to je mehanizam koji čini sesije bezbedno kratkim, jer nijedna sesija ne mora da "pamti" prethodnu.

**Zašto:** kombinacija "dugih sesija koje troše budžet" i "dugih sesija koje povećavaju rizik greške/bagova" su dva odvojena problema — prvi se rešava budžetskim rezervama (principi 1-6 iznad), drugi isključivo disciplinom "jedan korak = jedna sesija", bez obzira koliko je budžeta preostalo.

### Format loga u `STATUS.md` (kreirati fajl ako ne postoji, po uzoru na glavni projekat)

```
## [DATUM] — Faza X, korak: [kratak opis]
Urađeno: ...
Provereno: typecheck ✓ / build ✓ / [ostalo]
Sledeće: [tačno sledeći korak, dovoljno konkretno da sledeća sesija ne mora nagađati]
ČEKA VLASNIKA: [samo ako postoji blokada van kontrole]
```

**Zašto ovaj format:** sledeća sesija (možda bez ijednog tokena "sećanja" na ovu) mora moći da nastavi tačno gde je stalo, bez ponovnog čitanja cele istorije — to je jedini način da se budžet po sesiji troši na napredak, ne na rekonstrukciju konteksta.

---

## 6. Tvrde ograde (nikad ne kršiti, bez obzira na fazu ili pritisak budžeta)

- Sanity write token, Supabase `service_role` ključ, ili bilo koji drugi tajni ključ nikad ne idu u mobilni app kod/bundle — vidi `05-AUTH_AND_SECURITY.md` i `09-MESSAGES.md`. Ovo je jedino pravilo u celom projektu koje se ne sme prekršiti radi brzine.
- Instagram objavljivanje/metrike (`10-FUTURE_INSTAGRAM_METRICS.md`) se ne implementira dok preduslov (Meta App Review) nije potvrđeno zadovoljen od strane vlasnika — ne pokušavati "delimičnu" verziju bez odobrenih permisija.
- Ne diraj glavni `zlaticart` repo van eksplicitno dozvoljene granice (Draft Mode + preview endpoint, Faza 4) — glavni projekat ima svoj `CLAUDE.md` i `docs/STATUS.md`, ne mešati istoriju/status ta dva projekta.
- Ne izmišljaj sadržaj (nazive radova, biografske podatke, izložbe) — ovo je alat za unos, ne generator sadržaja.
- Ne preskači `07-ROADMAP.md` gate kriterijume da bi se "brže" stiglo do sledeće faze — nedovršena Faza 3 (upload) koja se ostavi za kasnije garantovano vraća skuplji dug u Fazama 5-6 koje je ponovo koriste.
- Ne piši dokumentacione/planning fajlove van onoga što je već postavljeno u `docs/` osim ako faza to eksplicitno traži (skillovi iz odeljka 2) — izbegavati gomilanje paralelnih "planova" koji se rasinhronizuju sa ovim fajlom.
