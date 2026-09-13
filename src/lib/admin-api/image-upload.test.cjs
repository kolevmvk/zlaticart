/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness loads transpiled TypeScript. */
//
// P5/A5: server prihvata samo stvarne JPEG/PNG/WebP bajtove, bez obzira na
// ime fajla ili Content-Type koji klijent pošalje.
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, 'image-upload.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const loaded = { exports: {} }
new Function('require', 'module', 'exports', compiled)(require, loaded, loaded.exports)
const { sniffImageType, uploadFilename, MAX_UPLOAD_BYTES } = loaded.exports

test('prepoznaje JPEG, PNG i WebP po sadržaju', () => {
  assert.equal(sniffImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10])), 'image/jpeg')
  assert.equal(sniffImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])), 'image/png')
  assert.equal(sniffImageType(Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBPVP8 ')])), 'image/webp')
  assert.equal(uploadFilename('image/png'), 'artwork.png')
})

test('odbija sve ostalo, uključujući prazan i skraćen fajl', () => {
  assert.equal(sniffImageType(Buffer.alloc(0)), null)
  assert.equal(sniffImageType(Buffer.from([0xff, 0xd8])), null)
  assert.equal(sniffImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')), null)
  assert.equal(sniffImageType(Buffer.from('GIF89a......')), null)
  assert.equal(sniffImageType(Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WAVE')])), null)
})

test('limit ostaje ispod Vercel granice od 4.5MB', () => {
  assert.ok(MAX_UPLOAD_BYTES < 4.5 * 1024 * 1024)
})
