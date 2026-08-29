# ZlaticArt Rebirth — Status

## DONE
- isolated redesign on `feat/zlaticart-rebirth`
- defined legacy boundary: old `index.html` must not influence new architecture/design
- added product specification, hero spec, implementation plan, content/CMS model
- scaffolded clean Next.js 15.5 + TypeScript + Tailwind CSS v3 + GSAP 3
- Cormorant Garamond (serif) + DM Sans (sans) editorial typography
- design tokens: `--color-ink: #0A0A09`, `--color-canvas: #F0EDE6` etc.
- `src/lib/content/types.ts` — domain types incl. EducationItem
- `src/lib/content/seed.ts` — seed data with placeholder exhibitions and education items
- `src/lib/content/api.ts` — content API layer, falls back to seed when no Sanity project ID
- `src/lib/social/` — Instagram-first provider abstraction + CMS/empty fallback
- **Sanity CMS setup** — schemas: artwork, medium, journalPost, artistProfile, exhibition, educationItem, siteSettings, socialItem
- `src/lib/sanity/client.ts` + `queries.ts` — GROQ queries for all content types
- Embedded Sanity Studio on `/admin`
- Navigation — desktop + mobile menu (now includes Education + Exhibitions)
- SiteFooter
- **Living Canvas hero** — WebGL GLSL brush/pigment reveal, 7-stroke sequence, warm glow at leading edge, scroll/touch boost, reduced-motion fallback
- **Hero "živi pigment"** — post-reveal GLSL micro-warp: sinusoidal displacement ±0.12% makes artwork breathe after reveal completes
- **SelectedWorks** — editorial asymmetric layout desktop + vertical stack mobile, KineticHeading
- **ArtworkCard** — hover scale 1.04x + medium overlay sliding up from bottom (desktop)
- **MediaTransitions** — horizontal editorial strip per medium, GSAP parallax on each card, hover overlays
- **TheArtist** — dark section, scale reveal + GSAP parallax on portrait, text slides from left
- **JournalHighlights** — GSAP parallax on lead image, removed clip-path wipe
- **KineticHeading** — per-character reveal using GSAP translateY from clip overflow (power4.out, stagger 30ms)
- **ParallaxImage** — reusable GSAP ScrollTrigger scrub ±12% yPercent
- **ArtEducationPreview** — home preview linking to /education
- **ExhibitionsPreview** — home timeline rows with KineticHeading
- All pages: `/works`, `/works/[slug]`, `/journal`, `/journal/[slug]`, `/about`, `/studio`, `/contact`
- **NEW: `/education`** — Art & Education page, editorial layout with type labels
- **NEW: `/exhibitions`** — Exhibitions page, chronological timeline past/current/upcoming
- `npm run build` PASSES — 22 static/SSG pages, zero TypeScript errors

## IN PROGRESS
- Visual QA at phone/tablet/desktop widths (run `npm run dev`)
- Art direction review: hero typography timing, scroll handoff feel

## BLOCKED / NEEDS OWNER INPUT
Not implementation blockers — explicit placeholders in place:

- **Final artwork titles, years, dimensions** — update via Sanity CMS `/admin` after deploy
- **Verified Instagram URL** — currently `null` in seed.ts → update via Sanity siteSettings
- **Verified Facebook URL** — currently `null`
- **Contact email address** — currently `null`
- **Final artist biography + statement** — seed shortBio is placeholder
- **Verified exhibition history** — 2 placeholder exhibitions in seed; real data goes in Sanity
- **Sanity project ID** — add to `.env.local` after creating project at sanity.io
- **Meta/Instagram API credentials** — provider boundary ready, no credentials needed for fallback

## TO DEPLOY
1. Create Sanity project at sanity.io → get projectId
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_READ_TOKEN=your_read_token
   ```
3. Deploy to Vercel — `npm run build` already passes
4. Open `/admin` to populate real content
5. Supply verified URLs (Instagram, Facebook, email) via Site Settings in Sanity Studio
