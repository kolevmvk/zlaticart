# Plan rezervnih kopija (bekap)

Konkretan, izvršiv plan za zaštitu sadržaja koji danas nema poznatu rezervnu kopiju. Ne zavisi od odluke o AWS migraciji hostinga (vidi [`PROCENA_AWS_MIGRACIJE_I_PLAN_BEKAPA.md`](PROCENA_AWS_MIGRACIJE_I_PLAN_BEKAPA.md)) — može se sprovesti odmah, nezavisno.

## Zašto ovo ima prioritet

Kod je već bezbedan (GitHub, `kolevmvk/zlaticart`). Ono što **nije** poznato-zaštićeno je sadržaj u dva spoljna SaaS servisa: Sanity (sav tekst i, najvažnije, **fotografije radova — neponovljivi originali**) i Supabase (poruke posetilaca). Gubitak bilo kog od ova dva bi bio ili nenadoknadiv (fotografije) ili bi prekinuo komunikaciju sa klijentima (poruke/porudžbine) bez traga.

## Šta se čuva

| Šta | Izvor | Format izvoza |
|---|---|---|
| Sanity dataset (sadržaj: radovi, dnevnik, izložbe, biografija, edukacija, podešavanja) | Sanity projekat `qm16j7ru` | `sanity dataset export` → NDJSON |
| Sanity image assets (fotografije radova, portret, atelje) | Isti export (uključen po default-u) ili odvojen preuzimanje preko asset API-ja | originalni fajlovi |
| `zlaticart.contact_submissions` | Supabase (deljena instanca) | `pg_dump` / Supabase CLI export → SQL |
| `zlaticart.commission_requests` | Supabase (deljena instanca) | `pg_dump` / Supabase CLI export → SQL |

Van automatizovanog dela, ručno i jednom:
- Env varijable/tokeni (Sanity, Supabase, budući `addmin-app` proxy ključevi) → kopija u password manager, nikad u repo.
- Snimak DNS konfiguracije domena (zapisi, TTL, registrar).

## Gde se čuva: AWS S3

- Privatan bucket, npr. `zlaticart-backups`, **versioning uključen** (štiti i od toga da loš backup tiho prepiše dobar).
- Lifecycle pravilo: backup stariji od 90 dana automatski prelazi u **S3 Glacier** (niža cena, dovoljno za arhivu koja se retko čita).
- Pristup isključivo preko namenskog IAM korisnika sa `PutObject`/`GetObject` pravom ograničenim na taj jedan bucket — ne root nalog, ne šire permisije.
- Cena za ovaj obim podataka (tekstualni sadržaj + fotografije jednog umetnika, nedeljni snapshotovi): reda veličine par centi do par dolara mesečno.

## Mehanizam: zakazani GitHub Action

Kod je već na GitHub-u — najprirodnije mesto za zakazani posao, bez nove infrastrukture za održavanje.

**`.github/workflows/backup.yml`** (opis, ne konačan kod — piše se u Fazi implementacije):

```yaml
on:
  schedule:
    - cron: "0 22 * * 0"   # nedeljom uveče
  workflow_dispatch: {}      # + ručno pokretanje po potrebi

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - export Sanity dataset (koristi SANITY_API_TOKEN iz GitHub Secrets)
      - export Supabase tabele (koristi SUPABASE_DB_URL / service role iz GitHub Secrets)
      - upload oba u S3 (koristi AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY iz GitHub Secrets),
        pod putanjama sanity/<datum>.tar.gz i supabase/<datum>.sql
      - ako bilo koji korak ne uspe: workflow status = failed → GitHub šalje email notifikaciju
```

Sve tajne (Sanity token, Supabase connection string, AWS ključevi) idu isključivo kao **GitHub Actions Secrets** — nikad u kodu, nikad u commit istoriji.

**Zašto nedeljno, ne dnevno:** sadržaj (radovi, dnevnik, izložbe) se ne menja svaki dan takvim tempom da bi dnevni backup bio vredan dodatne cene/kompleksnosti; nedeljno je dovoljno gusto da maksimalni gubitak u najgorem slučaju bude "poslednjih par dana rada", ne meseci.

## Provera da backup stvarno radi

Backup koji se nikad nije probao vratiti nije proveren backup — tiho pokvaren export bi inače prošao neopaženo mesecima. Plan provere:

- **Jednom u nekoliko meseci:** ručno preuzeti poslednji S3 export i uvesti Sanity deo u prazan test-dataset (`sanity dataset import --dataset test-restore`) — potvrđuje da fajl nije korumpiran i da sadrži ono što se očekuje.
- Isto, povremeno, učitati poslednji Supabase SQL export u lokalnu/test Postgres instancu.
- Svaki neuspeo restore test se tretira kao ozbiljan nalaz — znači da nedelje/meseci backupa mogu biti neupotrebljivi.

## Koraci implementacije (redosled)

1. Kreirati AWS nalog (ako ne postoji), S3 bucket, i namenski IAM korisnik sa ograničenim pravima — zahteva odluku i pristup vlasnika, van ovog dokumenta.
2. Kreirati GitHub Actions Secrets: `SANITY_API_TOKEN`, `SUPABASE_DB_URL` (ili ekvivalent), `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
3. Napisati i testirati `.github/workflows/backup.yml` — prvo ručno pokretanje (`workflow_dispatch`) pre nego što se osloni na cron raspored.
4. Prva ručna restore provera (vidi gore) — potvrđuje da ceo lanac stvarno radi, ne samo da "upload ne baca grešku".
5. Tek posle uspešne restore provere, smatrati backup sistem pouzdanim i osloniti se na njega.

Ovaj dokument ne implementira ništa od navedenog — čeka odluku vlasnika da krene na Korak 1 (AWS nalog/bucket), pošto to zahteva pristup koji je van dometa ove sesije.
