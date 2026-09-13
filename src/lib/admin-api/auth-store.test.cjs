/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness loads transpiled TypeScript. */
// Run: node --test src/lib/admin-api/auth-store.test.cjs
// Opoziv sesije: prolazna greška servera se ponavlja, trajna ne, a posle
// iscrpljenih pokušaja greška mora da stigne do rute (token bi inače ostao važeći).
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

let responses = []
let updates = 0
let reads = []
let selects = 0
const builder = {
  from: () => builder,
  update: () => { updates += 1; return builder },
  select: () => { selects += 1; return builder },
  eq: () => builder,
  is: () => Promise.resolve(responses.shift()),
  maybeSingle: () => Promise.resolve(reads.shift()),
}

function loadStore() {
  const compiled = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, 'auth-store.ts'), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
  ).outputText
  const loaded = { exports: {} }
  const shim = name => {
    if (name === 'server-only') return {}
    if (name === '@supabase/supabase-js') return { createClient: () => builder }
    throw new Error(`Unexpected dependency: ${name}`)
  }
  new Function('require', 'module', 'exports', compiled)(shim, loaded, loaded.exports)
  return loaded.exports
}

process.env.SUPABASE_URL = 'https://isolated-test.invalid'
process.env.SUPABASE_SECRET_KEY = 'isolated-test-key-not-a-credential'
const store = loadStore()
store.REVOKE_RETRY_DELAYS_MS.splice(0, Infinity, 1, 1)
store.SESSION_RETRY_DELAYS_MS.splice(0, Infinity, 1, 1)
const quietly = async fn => {
  const original = console.error
  console.error = () => {}
  try { return await fn() } finally { console.error = original }
}
const reset = list => { responses = list; updates = 0 }

test('transient 504 is retried and revoke succeeds', async () => {
  reset([{ error: { message: 'timeout' }, status: 504 }, { error: null, status: 204 }])
  await quietly(() => store.revokeSession('jti-1'))
  assert.equal(updates, 2)
})

test('network failure without status is retried', async () => {
  reset([{ error: { message: 'fetch failed' }, status: 0 }, { error: null, status: 204 }])
  await quietly(() => store.revokeSession('jti-1'))
  assert.equal(updates, 2)
})

test('client error is not retried and surfaces as store failure', async () => {
  reset([{ error: { code: '42501', message: 'permission denied' }, status: 403 }])
  await quietly(() => assert.rejects(store.revokeSession('jti-1'), e => e instanceof store.AdminStoreError))
  assert.equal(updates, 1)
})

test('persistent 5xx gives up after bounded attempts', async () => {
  reset(Array.from({ length: 5 }, () => ({ error: { message: 'timeout' }, status: 504 })))
  await quietly(() => assert.rejects(store.revokeSession('jti-1'), e => e instanceof store.AdminStoreError))
  assert.equal(updates, 3)
})

const future = () => new Date(Date.now() + 3600_000).toISOString()
const resetReads = list => { reads = list; selects = 0; store.resetSessionCacheForTest() }

test('session check retries a transient gateway timeout and then succeeds', async () => {
  resetReads([{ data: null, error: { message: 'Gateway Timeout' }, status: 504 }, { data: { jti: 'j', revoked_at: null, expires_at: future() }, error: null, status: 200 }])
  assert.equal(await quietly(() => store.isSessionActive('j')), true)
  assert.equal(selects, 2)
})

test('confirmed session is cached briefly; revoke on the same instance clears it', async () => {
  resetReads([{ data: { jti: 'j', revoked_at: null, expires_at: future() }, error: null, status: 200 }])
  assert.equal(await store.isSessionActive('j'), true)
  assert.equal(await store.isSessionActive('j'), true)
  assert.equal(selects, 1)
  reset([{ error: null, status: 204 }])
  await store.revokeSession('j')
  reads = [{ data: { jti: 'j', revoked_at: new Date().toISOString(), expires_at: future() }, error: null, status: 200 }]
  assert.equal(await store.isSessionActive('j'), false)
  assert.equal(selects, 2)
})

test('inactive sessions are never cached and persistent store failure fails closed', async () => {
  resetReads([{ data: null, error: null, status: 200 }, { data: null, error: null, status: 200 }])
  assert.equal(await store.isSessionActive('gone'), false)
  assert.equal(await store.isSessionActive('gone'), false)
  assert.equal(selects, 2)
  resetReads(Array.from({ length: 5 }, () => ({ data: null, error: { message: 'Gateway Timeout' }, status: 504 })))
  await quietly(() => assert.rejects(store.isSessionActive('j'), e => e instanceof store.AdminStoreError))
  assert.equal(selects, 3)
  resetReads([{ data: null, error: { code: '42501', message: 'permission denied' }, status: 403 }])
  await quietly(() => assert.rejects(store.isSessionActive('j'), e => e instanceof store.AdminStoreError))
  assert.equal(selects, 1)
})
