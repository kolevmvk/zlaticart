# Android release — potpisan APK

Produkcioni APK za Zlaticin telefon, sa API-jem `https://www.zlaticart.com`. Nije vezan za računar, Metro ni lokalnu mrežu.

## Ključ za potpisivanje

- Fajl: `~/.zlaticart-release/zlaticart-admin-release.jks`, alias `zlaticart-admin` (PKCS12, RSA 4096, važi 10000 dana).
- Kopije: Linux mašina i Mac mini (`milankolev@100.74.134.3`), istog SHA-256 (proveriti `sha256sum` / `shasum -a 256`). Preporuka: treća kopija van obe mašine (USB).
- Lozinka: samo kod vlasnika (menadžer lozinki) i u `~/.gradle/gradle.properties` mašine koja pravi build (chmod 600). Nikad u repozitorijumu, dokumentaciji, chatu ni APK-u.
- **Gubitak ključa ili lozinke** znači da postojeća instalacija ne može da se nadogradi — aplikacija mora da se deinstalira i ponovo instalira (podaci su na serveru; gubi se samo lokalna prijava).

`~/.gradle/gradle.properties` na mašini koja pravi build:

```
ZLATICART_UPLOAD_STORE_FILE=<apsolutna putanja do .jks>
ZLATICART_UPLOAD_KEY_ALIAS=zlaticart-admin
ZLATICART_UPLOAD_STORE_PASSWORD=<lozinka>
ZLATICART_UPLOAD_KEY_PASSWORD=<lozinka>
```

Bez ovih svojstava release ostaje nepotpisan i skripta pada — nikad se ne vraća na debug potpis (`plugins/withReleaseSigning.cjs`).

## Build

Iz `addmin-app/`, Node 22:

```sh
EXPO_PUBLIC_ADMIN_API_URL=https://www.zlaticart.com ./scripts/build-release-apk.sh
```

Skripta generiše native projekat, pravi ARM64 release APK, proverava da potpis nije debug, da je ugrađen produkcioni URL (i da nema QA fixture URL-a) i ispisuje SHA-256 sertifikata i APK-a.

APK: `android/app/build/outputs/apk/release/app-release.apk`.

Pre svakog novog release-a povećati `version` i `android.versionCode` u `app.json` (Android odbija nadogradnju na isti ili manji versionCode).

Build je samo `arm64-v8a` (svi savremeni Android telefoni). Stariji 32-bitni uređaj zahteva build sa `-PreactNativeArchitectures=armeabi-v7a,arm64-v8a`.

## Instalacija na telefon

Preko USB-a (razvojne opcije → USB debugging):

```sh
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

Bez računara: prebaciti APK na telefon (npr. Google Drive / kabl), otvoriti ga i dozvoliti „Instaliraj nepoznate aplikacije“ za aplikaciju iz koje se otvara.

**Prelaz sa ranijih test verzija:** verzije potpisane debug ključem (`com.zlaticart.admin` 0.1.0) ne mogu da se nadograde release APK-om — prvo ih deinstalirati. `com.zlaticart.admin.test` (internalTest) je zaseban paket i može da ostane.

## Nadogradnja

Novi APK sa većim versionCode, istim ključem: `adb install -r` ili otvaranje APK-a na telefonu. Prijava se čuva.
