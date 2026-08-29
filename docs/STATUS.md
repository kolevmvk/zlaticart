# ZlaticArt Rebirth — Status

## DONE
- isolated redesign on `feat/zlaticart-rebirth`
- defined legacy boundary: old `index.html` must not influence new architecture/design
- added product specification, hero spec, implementation plan, content/CMS model
- added Claude Code subagents, Living Canvas project skill, `/execute-rebirth` command
- moved legacy `index.html` + `img/` to `_legacy/` (preserved, not deleted)
- organized seed artwork assets into `public/assets/works/{oil,acrylic,watercolor,graphics,mosaic}/`
- scaffolded clean Next.js 15.5 + TypeScript + Tailwind CSS v3 + GSAP 3
- Cormorant Garamond (serif) + DM Sans (sans) editorial typography via next/font
- design tokens: `--color-ink: #0A0A09`, `--color-canvas: #F0EDE6` etc.
- `src/lib/content/types.ts` — domain types (Artwork, JournalPost, ArtistProfile, etc.)
- `src/lib/content/seed.ts` — seed data layer with convenience accessors (placeholder content, no fabricated facts)
- `src/lib/social/types.ts` + `src/lib/social/provider.ts` — Instagram-first provider abstraction + CMS/empty fallback
- Navigation (desktop + mobile menu/overlay)
- SiteFooter
- LivingCanvas hero — Canvas2D brush/pigment reveal, 5-stroke sequence (desktop) / 6-stroke portrait (mobile), reduced-motion fallback, scroll/touch boost to accelerate
- SelectedWorks — GSAP ScrollTrigger entrance, editorial asymmetric layout desktop + vertical stack mobile
- ArtworkCard — hover scale, gallery metadata
- JournalHighlights — lead post + secondary posts editorial layout
- TheArtist — dark section, monochrome portrait, bio, identity line
- StudioPreview — Instagram placeholder with fallback state
- Home page composed of all sections
- `/works` — filter bar by medium, editorial grid
- `/works/[slug]` — large artwork presentation, metadata dl, prev/next navigation
- `/journal` — editorial list with category filter
- `/journal/[slug]` — article layout with cover image, body, related artworks
- `/about` — monochrome portrait at scale, biography, archive photograph sequence
- `/studio` — social feed via provider abstraction, empty/fallback state
- `/contact` — minimal social-first contact
- `npm run build` PASSES — 20 static/SSG pages, zero errors, zero type errors

## IN PROGRESS
- visual QA (run `npm run dev` and inspect at phone/tablet/desktop widths)
- hero motion refinement (run locally to tune brush timing and typography reveal)

## BLOCKED / NEEDS OWNER INPUT
These are NOT implementation blockers — explicit placeholders are in place:
- final high-resolution hero artwork (currently: `up2.jpg` 2009×2015)
- verified artwork titles, years, dimensions for all seed works
- verified Instagram profile URL (currently: `null` — placeholder config in `src/lib/content/seed.ts`)
- verified Facebook profile URL (currently: `null`)
- contact email address
- final artist biography and statement (seed shortBio is placeholder)
- verified exhibition history (exhibitions array is empty pending Zlatica input)
- Meta/Instagram API credentials (provider boundary ready; no credentials needed for fallback)
- Node.js >= 20.19.0 for Next.js 16+ (current: 20.18.2 — working fine on 15.5.24)

## NEXT
1. Run `npm run dev` locally — visual QA at 375/390/430px mobile, tablet, desktop
2. Tune hero brush timing, typography entrance, and scroll handoff
3. Wire up Sanity CMS schemas (Phase 4 in IMPLEMENTATION_PLAN)
4. Supply verified Instagram/Facebook URLs — update `SITE_SETTINGS` in seed.ts
5. Supply final artwork metadata — update seed.ts as verified
6. Supply artist biography and statement text
7. QA: prefers-reduced-motion, keyboard nav, horizontal overflow, image loading
