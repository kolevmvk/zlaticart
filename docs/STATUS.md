# ZlaticArt Rebirth — Status

> **2026-08-30 update (2):** Premium animation/gallery upgrade shipped on `feat/animation-gallery-upgrade` (branched off `main`, not merged yet — see "Animation & Gallery Upgrade" section below): hero scroll effect redesigned from a subtle "glass sweep" into an unmistakable oil-pigment pull (renamed uniforms/semantics, short controlled hero pin, chromatic bleed, bristle-fray edges), the desktop `MediaTransitions` strip is now a real pinned horizontal-scroll gallery with a progress rail and keyboard support, `SelectedWorks`' first card settles out of a blur/scale as a continuation of the hero, and nav/language-toggle touch targets + safe-area padding were fixed. Build/typecheck pass; see details below.
>
> **2026-08-30 update:** SEO/security baseline deployed (robots.txt, sitemap.xml, security headers, homepage h1/JSON-LD/canonical), a P0 mobile-nav bug fixed on real Safari/iOS, a missing Studio-section image fixed, and a scroll-driven wet-oil/glass hero effect shipped. Full detail in `docs/SESSION_LOG_2026-08-30.md`. Remaining SEO work tracked in `docs/ZLATICART_REMEDIATION_PLAN.md` (Phases 2–6). A pre-existing uncommitted pile (Supabase contact form, Sanity schema edits) is still sitting in the working tree, unreviewed — see the session log's "What's still open" section.

## Animation & Gallery Upgrade (2026-08-30, branch `feat/animation-gallery-upgrade`)

Implemented per `docs/CLAUDE_ANIMATION_GALLERY_PROMPT.md` / `docs/ZLATICART_ANIMATION_GALLERY_AUDIT.md`. Not merged to `main` — review first.

### Hero pigment pull (`src/lib/gl/brushShader.ts`, `src/components/hero/HeroGL.tsx`)
- Renamed the scroll effect from "glass sweep" to pigment-pull semantics: `uGlassStrength` → `uPigmentPull`, `glassEnvelope()` → `pigmentEnvelope()`, `glassScrollRef`/`glassDeviceScaleRef` → `pigmentScrollRef`/`pigmentDeviceScaleRef`.
- Shader: wider band (0.2 → 0.34), stronger directional drag (0.016 → 0.09), per-channel chromatic-bleed taps (visible color fringing at the drag edge), bristle-fray on the band boundary (`rowBreak`), a brighter wet-edge rim, and warmer wet-oil tint. Reads as pigment being dragged, not a lens/glass filter.
- The hero is now briefly pinned (`ScrollTrigger.create({ pin: true, ... })`, ~62% of one viewport height on desktop, ~42% on mobile/touch) so the pull plays out fully on screen instead of racing past while the hero scrolls away — the prior failure mode the audit flagged. Merged the old two separate ScrollTriggers (wrapper scale/opacity + glass progress) into one, driven off a single pin's progress; the wrapper "framing" scale/opacity now only kicks in during the pin's final 28%, after the pigment pull has peaked.
- Envelope re-tuned so the effect starts ramping immediately (not gated behind 15% dead scroll) and holds near-full strength through most of the pin.
- Mobile: own tuning, not just weaker — 0.85× strength (was 0.5×) with a shorter pin distance.
- Reduced motion unaffected: pin/ScrollTrigger skipped entirely, hero stays static and unpinned.
- Verified via Playwright screenshots mid-pin: a clear warm, chromatically-fringed band sweeps across the canvas; confirmed hero pins (`position: fixed`) for the expected scroll span and releases cleanly back to `relative`.

### Desktop horizontal gallery (`src/components/sections/MediaTransitions.tsx`)
- Rewritten with `gsap.matchMedia()`: desktop/tablet (`min-width: 768px`) pins the section and maps vertical scroll to horizontal strip translation (`ScrollTrigger` with `pin: true`, distance = strip scrollWidth − viewport width); mobile keeps the original native `overflow-x-auto` + scroll-snap untouched.
- Added a progress rail + index ("01 / 05") next to the section heading, desktop-only, driven off the same scroll progress.
- Keyboard: focusing a card (`onFocus`) now scrolls the pinned trigger to bring that card into view, so tabbing never lands on a transformed-offscreen card.
- Fixed a real a11y bug found while testing: `focus-visible:outline-none` had no replacement — added a visible focus ring. Also made the medium-label overlay visible on touch/focus, not hover-only (matches `ArtworkCard`'s existing pattern).
- Confirmed via Playwright: no horizontal `document.documentElement` overflow at 375/768/1440, cards visibly translate left as the section pins, pin releases cleanly into the next section.

### Hero-to-Selected-Works handoff (`src/components/works/SelectedWorks.tsx`, `src/components/works/ArtworkCard.tsx`)
- The first work (`data-work-card="hero"`, desktop and mobile) now animates in from a blur+overscale (`scale 1.06 → 1`, `blur(12px) → 0`, opacity), scrubbed to its own scroll position — a visual continuation of the hero canvas settling into focus. Its caption (`data-work-meta`, added to `ArtworkCard`) fades in afterward like a museum label.
- Secondary cards (`data-work-card="secondary"`) now get varied per-index offsets/delays instead of the previous single uniform section-level rise — "cards do not all animate identically."
- All of this is layered on top of the existing gallery-rise scroll trigger, not a replacement; reduced-motion still short-circuits the whole effect block.

### Responsive/touch polish
- `.nav-link` (globals.css) and `LanguageToggle` now have a real ≥44px tap target (`min-height`/`min-width` + `inline-flex items-center`) without growing the visible text.
- Hamburger and mobile-menu close buttons resized to 44×44px hit areas.
- Fixed a real keyboard-trap bug found while testing: the closed mobile-menu overlay had `aria-hidden` but no `inert`, so its links/close button were still reachable by Tab even while invisible — a user tabbing from the header used to land in the hidden menu before ever reaching page content. Added `inert={!menuOpen}` (React 19 native support). Verified via Playwright: Tab order now goes header → hero CTA → gallery cards, no dead stops in the hidden menu.
- Added `env(safe-area-inset-top)`/`env(safe-area-inset-bottom)` padding to the header and mobile-menu overlay for notched devices (`viewport-fit=cover` was already set but nothing consumed the inset).

### Verification performed
- `npm run typecheck` — passes.
- `npm run build` — passes (22 routes, no errors).
- Playwright checks (chromium) at 375/768/1440 widths: no console/page errors, no `document.documentElement` horizontal overflow.
- Manual scroll-step screenshots confirmed the pigment-pull band, the hero pin engaging/releasing, the media-strip horizontal translation + progress rail, and the Selected-Works hero-card settle.
- `prefers-reduced-motion: reduce` verified via Playwright's `reducedMotion: 'reduce'` context: hero never pins (`position: relative` throughout).
- Keyboard tab-through verified via Playwright: reaches every `MediaTransitions` card with correct `aria-label`s once the mobile-menu inert fix was applied.
- Not separately re-verified: Lighthouse/perf numbers, real iOS/Android Safari touch behavior (only Playwright's touch/mobile emulation was used), tablet-specific (768–1024) composition beyond the breakpoint check.

### Remaining follow-ups
- `gsap.matchMedia` in `MediaTransitions` recomputes on resize (idiomatic GSAP responsive pattern) but hasn't been manually tested resizing live across the 768px boundary in a real browser, only via fixed-viewport Playwright pages.
- No custom pointer-drag/inertia was added to the desktop gallery beyond the scroll-driven pin (the audit listed this as "where practical"); wheel/scroll-driven horizontal movement was judged sufficient for the acceptance criteria.
- `LivingCanvas.tsx` remains unused, as before — not touched.

---

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

### Instagram/Facebook self-service connection
- `sanity/schemas/siteSettings.ts` — grouped "Instagram i Facebook" fields: profile URLs (unchanged) + `instagramConnectionStatus` / `facebookConnectionStatus` (manual / pending / connected)
- `sanity/components/SocialConnectionGuide.tsx` — read-only in-Studio guide (Serbian, no dev jargon) walking Zlatica through switching to an Instagram Professional/Business account and linking a Facebook Page
- `docs/ADMIN_GUIDE_SR.md` — matching plain-language section: what to do, when to loop in the developer, when nothing breaks in the meantime
- `src/lib/social/provider.ts` — feed function unchanged in shape; commented hook shows exactly where to wire `META_ACCESS_TOKEN` once she reports "connected" — no other code needs to change when that day comes

### Admin panel isolation from site chrome
- Site pages moved into `src/app/(site)/` route group with their own layout carrying CustomCursor, SmoothScroll, PageTransition, GrainPauser — `/admin` (Sanity Studio) sits outside it, on the slimmed-down root layout
- Fixes: Studio previously inherited `cursor: none` on every element (from the site's custom cursor) and an animated film-grain overlay across the whole viewport, making the CMS hard to use
- Verified in a real headless browser: `/` still has custom cursor + grain active, `/admin` has native cursor and no grain

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
