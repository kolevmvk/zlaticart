/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness loads transpiled TypeScript. */
//
// P5 tačka 4: namenski preview token umesto sesijskog tokena u URL-u.
//
// Proverava da preview token otvara samo jedan rad, kratko traje, ne može da
// zameni sesijski token (ni obrnuto) i da prestaje da važi kad se sesija opozove.
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const secret = 'isolated-unit-test-secret-not-a-production-credential'
const sid = 'BBBBBBBBBBBBBBBBBBBBBB'
const now = 200000

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

const scope = { type: 'artwork', slug: 'plavi-horizont-abc123', sid }
const invalid = { code: 'invalid_token' }

test('preview token nosi tačan opseg i ističe na vreme', () => withSecret(() => {
  const auth = loadAuth({ isSessionActive: async () => true })
  const token = auth.createPreviewToken(scope, auth.PREVIEW_LINK_TTL_SECONDS, now)
  const claims = auth.verifyPreviewToken(token, now)
  assert.equal(claims.slug, scope.slug)
  assert.equal(claims.sid, sid)
  assert.equal(claims.exp - claims.iat, 300)
  auth.verifyPreviewToken(token, now + 299)
  assert.throws(() => auth.verifyPreviewToken(token, now + 300), invalid)
}))

test('rok duži od dozvoljenog se ne izdaje', () => withSecret(() => {
  const auth = loadAuth({ isSessionActive: async () => true })
  assert.throws(() => auth.createPreviewToken(scope, 24 * 60 * 60, now))
  assert.throws(() => auth.createPreviewToken({ ...scope, slug: '../admin' }, 60, now), invalid)
  assert.throws(() => auth.createPreviewToken({ ...scope, type: 'siteSettings' }, 60, now), invalid)
}))

test('sesijski token nije preview token, a preview token nije sesijski', () => withSecret(() => {
  const auth = loadAuth({ isSessionActive: async () => true })
  const session = auth.createAdminSessionToken(now, sid)
  const preview = auth.createPreviewToken(scope, 60, now)
  assert.throws(() => auth.verifyPreviewToken(session, now), invalid)
  assert.throws(() => auth.verifyAdminSessionToken(preview, now), invalid)
}))

test('izmenjen slug u tokenu obara potpis', () => withSecret(() => {
  const auth = loadAuth({ isSessionActive: async () => true })
  const [header, payload, signature] = auth.createPreviewToken(scope, 60, now).split('.')
  const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  const forged = Buffer.from(JSON.stringify({ ...claims, slug: 'drugi-rad' })).toString('base64url')
  assert.throws(() => auth.verifyPreviewToken(`${header}.${forged}.${signature}`, now), invalid)
}))

test('pristup nacrtu važi samo za rad iz tokena', () => withSecret(async () => {
  const auth = loadAuth({ isSessionActive: async () => true })
  const token = auth.createPreviewToken(scope, 60)
  assert.equal(await auth.hasArtworkPreviewAccess(token, scope.slug), true)
  assert.equal(await auth.hasArtworkPreviewAccess(token, 'drugi-rad'), false)
  assert.equal(await auth.hasArtworkPreviewAccess(undefined, scope.slug), false)
  assert.equal(await auth.hasArtworkPreviewAccess('nije.token.uopste', scope.slug), false)
}))

test('logout (opoziv sesije) gasi i pregled', () => withSecret(async () => {
  const auth = loadAuth({ isSessionActive: async jti => { assert.equal(jti, sid); return false } })
  const token = auth.createPreviewToken(scope, 60)
  await assert.rejects(auth.verifyPreviewTokenWithSession(token), { code: 'session_revoked' })
  assert.equal(await auth.hasArtworkPreviewAccess(token, scope.slug), false)
}))

test('nedostupan store ODBIJA pregled (fail closed)', () => withSecret(async () => {
  const auth = loadAuth({ isSessionActive: async () => { throw new Error('connection refused') } })
  const token = auth.createPreviewToken(scope, 60)
  await assert.rejects(auth.verifyPreviewTokenWithSession(token), { code: 'store_unavailable' })
  assert.equal(await auth.hasArtworkPreviewAccess(token, scope.slug), false)
}))

test('journal scope cannot unlock artwork with the same slug, and vice versa', () => withSecret(async () => {
 const auth=loadAuth({isSessionActive:async()=>true})
 const journal=auth.createPreviewToken({...scope,type:'journalPost'},60)
 const artwork=auth.createPreviewToken(scope,60)
 assert.equal(await auth.hasContentPreviewAccess(journal,'journalPost',scope.slug),true)
 assert.equal(await auth.hasArtworkPreviewAccess(journal,scope.slug),false)
 assert.equal(await auth.hasContentPreviewAccess(artwork,'journalPost',scope.slug),false)
 assert.equal(await auth.hasContentPreviewAccess(journal,'journalPost','other'),false)
}))
