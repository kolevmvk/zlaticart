/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness loads transpiled TypeScript. */
// Run: node --test src/lib/admin-api/messages.test.cjs
// Poruke: samo uz aktivnu sesiju, samo poznate vrste i UUID, stranice po 30,
// greška store-a ne otkriva detalje i ne propušta pristup.
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

class AdminAuthError extends Error { constructor(code) { super(code); this.code = code } }
let authError = null
let result = { data: [], error: null }
let calls = []

const builder = {
  from(table) { calls.push(['from', table]); return builder },
  select(columns) { calls.push(['select', columns]); return builder },
  eq(column, value) { calls.push(['eq', column, value]); return builder },
  order(column) { calls.push(['order', column]); return builder },
  range(from, to) { calls.push(['range', from, to]); return Promise.resolve(result) },
  maybeSingle() { calls.push(['single']); return Promise.resolve(result) },
}

function load() {
  const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, 'messages.ts'), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  const loaded = { exports: {} }
  new Function('require', 'module', 'exports', compiled)(name => {
    if (name === 'server-only') return {}
    if (name === '@supabase/supabase-js') return { createClient: () => builder }
    if (name === './auth') return { AdminAuthError, async verifyAdminRequestWithSession() { if (authError) throw new AdminAuthError(authError) } }
    if (name === './responses') return {
      adminOk: data => ({ status: 200, body: { ok: true, data } }),
      adminError: (error, status) => ({ status, body: { ok: false, error } }),
      adminAuthError: error => ({ status: error.code === 'store_unavailable' ? 503 : 401, body: { ok: false } }),
    }
    throw new Error(`Unexpected dependency: ${name}`)
  }, loaded, loaded.exports)
  return loaded.exports
}

process.env.SUPABASE_URL = 'https://isolated-test.invalid'
process.env.SUPABASE_SECRET_KEY = 'isolated-test-key-not-a-credential'
const { messagesRoute } = load()
const request = (query = '') => new Request(`https://admin.test/api/admin/messages/contact${query}`)
const reset = (next = { data: [], error: null }) => { authError = null; result = next; calls = [] }
const UUID = '00000000-0000-4000-8000-000000000001'

test('requires an active session before touching the store', async () => {
  for (const code of ['invalid_token', 'session_revoked']) {
    reset(); authError = code
    const response = await messagesRoute(request(), 'contact')
    assert.equal(response.status, 401)
    assert.equal(calls.length, 0)
  }
})

test('unknown kind and malformed id are 404 without store access', async () => {
  reset()
  assert.equal((await messagesRoute(request(), 'artwork')).status, 404)
  assert.equal((await messagesRoute(request(), 'contact', '1 or 1=1')).status, 404)
  assert.equal(calls.length, 0)
})

test('list reads only whitelisted columns, newest first, 30 per page with hasMore', async () => {
  reset({ data: Array.from({ length: 31 }, (_, index) => ({ id: String(index) })), error: null })
  const response = await messagesRoute(request('?page=1'), 'commission')
  assert.equal(response.status, 200)
  assert.equal(response.body.data.messages.length, 30)
  assert.equal(response.body.data.hasMore, true)
  assert.deepEqual(calls.find(call => call[0] === 'from'), ['from', 'commission_requests'])
  assert.deepEqual(calls.find(call => call[0] === 'select'), ['select', 'id,name,email,format,technique,budget,description,created_at'])
  assert.deepEqual(calls.find(call => call[0] === 'range'), ['range', 30, 60])
  assert.equal((await messagesRoute(request('?page=-1'), 'contact')).status, 400)
})

test('detail returns one message or 404', async () => {
  reset({ data: { id: UUID, name: 'QA' }, error: null })
  const found = await messagesRoute(request(), 'contact', UUID)
  assert.equal(found.status, 200)
  assert.deepEqual(calls.find(call => call[0] === 'eq'), ['eq', 'id', UUID])
  reset({ data: null, error: null })
  assert.equal((await messagesRoute(request(), 'contact', UUID)).status, 404)
})

test('store errors (e.g. missing GRANT) return 503 without leaking details', async () => {
  reset({ data: null, error: { code: '42501', message: 'permission denied for table contact_submissions' } })
  const response = await messagesRoute(request(), 'contact')
  assert.equal(response.status, 503)
  assert.doesNotMatch(JSON.stringify(response.body), /permission|42501/)
})
