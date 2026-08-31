# Procena migracije na AWS i plan rezervnih kopija

Ovaj dokument je **procena**, ne odluka o izvršenju — pokriva dva odvojena pitanja koja su zajedno postavljena: (1) da li i pod kojim uslovima ima smisla premestiti hosting sajta sa Vercel-a na AWS, i (2) konkretan plan rezervnih kopija (backup) za sadržaj koji danas nema poznatu zaštitu, nezavisno od bilo koje hosting odluke.

## Trenutno stanje (osnova za procenu)

- **Next.js 15.5** deployovan na **Vercel** — koristi Vercel-ov automatski image optimization pipeline (`next/image`, AVIF/WebP), zero-config preview deploy po branch-u, i planirani Draft Mode za `addmin-app` preview (vidi `addmin-app/docs/04-ARCHITECTURE.md`) koji se oslanja na dinamičko SSR renderovanje.
- **Sanity CMS** — spoljni SaaS (projekat `qm16j7ru`), izvor istine za sav tekstualni sadržaj i fotografije radova. Hostovan na Sanity-jevoj infrastrukturi, ne na Vercel-u.
- **Supabase** — spoljni SaaS (deljena instanca sa drugim projektima), čuva `zlaticart.contact_submissions` i `zlaticart.commission_requests`.
- **GitHub** (`kolevmvk/zlaticart`) — kod je već bezbedan i nezavisan od Vercel-a.
- `/admin` (Sanity Studio) je `force-dynamic` SSR ruta unutar istog Next.js projekta.
- Sajt se menja i deployuje gotovo dnevno (vidi `docs/STATUS.md`) — aktivan proizvod u razvoju, ne statičan sajt u mirovanju.

---

## Deo 1 — Procena migracije na AWS

### Prepreke i problemi

1. **Vercel-specifične pogodnosti se ne prenose automatski.** Image optimizacija, edge caching, i (planirani) Draft Mode danas rade "iz kutije". Ekvivalent na AWS-u realno ide preko **OpenNext** frameworka (Lambda@Edge/CloudFront + S3 + Lambda) — to je nov deployment sloj koji treba izgraditi i održavati, ne prosto premeštanje fajlova.

2. **`/admin` je dinamička SSR ruta.** Mora raditi ispravno na novoj arhitekturi (Lambda cold-start, timeout limiti) — rizik da admin panel postane sporiji ili nestabilniji nego danas.

3. **Sanity i Supabase ostaju spoljni bez obzira na AWS.** Sanity je SaaS koji se ne migrira (samo-hostovanje je ogroman, nesrazmeran poduhvat). Supabase je već spoljni Postgres — da bi AWS migracija stvarno smanjila broj spoljnih zavisnosti, trebalo bi zameniti i Supabase (RDS/Aurora + sopstveni auth/storage sloj) — to je **potpuno odvojen, veći projekat**, ne deo "premesti hosting".

4. **Nema CI/CD infrastrukture van Vercel-a danas.** Trenutni git-push-deploy tok bi trebalo zameniti sopstvenim pipeline-om (CodePipeline/GitHub Actions → ECR/ECS ili Amplify Hosting) — dodatna infrastruktura za pisanje i održavanje (IaC, monitoring, logovi), za sajt koji se održava solo.

5. **Rizik prekida tokom migracije.** Sajt se deployuje skoro svakodnevno, sa realnim saobraćajem. Cutover domena/DNS-a i prva nedelja na novoj infrastrukturi nosi povišen rizik za proizvod koji trenutno radi dobro.

6. **Cena/korist je sumnjiva za ovaj obim.** Za sajt jednog umetnika, Vercel-ov besplatan/Pro tier realno već pokriva potrebe uz nula DevOps posla. AWS ekvivalent (CloudFront + Lambda + Route53 + monitoring) verovatno ne bi bio jeftiniji kad se uračuna vreme izgradnje i održavanja — dobitak bi bio kontrola/nezavisnost od Vercel-a, ne novac ni performanse.

7. **Ripple efekat na `addmin-app`.** Ceo plan mobilne admin aplikacije pretpostavlja da `admin-api` proxy živi unutar postojećeg Vercel projekta (`addmin-app/docs/04-ARCHITECTURE.md`). Promena hosting platforme za glavni sajt bi zahtevala reviziju tog plana takođe.

### Zaključak procene

Puna migracija hostinga na AWS trenutno nosi **visok inženjerski rizik/trud za nejasnu korist**, dok se proizvod aktivno razvija i menja. Nema danas identifikovanog konkretnog razloga (trošak koji je postao problem, vendor lock-in koji ometa nešto stvarno, compliance zahtev) koji bi opravdao taj trud. Preporuka: **odloženo**, ne odbačeno — ako se pojavi konkretan okidač, ovaj dokument je polazna tačka za ponovnu procenu.

Ono što **jeste** vredno iz AWS sveta, bez rizika pune migracije: rezervne kopije (Deo 2).

---

## Deo 2 — Plan rezervnih kopija (bekap)

Razrađen kao poseban dokument: **[`docs/PLAN_BEKAPA.md`](PLAN_BEKAPA.md)** — šta je izloženo riziku, gde se backup čuva, mehanizam (zakazani GitHub Action → AWS S3), i kako se proverava da backup stvarno radi. Ovde ostaje samo veza ka njemu da se izbegne dupliranje istog sadržaja na dva mesta.
