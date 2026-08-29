import type { Metadata } from 'next'
import Navigation from '@/components/nav/Navigation'
import SiteFooter from '@/components/nav/SiteFooter'
import { getSiteSettings } from '@/lib/content/api'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Zlatica.',
}

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const { instagramProfileUrl, facebookProfileUrl, contactEmail } = settings

  return (
    <>
      <Navigation />
      <main className="min-h-svh bg-canvas">
        <div className="section-gutter pt-32 md:pt-36 pb-12 border-b border-canvas-deep">
          <h1
            className="font-serif font-light text-ink"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', letterSpacing: '0.10em' }}
          >
            Contact
          </h1>
        </div>

        <div className="section-gutter section-spacing">
          <div className="max-w-md">
            <p className="font-sans text-ink/70 leading-loose mb-10 text-[0.9375rem]">
              For inquiries about works, exhibitions, and collaborations — reach out directly.
            </p>

            <div className="space-y-6">
              {instagramProfileUrl && (
                <div>
                  <p className="text-label text-ink/40 mb-1">Instagram</p>
                  <a
                    href={instagramProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-ink hover:opacity-60 transition-opacity duration-200 text-sm"
                  >
                    {instagramProfileUrl}
                  </a>
                </div>
              )}

              {facebookProfileUrl && (
                <div>
                  <p className="text-label text-ink/40 mb-1">Facebook</p>
                  <a
                    href={facebookProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-ink hover:opacity-60 transition-opacity duration-200 text-sm"
                  >
                    {facebookProfileUrl}
                  </a>
                </div>
              )}

              {contactEmail && (
                <div>
                  <p className="text-label text-ink/40 mb-1">Email</p>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="font-sans text-ink hover:opacity-60 transition-opacity duration-200 text-sm"
                  >
                    {contactEmail}
                  </a>
                </div>
              )}

              {!instagramProfileUrl && !contactEmail && (
                <p className="text-gallery-meta italic text-ink/40">
                  Contact information will be added soon.
                </p>
              )}
            </div>
          </div>
        </div>

        <SiteFooter
          instagramUrl={instagramProfileUrl ?? null}
          facebookUrl={facebookProfileUrl ?? null}
          email={contactEmail ?? null}
        />
      </main>
    </>
  )
}
