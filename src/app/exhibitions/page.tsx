import type { Metadata } from 'next'
import Navigation from '@/components/nav/Navigation'
import SiteFooter from '@/components/nav/SiteFooter'
import { getAllExhibitions, SITE_SETTINGS } from '@/lib/content/seed'

export const metadata: Metadata = {
  title: 'Exhibitions — Zlatica',
  description: 'Past, current, and upcoming exhibitions.',
}

const STATUS_LABELS = {
  upcoming: 'Upcoming',
  current: 'On View',
  past: 'Past',
}

function formatDateRange(start: string, end?: string): string {
  const startDate = new Date(start)
  const year = startDate.getFullYear()
  const startMonth = startDate.toLocaleDateString('en-GB', { month: 'long' })
  if (!end) return `${startMonth} ${year}`
  const endDate = new Date(end)
  const endMonth = endDate.toLocaleDateString('en-GB', { month: 'long' })
  const endYear = endDate.getFullYear()
  if (year === endYear) return `${startMonth} – ${endMonth} ${year}`
  return `${startMonth} ${year} – ${endMonth} ${endYear}`
}

export default function ExhibitionsPage() {
  const exhibitions = getAllExhibitions()

  const upcoming = exhibitions.filter((e) => e.status === 'upcoming')
  const current = exhibitions.filter((e) => e.status === 'current')
  const past = exhibitions.filter((e) => e.status === 'past')

  return (
    <>
      <Navigation theme="light" />
      <main className="bg-canvas min-h-screen pt-24">

        {/* Page header */}
        <header className="section-gutter py-16 md:py-24 border-b border-ink/10">
          <p className="text-label text-ink/40 mb-4 tracking-widest text-xs uppercase">
            Exhibitions
          </p>
          <h1
            className="font-serif font-light text-ink"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.03em', lineHeight: 1.1 }}
          >
            Exhibition History
          </h1>
        </header>

        <section className="section-gutter section-spacing" aria-label="Exhibitions list">

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mb-20">
              <h2 className="text-label text-ink/40 tracking-widest text-xs uppercase mb-10">
                Upcoming
              </h2>
              <ExhibitionList exhibitions={upcoming} />
            </div>
          )}

          {/* Current */}
          {current.length > 0 && (
            <div className="mb-20">
              <h2 className="text-label text-ink/40 tracking-widest text-xs uppercase mb-10">
                On View
              </h2>
              <ExhibitionList exhibitions={current} />
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div className="mb-20">
              <h2 className="text-label text-ink/40 tracking-widest text-xs uppercase mb-10">
                Past Exhibitions
              </h2>
              <ExhibitionList exhibitions={past} />
            </div>
          )}

          {exhibitions.length === 0 && (
            <p className="text-ink/40 font-sans text-sm">
              [Exhibition history will be added via CMS — awaiting verified details from Zlatica.]
            </p>
          )}

          {exhibitions.length > 0 && upcoming.length === 0 && current.length === 0 && (
            <div className="mb-20 pb-16 border-b border-ink/10">
              <p className="text-ink/40 font-sans text-sm italic">
                [Upcoming exhibitions to be announced — placeholder content only]
              </p>
            </div>
          )}
        </section>

        <SiteFooter
          instagramUrl={SITE_SETTINGS.instagramProfileUrl}
          facebookUrl={SITE_SETTINGS.facebookProfileUrl}
          email={SITE_SETTINGS.contactEmail}
        />
      </main>
    </>
  )
}

function ExhibitionList({ exhibitions }: { exhibitions: ReturnType<typeof getAllExhibitions> }) {
  return (
    <ul className="space-y-12">
      {exhibitions.map((ex) => (
        <li
          key={ex.id}
          className="grid md:grid-cols-12 md:gap-8 border-t border-ink/10 pt-8"
        >
          {/* Date column */}
          <div className="md:col-span-2 mb-3 md:mb-0">
            <p className="font-sans text-ink/40 text-sm">
              {formatDateRange(ex.startDate, ex.endDate)}
            </p>
            <span
              className={`inline-block mt-1 text-xs font-sans tracking-widest uppercase ${
                ex.status === 'upcoming'
                  ? 'text-ink/60'
                  : ex.status === 'current'
                  ? 'text-ink'
                  : 'text-ink/30'
              }`}
            >
              {STATUS_LABELS[ex.status]}
            </span>
          </div>

          {/* Content column */}
          <div className="md:col-span-8">
            <h3
              className="font-serif font-light text-ink mb-1"
              style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', letterSpacing: '0.03em' }}
            >
              {ex.title}
            </h3>
            <p className="font-sans text-ink/50 text-sm mb-3">
              {ex.venue}{ex.city ? `, ${ex.city}` : ''}
            </p>
            {ex.description && (
              <p
                className="font-sans text-ink/60 font-light"
                style={{ fontSize: 'clamp(0.875rem, 1.2vw, 0.9375rem)', lineHeight: 1.75 }}
              >
                {ex.description}
              </p>
            )}
            {ex.externalUrl && (
              <a
                href={ex.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-ink/50 text-xs font-sans tracking-widest uppercase hover:text-ink transition-colors duration-200"
              >
                More information →
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
