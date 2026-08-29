'use client'

import Link from 'next/link'
import KineticHeading from '@/components/ui/KineticHeading'
import { useLanguage } from '@/context/LanguageContext'
import type { Exhibition } from '@/lib/content/types'

interface ExhibitionsPreviewProps {
  exhibitions: Exhibition[]
}

function formatYear(dateStr: string): string {
  return new Date(dateStr).getFullYear().toString()
}

export default function ExhibitionsPreview({ exhibitions }: ExhibitionsPreviewProps) {
  const { t } = useLanguage()
  const visible = exhibitions.slice(0, 3)
  const hasContent = visible.length > 0

  return (
    <section
      className="bg-canvas section-spacing border-t border-ink/[0.08]"
      aria-labelledby="exhibitions-preview-heading"
    >
      <div className="section-gutter">
        <div className="flex items-baseline justify-between mb-12 md:mb-16">
          <KineticHeading
            as="h2"
            id="exhibitions-preview-heading"
            className="font-serif font-light text-ink"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)', letterSpacing: '0.05em' }}
          >
            {t.exhibitions.heading}
          </KineticHeading>
          <Link
            href="/exhibitions"
            className="text-label text-ink/40 hover:text-ink transition-colors duration-200 text-xs tracking-widest uppercase hidden md:block"
          >
            {t.exhibitions.viewAll}
          </Link>
        </div>

        {hasContent ? (
          <ul className="divide-y divide-ink/10">
            {visible.map((ex) => (
              <li
                key={ex.id}
                className="py-6 grid grid-cols-12 gap-4 items-baseline"
              >
                <div className="col-span-2 md:col-span-1">
                  <span className="font-sans text-ink/30 text-sm">
                    {formatYear(ex.startDate)}
                  </span>
                </div>
                <div className="col-span-8 md:col-span-9">
                  <p
                    className="font-serif font-light text-ink"
                    style={{ fontSize: 'clamp(1rem, 2vw, 1.375rem)', letterSpacing: '0.02em' }}
                  >
                    {ex.title}
                  </p>
                  <p className="font-sans text-ink/40 text-sm mt-0.5">
                    {ex.venue}{ex.city ? `, ${ex.city}` : ''}
                  </p>
                </div>
                <div className="col-span-2 text-right">
                  <span
                    className={`text-xs font-sans tracking-widest uppercase ${
                      ex.status === 'current'
                        ? 'text-ink/70'
                        : ex.status === 'upcoming'
                        ? 'text-ink'
                        : 'text-ink/25'
                    }`}
                  >
                    {ex.status === 'current'
                      ? t.exhibitions.current
                      : ex.status === 'upcoming'
                      ? t.exhibitions.upcoming
                      : t.exhibitions.past}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink/35 font-sans text-sm italic">
            {t.exhibitions.comingSoon}
          </p>
        )}

        <div className="mt-10 md:hidden">
          <Link
            href="/exhibitions"
            className="text-label text-ink/40 hover:text-ink transition-colors duration-200 text-xs tracking-widest uppercase"
          >
            {t.exhibitions.viewAll}
          </Link>
        </div>
      </div>
    </section>
  )
}
