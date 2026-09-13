/* eslint-disable @typescript-eslint/no-require-imports -- Test actual TypeScript with isolated Sanity stubs. */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const root = path.resolve(__dirname, '../../..')
function load(file) {
  const loaded = { exports: {} }
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
  new Function('require', 'module', 'exports', source)(id => {
    if (id === 'sanity') return { defineType: x => x, defineField: x => x }
    if (id === '../components/SocialConnectionGuide') return { SocialConnectionGuide: () => null }
    throw new Error(`Unexpected dependency ${id}`)
  }, loaded, loaded.exports)
  return loaded.exports
}
const { contentTypes, getContentType, validateContent } = load(path.join(__dirname, 'content-types.ts'))
function required(field) {
  let result = false
  field.validation?.({ required() { result = true; return this } })
  return result
}
function metadata(field) {
  const kind = field.readOnly ? 'info' : field.options?.list ? 'select' : field.type === 'array'
    ? field.of.some(item => item.type === 'block') ? 'portableText' : field.of[0].type === 'image' ? 'images' : 'references' : field.type
  return {
    name: field.name, title: field.title, kind,
    ...(required(field) ? { required: true } : {}),
    ...(field.options?.list ? { options: field.options.list.map(option => typeof option === 'string' ? { title: option, value: option } : option) } : {}),
    ...(field.to || field.of?.[0]?.to ? { referenceType: (field.to ?? field.of[0].to)[0].type } : {}),
    ...('initialValue' in field ? { initialValue: field.initialValue } : {}),
    ...(field.fields?.some(nested => nested.name === 'alt' && required(nested)) ? { altRequired: true } : {}),
    ...(kind === 'portableText' ? { allowImages: field.of.some(item => item.type === 'image') } : {}),
  }
}
test('every Studio schema field, option, required rule, reference and default has editor parity', () => {
  const files = fs.readdirSync(path.join(root, 'sanity/schemas')).filter(file => file.endsWith('.ts') && file !== 'index.ts')
  assert.deepEqual(contentTypes.map(type => type.name).sort(), files.map(file => file.slice(0, -3)).sort())
  const config = fs.readFileSync(path.join(root, 'sanity.config.ts'), 'utf8')
  for (const type of contentTypes) {
    const schema = load(path.join(root, 'sanity/schemas', `${type.name}.ts`)).default
    assert.deepEqual(type.fields, schema.fields.map(metadata), type.name)
    assert.ok(config.includes(`.title('${type.title}')`), `Studio section ${type.title}`)
    assert.ok(type.fields.some(field => field.name === type.titleField))
    if (type.imageField) assert.equal(type.fields.find(field => field.name === type.imageField)?.kind, 'image')
  }
  assert.equal(getContentType('siteSettings').singleton, 'siteSettings')
  assert.equal(getContentType('artistProfile').singleton, 'artistProfile')
  assert.equal(getContentType('constructor'), undefined)
})
const ref = { _type: 'reference', _ref: 'image-test-40x40-jpg' }
const photo = { _type: 'image', asset: ref, alt: 'Slika', crop: { top: 0.1, bottom: 0.1, left: 0, right: 0 }, hotspot: { x: 0.5, y: 0.5, width: 0.4, height: 0.4 }, custom: { retained: true } }
const artwork = { title: 'Rad', slug: { _type: 'slug', current: 'rad' }, status: 'published', primaryImage: photo }
const validate = (name, value, publish = false) => validateContent(getContentType(name), value, publish)
test('drafts may be incomplete, publication enforces every required field and image alt', () => {
  for (const type of contentTypes) {
    assert.equal(validate(type.name, {}), null)
    if (type.fields.some(field => field.required)) assert.match(validate(type.name, {}, true), /obavezno/)
  }
  assert.equal(validate('artwork', artwork, true), null)
  assert.ok(validate('artwork', { ...artwork, primaryImage: { ...photo, alt: '' } }, true))
  assert.equal(validate('artwork', { primaryImage: { _type: 'image' } }), null)
  assert.ok(validate('artwork', { ...artwork, primaryImage: { _type: 'image', alt: 'Opis' } }, true))
  assert.ok(validate('artwork', { ...artwork, title: '  ' }, true))
  assert.equal(validate('artwork', { medium: null, year: null, featured: false }), null)
})
test('wrong scalar types and malformed dates, URLs and enums fail even in drafts', () => {
  for (const value of [{ year: '2026' }, { year: Infinity }, { featured: 'false' }, { title: 7 }, { title: {} }, { status: 'other' }, { slug: 'plain' }, { instagramUrl: 'javascript:alert(1)' }]) assert.ok(validate('artwork', value), JSON.stringify(value))
  for (const date of ['2026-02-30', 'not-a-date', '2026-9-1']) assert.ok(validate('exhibition', { startDate: date }))
  assert.equal(validate('exhibition', { startDate: '2024-02-29' }), null)
  assert.equal(validate('artwork', { instagramUrl: 'https://instagram.com/p/art' }), null)
})
test('references, keys and image framing are checked without stripping unknown data', () => {
  for (const value of [{ medium: { _type: 'reference', _ref: 'drafts.test' } }, { detailImages: [photo] }, { detailImages: [{ ...photo, _key: 'a' }, { ...photo, _key: 'a' }] }, { primaryImage: { ...photo, crop: { top: 2 } } }, { primaryImage: { ...photo, alt: 2 } }]) assert.ok(validate('artwork', value))
  const data = { ...artwork, futureField: { yes: true }, detailImages: [{ ...photo, _key: 'one' }], medium: { _type: 'reference', _ref: 'oil', future: 1 } }
  const before = structuredClone(data)
  assert.equal(validate('artwork', data, true), null)
  assert.deepEqual(data, before)
  assert.equal(validate('siteSettings', { featuredArtworks: [{ _key: 'r1', _type: 'reference', _ref: 'art-1' }] }), null)
})
const block = { _type: 'block', _key: 'b', style: 'h2', children: [{ _type: 'span', _key: 's', text: 'Priča', marks: ['strong', 'link1'] }], markDefs: [{ _key: 'link1', _type: 'link', href: 'https://example.com' }] }
test('Portable Text accepts formatting and journal images, preserves opaque blocks and rejects broken data', () => {
  const body = [block, { ...photo, _key: 'image' }, { _type: 'futureBlock', _key: 'future', opaque: [1, 2] }]
  const before = structuredClone(body)
  assert.equal(validate('journalPost', { body }), null)
  assert.deepEqual(body, before)
  assert.ok(validate('artwork', { story: [{ ...photo, _key: 'photo' }] }))
  assert.ok(validate('journalPost', { body: [{ ...block, children: [{ _type: 'span', _key: 's', text: 7 }] }] }))
  assert.ok(validate('journalPost', { body: [{ ...block, markDefs: [{ _key: 'bad', _type: 'link', href: 'javascript:alert(1)' }] }] }))
  assert.ok(validate('journalPost', { body: [block, block] }))
})
