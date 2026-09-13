/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness loads transpiled TypeScript. */
// Run: node --test src/lib/admin-api/artwork-mutation.test.cjs
// Transpile the actual TS sources with the repo's existing compiler. No service,
// credentials, Next runtime or additional test dependency is needed.
//
// Lažni Sanity dataset poštuje ono na šta se kod oslanja: `create` pada sa 409
// ako ID postoji, `ifRevisionID` pada sa 409, transakcija je sve-ili-ništa i
// svaki izmenjen dokument dobija `_rev` jednak ID-ju transakcije.
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const root = path.resolve(__dirname, '../..')
const modules = new Map()

let store = new Map()
let transactions = 0
let mutationLog = []
let beforeMutate = null

const conflict = message => Object.assign(new Error(message), { statusCode: 409 })
const slugOf = doc => doc.slug?.current ?? null
const project = doc => ({
  _id: doc._id, _rev: doc._rev, title: doc.title, slug: slugOf(doc), status: doc.status,
  year: doc.year ?? null, featured: Boolean(doc.featured), heroCandidate: Boolean(doc.heroCandidate),
  dimensions: doc.dimensions ?? null, shortDescription: doc.shortDescription ?? null,
  thumbnailUrl: doc.primaryImage?.asset?._ref ? `https://cdn/${doc.primaryImage.asset._ref}` : null,
  primaryImageAlt: doc.primaryImage?.alt ?? null, medium: null,
})

function setPath(target, key, value) {
  const parts = key.split('.')
  let node = target
  for (const part of parts.slice(0, -1)) node = node[part] ??= {}
  node[parts.at(-1)] = value
}

const client = {
  async fetch(query, params = {}) {
    const docs = [...store.values()].map(doc => structuredClone(doc))
    if (query.startsWith('*[_id in [$id, $draftId]]')) {
      return docs.filter(doc => doc._id === params.id || doc._id === params.draftId)
    }
    if (query.startsWith('*[_type == "artwork" && _id in [$id, $draftId]]')) {
      return docs.filter(doc => doc._type === 'artwork' && (doc._id === params.id || doc._id === params.draftId)).map(project)
    }
    if (query.startsWith('*[_type == "artwork"]')) {
      return docs.filter(doc => doc._type === 'artwork').map(project)
    }
    throw new Error(`Unexpected query: ${query}`)
  },
  async mutate(mutations, options) {
    assert.deepEqual(options, { returnDocuments: false, returnFirst: false })
    if (beforeMutate) { const hook = beforeMutate; beforeMutate = null; hook() }
    const next = new Map([...store].map(([id, doc]) => [id, structuredClone(doc)]))
    const transactionId = `tx-${++transactions}`
    const results = []
    for (const mutation of mutations) {
      const [operation, body] = Object.entries(mutation)[0]
      if (operation === 'create') {
        const id = body._id.endsWith('.') ? `${body._id}generated${transactions}` : body._id
        if (next.has(id)) throw conflict(`Document ${id} already exists`)
        next.set(id, { ...structuredClone(body), _id: id, _rev: transactionId })
        results.push({ id, operation: 'create' })
      } else if (operation === 'createOrReplace') {
        next.set(body._id, { ...structuredClone(body), _rev: transactionId })
        results.push({ id: body._id, operation: 'update' })
      } else if (operation === 'delete') {
        next.delete(body.id)
        results.push({ id: body.id, operation: 'delete' })
      } else if (operation === 'patch') {
        const doc = next.get(body.id)
        if (!doc) throw Object.assign(new Error('Document not found'), { statusCode: 404 })
        if (body.ifRevisionID && doc._rev !== body.ifRevisionID) throw conflict('Unexpected revision')
        for (const [key, value] of Object.entries(body.set ?? {})) setPath(doc, key, structuredClone(value))
        for (const key of body.unset ?? []) delete doc[key]
        doc._rev = transactionId
        results.push({ id: body.id, operation: 'update' })
      } else {
        throw new Error(`Unexpected mutation: ${operation}`)
      }
    }
    store = next
    mutationLog.push(mutations)
    return { transactionId, results, documentIds: results.map(result => result.id) }
  },
}

function load(filename) {
  filename = path.resolve(filename)
  if (modules.has(filename)) return modules.get(filename).exports
  const loaded = { exports: {} }
  modules.set(filename, loaded)
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const localRequire = name => {
    if (name === 'server-only') return {}
    if (name === 'next-sanity') return { createClient: () => client }
    if (name.startsWith('.')) return load(path.resolve(path.dirname(filename), `${name}.ts`))
    throw new Error(`Unexpected dependency: ${name}`)
  }
  new Function('require', 'module', 'exports', compiled)(localRequire, loaded, loaded.exports)
  return loaded.exports
}
const api = load(path.join(__dirname, 'sanity.ts'))
const { ArtworkMutationError } = load(path.join(__dirname, 'artwork-mutation.ts'))
const { parseArtworkFormInput, readBaseRevision } = load(path.join(root, 'app/api/admin/artworks/form-input.ts'))

const input = overrides => ({ title: 'Work', year: null, dimensions: null, shortDescription: null,
  featured: false, heroCandidate: false, primaryImage: null, ...overrides })
const artwork = overrides => ({ _id: 'work', _rev: 'rev-published', _type: 'artwork', title: 'Work',
  slug: { _type: 'slug', current: 'work' }, status: 'published', _createdAt: '2026-01-01T00:00:00Z',
  primaryImage: { _type: 'image', asset: { _ref: 'image-123' }, alt: 'Image',
    crop: { left: 0.1 }, hotspot: { x: 0.5 }, future: true }, story: ['preserve'], ...overrides })
const reset = (...docs) => {
  store = new Map(docs.map(doc => [doc._id, structuredClone(doc)]))
  transactions = 0; mutationLog = []; beforeMutate = null
}
const snapshot = () => structuredClone(Object.fromEntries(store))
const rejectsStatus = (promise, status) => assert.rejects(promise, e => e instanceof ArtworkMutationError && e.status === status)
/** Ono što javni sajt vidi: perspective published + filter status == "published". */
const publicWorks = () => [...store.values()].filter(doc => !doc._id.startsWith('drafts.') && doc.status === 'published')

test('saving a published artwork creates drafts.<id> and leaves the public version untouched', async () => {
  reset(artwork())
  const before = structuredClone(store.get('work'))
  const saved = await api.adminSaveArtworkDraft('work', input({ title: 'New title', primaryImageAlt: 'Changed alt' }), 'rev-published')
  assert.deepEqual(store.get('work'), before)
  const draft = store.get('drafts.work')
  assert.equal(draft.title, 'New title')
  assert.equal(draft.primaryImage.alt, 'Changed alt')
  assert.deepEqual(draft.primaryImage.crop, { left: 0.1 })
  assert.deepEqual(draft.primaryImage.hotspot, { x: 0.5 })
  assert.equal(draft.primaryImage.future, true)
  assert.deepEqual(draft.story, ['preserve'])
  assert.equal(draft._createdAt, undefined)
  assert.equal(saved.revision, draft._rev)
  assert.deepEqual(publicWorks().map(doc => doc.title), ['Work'])
})

test('second save patches the existing draft under its revision; stale form gets 409 and nothing changes', async () => {
  reset(artwork())
  const first = await api.adminSaveArtworkDraft('work', input({ title: 'One' }), 'rev-published')
  const second = await api.adminSaveArtworkDraft('work', input({ title: 'Two' }), first.revision)
  assert.equal(store.get('drafts.work').title, 'Two')
  assert.equal(mutationLog[1][0].patch.ifRevisionID, first.revision)
  const before = snapshot()
  await rejectsStatus(api.adminSaveArtworkDraft('work', input({ title: 'Stale' }), first.revision), 409)
  await rejectsStatus(api.adminSaveArtworkDraft('work', input({ title: 'Stale' }), 'rev-published'), 409)
  assert.deepEqual(snapshot(), before)
  assert.notEqual(second.revision, first.revision)
})

test('omitted medium preserves but explicit null removes the reference, only on the draft', async () => {
  reset(artwork({ medium: { _type: 'reference', _ref: 'medium-1' } }))
  const omitted = parseArtworkFormInput(input())
  await api.adminSaveArtworkDraft('work', omitted.data)
  assert.deepEqual(store.get('drafts.work').medium, { _type: 'reference', _ref: 'medium-1' })
  const cleared = parseArtworkFormInput(input({ mediumId: null }))
  await api.adminSaveArtworkDraft('work', cleared.data)
  assert.equal(store.get('drafts.work').medium, undefined)
  assert.deepEqual(store.get('work').medium, { _type: 'reference', _ref: 'medium-1' })
})

test('draft may be incomplete; publishing it is rejected and changes nothing', async () => {
  for (const invalid of [input({ title: ' ', primaryImageAlt: 'Image' }), input({ primaryImageAlt: '' })]) {
    reset(artwork())
    await api.adminSaveArtworkDraft('work', invalid)
    const before = snapshot()
    await rejectsStatus(api.adminPublishArtwork('work'), 400)
    await rejectsStatus(api.adminSetArtworkStatus('work', 'published'), 400)
    assert.deepEqual(snapshot(), before)
  }
  reset(artwork({ _id: 'drafts.work', primaryImage: null, status: 'draft' }))
  await rejectsStatus(api.adminPublishArtwork('work'), 400)
  await rejectsStatus(api.adminSaveArtworkDraft('work', input({ primaryImageAlt: 'Orphan alt' })), 400)
})

test('publish atomically replaces the public version with the draft and removes only that draft', async () => {
  reset(artwork(), artwork({ _id: 'other', slug: { current: 'other' } }), artwork({ _id: 'drafts.other', _rev: 'rev-other-draft', title: 'Other draft' }))
  const saved = await api.adminSaveArtworkDraft('work', input({ title: 'Published title', primaryImage: { assetId: 'image-new', alt: 'New' } }))
  const result = await api.adminPublishArtwork('work', saved.revision)
  assert.equal(mutationLog.at(-1).length, 4)
  const published = store.get('work')
  assert.equal(published.title, 'Published title')
  assert.equal(published.status, 'published')
  assert.equal(published.primaryImage.asset._ref, 'image-new')
  assert.deepEqual(published.story, ['preserve'])
  assert.equal(published._rev, result.revision)
  assert.equal(store.has('drafts.work'), false)
  assert.equal(store.get('drafts.other').title, 'Other draft')
})

test('publish with a stale revision, or a draft changed mid-publish, fails without partial writes', async () => {
  reset(artwork())
  const saved = await api.adminSaveArtworkDraft('work', input({ title: 'Mine' }))
  await rejectsStatus(api.adminPublishArtwork('work', 'rev-published'), 409)
  const before = snapshot()
  beforeMutate = () => { store.get('drafts.work')._rev = 'changed-in-studio' }
  await rejectsStatus(api.adminPublishArtwork('work', saved.revision), 409)
  const after = snapshot()
  after['drafts.work']._rev = before['drafts.work']._rev
  assert.deepEqual(after, before)
  assert.equal(store.get('work').title, 'Work')
})

test('new artwork exists only as a draft, retries do not duplicate, and first publish creates it', async () => {
  reset()
  const created = await api.adminCreateArtwork(input({ title: 'Fresh', primaryImage: { assetId: 'image-1', alt: 'Art' } }), 'artwork-abcdefghijklmnop')
  assert.equal(created._id, 'artwork-abcdefghijklmnop')
  assert.equal(created.existed, false)
  assert.deepEqual([...store.keys()], ['drafts.artwork-abcdefghijklmnop'])
  assert.equal(store.get('drafts.artwork-abcdefghijklmnop').status, 'draft')
  assert.equal(publicWorks().length, 0)

  const retried = await api.adminCreateArtwork(input({ title: 'Fresh' }), 'artwork-abcdefghijklmnop')
  assert.equal(retried.existed, true)
  assert.equal(retried.revision, created.revision)
  assert.equal(store.size, 1)

  await api.adminPublishArtwork('artwork-abcdefghijklmnop', created.revision)
  assert.deepEqual([...store.keys()], ['artwork-abcdefghijklmnop'])
  assert.equal(publicWorks().length, 1)
  const afterPublish = await api.adminCreateArtwork(input({ title: 'Fresh' }), 'artwork-abcdefghijklmnop')
  assert.equal(afterPublish.existed, true)
  assert.equal(store.size, 1)
})

test('first publish fails with 409 if the public version appeared meanwhile', async () => {
  reset(artwork({ _id: 'drafts.work', _rev: 'rev-draft' }))
  beforeMutate = () => store.set('work', artwork({ title: 'Published in Studio' }))
  await rejectsStatus(api.adminPublishArtwork('work'), 409)
  assert.equal(store.get('work').title, 'Published in Studio')
  assert.equal(store.has('drafts.work'), true)
})

test('list and detail show one item per artwork with draft content and public status', async () => {
  reset(
    artwork({ title: 'Live' }),
    artwork({ _id: 'drafts.work', _rev: 'rev-draft', title: 'Edited' }),
    artwork({ _id: 'drafts.new-one', _rev: 'rev-new', title: 'Never published', status: 'published' }),
    artwork({ _id: 'hidden', status: 'archived' }),
  )
  const list = await api.adminListArtworks()
  assert.deepEqual(list.map(item => [item._id, item.title, item.status, item.hasDraft]).sort(), [
    ['hidden', 'Work', 'archived', false],
    ['new-one', 'Never published', 'draft', true],
    ['work', 'Edited', 'published', true],
  ])
  const detail = await api.adminGetArtwork('work')
  assert.equal(detail.title, 'Edited')
  assert.equal(detail.status, 'published')
  assert.equal(detail.hasDraft, true)
  assert.equal(detail.hasPublished, true)
  assert.equal(detail.revision, 'rev-draft')
  assert.equal(await api.adminGetArtwork('missing'), null)
})

test('archiving hides only the public version and keeps pending draft; draft-only work is marked on the draft', async () => {
  reset(artwork(), artwork({ _id: 'drafts.work', _rev: 'rev-draft', title: 'Pending' }))
  const archived = await api.adminSetArtworkStatus('work', 'archived')
  assert.equal(archived.status, 'archived')
  assert.equal(store.get('work').status, 'archived')
  assert.equal(store.get('drafts.work').title, 'Pending')
  assert.equal(store.get('drafts.work')._rev, 'rev-draft')
  assert.equal(publicWorks().length, 0)
  const republished = await api.adminSetArtworkStatus('work', 'published')
  assert.equal(republished.status, 'published')
  assert.equal(store.get('work').title, 'Pending')
  assert.equal(store.has('drafts.work'), false)

  reset(artwork({ _id: 'drafts.solo', _rev: 'rev-solo', status: 'draft' }))
  assert.equal((await api.adminSetArtworkStatus('solo', 'archived')).status, 'archived')
  assert.equal(store.get('drafts.solo').status, 'archived')
  assert.equal((await api.adminSetArtworkStatus('solo', 'draft')).status, 'draft')
})

test('missing and non-artwork targets are rejected before any mutation', async () => {
  for (const docs of [[], [artwork({ _type: 'siteSettings' })], [artwork({ _id: 'drafts.work', _type: 'siteSettings' })]]) {
    reset(...docs)
    await rejectsStatus(api.adminSaveArtworkDraft('work', input()), 404)
    await rejectsStatus(api.adminPublishArtwork('work'), 404)
    await rejectsStatus(api.adminSetArtworkStatus('work', 'archived'), 404)
    assert.equal(mutationLog.length, 0)
  }
})

test('route ids cannot address drafts or other document versions', () => {
  for (const bad of ['drafts.work', 'versions.r1.work', '', '../work', 'a b', 'x'.repeat(129), 5]) {
    assert.equal(api.isArtworkBaseId(bad), false)
  }
  for (const good of ['work', 'artwork-abcdefghijklmnop', '8f0c2a3e-6d1b-4b2a-9c3e-1f2a3b4c5d6e']) {
    assert.equal(api.isArtworkBaseId(good), true)
  }
})

test('parser ignores status, rejects malformed image/alt/medium, and validates base revision', () => {
  for (const bad of [{ primaryImage: 'oops' }, { primaryImage: [] }, { primaryImageAlt: null },
    { mediumId: 4 }, { primaryImage: { assetId: '  ', alt: 'Art' } }]) {
    assert.equal(parseArtworkFormInput(input(bad)).ok, false)
  }
  const parsed = parseArtworkFormInput(input({ status: 'published', primaryImageAlt: '  New alt  ' }))
  assert.equal(parsed.data.primaryImageAlt, 'New alt')
  assert.equal('status' in parsed.data, false)
  assert.deepEqual(readBaseRevision({}), { ok: true })
  assert.deepEqual(readBaseRevision({ baseRevision: 'tx-1' }), { ok: true, value: 'tx-1' })
  assert.equal(readBaseRevision({ baseRevision: 7 }).ok, false)
  assert.equal(readBaseRevision({ baseRevision: 'bad rev' }).ok, false)
})
