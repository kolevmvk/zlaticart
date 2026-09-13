/* eslint-disable @typescript-eslint/no-require-imports -- Tests transpile actual TypeScript without Next runtime or credentials. */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
let store = new Map(), serial = 0, beforeMutate = null
const modules = new Map()
const conflict = () => Object.assign(new Error('Conflict'), { statusCode: 409 })
const containsReference = (value, ids) => value && typeof value === 'object' &&
  ((value._type === 'reference' && ids.includes(value._ref)) || Object.values(value).some(child => containsReference(child, ids)))
const client = {
  async fetch(query, p = {}) {
    const docs = structuredClone([...store.values()])
    if (query.startsWith('*[_id in [$id, $draftId]]')) return docs.filter(d => [p.id, p.draftId].includes(d._id))
    if (query.includes('references($ids)')) return docs.filter(d => !p.ids.includes(d._id) && containsReference(d, p.ids))
    if (query.startsWith('*[_id in $ids')) return docs.filter(d => p.ids.includes(d._id) && d._type === p.type).map(d => ({ _id: d._id }))
    if (query.includes('slug.current == $slug')) return docs.filter(d => d._type === p.type && d.slug?.current === p.slug && ![p.id, p.draftId].includes(d._id) && !d._id.startsWith('versions.'))
    if (query.startsWith('*[_type == $type')) return docs.filter(d => d._type === p.type && !d._id.startsWith('versions.'))
    throw new Error(`Unexpected query: ${query}`)
  },
  async mutate(mutations, options) {
    assert.deepEqual(options, { returnDocuments: false, returnFirst: false })
    if (beforeMutate) { const hook = beforeMutate; beforeMutate = null; hook() }
    const next = structuredClone(store), transactionId = `tx-${++serial}`
    for (const mutation of mutations) {
      const [operation, body] = Object.entries(mutation)[0]
      if (operation === 'create' || operation === 'createOrReplace') {
        if (operation === 'create' && next.has(body._id)) throw conflict()
        next.set(body._id, { ...structuredClone(body), _rev: transactionId })
      } else if (operation === 'patch') {
        const doc = next.get(body.id)
        if (!doc || body.ifRevisionID && doc._rev !== body.ifRevisionID) throw conflict()
        Object.assign(doc, structuredClone(body.set ?? {}))
        for (const key of body.unset ?? []) delete doc[key]
        doc._rev = transactionId
      } else if (operation === 'delete') next.delete(body.id)
      else throw new Error(`Unexpected operation: ${operation}`)
    }
    // Strong references are enforced against the complete transaction result.
    for (const mutation of mutations.filter(m => m.delete)) {
      if ([...next.values()].some(doc => containsReference(doc, [mutation.delete.id]))) throw conflict()
    }
    store = next
    return { transactionId }
  },
}
function load(filename) {
  filename = path.resolve(filename)
  if (modules.has(filename)) return modules.get(filename).exports
  const loaded = { exports: {} }; modules.set(filename, loaded)
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  const localRequire = name => {
    if (name === 'server-only') return {}
    if (name === './sanity') return { adminSanityClient: client }
    if (name.startsWith('.')) return load(path.resolve(path.dirname(filename), `${name}.ts`))
    throw new Error(`Unexpected dependency: ${name}`)
  }
  new Function('require', 'module', 'exports', code)(localRequire, loaded, loaded.exports)
  return loaded.exports
}
const api = load(path.join(__dirname, 'content.ts'))
const { contentTypes, getContentType } = load(path.join(__dirname, 'content-types.ts'))
const image = { _type: 'image', asset: { _type: 'reference', _ref: 'image-example-100x100-jpg' }, alt: 'Primer', crop: { top: .1, bottom: .1, left: 0, right: 0 }, hotspot: { x: .5, y: .5, width: .8, height: .8 }, future: 'keep' }
const fields = type => Object.fromEntries(type.fields.filter(f => f.required || f.name === type.titleField).map(f => [f.name,
  f.kind === 'slug' ? { _type: 'slug', current: 'example' } : f.kind === 'image' ? structuredClone(image) : f.kind === 'date' ? '2026-09-13' : f.kind === 'url' ? 'https://example.org/post' : f.kind === 'select' ? f.options[0].value : 'Primer']))
const doc = (type, overrides = {}) => ({ ...fields(type), _id: type.singleton ?? 'example', _type: type.name, _rev: 'original', ...overrides })
const reset = (...docs) => { store = new Map(docs.map(d => [d._id, structuredClone(d)])); serial = 0; beforeMutate = null }
const reject = (promise, status) => assert.rejects(promise, e => e instanceof api.ContentError && e.status === status)
const business = document => { const copy = structuredClone(document); delete copy._rev; return copy }

for (const type of contentTypes) test(`${type.name}: create, retry, save, publish, discard and delete`, async () => {
  reset()
  const id = type.singleton ?? 'example'
  const created = await api.createContent(type, id, fields(type))
  assert.equal(created.existed, false)
  assert.equal(created.publicationStatus, 'draft')
  assert.deepEqual([...store.keys()], [`drafts.${id}`])
  const retry = await api.createContent(type, id, {})
  assert.equal(retry.existed, true)
  assert.equal(retry.revision, created.revision)
  const published = await api.publishContent(type, id, created.revision)
  assert.equal(published.publicationStatus, 'published')
  const publicBefore = business(store.get(id))
  const saved = await api.saveContent(type, id, { [type.titleField]: 'Izmenjeno' }, published.revision)
  assert.deepEqual(business(store.get(id)), publicBefore)
  assert.equal(saved.publicationStatus, 'changed')
  assert.equal((await api.listContent(type)).length, 1)
  assert.equal((await api.listContent(type))[0].title, 'Izmenjeno')
  await api.removeContent(type, id, saved.revision, true)
  assert.deepEqual(business(store.get(id)), publicBefore)
  assert.equal(store.has(`drafts.${id}`), false)
  const changed = await api.saveContent(type, id, { [type.titleField]: 'Objavljeno' }, store.get(id)._rev)
  const live = await api.publishContent(type, id, changed.revision)
  assert.equal(live.document[type.titleField], 'Objavljeno')
  assert.equal(store.has(`drafts.${id}`), false)
  await api.removeContent(type, id, live.revision, false)
  assert.equal(store.size, 0)
})
const medium = getContentType('medium')
test('revision is mandatory for every destructive operation and stale forms cannot write', async () => {
  for (const action of [rev => api.saveContent(medium, 'example', { title: 'Edit' }, rev), rev => api.publishContent(medium, 'example', rev), rev => api.removeContent(medium, 'example', rev, false), rev => api.removeContent(medium, 'example', rev, true)]) {
    reset(doc(medium))
    const before = structuredClone(store)
    await reject(action(undefined), 400)
    await reject(action('stale'), 409)
    assert.deepEqual(store, before)
  }
})
test('incomplete draft saves but cannot publish; draft-only discard removes it', async () => {
  reset()
  const created = await api.createContent(medium, 'example', {})
  await reject(api.publishContent(medium, 'example', created.revision), 400)
  assert.equal(store.size, 1)
  assert.equal((await api.removeContent(medium, 'example', created.revision, true)).deleted, true)
  assert.equal(store.size, 0)
})
test('Studio race on first draft save preserves Studio edits and rolls back the whole transaction', async () => {
  reset(doc(medium))
  beforeMutate = () => Object.assign(store.get('example'), { title: 'Studio', _rev: 'studio' })
  await reject(api.saveContent(medium, 'example', { title: 'Phone' }, 'original'), 409)
  assert.equal(store.get('example').title, 'Studio')
  assert.equal(store.has('drafts.example'), false)
  reset(doc(medium))
  beforeMutate = () => store.set('drafts.example', doc(medium, { _id: 'drafts.example', _rev: 'studio', title: 'Studio draft' }))
  await reject(api.saveContent(medium, 'example', { title: 'Phone' }, 'original'), 409)
  assert.equal(store.get('example')._rev, 'original')
  assert.equal(store.get('drafts.example').title, 'Studio draft')
})
test('Studio race during publish protects either version and does not partially mutate the other', async () => {
  for (const changedId of ['example', 'drafts.example']) {
    reset(doc(medium), doc(medium, { _id: 'drafts.example', _rev: 'draft', title: 'Phone' }))
    beforeMutate = () => Object.assign(store.get(changedId), { _rev: 'studio', title: 'Studio' })
    await reject(api.publishContent(medium, 'example', 'draft'), 409)
    assert.equal(store.get(changedId).title, 'Studio')
    assert.equal(store.get(changedId === 'example' ? 'drafts.example' : 'example')._rev, changedId === 'example' ? 'draft' : 'original')
  }
  reset(doc(medium, { _id: 'drafts.example' }))
  beforeMutate = () => store.set('example', doc(medium, { title: 'Studio' }))
  await reject(api.publishContent(medium, 'example', 'original'), 409)
  assert.equal(store.get('drafts.example')._rev, 'original')
  assert.equal(store.get('example').title, 'Studio')
})
test('reference preflight and racing strong references both block deletion atomically', async () => {
  const referring = doc(getContentType('artwork'), { _id: 'other', medium: { _type: 'reference', _ref: 'example' } })
  reset(doc(medium), referring)
  const before = structuredClone(store)
  await reject(api.removeContent(medium, 'example', 'original', false), 409)
  assert.deepEqual(store, before)
  reset(doc(medium), doc(medium, { _id: 'drafts.example', _rev: 'draft' }))
  beforeMutate = () => store.set('other', referring)
  await reject(api.removeContent(medium, 'example', 'draft', false), 409)
  assert.equal(store.get('example')._rev, 'original')
  assert.equal(store.get('drafts.example')._rev, 'draft')
})
test('publication rejects missing and wrong-type references and duplicate slugs', async () => {
  const artwork = getContentType('artwork')
  for (const related of [[], [doc(medium, { _id: 'linked', _type: 'journalPost' })], [doc(medium, { _id: 'drafts.linked' })]]) {
    reset(doc(artwork, { _id: 'drafts.example', medium: { _type: 'reference', _ref: 'linked' } }), ...related)
    const before = structuredClone(store)
    await reject(api.publishContent(artwork, 'example', 'original'), 400)
    assert.deepEqual(store, before)
  }
  reset(doc(artwork, { _id: 'drafts.example', medium: { _type: 'reference', _ref: 'linked' } }), doc(medium, { _id: 'linked' }))
  await api.publishContent(artwork, 'example', 'original')
  for (const otherId of ['other', 'drafts.other']) {
    reset(doc(medium, { _id: 'drafts.example' }), doc(medium, { _id: otherId }))
    await reject(api.publishContent(medium, 'example', 'original'), 409)
  }
})
test('opaque Studio fields survive; user input cannot inject top-level or system fields', async () => {
  reset(doc(medium, { futureStudioField: { preserve: true }, description: 'Remove me' }))
  for (const key of ['futureStudioField', '_id', '_type', '_rev', '_createdAt', 'unknown']) {
    await reject(api.saveContent(medium, 'example', { [key]: 'injected' }, 'original'), 400)
  }
  const saved = await api.saveContent(medium, 'example', { title: 'Changed', description: null }, 'original')
  assert.deepEqual(saved.document.futureStudioField, { preserve: true })
  assert.equal(saved.document.description, undefined)
  const published = await api.publishContent(medium, 'example', saved.revision)
  assert.deepEqual(published.document.futureStudioField, { preserve: true })
  assert.equal(published.document.description, undefined)
})
test('nested framing, gallery order, portable text annotations and unknown blocks round-trip exactly', async () => {
  const journal = getContentType('journalPost')
  const body = [{ _key: 'heading', _type: 'block', style: 'h2', children: [{ _type: 'span', _key: 's1', text: 'Čačak', marks: ['strong', 'em', 'link1'] }], markDefs: [{ _key: 'link1', _type: 'link', href: 'https://example.org' }] }, { _key: 'list', _type: 'block', style: 'normal', listItem: 'number', level: 2, children: [{ _type: 'span', _key: 's2', text: 'Lista', marks: [] }], markDefs: [] }, { ...image, _key: 'photo' }, { _key: 'custom', _type: 'futureWidget', data: { untouched: true } }]
  reset(doc(journal, { body, coverImage: image }))
  const saved = await api.saveContent(journal, 'example', { title: 'Changed', body }, 'original')
  const published = await api.publishContent(journal, 'example', saved.revision)
  assert.deepEqual(published.document.body, body)
  assert.deepEqual(published.document.coverImage, image)
  const exhibition = getContentType('exhibition')
  const gallery = [{ ...image, _key: 'second' }, { ...image, _key: 'first' }]
  reset(doc(exhibition))
  const ordered = await api.saveContent(exhibition, 'example', { images: gallery }, 'original')
  assert.deepEqual((await api.publishContent(exhibition, 'example', ordered.revision)).document.images, gallery)
})
test('singletons reuse existing legacy IDs and concurrent create retry returns the same document', async () => {
  for (const type of contentTypes.filter(t => t.singleton)) {
    reset(doc(type, { _id: 'legacy-singleton' }))
    const existing = await api.createContent(type, type.singleton, fields(type))
    assert.equal(existing._id, 'legacy-singleton')
    assert.equal(existing.existed, true)
    assert.equal(store.size, 1)
    reset()
    await reject(api.createContent(type, 'wrong-id', {}), 400)
    beforeMutate = () => store.set(`drafts.${type.singleton}`, doc(type, { _id: `drafts.${type.singleton}`, _rev: 'studio' }))
    const raced = await api.createContent(type, type.singleton, fields(type))
    assert.equal(raced.existed, true)
    assert.equal(raced.revision, 'studio')
    assert.equal(store.size, 1)
  }
})
test('missing, wrong-type and protected-version IDs cannot be mutated', async () => {
  for (const docs of [[], [doc(medium, { _type: 'siteSettings' })], [doc(medium, { _id: 'drafts.example', _type: 'siteSettings' })]]) {
    reset(...docs)
    await reject(api.saveContent(medium, 'example', {}, 'original'), 404)
    await reject(api.publishContent(medium, 'example', 'original'), 404)
    await reject(api.removeContent(medium, 'example', 'original', false), 404)
  }
  reset(doc(medium))
  for (const id of ['drafts.example', 'versions.release.example', '../example', '']) await reject(api.getContent(medium, id), 404)
  assert.throws(() => api.contentType('not-a-type'), e => e.status === 404)
})
test('partial image edits and keyed gallery reorder preserve existing framing and unknown metadata', async () => {
  const artwork = getContentType('artwork')
  const first = { ...image, _key: 'first', future: 'first metadata' }
  const second = { ...image, _key: 'second', future: 'second metadata' }
  reset(doc(artwork, { primaryImage: image, detailImages: [first, second] }))
  const saved = await api.saveContent(artwork, 'example', {
    primaryImage: { _type: 'image', alt: 'Novi alt' },
    detailImages: [{ _key: 'second', _type: 'image', alt: 'Druga' }, { _key: 'first', _type: 'image', alt: 'Prva' }],
  }, 'original')
  assert.deepEqual(saved.document.primaryImage, { ...image, alt: 'Novi alt' })
  assert.deepEqual(saved.document.detailImages, [{ ...second, alt: 'Druga' }, { ...first, alt: 'Prva' }])
  const updated = await api.saveContent(artwork, 'example', { primaryImage: { _type: 'image', alt: 'Još jednom' } }, saved.revision)
  assert.deepEqual(updated.document.primaryImage, { ...image, alt: 'Još jednom' })
  const live = await api.publishContent(artwork, 'example', updated.revision)
  assert.deepEqual(live.document.primaryImage, updated.document.primaryImage)
  assert.deepEqual(live.document.detailImages, saved.document.detailImages)
})
test('reference lists check every target type and retain keys and explicit order', async () => {
  const settings = getContentType('siteSettings'), artwork = getContentType('artwork')
  const links = [{ _type: 'reference', _key: 'b', _ref: 'second' }, { _type: 'reference', _key: 'a', _ref: 'first' }]
  reset(doc(settings, { _id: 'drafts.siteSettings', featuredArtworks: links }), doc(artwork, { _id: 'first' }), doc(medium, { _id: 'second' }))
  await reject(api.publishContent(settings, 'siteSettings', 'original'), 400)
  store.set('second', doc(artwork, { _id: 'second' }))
  const live = await api.publishContent(settings, 'siteSettings', 'original')
  assert.deepEqual(live.document.featuredArtworks, links)
  const cleared = await api.saveContent(settings, 'siteSettings', { featuredArtworks: [] }, live.revision)
  assert.deepEqual(cleared.document.featuredArtworks, [])
})
test('lists collapse published/draft pairs and exclude release versions', async () => {
  reset(doc(medium), doc(medium, { _id: 'drafts.example', _rev: 'draft', title: 'Edited' }), doc(medium, { _id: 'drafts.fresh', title: 'Fresh' }), doc(medium, { _id: 'versions.release.example', title: 'Release' }))
  const list = await api.listContent(medium)
  assert.deepEqual(list.map(d => [d._id, d.title, d.publicationStatus, d.revision]), [['example', 'Edited', 'changed', 'draft'], ['fresh', 'Fresh', 'draft', 'original']])
})
