import type { Metadata } from 'next'
import Navigation from '@/components/nav/Navigation'
import SiteFooter from '@/components/nav/SiteFooter'
import KineticHeading from '@/components/ui/KineticHeading'
import { getAllEducationItems, getArtistProfile, getSiteSettings } from '@/lib/content/api'
import type { EducationItem } from '@/lib/content/types'

export const metadata: Metadata = {
  title: 'Art & Education — Zlatica',
  description: 'Teaching philosophy, workshops, and educational practice.',
}

const TYPE_LABELS: Record<EducationItem['type'], string> = {
  teaching: 'Teaching',
  workshop: 'Workshop',
  'student-project': 'Student Project',
  project: 'Project',
}

export default async function EducationPage() {
  const [items, profile, settings] = await Promise.all([
    getAllEducationItems(),
    getArtistProfile(),
    getSiteSettings(),
  ])

  return (
    <>
      <Navigation theme="light" />
      <main className="bg-canvas min-h-screen pt-24">

        {/* Page header */}
        <header className="section-gutter py-16 md:py-24 border-b border-ink/10">
          <p className="text-label text-ink/40 mb-4 tracking-widest text-xs uppercase">
            Art &amp; Education
          </p>
          <KineticHeading
            as="h1"
            className="font-serif font-light text-ink"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.03em', lineHeight: 1.1 }}
            staggerMs={25}
          >
            Teaching as Practice
          </KineticHeading>
          <p
            className="mt-6 text-ink/60 font-sans font-light max-w-xl"
            style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.7 }}
          >
            {profile.educationStatement ?? (
              '[Placeholder — teaching philosophy statement from Zlatica to be added here.]'
            )}
          </p>
        </header>

        {/* Education items */}
        <section className="section-gutter section-spacing" aria-label="Education and teaching">
          {items.length === 0 ? (
            <p className="text-ink/40 font-sans text-sm">
              [No education items yet — content will be added via CMS.]
            </p>
          ) : (
            <ul className="space-y-16 md:space-y-20">
              {items.map((item, i) => (
                <li
                  key={item.id}
                  className={`grid md:grid-cols-12 md:gap-8 ${
                    i % 2 === 1 ? 'md:direction-rtl' : ''
                  }`}
                >
                  {/* Index / type */}
                  <div className="md:col-span-2 mb-4 md:mb-0">
                    <span className="text-label text-ink/30 text-xs tracking-widest uppercase">
                      {TYPE_LABELS[item.type]}
                    </span>
                    {item.date && (
                      <p className="text-ink/25 font-sans text-xs mt-1">{item.date}</p>
                    )}
                  </div>

                  {/* Content */}
                  <div className="md:col-span-7">
                    <h2
                      className="font-serif font-light text-ink mb-4"
                      style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', letterSpacing: '0.03em' }}
                    >
                      {item.title}
                    </h2>
                    {item.description && (
                      <p
                        className="text-ink/60 font-sans font-light"
                        style={{ fontSize: 'clamp(0.9375rem, 1.25vw, 1rem)', lineHeight: 1.75 }}
                      >
                        {item.description}
                      </p>
                    )}
                    {item.featured && (
                      <span className="inline-block mt-4 text-ink/30 text-xs font-sans tracking-widest uppercase">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Divider on mobile */}
                  <div className="md:hidden border-b border-ink/10 mt-12" aria-hidden />
                </li>
              ))}
            </ul>
          )}
        </section>

        <SiteFooter
          instagramUrl={settings.instagramProfileUrl ?? null}
          facebookUrl={settings.facebookProfileUrl ?? null}
          email={settings.contactEmail ?? null}
        />
      </main>
    </>
  )
}
