#!/bin/bash
# Produkcioni APK potpisan trajnim ključem.
#
#   EXPO_PUBLIC_ADMIN_API_URL=https://www.zlaticart.com ./scripts/build-release-apk.sh
#
# Preduslov: ~/.gradle/gradle.properties sa ZLATICART_UPLOAD_STORE_FILE,
# ZLATICART_UPLOAD_STORE_PASSWORD, ZLATICART_UPLOAD_KEY_ALIAS i
# ZLATICART_UPLOAD_KEY_PASSWORD (van repozitorijuma, chmod 600).
# Pre svakog novog release-a povećati `version` i `android.versionCode` u app.json.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${EXPO_PUBLIC_ADMIN_API_URL:?Set the production API URL}"
if [[ "$EXPO_PUBLIC_ADMIN_API_URL" != https://* ]]; then
  echo "Release API URL must use https://" >&2
  exit 1
fi
export EXPO_NO_DOTENV=1
export NODE_ENV=production
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
if [[ -z "${JAVA_HOME:-}" && -d "/Applications/Android Studio.app/Contents/jbr/Contents/Home" ]]; then
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
fi

npx --no-install expo prebuild --platform android --no-install
(cd android && ./gradlew :app:assembleRelease -PreactNativeArchitectures=arm64-v8a --console=plain)

APK=android/app/build/outputs/apk/release/app-release.apk
if [[ ! -f "$APK" ]]; then
  echo "Signed release APK not produced (missing ZLATICART_UPLOAD_* Gradle properties?)" >&2
  exit 1
fi

APKSIGNER=$(ls -d "$ANDROID_HOME"/build-tools/*/apksigner | sort -V | tail -1)
CERTS=$("$APKSIGNER" verify --print-certs "$APK")
if grep -q "CN=Android Debug" <<<"$CERTS"; then
  echo "APK is signed with the debug key" >&2
  exit 1
fi
grep -E "Signer #1 certificate (DN|SHA-256 digest)" <<<"$CERTS"

unzip -p "$APK" assets/index.android.bundle | node -e '
const chunks=[]; process.stdin.on("data", c=>chunks.push(c)); process.stdin.on("end", ()=>{
 const bundle=Buffer.concat(chunks)
 if(!bundle.includes(Buffer.from(process.env.EXPO_PUBLIC_ADMIN_API_URL))) {
  console.error("APK does not contain requested API URL"); process.exit(1);
 }
 if(bundle.includes(Buffer.from("127.0.0.1:4317"))) {
  console.error("APK still contains the QA fixture URL"); process.exit(1);
 }
 console.log("Embedded API URL verified:", process.env.EXPO_PUBLIC_ADMIN_API_URL);
});'
sha256sum "$APK" 2>/dev/null || shasum -a 256 "$APK"
