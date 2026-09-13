/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness loads transpiled TypeScript. */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createHmac } = require('node:crypto')
const ts = require('typescript')
const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, 'auth.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const loaded = { exports: {} }
// auth.ts uvozi ./auth-store za proveru opoziva; u izolovanom testu ga
// stubujemo — ovaj fajl testira SAMO potpis/oblik/vreme tokena.
const requireShim = name => {
  if (name === 'server-only') return {}
  if (name === './auth-store') return { isSessionActive: async () => true }
  return require(name)
}
new Function('require', 'module', 'exports', compiled)(requireShim, loaded, loaded.exports)
const { createAdminSessionToken, verifyAdminSessionToken, AdminAuthError } = loaded.exports
const secret = 'isolated-unit-test-secret-not-a-production-credential'
const now = 100000
const jti = 'AAAAAAAAAAAAAAAAAAAAAA'
const claims = { sub: 'zlaticart-admin', jti, iat: now, exp: now + 86400 }
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url')
function signed(payload, header = { alg: 'HS256', typ: 'JWT' }) {
  const content = `${encode(header)}.${encode(payload)}`
  return `${content}.${createHmac('sha256', secret).update(content).digest('base64url')}`
}
function rejected(token) {
  assert.throws(() => verifyAdminSessionToken(token, now), error => error instanceof AdminAuthError && error.code === 'invalid_token')
}
test('session verification rejects malformed, mistimed and tampered tokens', () => {
  const previous = process.env.ADMIN_SESSION_SECRET
  process.env.ADMIN_SESSION_SECRET = secret
  try {
    const token = createAdminSessionToken(now, jti)
    assert.deepEqual(verifyAdminSessionToken(token, now), claims)
    assert.deepEqual(verifyAdminSessionToken(token, now + 86399), claims)
    assert.throws(() => verifyAdminSessionToken(token, now + 86400), { code: 'invalid_token' })
    for (const value of [token + '.extra', token + '.', token.slice(0, -1), '', 'a.b', '.b.c']) rejected(value)
    for (const payload of [null, [], {}, { ...claims, exp: undefined }, { ...claims, iat: undefined },
      { ...claims, exp: String(claims.exp) }, { ...claims, exp: null },
      { ...claims, iat: now + 1 }, { ...claims, iat: now - 1 },
      { ...claims, exp: now }, { ...claims, exp: now - 1 },
      { ...claims, exp: now + 86401 }, { ...claims, exp: now + 0.5 },
      { ...claims, sub: 'different-subject' },
      // Bez jti opoziv nije moguć — takav token se ne sme prihvatiti.
      { ...claims, jti: undefined }, { ...claims, jti: '' }, { ...claims, jti: 'prekratak' },
      { ...claims, jti: 123 }, { ...claims, jti: 'ima nedozvoljen znak!!' }]) rejected(signed(payload))
    for (const header of [null, {}, { alg: 'none', typ: 'JWT' }, { alg: 'HS512', typ: 'JWT' }, { alg: 'HS256', typ: 'other' }]) rejected(signed(claims, header))
    const changedPayload = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ ...claims, exp: now + 5 })}.${token.split('.')[2]}`
    rejected(changedPayload)
  } finally {
    if (previous === undefined) delete process.env.ADMIN_SESSION_SECRET
    else process.env.ADMIN_SESSION_SECRET = previous
  }
})
