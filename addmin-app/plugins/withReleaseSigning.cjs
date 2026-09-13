const { withAppBuildGradle } = require('expo/config-plugins')

// Release APK se potpisuje trajnim ključem, nikad debug ključem.
// Putanja i lozinke dolaze iz Gradle svojstava van repozitorijuma
// (~/.gradle/gradle.properties); bez njih release ostaje NEPOTPISAN, pa
// build-release-apk.sh pada umesto da tiho isporuči debug potpis.
const PROPERTIES = ['ZLATICART_UPLOAD_STORE_FILE', 'ZLATICART_UPLOAD_STORE_PASSWORD', 'ZLATICART_UPLOAD_KEY_ALIAS', 'ZLATICART_UPLOAD_KEY_PASSWORD']

const signingConfig = `
        release {
            if (${PROPERTIES.map(name => `project.hasProperty('${name}')`).join(' && ')}) {
                storeFile file(ZLATICART_UPLOAD_STORE_FILE)
                storePassword ZLATICART_UPLOAD_STORE_PASSWORD
                keyAlias ZLATICART_UPLOAD_KEY_ALIAS
                keyPassword ZLATICART_UPLOAD_KEY_PASSWORD
            }
        }
`
const debugRelease = `            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug
`
const ownRelease = `            // Trajni ključ (plugins/withReleaseSigning.cjs); bez svojstava APK ostaje nepotpisan.
            signingConfig project.hasProperty('ZLATICART_UPLOAD_STORE_FILE') ? signingConfigs.release : null
`

function addReleaseSigning(contents) {
  if (contents.includes('ZLATICART_UPLOAD_STORE_FILE')) return contents
  if (!contents.includes('    signingConfigs {') || !contents.includes(debugRelease)) {
    throw new Error('Android release signing block not found; update withReleaseSigning.cjs for the new template')
  }
  return contents
    .replace('    signingConfigs {', '    signingConfigs {' + signingConfig)
    .replace(debugRelease, ownRelease)
}

function withReleaseSigning(config) {
  return withAppBuildGradle(config, mod => {
    mod.modResults.contents = addReleaseSigning(mod.modResults.contents)
    return mod
  })
}
module.exports = withReleaseSigning
module.exports.addReleaseSigning = addReleaseSigning
