/**
 * Provera fotografije pre slanja Sanity-ju.
 *
 * Limit je ispod Vercel granice od 4.5MB za telo zahteva serverless funkcije —
 * veći fajl Vercel odbije pre našeg koda, bez razumljive poruke. Mobilna app
 * zato smanjuje fotografiju pre slanja; ovo je serverska zaštita.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

export type UploadImageType = 'image/jpeg' | 'image/png' | 'image/webp'

const EXTENSIONS: Record<UploadImageType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

/** Tip po stvarnim bajtovima, ne po imenu ili Content-Type zaglavlju klijenta. */
export function sniffImageType(bytes: Uint8Array): UploadImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg'
  }
  if (
    bytes.length >= 8 &&
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte)
  ) {
    return 'image/png'
  }
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP') {
    return 'image/webp'
  }
  return null
}

export function uploadFilename(type: UploadImageType) {
  return `artwork.${EXTENSIONS[type]}`
}

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.subarray(start, end))
}
