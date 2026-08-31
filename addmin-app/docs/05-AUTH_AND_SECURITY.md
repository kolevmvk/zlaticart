# 05 — Autentifikacija i bezbednost

Odabrani pristup (potvrđeno sa vlasnikom projekta): **Sanity token + jednostavan PIN/lozinka**, gde app nikad direktno ne drži Sanity write token — token živi isključivo na serverskoj strani proxy-ja opisanog u [`04-ARCHITECTURE.md`](04-ARCHITECTURE.md).

## Tok logovanja

1. Zlatica unosi PIN (ili lozinku) u app.
2. App šalje PIN preko HTTPS na `admin-api` proxy (`POST /api/admin/login`).
3. Proxy proverava PIN protiv hash-ovane vrednosti čuvane kao environment varijabla (ne u bazi — jedan korisnik, nema potrebe za user tabelom).
4. Ako je ispravan, proxy izdaje **kratkotrajan, potpisan sesijski token** (JWT, npr. 24h TTL, ili duže uz "zapamti me" na poverljivom uređaju).
5. App čuva taj sesijski token u **secure storage-u uređaja** (`expo-secure-store` — Keychain na iOS, Keystore na Android), nikad u plain AsyncStorage.
6. Svaki naredni API poziv (lista radova, upload slike, izmena) nosi sesijski token; proxy ga verifikuje i tek onda koristi **svoj** server-side Sanity write token da izvrši stvarnu mutaciju.

## Šta app UVEK radi

- Čuva samo kratkotrajni sesijski token, nikad Sanity token.
- Koristi `expo-secure-store` (ili ekvivalent) za bilo koji osetljivi podatak na uređaju.
- Automatski odjavljuje (briše sesijski token) posle isteka TTL-a ili eksplicitne odjave.
- Sve mrežne pozive šalje isključivo preko HTTPS ka proxy domenu (nikad direktno ka `api.sanity.io` sa write namerom).

## Šta app NIKAD ne radi

- Ne ugrađuje Sanity API token u app bundle, kod, ili bilo koji fajl koji ide u APK/IPA.
- Ne šalje PIN u plaintext logovima ili crash-reporting alatima.
- Ne dozvoljava neograničene pokušaje PIN-a bez rate-limitinga na proxy strani (sprečava brute-force ako je telefon izgubljen/ukraden a app zaključana ekranom uređaja probijena).

## Rate limiting i lockout

Proxy `login` endpoint ograničava pokušaje (npr. 5 pogrešnih PIN-ova → privremeni lockout od nekoliko minuta, eksponencijalno rastući). Ovo je jedini korisnik sistema, pa lockout ne pravi problem timu — samo usporava napadača.

## Zašto ne biometrija (Face ID / otisak prsta) u MVP-u

Razmotreno, ali izostavljeno iz MVP-a: biometrija bi bila **dodatna** zaštita nad postojećim sesijskim tokenom (otključavanje app-a na uređaju), ne zamena za PIN+proxy model — može se dodati posle MVP-a kao UX poboljšanje (vidi [`07-ROADMAP.md`](07-ROADMAP.md)) bez menjanja osnovne bezbednosne arhitekture.

## Zašto ovaj pristup umesto Sanity Studio-nivo (OAuth) logina

Razmotrena alternativa (Google/email OAuth kroz Sanity, isti mehanizam kao web `/admin`) je bezbednosno ekvivalentna, ali mobilni OAuth deep-link tok (redirect nazad u app, upravljanje refresh tokenima direktno na uređaju) je značajno kompleksniji za realizaciju i testiranje na oba OS-a, za dobitak koji ovde nije neophodan — jedan poznat korisnik, ne treba "Sign in with Google" iskustvo. PIN + server-side proxy daje istu suštinsku garanciju (token nikad na uređaju) uz mnogo jednostavniju implementaciju.

**Zašto ovo dobija poseban dokument:** ovo je jedina komponenta u celom planu koja, ako se pogrešno implementira, izlaže **ceo javni sajt** riziku (isti Sanity dataset, isti write pristup kao Studio) — vredi eksplicitno dokumentovati granicu pre nego što se piše ijedna linija koda.
