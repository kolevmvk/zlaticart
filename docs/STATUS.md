# ZlaticArt Rebirth — Status

## DONE

### Foundation
- Isolated redesign on `feat/zlaticart-rebirth`
- Legacy boundary: old `index.html` has zero influence
- Product spec, hero spec, implementation plan, content/CMS model
- Scaffolded Next.js 15.5 + TypeScript + Tailwind CSS v3 + GSAP 3
- Cormorant Garamond (serif) + DM Sans (sans) editorial typography
- Design tokens: `--color-ink: #0A0A09`, `--color-canvas: #F0EDE6` etc.
- Film grain overlay (CSS body::after) — paused on hidden tab via GrainPauser
- Custom cursor (GSAP quickTo, dot + ring, exclusion blend)
- Lenis smooth scroll synced with GSAP ticker

### Content Layer
- `src/lib/content/types.ts` — all domain types incl. EducationItem
- `src/lib/content/seed.ts` — seed data with placeholder exhibitions and education items
- `src/lib/content/api.ts` — content API layer, falls back to seed when no Sanity project ID
- `src/lib/social/` — Instagram-first provider abstraction + CMS/empty fallback

### Sanity CMS
- `sanity/schemas/` — 8 schemas: artwork, medium, journalPost, artistProfile, exhibition, educationItem, siteSettings, socialItem
- `src/lib/sanity/client.ts` + `queries.ts` — GROQ queries for all content types
- Embedded Sanity Studio on `/admin` (force-dynamic)

### Navigation & Structure
- Navigation — desktop + mobile menu: Works | Journal | About | Education | Exhibitions | Contact
- SiteFooter — all 7 nav links including Education + Exhibitions
- Pages: `/`, `/works`, `/works/[slug]`, `/journal`, `/journal/[slug]`, `/about`, `/education`, `/exhibitions`, `/studio`, `/contact`

### Hero
- Living Canvas hero — WebGL GLSL brush/pigment reveal, 7-stroke sequence, warm glow at leading edge
- GLSL micro-warp "živi pigment" — post-reveal sinusoidal displacement ±0.12%
- Scroll/touch boost, reduced-motion fallback (static image)
- Scroll handoff: canvas scales 1.0→0.96 as hero exits viewport (cinematic framing)
- Hero wordmark: per-character GSAP timeline (ZLATICA + Art + subtitle + CTA)

### Motion System
- KineticHeading: per-char reveal (aria-label ✓, aria-hidden ✓, SSR-safe opacity:0 ✓, scoped cleanup ✓)
- ParallaxImage: reusable GSAP ScrollTrigger scrub ±12% yPercent
- ArtworkCard: hover scale 1.04x + medium overlay sliding from bottom

### Sections (home)
- SelectedWorks: editorial asymmetric grid, KineticHeading, connection label to hero
- MediaTransitions: horizontal strip per medium, GSAP parallax, KineticHeading "Across Media"
- TheArtist: scale reveal + parallax portrait, text stagger, KineticHeading standalone (no wrapper conflict)
- JournalHighlights: GSAP parallax on lead image, KineticHeading "Journal", stagger entrance on secondary posts
- ArtEducationPreview: KineticHeading "Teaching as a Form of Practice"
- ExhibitionsPreview: KineticHeading "Exhibitions", valid border-ink/[0.08]
- StudioPreview: KineticHeading "The Atelier", scale+opacity stagger (no clip-path wipe), 4 unique images

### Pages
- `/education`: KineticHeading h1 "Teaching as Practice"
- `/exhibitions`: KineticHeading h1 "Exhibition History"
- `/works/[slug]`: editorial two-column layout (desktop), scale+opacity reveal (no clip-path)
- `/works/[slug]`: Open Graph image metadata ✓
- `/journal/[slug]`: Open Graph image metadata ✓

### Cinematic motion skill
- Created at `~/.claude/commands/cinematic-motion.md` — reusable, not project-specific

### Build health
- `npm run build` PASSES — 22 static/SSG pages, zero TypeScript errors, zero ESLint errors
- All aria fixes applied, SSR flash fixed, scoped GSAP cleanup

---

## IN PROGRESS

- Agent: hero scroll handoff + section continuity (SelectedWorks connecting label, JournalHighlights)
- Agent: artwork detail two-column editorial layout improvement
- Visual QA at phone/tablet/desktop widths (run `npm run dev`)

---

## BLOCKED / NEEDS OWNER INPUT

Not implementation blockers — explicit placeholders in place:

- **Final artwork titles, years, dimensions** → update via Sanity CMS `/admin` after deploy
- **Instagram URL** → Sanity siteSettings
- **Facebook URL** → Sanity siteSettings
- **Contact email** → Sanity siteSettings
- **Final artist biography + statement** → seed shortBio is placeholder
- **Verified exhibition history** → 2 placeholder exhibitions; real data goes in Sanity
- **Sanity project ID** → create at sanity.io, add `NEXT_PUBLIC_SANITY_PROJECT_ID` to `.env.local`
- **Meta/Instagram API credentials** → provider boundary ready, fallback active

---

## TO DEPLOY

1. Create Sanity project at sanity.io → get projectId
2. Create `.env.local`:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_READ_TOKEN=your_read_token
   NEXT_PUBLIC_SITE_URL=https://zlaticart.com
   ```
3. Deploy to Vercel — `npm run build` passes locally
4. Open `/admin` to populate real content
5. Supply verified URLs (Instagram, Facebook, email) via Site Settings in Sanity Studio
