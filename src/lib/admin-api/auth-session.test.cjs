/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness loads transpiled TypeScript. */
//
// P5: opoziv sesije i FAIL CLOSED ponašanje.
//
// Ovo su provere koje postojeci auth.test.cjs NE pokriva — on testira samo
// potpis/oblik/vreme tokena. Ovde se testira da opozvana sesija prestaje da
// radi i da nedostupan store ODBIJA pristup, a ne da ga propusti.
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const secret = 'isolated-unit-test-secret-not-a-production-credential'

// Ucitava auth.ts sa ubrizganim stubom store-a.
function loadAuth(storeStub) {
  const compiled = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, 'auth.ts'), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
  ).outputText
  const loaded = { exports: {} }
  const shim = name => {
    if (name === 'server-only') return {}
    if (name === './auth-store') return storeStub
    return require(name)
  }
  new Function('require', 'module', 'exports', compiled)(shim, loaded, loaded.exports)
  return loaded.exports
}

function withSecret(fn) {
  const previous = process.env.ADMIN_SESSION_SECRET
  process.env.ADMIN_SESSION_SECRET = secret
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      if (previous === undefined) delete process.env.ADMIN_SESSION_SECRET
      else process.env.ADMIN_SESSION_SECRET = previous
    })
}

function requestWith(token) {
  return new Request('https://example.test/api/admin/artworks', {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  })
}

test('aktivna sesija prolazi punu proveru', () => withSecret(async () => {
  const auth = loadAuth({ isSessionActive: async () => true })
  const token = auth.createAdminSessionToken()
  const claims = await auth.verifyAdminRequestWithSession(requestWith(token))
  assert.equal(claims.sub, 'zlaticart-admin')
  assert.match(claims.jti, /^[A-Za-z0-9_-]{16,64}$/)
}))

test('opozvana sesija se odbija iako je potpis ispravan', () => withSecret(async () => {
  const auth = loadAuth({ isSessionActive: async () => false })
  const token = auth.createAdminSessionToken()
  await assert.rejects(
    auth.verifyAdminRequestWithSession(requestWith(token)),
    error => error instanceof auth.AdminAuthError && error.code === 'session_revoked',
  )
}))

test('FAIL CLOSED: nedostupan store odbija pristup, ne propušta ga', () => withSecret(async () => {
  const auth = loadAuth({
    isSessionActive: async () => { throw new Error('store down') },
  })
  const token = auth.createAdminSessionToken()
  await assert.rejects(
    auth.verifyAdminRequestWithSession(requestWith(token)),
    error => error instanceof auth.AdminAuthError && error.code === 'store_unavailable',
  )
}))

test('store se ne konsultuje ako token nije ni validan', () => withSecret(async () => {
  let consulted = false
  const auth = loadAuth({
    isSessionActive: async () => { consulted = true; return true },
  })
  await assert.rejects(
    auth.verifyAdminRequestWithSession(requestWith('ocigledno.nije.token')),
    error => error instanceof auth.AdminAuthError && error.code === 'invalid_token',
  )
  assert.equal(consulted, false, 'nevalidan token ne sme da pravi upit ka store-u')
}))

test('zahtev bez Authorization zaglavlja se odbija', () => withSecret(async () => {
  const auth = loadAuth({ isSessionActive: async () => true })
  await assert.rejects(
    auth.verifyAdminRequestWithSession(requestWith(null)),
    error => error instanceof auth.AdminAuthError && error.code === 'invalid_token',
  )
}))

test('svaka prijava dobija svoj jti — inače opoziv gasi tuđu sesiju', () => withSecret(async () => {
  const auth = loadAuth({ isSessionActive: async () => true })
  const a = await auth.verifyAdminRequestWithSession(requestWith(auth.createAdminSessionToken()))
  const b = await auth.verifyAdminRequestWithSession(requestWith(auth.createAdminSessionToken()))
  assert.notEqual(a.jti, b.jti)
}))
