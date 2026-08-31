# draft-preview-link

## Svrha

Obrazac za "Pregledaj" tok: app dobija kratkotrajan preview link i otvara pravu Next.js stranicu u WebView/browser prikazu.

## Kada se koristi

- Faza 4: prvi dokaz na `artwork` ruti.
- Faze 5-8: ponovna upotreba za dnevnik, pocetnu, kontakt i druge relevantne stranice.

## Granice

- Glavni web projekat se dira samo za Draft Mode i preview endpoint, kako `CODEX.md` dozvoljava.
- App ne pokusava native da rekreira izgled sajta.
- Preview link je kratkotrajan i vezan za admin sesiju.

## Tok

1. Forma sacuva draft ili trenutne izmene kroz proxy.
2. App trazi preview link od proxy-ja.
3. Proxy pravi potpisan link ka web preview endpointu.
4. Web endpoint ukljucuje Next.js Draft Mode.
5. Sanity citanje koristi draft/preview perspektivu.
6. App otvara pravu stranicu u in-app prikazu.
7. Header jasno kaze: "PREGLED - nije jos objavljeno".

## Verifikacija

- draft se vidi u preview-u pre objave.
- javna stranica bez preview tokena ne prikazuje neobjavljeni draft.
- istekao ili los token ne ukljucuje draft mode.
- povratak iz preview-a cuva stanje forme.

