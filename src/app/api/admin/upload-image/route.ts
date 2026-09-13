import { AdminAuthError, verifyAdminRequestWithSession } from '@/lib/admin-api/auth'
import { adminAuthError, adminError, adminOk } from '@/lib/admin-api/responses'
import { MAX_UPLOAD_BYTES, sniffImageType, uploadFilename } from '@/lib/admin-api/image-upload'
import { adminUploadArtworkImage, adminWriteConfigured } from '@/lib/admin-api/sanity'

export const runtime = 'nodejs'

// Mobilna app nikad ne salje sliku direktno Sanity-ju (nema write token) —
// prolazi kroz ovu rutu, koja je jedina koja koristi Sanity Asset API
// server-side. Vidi skills/image-upload-pipeline.md.
export async function POST(request: Request) {
  try {
    await verifyAdminRequestWithSession(request)
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return adminAuthError(error)
    }
    return adminError('Unexpected admin API error.', 500)
  }

  if (!adminWriteConfigured()) {
    return adminError('Sanity write access is not configured.', 503)
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return adminError('Expected multipart/form-data with a "file" field.', 400)
  }

  const file = formData.get('file')
  if (!(file instanceof Blob)) {
    return adminError('Missing "file" field.', 400)
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return adminError('Image is too large (max 4MB).', 413)
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const type = sniffImageType(buffer)
  if (!type) {
    return adminError('Unsupported image format. Use JPEG, PNG or WebP.', 415)
  }

  try {
    // Sanity deduplicira asset po sadržaju, pa ponovljen upload iste
    // fotografije posle prekida vraća isti asset, ne pravi kopiju.
    const asset = await adminUploadArtworkImage(buffer, uploadFilename(type))
    return adminOk({ assetId: asset._id, url: asset.url })
  } catch {
    return adminError('Could not upload image to Sanity.', 502)
  }
}
