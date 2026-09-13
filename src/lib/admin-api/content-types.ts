/** Shared editor contract. Kept in parity with Sanity schemas by content-types.test.cjs. */
export type ContentField = {
 name: string; title: string; kind: 'string' | 'text' | 'number' | 'boolean' | 'select' | 'date' | 'url' | 'slug' | 'image' | 'images' | 'reference' | 'references' | 'portableText' | 'info';
 required?: boolean; options?: {title: string; value: string}[]; referenceType?: string; initialValue?: unknown; altRequired?: boolean; allowImages?: boolean;
}
export type ContentType = {name: string; title: string; singleton?: string; fields: ContentField[]; titleField: string; imageField?: string}

export const contentTypes: ContentType[] = [
  {
    "name": "artwork",
    "title": "Moji radovi",
    "titleField": "title",
    "imageField": "primaryImage",
    "fields": [
      {
        "name": "title",
        "title": "Naziv",
        "kind": "string",
        "required": true
      },
      {
        "name": "slug",
        "title": "Slug (adresa u URL-u)",
        "kind": "slug",
        "required": true
      },
      {
        "name": "status",
        "title": "Status",
        "kind": "select",
        "required": true,
        "options": [
          {
            "title": "Objavljeno",
            "value": "published"
          },
          {
            "title": "Nacrt",
            "value": "draft"
          },
          {
            "title": "Arhivirano",
            "value": "archived"
          }
        ],
        "initialValue": "draft"
      },
      {
        "name": "year",
        "title": "Godina",
        "kind": "number"
      },
      {
        "name": "medium",
        "title": "Tehnika",
        "kind": "reference",
        "referenceType": "medium"
      },
      {
        "name": "dimensions",
        "title": "Dimenzije",
        "kind": "string"
      },
      {
        "name": "primaryImage",
        "title": "Fotografija",
        "kind": "image",
        "required": true,
        "altRequired": true
      },
      {
        "name": "detailImages",
        "title": "Detaljne fotografije",
        "kind": "images"
      },
      {
        "name": "shortDescription",
        "title": "Kratak opis",
        "kind": "string"
      },
      {
        "name": "story",
        "title": "Opis / priča o radu",
        "kind": "portableText",
        "allowImages": false
      },
      {
        "name": "featured",
        "title": "Izdvojeno",
        "kind": "boolean",
        "initialValue": false
      },
      {
        "name": "featuredOrder",
        "title": "Redosled prikaza (izdvojeno)",
        "kind": "number"
      },
      {
        "name": "heroCandidate",
        "title": "Naslovni rad (hero)",
        "kind": "boolean",
        "initialValue": false
      },
      {
        "name": "instagramUrl",
        "title": "Instagram URL",
        "kind": "url"
      }
    ]
  },
  {
    "name": "medium",
    "title": "Tehnike",
    "titleField": "title",
    "fields": [
      {
        "name": "title",
        "title": "Naziv",
        "kind": "string",
        "required": true
      },
      {
        "name": "slug",
        "title": "Slug (adresa u URL-u)",
        "kind": "slug",
        "required": true
      },
      {
        "name": "description",
        "title": "Opis",
        "kind": "text"
      },
      {
        "name": "motionLanguage",
        "title": "Vizuelni jezik animacije",
        "kind": "select",
        "options": [
          {
            "title": "oil",
            "value": "oil"
          },
          {
            "title": "watercolor",
            "value": "watercolor"
          },
          {
            "title": "line",
            "value": "line"
          },
          {
            "title": "mosaic",
            "value": "mosaic"
          },
          {
            "title": "neutral",
            "value": "neutral"
          }
        ]
      },
      {
        "name": "order",
        "title": "Redosled",
        "kind": "number"
      }
    ]
  },
  {
    "name": "journalPost",
    "title": "Dnevnik / Blog",
    "titleField": "title",
    "imageField": "coverImage",
    "fields": [
      {
        "name": "title",
        "title": "Naslov",
        "kind": "string",
        "required": true
      },
      {
        "name": "slug",
        "title": "Slug (adresa u URL-u)",
        "kind": "slug",
        "required": true
      },
      {
        "name": "excerpt",
        "title": "Kratak izvod",
        "kind": "text"
      },
      {
        "name": "publishedAt",
        "title": "Datum objave",
        "kind": "date",
        "required": true
      },
      {
        "name": "category",
        "title": "Kategorija",
        "kind": "select",
        "options": [
          {
            "title": "Atelje",
            "value": "Atelier"
          },
          {
            "title": "Razmišljanja",
            "value": "Thoughts"
          },
          {
            "title": "Podučavanje",
            "value": "Teaching"
          },
          {
            "title": "Izložbe",
            "value": "Exhibitions"
          },
          {
            "title": "Radovi",
            "value": "Works"
          }
        ]
      },
      {
        "name": "coverImage",
        "title": "Naslovna fotografija",
        "kind": "image"
      },
      {
        "name": "body",
        "title": "Tekst",
        "kind": "portableText",
        "allowImages": true
      },
      {
        "name": "relatedArtworks",
        "title": "Povezani radovi",
        "kind": "references",
        "referenceType": "artwork"
      },
      {
        "name": "instagramUrl",
        "title": "Instagram URL",
        "kind": "url"
      }
    ]
  },
  {
    "name": "exhibition",
    "title": "Izložbe",
    "titleField": "title",
    "fields": [
      {
        "name": "title",
        "title": "Naziv",
        "kind": "string",
        "required": true
      },
      {
        "name": "venue",
        "title": "Mesto održavanja (galerija/prostor)",
        "kind": "string",
        "required": true
      },
      {
        "name": "city",
        "title": "Grad",
        "kind": "string"
      },
      {
        "name": "startDate",
        "title": "Datum početka",
        "kind": "date",
        "required": true
      },
      {
        "name": "endDate",
        "title": "Datum završetka",
        "kind": "date"
      },
      {
        "name": "status",
        "title": "Status",
        "kind": "select",
        "required": true,
        "options": [
          {
            "title": "Predstoji",
            "value": "upcoming"
          },
          {
            "title": "Trenutno traje",
            "value": "current"
          },
          {
            "title": "Prošla",
            "value": "past"
          }
        ],
        "initialValue": "past"
      },
      {
        "name": "description",
        "title": "Opis",
        "kind": "text"
      },
      {
        "name": "images",
        "title": "Fotografije",
        "kind": "images"
      },
      {
        "name": "externalUrl",
        "title": "Spoljni link",
        "kind": "url"
      }
    ]
  },
  {
    "name": "educationItem",
    "title": "Edukacija",
    "titleField": "title",
    "fields": [
      {
        "name": "title",
        "title": "Naziv",
        "kind": "string",
        "required": true
      },
      {
        "name": "type",
        "title": "Vrsta",
        "kind": "select",
        "required": true,
        "options": [
          {
            "title": "Podučavanje",
            "value": "teaching"
          },
          {
            "title": "Radionica",
            "value": "workshop"
          },
          {
            "title": "Rad učenika",
            "value": "student-project"
          },
          {
            "title": "Projekat",
            "value": "project"
          }
        ]
      },
      {
        "name": "date",
        "title": "Datum",
        "kind": "string"
      },
      {
        "name": "description",
        "title": "Opis",
        "kind": "text"
      },
      {
        "name": "images",
        "title": "Fotografije",
        "kind": "images"
      },
      {
        "name": "featured",
        "title": "Izdvojeno",
        "kind": "boolean",
        "initialValue": false
      }
    ]
  },
  {
    "name": "socialItem",
    "title": "Objave",
    "titleField": "captionExcerpt",
    "imageField": "image",
    "fields": [
      {
        "name": "platform",
        "title": "Platforma",
        "kind": "select",
        "required": true,
        "options": [
          {
            "title": "Instagram",
            "value": "instagram"
          },
          {
            "title": "Facebook",
            "value": "facebook"
          }
        ]
      },
      {
        "name": "externalUrl",
        "title": "Link ka objavi",
        "kind": "url",
        "required": true
      },
      {
        "name": "image",
        "title": "Fotografija",
        "kind": "image"
      },
      {
        "name": "captionExcerpt",
        "title": "Izvod iz opisa",
        "kind": "text"
      },
      {
        "name": "publishedAt",
        "title": "Datum objave",
        "kind": "date"
      },
      {
        "name": "featured",
        "title": "Izdvojeno",
        "kind": "boolean",
        "initialValue": false
      }
    ]
  },
  {
    "name": "artistProfile",
    "title": "O meni",
    "singleton": "artistProfile",
    "titleField": "name",
    "imageField": "portrait",
    "fields": [
      {
        "name": "name",
        "title": "Ime",
        "kind": "string",
        "required": true
      },
      {
        "name": "roleLine",
        "title": "Podnaslov (npr. Slikarka · Edukator)",
        "kind": "string"
      },
      {
        "name": "portrait",
        "title": "Portret",
        "kind": "image"
      },
      {
        "name": "atelierImages",
        "title": "Fotografije iz ateljea",
        "kind": "images"
      },
      {
        "name": "shortBio",
        "title": "Kratka biografija",
        "kind": "text"
      },
      {
        "name": "biography",
        "title": "Puna biografija",
        "kind": "portableText",
        "allowImages": false
      },
      {
        "name": "artistStatement",
        "title": "Umetnička izjava (statement)",
        "kind": "text"
      },
      {
        "name": "educationStatement",
        "title": "O pedagoškom radu",
        "kind": "text"
      },
      {
        "name": "location",
        "title": "Lokacija",
        "kind": "string"
      }
    ]
  },
  {
    "name": "siteSettings",
    "title": "Podešavanja",
    "singleton": "siteSettings",
    "titleField": "siteTitle",
    "fields": [
      {
        "name": "siteTitle",
        "title": "Naziv sajta",
        "kind": "string"
      },
      {
        "name": "siteDescription",
        "title": "Opis sajta",
        "kind": "text"
      },
      {
        "name": "heroArtwork",
        "title": "Naslovni rad (početna strana)",
        "kind": "reference",
        "referenceType": "artwork"
      },
      {
        "name": "featuredArtworks",
        "title": "Izdvojeni radovi",
        "kind": "references",
        "referenceType": "artwork"
      },
      {
        "name": "featuredJournalPosts",
        "title": "Izdvojene objave iz dnevnika",
        "kind": "references",
        "referenceType": "journalPost"
      },
      {
        "name": "socialConnectionGuide",
        "title": "Uputstvo",
        "kind": "info"
      },
      {
        "name": "instagramProfileUrl",
        "title": "Instagram profil (link)",
        "kind": "url"
      },
      {
        "name": "instagramConnectionStatus",
        "title": "Status — Instagram",
        "kind": "select",
        "options": [
          {
            "title": "Nije povezano — samo ručni link",
            "value": "manual"
          },
          {
            "title": "Napravila sam Professional/Business nalog — čeka se developer",
            "value": "pending"
          },
          {
            "title": "Povezano automatski (API)",
            "value": "connected"
          }
        ],
        "initialValue": "manual"
      },
      {
        "name": "facebookProfileUrl",
        "title": "Facebook profil (link)",
        "kind": "url"
      },
      {
        "name": "facebookConnectionStatus",
        "title": "Status — Facebook",
        "kind": "select",
        "options": [
          {
            "title": "Nije povezano — samo ručni link",
            "value": "manual"
          },
          {
            "title": "Napravila sam Professional/Business nalog — čeka se developer",
            "value": "pending"
          },
          {
            "title": "Povezano automatski (API)",
            "value": "connected"
          }
        ],
        "initialValue": "manual"
      },
      {
        "name": "contactEmail",
        "title": "Kontakt email",
        "kind": "string"
      },
      {
        "name": "contactEnabled",
        "title": "Kontakt forma uključena",
        "kind": "boolean",
        "initialValue": false
      }
    ]
  }
]

export function getContentType(name: string): ContentType | undefined { return contentTypes.find(type => type.name === name) }

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
function nonempty(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0 }
function reference(value: unknown): boolean {
  return object(value) && value._type === 'reference' && nonempty(value._ref) && /^[a-zA-Z0-9_][a-zA-Z0-9_.-]*$/.test(value._ref) && !value._ref.startsWith('drafts.')
}
function url(value: string): boolean {
  try { return ['https:', 'http:'].includes(new URL(value).protocol) } catch { return false }
}
function image(value: unknown, publish: boolean, altRequired = false): boolean {
  if (!object(value) || value._type !== 'image') return false
  if (value.asset != null && (!reference(value.asset) || !String((value.asset as Record<string, unknown>)._ref).startsWith('image-'))) return false
  if (publish && !value.asset) return false
  if (value.alt != null && typeof value.alt !== 'string') return false
  if (publish && altRequired && !nonempty(value.alt)) return false
  for (const [name, keys] of [['crop', ['top', 'bottom', 'left', 'right']], ['hotspot', ['x', 'y', 'width', 'height']]] as const) {
    const coordinate = value[name]
    if (coordinate == null) continue
    if (!object(coordinate) || keys.some(key => typeof coordinate[key] !== 'number' || !Number.isFinite(coordinate[key]) || Number(coordinate[key]) < 0 || Number(coordinate[key]) > 1)) return false
    if (name === 'crop' && (Number(coordinate.top) + Number(coordinate.bottom) >= 1 || Number(coordinate.left) + Number(coordinate.right) >= 1)) return false
  }
  return true
}
function keyedArray(value: unknown): value is Record<string, unknown>[] {
  if (!Array.isArray(value)) return false
  const keys = new Set<string>()
  for (const item of value) {
    if (!object(item) || !nonempty(item._key) || keys.has(item._key)) return false
    keys.add(item._key)
  }
  return true
}
function portableText(value: unknown, field: ContentField, publish: boolean): boolean {
  if (!keyedArray(value)) return false
  return value.every(block => {
    if (block._type === 'image') return Boolean(field.allowImages) && image(block, publish)
    // Preserve future/custom blocks as opaque keyed objects. The editor must protect them.
    if (block._type !== 'block') return nonempty(block._type)
    if (!keyedArray(block.children)) return false
    if (block.style != null && typeof block.style !== 'string') return false
    if (block.listItem != null && typeof block.listItem !== 'string') return false
    if (block.level != null && (typeof block.level !== 'number' || !Number.isInteger(block.level) || block.level < 1)) return false
    const definitions = block.markDefs ?? []
    if (!keyedArray(definitions)) return false
    if (!definitions.every(mark => {
      if (!nonempty(mark._type)) return false
      if (mark._type !== 'link') return true
      if (typeof mark.href !== 'string') return false
      return url(mark.href) || /^(mailto:|tel:|\/[^/]|#)/.test(mark.href)
    })) return false
    return block.children.every(child => {
      if (child._type !== 'span') return nonempty(child._type)
      return typeof child.text === 'string' && (child.marks === undefined || (Array.isArray(child.marks) && child.marks.every(mark => typeof mark === 'string')))
    })
  })
}

/** Validate without rewriting: unknown Studio data, image framing and array identities survive. */
export function validateContent(type: ContentType, fields: Record<string, unknown>, publish: boolean): string | null {
  for (const field of type.fields) {
    const value = fields[field.name]
    if (field.kind === 'info') continue
    const empty = value == null || value === '' || (field.kind === 'slug' && object(value) && !value.current)
    if (empty) {
      if (publish && field.required) return `Polje „${field.title}“ je obavezno.`
      if (value == null || value === '' && ['string', 'text', 'date', 'url', 'select'].includes(field.kind)) continue
    }
    let valid: boolean
    switch (field.kind) {
      case 'string': case 'text': valid = typeof value === 'string'; break
      case 'number': valid = typeof value === 'number' && Number.isFinite(value); break
      case 'boolean': valid = typeof value === 'boolean'; break
      case 'select': valid = typeof value === 'string' && Boolean(field.options?.some(option => option.value === value)); break
      case 'date': valid = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value; break
      case 'url': valid = typeof value === 'string' && url(value); break
      case 'slug': valid = object(value) && value._type === 'slug' && typeof value.current === 'string' && (!value.current || /^[a-zA-Z0-9]+(?:[-_][a-zA-Z0-9]+)*$/.test(value.current)); break
      case 'image': valid = image(value, publish, field.altRequired); break
      case 'images': valid = keyedArray(value) && value.every(item => image(item, publish, field.altRequired)); break
      case 'reference': valid = reference(value); break
      case 'references': valid = keyedArray(value) && value.every(reference); break
      case 'portableText': valid = portableText(value, field, publish); break
    }
    if (!valid) return `Polje „${field.title}“ nema ispravnu vrednost.`
    if (publish && field.required && typeof value === 'string' && !value.trim()) return `Polje „${field.title}“ je obavezno.`
  }
  return null
}
