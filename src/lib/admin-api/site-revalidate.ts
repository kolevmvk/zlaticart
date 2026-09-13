import 'server-only'

import { revalidatePath } from 'next/cache'

/**
 * Posle promene javnog sadržaja (objava, brisanje, sklanjanje sa sajta) sve
 * stranice sajta se ponovo generišu pri sledećem zahtevu. Sajt je većinom
 * statičan; bez ovoga bi objava iz aplikacije postala vidljiva tek posle deploy-a.
 * Neuspeh ne sme da obori već uspelu objavu — vremenski revalidate je rezerva.
 */
export function revalidateSite() {
  try {
    revalidatePath('/', 'layout')
  } catch (error) {
    console.error('[site-revalidate] failed', error instanceof Error ? error.message : error)
  }
}
