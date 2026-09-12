# Android test — 2026-09-11

## Rezultat

Izgrađen i instaliran samostalan ARM64 test APK, paket `com.zlaticart.admin.test`, naziv „ZlaticArt Admin Test“. Debug ključ je namerno korišćen za internu proveru. Ovo nije produkciona isporuka; postojeća aplikacija ima drugi paket i ne prepisuje se.

APK: `android/app/build/outputs/apk/internalTest/app-internalTest.apk` (putanja od `addmin-app/`).
SHA-256: `a7395d29c58691e67518e4dedae9db32a8fc08005223f5870d54f19b93b253d4`
API ugrađen u ovaj APK: `http://127.0.0.1:4317`. Provereno prisustvo ispravnog URL-a i odsustvo starog LAN URL-a u ugrađenom bundle-u.

## Šta je provereno

Android 35, emulator-5556, samostalan internalTest build sa zapakovanim JS-om; ne zavisi od Metro servera. Lokalni fixture API ima samo sintetičke podatke i ne komunicira sa Sanity/Supabase.

| Provera | Rezultat | Dokaz |
|---|---|---|
| Instalacija i pokretanje zasebnog paketa | PASS | Gradle BUILD SUCCESSFUL, adb install Success |
| Prijava i dashboard | PASS | qa/2026-09-11/login.png, dashboard.png |
| Android Back posle izmene | PASS | dirty.png; „Nastavi izmenu“ zadržava formu |
| Čuvanje izmenjenog naziva, alt opisa i uklonjene tehnike | PASS, fixture | API readback potvrđuje sve tri vrednosti; saved.png prikazuje potvrdu |
| Povratak na listu posle čuvanja | PASS | saved.png, bez petlje navigacione zaštite |
| Ponovno pokretanje aplikacije | PASS | Sesija obnovljena, dashboard ponovo učitan |
| Dashboard sa font scale 1.3 | PASS, ograničen vizuelni pregled | large-text.png; vraćeno podešavanje 1.0 |
| Mobilni typecheck/lint | PASS | npm run typecheck; npm run lint |
| Kritične serverske mutacije | PASS, izolovani testovi | 9 testova u artwork-mutation.test.cjs |
| Kamera/galerija/upload na fizičkom telefonu | NOT RUN | Potreban fizički uređaj |
| Kompletan preview/publish prema stvarnom CMS-u | NOT RUN | P3 i produkciona integracija još nisu završeni |
| Slaba mreža, istek sesije, svi status/filter tokovi | NOT RUN | Preostali QA i P5 |

Fixture PASS potvrđuje UI transport i ponašanje; nije dokaz produkcione CMS integracije. Logo na testnom radu je samo kontrolna slika, ne stvarno umetničko delo.

## Prvi test na telefonu preko USB-a

Ovaj konkretan APK koristi loopback API i zahteva USB/ADB vezu sa računarom. Sam telefon bez veze sa test serverom neće moći da se prijavi. Za Wi-Fi ili rad van kuće potreban je drugi API URL i novi build; ne tvrditi da ovaj APK radi preko mobilnog interneta.

Sa računara, iz `addmin-app/`:

```sh
node scripts/qa-fixture.cjs
# U drugom terminalu, nakon što telefon odobri USB debugging:
adb devices
adb -s SERIAL_TELEFONA reverse tcp:4317 tcp:4317
adb -s SERIAL_TELEFONA install -r android/app/build/outputs/apk/internalTest/app-internalTest.apk
```

Ako test server već radi na portu 4317, ne pokretati duplikat. Ne gasiti nepoznat proces. Testni server prihvata proizvoljnih šest cifara — ne unositi pravi PIN. Podaci su u memoriji i resetuju se restartom servera.

1. Otvori „ZlaticArt Admin Test“ i prijavi se testnim ciframa.
2. Proveri čitljivost početne i liste, pretragu i filtere.
3. Otvori testni rad, promeni naziv/opis fotografije i izaberi „Bez tehnike“.
4. Pritisni Back, izaberi „Nastavi izmenu“, pa „Sačuvaj nacrt“.
5. Proveri potvrdu i ponovo otvori rad da potvrdiš izmene.
6. Zatvori i ponovo otvori aplikaciju; zabeleži svaku grešku i korake.

Fixture ne implementira upload pipeline; kamera/galerija mogu se vizuelno proveriti, ali pravi upload ostaje za integracioni test. Ne predstavljati fixture objavu/pregled kao objavu na sajtu.

## Ponovljiv build

```sh
EXPO_PUBLIC_ADMIN_API_URL=http://127.0.0.1:4317 ./scripts/build-internal-apk.sh
```

Skript generiše native projekat iz Expo konfiguracije, pravi ARM64 internalTest i proverava URL u APK-u. Expo config plugin održava odvojeni paket i dozvoljava HTTP samo testnoj varijanti. Gradle cache za bundle zavisi od test API URL-a. Javnu distribuciju i produkciono potpisivanje rešavati u P6.

Napomena: Expo 57 development virtual env može učitati `.env.local` uprkos EXPO_NO_DOTENV; ova provera koristi produkciono zapakovan JS sa eksplicitnim URL-om. Nisu menjane postojeće .env datoteke.
