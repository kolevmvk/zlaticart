#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${EXPO_PUBLIC_ADMIN_API_URL:?Set the test API URL reachable from the phone}"
if [[ "$EXPO_PUBLIC_ADMIN_API_URL" != http://* && "$EXPO_PUBLIC_ADMIN_API_URL" != https://* ]]; then
  echo "Test API URL must start with http:// or https://" >&2
  exit 1
fi
export EXPO_NO_DOTENV=1
export NODE_ENV=production
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
if [[ -z "${JAVA_HOME:-}" && -d "/Applications/Android Studio.app/Contents/jbr/Contents/Home" ]]; then
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
fi
npx --no-install expo prebuild --platform android --no-install
cd android
./gradlew :app:assembleInternalTest -PreactNativeArchitectures=arm64-v8a --console=plain

unzip -p app/build/outputs/apk/internalTest/app-internalTest.apk assets/index.android.bundle | node -e '
const chunks=[]; process.stdin.on("data", c=>chunks.push(c)); process.stdin.on("end", ()=>{
 if(!Buffer.concat(chunks).includes(Buffer.from(process.env.EXPO_PUBLIC_ADMIN_API_URL))) {
  console.error("APK does not contain requested test API URL"); process.exit(1);
 }
 console.log("Embedded test API URL verified");
});'
