import 'server-only'
import { AdminAuthError, verifyAdminRequestWithSession } from './auth'
import { adminAuthError, adminError, adminOk } from './responses'
import { adminWriteConfigured } from './sanity'
import { ContentError, contentType, contentUsage, createContent, getContent, listContent, publishContent, removeContent, saveContent } from './content'
import { contentTypes } from './content-types'
import { revalidateSite } from './site-revalidate'

type Params = { type?: string; id?: string }
export async function contentRoute(request: Request, params: Params = {}, action?: 'schema' | 'publish' | 'discard') {
  try {
    await verifyAdminRequestWithSession(request)
    if (action === 'schema') return adminOk({ types: contentTypes })
    const type = contentType(params.type ?? '')
    if (request.method === 'GET') {
      if (params.id && new URL(request.url).searchParams.get('usage') === '1') return adminOk({ usage: await contentUsage(type, params.id) })
      return adminOk(params.id ? { content: await getContent(type, params.id) } : { contents: await listContent(type) })
    }
    if (!adminWriteConfigured()) return adminError('Čuvanje trenutno nije dostupno.', 503)
    let body: Record<string, unknown>
    try {
      const parsed: unknown = await request.json()
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error()
      body = parsed as Record<string, unknown>
    } catch { return adminError('Zahtev nije ispravan.', 400) }
    if (!params.id) return adminOk({ content: await createContent(type, body.clientId, body.fields) }, { status: 201 })
    if (action === 'publish') {
      const content = await publishContent(type, params.id, body.baseRevision)
      revalidateSite()
      return adminOk({ content })
    }
    if (action === 'discard' || request.method === 'DELETE') {
      if (body.confirm !== true) return adminError('Potvrdite brisanje ili odbacivanje nacrta.', 400)
      const result = await removeContent(type, params.id, body.baseRevision, action === 'discard', body.unlinkReferences === true)
      // Brisanje (i uklonjena povezivanja) menja sajt; odbacivanje nacrta ne dira javnu verziju.
      if (action !== 'discard') revalidateSite()
      return adminOk(result)
    }
    return adminOk({ content: await saveContent(type, params.id, body.fields, body.baseRevision) })
  } catch (error) {
    if (error instanceof AdminAuthError) return adminAuthError(error)
    if (error instanceof ContentError) return adminError(error.message, error.status)
    return adminError('Sadržaj trenutno nije dostupan. Pokušajte ponovo.', 502)
  }
}
