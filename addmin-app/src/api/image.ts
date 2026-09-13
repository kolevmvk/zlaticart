import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'

/**
 * Priprema fotografije pre slanja.
 *
 * Server (Vercel) ne prima telo zahteva veće od 4.5MB, a fotografija sa
 * telefona lako prelazi 8MB. Umesto oštre kompresije pri izboru (koja kvari
 * boje i detalje slike), fotografija se uzima u punom kvalitetu i ovde svodi
 * na dovoljnu veličinu za sajt — dugačka ivica najviše 2400px — uz što blažu
 * kompresiju koja staje ispod limita.
 */
const UPLOAD_LIMIT_BYTES = 3.8 * 1024 * 1024
// 2400px je dovoljno i za najveći prikaz na sajtu (Sanity CDN pravi manje verzije),
// a fajl je oko upola manji od 3000px — slanje sa telefona je primetno brže.
const STEPS = [
  { maxEdge: 2400, compress: 0.85 },
  { maxEdge: 2000, compress: 0.8 },
  { maxEdge: 1600, compress: 0.8 },
] as const

export class ImagePreparationError extends Error {}

export async function prepareUploadImage(source: { uri: string; width: number; height: number }) {
  for (const step of STEPS) {
    const context = ImageManipulator.manipulate(source.uri)
    const longEdge = Math.max(source.width, source.height)
    if (longEdge > step.maxEdge) {
      context.resize(source.width >= source.height ? { width: step.maxEdge } : { height: step.maxEdge })
    }

    const rendered = await context.renderAsync()
    const saved = await rendered.saveAsync({ compress: step.compress, format: SaveFormat.JPEG })
    const size = await fileSize(saved.uri)

    if (size !== null && size <= UPLOAD_LIMIT_BYTES) {
      return { uri: saved.uri, width: saved.width, height: saved.height }
    }
  }

  throw new ImagePreparationError('Fotografija je prevelika i ne može da se pripremi za slanje.')
}

async function fileSize(uri: string) {
  try {
    const blob = await (await fetch(uri)).blob()
    return blob.size
  } catch {
    return null
  }
}
