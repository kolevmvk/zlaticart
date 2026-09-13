/* eslint-disable @typescript-eslint/no-require-imports -- Isolated Node harness for actual route entrypoints. */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const routeRoot = path.resolve(__dirname, '../../app/api/admin/content')

function harness({ authError, configured = true, operationError } = {}) {
  const events = []
  const cache = new Map()
  class AdminAuthError extends Error { constructor(code) { super(code); this.code = code } }
  class ContentError extends Error { constructor(message, status) { super(message); this.status = status } }
  const auth = { AdminAuthError, async verifyAdminRequestWithSession(request) {
    events.push(['auth', request])
    if (authError) throw new AdminAuthError(authError)
    return { sessionId: 'test-session' }
  } }
  const content = { ContentError, contentType(name) {
    events.push(['type', name])
    if (name !== 'artwork') throw new ContentError('Sekcija nije pronađena.', 404)
    return { name: 'artwork' }
  } }
  for (const operation of ['createContent', 'getContent', 'listContent', 'publishContent', 'removeContent', 'saveContent']) {
    content[operation] = async (...args) => {
      events.push([operation, ...args])
      if (operationError) throw new ContentError('Forma je zastarela.', operationError)
      return { marker: operation }
    }
  }
  function load(file) {
    if (cache.has(file)) return cache.get(file)
    const loaded = { exports: {} }
    const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
    new Function('require', 'module', 'exports', compiled)(id => {
      if (id === 'server-only') return {}
      if (id === './auth') return auth
      if (id === './sanity') return { adminWriteConfigured() { events.push(['configured']); return configured } }
      if (id === './content') return content
      if (id === '@/lib/admin-api/content-route') return load(path.join(__dirname, 'content-route.ts'))
      if (id === './responses' || id === './content-types') return load(path.join(__dirname, `${id.slice(2)}.ts`))
      throw new Error(`Unexpected dependency ${id}`)
    }, loaded, loaded.exports)
    cache.set(file, loaded.exports)
    return loaded.exports
  }
  return { events, route(file) { return load(path.join(routeRoot, file, 'route.ts')) } }
}
const cases = [
  { file: 'schema', method: 'GET', operation: null },
  { file: '[type]', method: 'GET', operation: 'listContent' },
  { file: '[type]/[id]', method: 'GET', operation: 'getContent', id: 'art-1' },
  { file: '[type]', method: 'POST', operation: 'createContent' },
  { file: '[type]/[id]', method: 'PATCH', operation: 'saveContent', id: 'art-1' },
  { file: '[type]/[id]/publish', method: 'POST', operation: 'publishContent', id: 'art-1' },
  { file: '[type]/[id]/discard', method: 'POST', operation: 'removeContent', id: 'art-1' },
  { file: '[type]/[id]', method: 'DELETE', operation: 'removeContent', id: 'art-1' },
]
async function call(h, scenario, { body = { fields: { title: 'Rad' }, clientId: 'client-1', baseRevision: 'rev-1', confirm: true }, raw, type = 'artwork' } = {}) {
  const request = new Request('https://example.test/api/admin/content', { method: scenario.method, ...(scenario.method === 'GET' ? {} : { body: raw ?? JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }) })
  const route = h.route(scenario.file)
  assert.equal(route.runtime, 'nodejs')
  return route[scenario.method](request, { params: Promise.resolve({ type, ...(scenario.id ? { id: scenario.id } : {}) }) })
}
test('all eight content entrypoints verify the session before reading schema or calling content services', async () => {
  for (const scenario of cases) {
    const h = harness()
    const response = await call(h, scenario)
    assert.equal(response.status, scenario.operation === 'createContent' ? 201 : 200, scenario.file)
    assert.equal(h.events[0][0], 'auth')
    assert.equal(h.events.filter(event => event[0] === 'auth').length, 1)
    const body = await response.json()
    assert.equal(body.ok, true)
    if (scenario.operation) assert.equal(h.events.at(-1)[0], scenario.operation)
    else { assert.equal(body.data.types.length, 8); assert.equal(h.events.length, 1) }
  }
})
test('missing, invalid, revoked and unavailable sessions fail closed on every content route', async () => {
  for (const [authError, status] of [['invalid_token', 401], ['session_revoked', 401], ['missing_config', 503], ['store_unavailable', 503]]) {
    for (const scenario of cases) {
      const h = harness({ authError })
      const response = await call(h, scenario)
      assert.equal(response.status, status, `${authError} ${scenario.file} ${scenario.method}`)
      assert.equal((await response.json()).ok, false)
      assert.deepEqual(h.events.map(event => event[0]), ['auth'], 'No content lookup, configuration or client operation before authorization')
    }
  }
})
test('every mutation returns 503 without write configuration and never calls its content operation', async () => {
  for (const scenario of cases.filter(item => item.method !== 'GET')) {
    const h = harness({ configured: false })
    assert.equal((await call(h, scenario)).status, 503)
    assert.deepEqual(h.events.map(event => event[0]), ['auth', 'type', 'configured'])
  }
})
test('malformed JSON and non-object payloads return 400 on every mutation', async () => {
  for (const scenario of cases.filter(item => item.method !== 'GET')) {
    for (const raw of ['{', 'null', '[]', '"text"', '1']) {
      const h = harness()
      assert.equal((await call(h, scenario, { raw })).status, 400)
      assert.deepEqual(h.events.map(event => event[0]), ['auth', 'type', 'configured'])
    }
  }
})
test('discard and delete require literal confirmation and forward revisions and distinct discard intent', async () => {
  for (const scenario of cases.filter(item => item.operation === 'removeContent')) {
    for (const confirm of [undefined, false, 'true', 1]) {
      const h = harness()
      assert.equal((await call(h, scenario, { body: { confirm, baseRevision: 'rev-1' } })).status, 400)
      assert.ok(!h.events.some(event => event[0] === 'removeContent'))
    }
    const h = harness()
    assert.equal((await call(h, scenario)).status, 200)
    assert.deepEqual(h.events.at(-1), ['removeContent', { name: 'artwork' }, 'art-1', 'rev-1', scenario.file.endsWith('/discard')])
  }
})
test('unknown types return 404 after authentication and stale content errors map to 409', async () => {
  for (const scenario of cases.filter(item => item.file !== 'schema')) {
    const unknown = harness()
    assert.equal((await call(unknown, scenario, { type: 'unknown' })).status, 404)
    assert.deepEqual(unknown.events.map(event => event[0]), ['auth', 'type'])
    const stale = harness({ operationError: 409 })
    const response = await call(stale, scenario)
    assert.equal(response.status, 409)
    assert.deepEqual(await response.json(), { ok: false, error: 'Forma je zastarela.' })
  }
})
test('create, save and publish route through the correct service with unmodified fields and revision', async () => {
  const expected = {
    createContent: ['createContent', { name: 'artwork' }, 'client-1', { title: 'Rad' }],
    saveContent: ['saveContent', { name: 'artwork' }, 'art-1', { title: 'Rad' }, 'rev-1'],
    publishContent: ['publishContent', { name: 'artwork' }, 'art-1', 'rev-1'],
  }
  for (const scenario of cases.filter(item => item.operation in expected)) {
    const h = harness()
    await call(h, scenario)
    assert.deepEqual(h.events.at(-1), expected[scenario.operation])
  }
})
