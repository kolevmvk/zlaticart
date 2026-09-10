// Run: node --test src/lib/admin-api/artwork-mutation.test.cjs
// Transpile the actual TS sources with the repo's existing compiler. No service,
// credentials, Next runtime or additional test dependency is needed.
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const root = path.resolve(__dirname, '../..')
const modules = new Map()
let current = null
let operations = []
let conflict = false
const client = {
  fetch: async () => current,
  create: async doc => { operations.push({ create: doc }); return { ...doc, _id: 'created' } },
  patch(id) {
    const op = { id }
    return {
      ifRevisionId(revision) { op.revision = revision; return this },
      set(value) { op.set = value; return this },
      unset(value) { op.unset = value; return this },
      async commit() {
        if (conflict) throw { statusCode: 409 }
        operations.push(op)
        return { _id: id }
      },
    }
  },
}
function load(filename) {
  filename = path.resolve(filename)
  if (modules.has(filename)) return modules.get(filename).exports
  const module = { exports: {} }
  modules.set(filename, module)
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const localRequire = name => {
    if (name === 'server-only') return {}
    if (name === 'next-sanity') return { createClient: () => client }
    if (name.startsWith('.')) return load(path.resolve(path.dirname(filename), `${name}.ts`))
    throw new Error(`Unexpected dependency: ${name}`)
  }
  new Function('require', 'module', 'exports', compiled)(localRequire, module, module.exports)
  return module.exports
}
const api = load(path.join(__dirname, 'sanity.ts'))
const { ArtworkMutationError } = load(path.join(__dirname, 'artwork-mutation.ts'))
const { parseArtworkFormInput } = load(path.join(root, 'app/api/admin/artworks/form-input.ts'))
const input = overrides => ({ title: 'Work', year: null, dimensions: null, shortDescription: null,
  status: 'draft', featured: false, heroCandidate: false, primaryImage: null, ...overrides })
const document = overrides => ({ _id: 'work', _rev: 'revision-1', _type: 'artwork', title: 'Work',
  status: 'draft', primaryImage: { _type: 'image', asset: { _ref: 'image-123' }, alt: 'Image',
    crop: { left: 0.1 }, hotspot: { x: 0.5 }, future: true }, story: ['preserve'], ...overrides })
const reset = value => { current = value; operations = []; conflict = false }
const rejectsStatus = (promise, status) => assert.rejects(promise, e => e instanceof ArtworkMutationError && e.status === status)

test('alt-only update patches nested field and keeps image metadata/unknown fields', async () => {
  reset(document())
  const before = structuredClone(current)
  await api.adminUpdateArtwork('work', input({ primaryImageAlt: 'Changed alt' }))
  assert.equal(operations[0].set['primaryImage.alt'], 'Changed alt')
  assert.equal(operations[0].set.primaryImage, undefined)
  assert.equal(operations[0].set.story, undefined)
  assert.equal(operations[0].revision, current._rev)
  assert.deepEqual(current, before)
})
test('omitted medium preserves but explicit null removes reference', async () => {
  reset(document({ medium: { _ref: 'medium-1' } }))
  const omitted = parseArtworkFormInput(input())
  assert.equal(omitted.ok, true)
  await api.adminUpdateArtwork('work', omitted.data)
  assert.equal(operations[0].unset, undefined)
  assert.equal(operations[0].set.medium, undefined)
  const cleared = parseArtworkFormInput(input({ mediumId: null }))
  await api.adminUpdateArtwork('work', cleared.data)
  assert.deepEqual(operations[1].unset, ['medium'])
})
test('create and both publish paths reject missing title/image/alt', async () => {
  for (const invalid of [{ title: ' ' }, { primaryImage: null },
    { primaryImage: { asset: { _ref: 'image-1' }, alt: ' ' } }]) {
    reset(document(invalid))
    await rejectsStatus(api.adminSetArtworkStatus('work', 'published'), 400)
    const values = input({ title: current.title, status: 'published' })
    await rejectsStatus(api.adminUpdateArtwork('work', values), 400)
    assert.equal(operations.length, 0)
  }
  reset(null)
  await rejectsStatus(api.adminCreateArtwork(input({ status: 'published' })), 400)
  assert.equal(operations.length, 0)
})
test('valid create, form publish, and status publish succeed', async () => {
  reset(document())
  await api.adminCreateArtwork(input({ status: 'published', primaryImage: { assetId: 'image-1', alt: 'Art' } }))
  await api.adminUpdateArtwork('work', input({ status: 'published' }))
  await api.adminSetArtworkStatus('work', 'published')
  assert.equal(operations.length, 3)
  assert.equal(operations[2].revision, 'revision-1')
})
test('clearing alt cannot leave published document invalid; replacing image uses its own alt', async () => {
  reset(document({ status: 'published' }))
  await rejectsStatus(api.adminUpdateArtwork('work', input({ status: 'published', primaryImageAlt: '' })), 400)
  await api.adminUpdateArtwork('work', input({ status: 'published', primaryImageAlt: 'Ignored',
    primaryImage: { assetId: 'image-new', alt: 'Replacement' } }))
  assert.equal(operations[0].set.primaryImage.alt, 'Replacement')
})
test('missing and non-artwork targets rejected before any patch', async () => {
  for (const value of [null, document({ _type: 'siteSettings' })]) {
    reset(value)
    await rejectsStatus(api.adminUpdateArtwork('work', input()), 404)
    await rejectsStatus(api.adminSetArtworkStatus('work', 'archived'), 404)
    assert.equal(operations.length, 0)
  }
})
test('revision conflict returns actionable 409 for update and status', async () => {
  reset(document()); conflict = true
  await rejectsStatus(api.adminUpdateArtwork('work', input()), 409)
  await rejectsStatus(api.adminSetArtworkStatus('work', 'published'), 409)
})
test('draft without image allowed, nonempty alt without image rejected', async () => {
  reset(document({ primaryImage: null }))
  await api.adminUpdateArtwork('work', input({ primaryImageAlt: '' }))
  await rejectsStatus(api.adminUpdateArtwork('work', input({ primaryImageAlt: 'Orphan alt' })), 400)
})
test('parser rejects malformed image/alt/medium and trims optional alt', () => {
  for (const bad of [{ primaryImage: 'oops' }, { primaryImage: [] }, { primaryImageAlt: null },
    { mediumId: 4 }, { primaryImage: { assetId: '  ', alt: 'Art' } }]) {
    assert.equal(parseArtworkFormInput(input(bad)).ok, false)
  }
  const parsed = parseArtworkFormInput(input({ primaryImageAlt: '  New alt  ' }))
  assert.equal(parsed.data.primaryImageAlt, 'New alt')
})
