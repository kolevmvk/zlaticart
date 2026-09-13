/* global __dirname */
// Uvoz STVARNOG seed sadržaja u Sanity kroz produkcioni admin API, pre prve prave objave.
//
//   bash addmin-app/scripts/import-seed.sh [https://www.zlaticart.com]   (PIN se unosi skriveno)
//   node addmin-app/scripts/import-seed.cjs --dry-run                     (bez mreže: plan + validacija)
//
// Uvozi samo ono što sajt već javno prikazuje iz src/lib/content/seed.ts i što je stvarno:
// 5 tehnika, 8 radova sa pravim fotografijama (naslovi ostaju „Untitled“ — placeholder,
// menja ih Zlatica), profil (ime, podnaslov, prave fotografije; bez biografije) i
// podešavanja sajta. Dnevnik, izložbe i edukacija su izmišljeni placeholderi — NE uvoze se.
//
// Idempotentno: postojeći dokumenti se ne prave ponovo; objavljuje se samo nacrt.
// Radovi se objavljuju tek kad su svi pripremljeni, jer sajt prelazi sa seed-a na
// Sanity čim postoji prvi objavljen rad.
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const root = path.resolve(__dirname, '../..')
const DRY = process.argv.includes('--dry-run')
const BASE = process.argv.slice(2).find(arg => arg.startsWith('https://')) ?? 'https://www.zlaticart.com'

function loadTs(file, requireMap = {}) {
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const loaded = { exports: {} }
  new Function('require', 'module', 'exports', compiled)(name => {
    if (name in requireMap) return requireMap[name]
    throw new Error(`Unexpected dependency in ${file}: ${name}`)
  }, loaded, loaded.exports)
  return loaded.exports
}

const seed = loadTs(path.join(root, 'src/lib/content/seed.ts'), { './types': {} })
const { getContentType, validateContent } = loadTs(path.join(root, 'src/lib/admin-api/content-types.ts'))

const slug = current => ({ _type: 'slug', current })
const ref = id => ({ _type: 'reference', _ref: id })
const keyed = (items, prefix) => items.map((item, index) => ({ _key: `${prefix}${index + 1}`, ...item }))
const mediumId = key => `medium-${key}`
const artworkId = artwork => `seed-${artwork.slug}`
const imageFile = src => path.join(root, 'public', src)

function image(src, alt, focal) {
  return {
    _type: 'image',
    alt,
    __file: src,
    ...(focal ? { hotspot: { _type: 'sanity.imageHotspot', x: focal.x, y: focal.y, width: 1, height: 1 } } : {}),
  }
}

function plan() {
  const mediumKeys = Object.keys(seed.MEDIA)
  const media = mediumKeys.map(key => {
    const medium = seed.MEDIA[key]
    return { type: 'medium', id: mediumId(key), fields: {
      title: medium.title, slug: slug(medium.slug), description: medium.description,
      motionLanguage: medium.motionLanguage, order: medium.order,
    } }
  })
  const keyOfMedium = medium => mediumKeys.find(key => seed.MEDIA[key].slug === medium.slug)
  const artworks = seed.ARTWORKS.filter(artwork => artwork.status === 'published').map(artwork => ({
    type: 'artwork', id: artworkId(artwork), fields: {
      title: artwork.title,
      slug: slug(artwork.slug),
      status: 'draft',
      medium: ref(mediumId(keyOfMedium(artwork.medium))),
      primaryImage: image(artwork.primaryImage.src, artwork.primaryImage.alt, artwork.primaryImage.desktopFocalPoint),
      featured: Boolean(artwork.featured),
      ...(artwork.featuredOrder != null ? { featuredOrder: artwork.featuredOrder } : {}),
      heroCandidate: Boolean(artwork.heroCandidate),
    },
  }))
  const profile = seed.ARTIST_PROFILE
  const artistProfile = { type: 'artistProfile', id: 'artistProfile', fields: {
    name: profile.name,
    roleLine: profile.roleLine,
    portrait: image(profile.portrait.src, profile.portrait.alt),
    atelierImages: keyed(profile.atelierImages.map(item => image(item.src, item.alt)), 'atelier'),
  } }
  const settings = seed.SITE_SETTINGS
  const bySlug = slugValue => seed.ARTWORKS.find(artwork => artwork.slug === slugValue)
  const siteSettings = { type: 'siteSettings', id: 'siteSettings', fields: {
    siteTitle: settings.siteTitle,
    siteDescription: settings.siteDescription,
    heroArtwork: ref(artworkId(bySlug(settings.heroArtworkSlug))),
    featuredArtworks: keyed(settings.featuredArtworkSlugs.map(value => ref(artworkId(bySlug(value)))), 'featured'),
    instagramConnectionStatus: settings.instagramConnectionStatus,
    facebookConnectionStatus: settings.facebookConnectionStatus,
    contactEnabled: settings.contactEnabled,
  } }
  return { media, artworks, singletons: [artistProfile, siteSettings] }
}

// Zamenjuje `__file` stvarnim asset referencama (ili lažnim ID-jem za dry-run).
async function resolveImages(value, upload) {
  if (Array.isArray(value)) return Promise.all(value.map(item => resolveImages(item, upload)))
  if (!value || typeof value !== 'object') return value
  const out = {}
  for (const [key, inner] of Object.entries(value)) {
    if (key === '__file') continue
    out[key] = await resolveImages(inner, upload)
  }
  if (value.__file) out.asset = ref(await upload(value.__file))
  return out
}

function validate(entry, fields) {
  const type = getContentType(entry.type)
  if (!type) throw new Error(`Nepoznat tip ${entry.type}`)
  const error = validateContent(type, fields, true)
  if (error) throw new Error(`${entry.type}/${entry.id}: ${error}`)
}

async function dryRun() {
  const { media, artworks, singletons } = plan()
  const fakeUpload = async src => {
    if (!fs.existsSync(imageFile(src))) throw new Error(`Nedostaje fajl ${src}`)
    return 'image-0123456789abcdef0123456789abcdef-100x100-jpg'
  }
  for (const entry of [...media, ...artworks, ...singletons]) {
    const fields = await resolveImages(entry.fields, fakeUpload)
    validate(entry, entry.type === 'artwork' ? { ...fields, status: 'published' } : fields)
    console.log(`  plan  ${entry.type.padEnd(13)} ${entry.id}  ${fields.title ?? fields.name ?? fields.siteTitle ?? ''}`)
  }
  console.log(`Dry-run OK: ${media.length} tehnika, ${artworks.length} radova, ${singletons.length} singletona; sve slike postoje i prolaze validaciju objave.`)
}

async function live() {
  const pin = process.env.ZLATICART_PIN
  delete process.env.ZLATICART_PIN
  if (!/^\d{6}$/.test(pin ?? '')) throw new Error('PIN nije prosleđen (koristi import-seed.sh).')

  // Prolazne greške servera (Supabase/Sanity kratko ne odgovara) ponavljaju se do 5 puta.
  // 503 znači da zahtev nije ništa promenio (provera sesije/konfiguracije pre upisa), pa je ponavljanje bezbedno;
  // za objavu posle 502/504 ishod je nepoznat — ensureDraft/publish ponovo čitaju stanje pre sledećeg pokušaja.
  async function call(method, pathname, { token, json, form } = {}) {
    for (let attempt = 1; ; attempt += 1) {
      let status = 0, body = null
      try {
        const response = await fetch(`${BASE}${pathname}`, {
          method,
          headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(json ? { 'Content-Type': 'application/json' } : {}) },
          body: json ? JSON.stringify(json) : form,
        })
        status = response.status
        body = await response.json().catch(() => null)
      } catch { status = 0 }
      const retryable = status === 0 || status === 503 || (method === 'GET' && status >= 500)
      if (!retryable || attempt >= 5) return { status, body }
      console.log(`  ponavljam (${status || 'bez veze'}) ${method} ${pathname}`)
      await new Promise(resolve => setTimeout(resolve, 1500 * attempt))
    }
  }

  const login = await call('POST', '/api/admin/login', { json: { pin } })
  const token = login.body?.data?.token
  if (login.status !== 200 || !token) throw new Error(`Prijava nije uspela (HTTP ${login.status}).`)
  console.log(`Prijava uspela. Server: ${BASE}`)

  try {
    const uploaded = new Map()
    async function upload(src) {
      if (uploaded.has(src)) return uploaded.get(src)
      const extension = path.extname(src).slice(1).toLowerCase()
      const typeByExtension = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
      const form = new FormData()
      form.append('file', new Blob([fs.readFileSync(imageFile(src))], { type: typeByExtension[extension] }), path.basename(src))
      const result = await call('POST', '/api/admin/upload-image', { token, form })
      if (result.status !== 200) throw new Error(`Upload ${src} nije uspeo (HTTP ${result.status}): ${result.body?.error ?? ''}`)
      uploaded.set(src, result.body.data.assetId)
      return result.body.data.assetId
    }

    async function ensureDraft(entry) {
      const existing = await call('GET', `/api/admin/content/${entry.type}/${entry.id}`, { token })
      if (existing.status === 200) {
        console.log(`  postoji  ${entry.type}/${entry.id}`)
        return existing.body.data.content
      }
      if (existing.status !== 404) throw new Error(`${entry.type}/${entry.id}: čitanje HTTP ${existing.status}`)
      const fields = await resolveImages(entry.fields, upload)
      validate(entry, entry.type === 'artwork' ? { ...fields, status: 'published' } : fields)
      const created = await call('POST', `/api/admin/content/${entry.type}`, { token, json: { clientId: entry.id, fields } })
      if (created.status !== 201) throw new Error(`${entry.type}/${entry.id}: kreiranje HTTP ${created.status}: ${created.body?.error ?? ''}`)
      console.log(`  nacrt    ${entry.type}/${entry.id}`)
      return created.body.data.content
    }

    async function publish(entry, previous) {
      // Sveže stanje: raniji pokušaj je možda već objavio (nepoznat ishod posle 502/504).
      const fresh = await call('GET', `/api/admin/content/${entry.type}/${entry.id}`, { token })
      const content = fresh.status === 200 ? fresh.body.data.content : previous
      if (!content.hasDraft) {
        console.log(`  objavljeno ranije  ${entry.type}/${entry.id}`)
        return
      }
      const result = await call('POST', `/api/admin/content/${entry.type}/${entry.id}/publish`, { token, json: { baseRevision: content.revision } })
      if (result.status !== 200) throw new Error(`${entry.type}/${entry.id}: objava HTTP ${result.status}: ${result.body?.error ?? ''}`)
      console.log(`  objavljeno  ${entry.type}/${entry.id}`)
    }

    const { media, artworks, singletons } = plan()
    console.log('1. Tehnike')
    for (const entry of media) await publish(entry, await ensureDraft(entry))
    console.log('2. Radovi — prvo svi nacrti, pa objava zajedno')
    const drafts = []
    for (const entry of artworks) drafts.push([entry, await ensureDraft(entry)])
    for (const [entry, content] of drafts) await publish(entry, content)
    console.log('3. O meni i Podešavanja')
    for (const entry of singletons) await publish(entry, await ensureDraft(entry))
    console.log('Uvoz završen.')
  } finally {
    const logout = await call('POST', '/api/admin/logout', { token })
    console.log(`Odjava: HTTP ${logout.status}`)
  }
}

;(DRY ? dryRun() : live()).catch(error => {
  console.error(`GREŠKA: ${error.message}`)
  process.exit(1)
})
