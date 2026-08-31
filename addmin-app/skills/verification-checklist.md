# verification-checklist

## Svrha

Izvrsiva kontrolna lista za kraj svakog koraka pre upisa u `STATUS.md`.

## Obavezno po koraku

- Procitaj `STATUS.md` i aktivni roadmap dokument na pocetku sesije.
- Uradi samo jedan mali korak.
- Ne predji na sledeci korak u istoj sesiji.
- Ne ostavljaj build u polu-stanju.
- Upisi novi blok u `STATUS.md`.

## Kod

- `npm run typecheck`
- lint komanda projekta
- build/start komanda relevantna za korak
- nema tajni u klijentskom kodu
- nema nepotrebnih izmena glavnog `zlaticart` projekta

## UI

- loading state
- error state
- empty state gde ima liste
- success feedback
- Android emulator ili uredjaj proveren za svaki novi ekran

## Mreza

- uspesan put proveren
- neuspesan put proveren
- zasticene rute odbijaju neautentifikovan zahtev
- nema osetljivih podataka u logovima

## STATUS format

```text
## [DATUM] - Faza X, korak: [kratak opis]
Uradjeno: ...
Provereno: typecheck ✓ / build ✓ / [ostalo]
Sledece: ...
CEKA VLASNIKA: ...
```

