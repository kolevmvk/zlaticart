const { withAppBuildGradle, withDangerousMod } = require('expo/config-plugins')
const fs = require('node:fs/promises')
const path = require('node:path')

const buildType = `
        internalTest {
            initWith release
            applicationIdSuffix ".test"
            versionNameSuffix "-test"
            signingConfig signingConfigs.debug
            matchingFallbacks = ['release']
        }
`
function addInternalTest(contents) {
  if (!contents.includes('    buildTypes {')) throw new Error('Android buildTypes block not found')
  const result = contents.includes('internalTest {') ? contents : contents.replace('    buildTypes {', '    buildTypes {' + buildType)
  if (result.includes("inputs.property('internalTestApiUrl'")) return result
  return result + `\n// Invalidate the embedded bundle when the test API target changes.\ntasks.configureEach {\n    if (name == 'createBundleInternalTestJsAndAssets') {\n        inputs.property('internalTestApiUrl', System.getenv('EXPO_PUBLIC_ADMIN_API_URL') ?: '')\n    }\n}\n`
}
const manifest = `<manifest xmlns:android="http://schemas.android.com/apk/res/android" xmlns:tools="http://schemas.android.com/tools">
  <application android:label="ZlaticArt Admin Test" android:usesCleartextTraffic="true" tools:replace="android:label" />
</manifest>
`
function withInternalTest(config) {
  config = withAppBuildGradle(config, mod => {
    mod.modResults.contents = addInternalTest(mod.modResults.contents)
    return mod
  })
  return withDangerousMod(config, ['android', async mod => {
    const folder = path.join(mod.modRequest.platformProjectRoot, 'app/src/internalTest')
    await fs.mkdir(folder, { recursive: true })
    await fs.writeFile(path.join(folder, 'AndroidManifest.xml'), manifest)
    return mod
  }])
}
module.exports = withInternalTest
module.exports.addInternalTest = addInternalTest
module.exports.manifest = manifest
