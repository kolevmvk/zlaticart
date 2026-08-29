interface StudioPreviewProps {
  instagramUrl: string | null
}

export default function StudioPreview({ instagramUrl }: StudioPreviewProps) {
  return (
    <section className="section-spacing bg-canvas" aria-labelledby="studio-heading">
      <div className="section-gutter text-center">
        <p className="text-label text-ink/40 mb-4" style={{ letterSpacing: '0.20em' }}>
          From the Studio
        </p>
        <h2
          id="studio-heading"
          className="font-serif font-light text-ink mb-6"
          style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)', letterSpacing: '0.05em' }}
        >
          On Instagram
        </h2>
        <p className="text-gallery-meta max-w-xs mx-auto mb-8 leading-relaxed">
          Follow Zlatica&apos;s studio practice — works in progress, new pieces, and moments from the atelier.
        </p>
        {instagramUrl ? (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-label text-ink hover:opacity-60 transition-opacity duration-200"
          >
            Follow on Instagram →
          </a>
        ) : (
          <span className="text-label text-ink/30 italic text-sm">
            Instagram link coming soon
          </span>
        )}
      </div>
    </section>
  )
}
