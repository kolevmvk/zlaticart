# ZlaticArt Rebirth — Status

> **2026-08-30 update (6):** The glass-drag smear from update 5 read as too weak/subtle ("mršavo") on deploy — strengthened it substantially: drag distance 0.1 → 0.26 (2.6×) with per-pixel thickness-based variation (a coarse noise field so some passages drag further than others, reading as uneven wet paint rather than a flat filter), tap count 6 → 12 so the now-much-longer streak stays smooth instead of banding, wobble widened slightly. Same color-faithful, no-tint, monotonic-with-scroll model as update 5 — this is a magnitude tune, not a concept change. Verified via Playwright the drag now reads as an unmistakable, literal downward streak (screenshots through the pin show shapes visibly stretching/smearing down). Deployed to production.
>
> **2026-08-30 update (5):** Redesigned the scroll smear per art-direction feedback ("glass sweep" band read as unfaithful/gimmicky) into a "glass-drag" concept: imagine a perfectly transparent pane resting on the still-wet painting, pulled straight down as the user scrolls — the whole canvas streaks downward uniformly (not a traveling colored band anymore), color-faithful to the artwork (removed the per-channel chromatic-bleed sampling and the added warm tint entirely — the smear is now strictly the artwork's own pixels dragged along a mostly-vertical direction). `pigmentPullEnvelope()` is now monotonic (0→1, no fade-out) since the metaphor is cumulative drag depth, not a passing band; the now-unused `uScrollSmearProgress` uniform was removed. Deployed to production — see "Hero pigment pull" → "Glass-drag redesign" below.
>
> **2026-08-30 update (4):** Strengthened the oil-paint texture/impasto on the hero artwork so it reads as raised, tactile paint rather than a flat photo, and made the surface "alive": lighting now reacts to the cursor (desktop) plus a constant subtle idle drift (touch/no-input fallback), so paint thickness visibly catches and loses light like real oil under gallery light. New `uPointerTiltX`/`uPointerTiltY` uniforms, three-octave `paintRelief()` (was two), stronger diffuse/specular response, added a broader soft sheen term. No new effect/state — purely enriches the existing "initial brush reveal" relief shading (effect 1) — verified the scroll-smear (effect 2) is unchanged and layers correctly on top. Build/typecheck pass; verified desktop (cursor-reactive), mobile/touch, and reduced-motion (idle-drift-only, no jank). See "Hero pigment pull" → "Paint texture / 3D relief" below.
>
> **2026-08-30 update (3):** Audited the hero on `feat/animation-gallery-upgrade` to confirm the initial brush reveal and the scroll oil-smear are genuinely two independent effects, not one replacing the other. They were already functionally separate (separate uniforms, separate JS-side drivers) but the naming didn't make that obvious, so everything was renamed to `uInitialRevealProgress` / `uScrollSmearProgress` / `uPigmentPullStrength` (shader) and `initialRevealRef` / `scrollSmearProgressRef` / `pigmentPullEnvelope()` (JS), with explicit "two independent effects" doc comments added at both uniform declarations and the two driving `useEffect`s. Verified via Playwright: the reveal plays fully with `scrollY` pinned at 0 (proves it's independent of scroll), reduced-motion snaps straight to the fully-revealed static state, and the scroll smear band is still visible and unchanged after the rename. Build/typecheck pass. See "Animation & Gallery Upgrade" → "Hero pigment pull" below for the full breakdown.
>
> **2026-08-30 update (2):** Premium animation/gallery upgrade shipped on `feat/animation-gallery-upgrade` (branched off `main`, not merged yet — see "Animation & Gallery Upgrade" section below): hero scroll effect redesigned from a subtle "glass sweep" into an unmistakable oil-pigment pull (renamed uniforms/semantics, short controlled hero pin, chromatic bleed, bristle-fray edges), the desktop `MediaTransitions` strip is now a real pinned horizontal-scroll gallery with a progress rail and keyboard support, `SelectedWorks`' first card settles out of a blur/scale as a continuation of the hero, and nav/language-toggle touch targets + safe-area padding were fixed. Build/typecheck pass; see details below.
>
> **2026-08-30 update:** SEO/security baseline deployed (robots.txt, sitemap.xml, security headers, homepage h1/JSON-LD/canonical), a P0 mobile-nav bug fixed on real Safari/iOS, a missing Studio-section image fixed, and a scroll-driven wet-oil/glass hero effect shipped. Full detail in `docs/SESSION_LOG_2026-08-30.md`. Remaining SEO work tracked in `docs/ZLATICART_REMEDIATION_PLAN.md` (Phases 2–6). A pre-existing uncommitted pile (Supabase contact form, Sanity schema edits) is still sitting in the working tree, unreviewed — see the session log's "What's still open" section.

## Animation & Gallery Upgrade (2026-08-30, branch `feat/animation-gallery-upgrade`)

Implemented per `docs/CLAUDE_ANIMATION_GALLERY_PROMPT.md` / `docs/ZLATICART_ANIMATION_GALLERY_AUDIT.md`.

**Deploys:** update 1–4 (hero pigment-pull rename/texture, desktop gallery, hero-to-works handoff, responsive polish) merged `feat/animation-gallery-upgrade` → `main` via fast-forward and pushed live on 2026-08-30 (Vercel auto-deploy, confirmed via `vercel inspect` that `www.zlaticart.com` aliased to the new deployment, smoke-tested with Playwright against production). Update 5 (glass-drag redesign) shipped the same way, from `feat/glass-drag-smear` → `main`. Pre-existing unrelated uncommitted work (Supabase contact form, Sanity schema edits) was stashed before each branch switch and restored after, so it never touched either branch or production.

### Hero pigment pull (`src/lib/gl/brushShader.ts`, `src/components/hero/HeroGL.tsx`)

**Two independent effects — confirmed and re-audited 2026-08-30 (update 3).** These were already functionally separate in the shipped code (separate uniforms, separate JS drivers, never sharing a progress value); the audit's concern was that the naming made that hard to verify at a glance, so both were renamed and explicitly documented:

1. **Initial brush reveal** — `initialRevealRef` (JS) → `uInitialRevealProgress` (GLSL). One-shot, tweened 0→1 over 4.2s on hero mount, boostable by an early scroll/touch (a dedicated effect, unrelated to effect 2's ScrollTrigger), skipped entirely under reduced motion (jumps straight to `1`, static hero, no tween). Drives the shader's 7-stroke bristle reveal that uncovers the artwork from bare linen. **Does not require any scroll to play** — verified via Playwright with `scrollY` held at 0 throughout: the reveal still animates from blank canvas to fully painted hero.
2. **Scroll oil-smear** — `scrollSmearProgressRef` (JS, raw position of the traveling band) + `pigmentPullEnvelope()` → `uPigmentPullStrength` (JS-computed stage envelope; how strong the smear looks at that position). Only starts once the user scrolls the hero, via its own `ScrollTrigger` (pinned, ~62% of one viewport height on desktop, ~42% on mobile/touch) so the smear plays out fully on screen instead of racing past while the hero scrolls away. In the shader, this effect only ever modifies `artFinal`, which is blended in through the *initial reveal's* `rev` mask — so it can only ever smear paint effect (1) has already revealed, never bare linen, matching "razmazuje već otkrivene sveže uljane boje". Reduced motion: pin/ScrollTrigger skipped entirely, hero stays static and unpinned.

Both uniform declarations in `brushShader.ts` and both driving `useEffect`s in `HeroGL.tsx` now carry an explicit "two independent effects — do not conflate" doc comment naming which is which.

Shader/visual tuning (unchanged from the prior pass, carried over): wider band (0.2 → 0.34), stronger directional drag (0.016 → 0.09), per-channel chromatic-bleed taps (visible color fringing at the drag edge), bristle-fray on the band boundary (`rowBreak`), a brighter wet-edge rim, and warmer wet-oil tint — reads as pigment being dragged, not a lens/glass filter. Mobile gets its own tuning (0.85× strength, shorter pin), not just a weaker desktop copy.

**Verification (2026-08-30, update 3):**
- Playwright, no scroll input at all (`scrollY` confirmed 0 throughout): screenshots at 0.8s/2.8s/5s show the brush reveal progressing from near-blank canvas to fully painted artwork + wordmark — proves effect (1) is scroll-independent.
- Playwright with `reducedMotion: 'reduce'`: hero shows the fully-revealed artwork immediately (no animation), and never pins on scroll (`position` stays `relative`).
- Playwright scroll-step screenshots after the rename: the scroll-smear band (bright, chromatically-fringed sweep) is still visible mid-scroll, pixel-identical in character to before the rename — confirms the rename was a pure naming/documentation change, not a behavior change.
- `npm run typecheck` and `npm run build` both pass after the rename.

### Paint texture / 3D relief (2026-08-30, update 4)

Belongs entirely to effect (1)'s relief shading — no new uniform besides the pointer tilt, no new scroll/state coupling:

- `paintRelief()` now sums three FBM octaves (macro brush ridges, mid-scale strokes, fine canvas-tooth grain — was two) for texture that reads at both a glance and up close.
- Normal-map `z` lowered 0.08 → 0.06 (steeper apparent bump); diffuse contribution 0.55 → 0.85 and its color range widened; specular 0.12 → 0.16; added a second, broader "soft sheen" specular term (exponent 3.5 vs the tight highlight's 16) so glossy oil reads across the whole surface, not just as a pinpoint highlight.
- New `uPointerTiltX`/`uPointerTiltY` uniforms (JS: `pointerTiltRef`, fed by the existing rAF-lerped mouse-parallax effect — no new listener) tilt the shader's light direction with the cursor on desktop pointer devices, so paint thickness visibly catches/loses light as the viewer moves — the requested "as if alive" quality. On touch or reduced-motion, that JS effect never runs, so the ref stays `(0, 0)`.
- A small constant idle drift (`sin`/`cos` of `uTime`, gated by the same `breathe` flag as the existing post-reveal micro-warp) keeps the light gently in motion even with zero input, so the surface never looks perfectly static/flat even on touch devices. Same imperceptible-but-alive precedent as the pre-existing UV breathing warp, which was also nudged up slightly (0.0022/0.0018 → 0.0028/0.0024) to match.
- Deliberately did **not** add true parallax-mapped UV displacement (bump-driven pixel offset) — evaluated but skipped as unnecessary risk/complexity; lighting-only relief already reads convincingly as raised paint and is the established technique already in this shader.

**Verification (update 4):**
- Playwright: zero console/page errors on desktop, mobile/touch, and `reducedMotion: 'reduce'`.
- Screenshots with the cursor moved to opposite corners show the sheen/highlight pattern visibly shifting — confirms the pointer-reactive lighting works.
- Screenshot after a scroll-smear pass confirms the two effects still layer correctly (smear band + relief texture both visible together, no fighting).
- `npm run typecheck` and `npm run build` both pass.

### Glass-drag redesign (2026-08-30, update 5)

Direct art-direction feedback on the deployed effect: it read as a colored band sweeping across, not as faithful wet-paint drag, and the chromatic bleed/warm tint distorted the artwork's own colors. Redesigned effect (2) end to end, keeping effect (1)'s relief/texture work from update 4 untouched:

- **Old model:** a Gaussian band traveled left→right across the canvas (`boundaryX`/`bandDist`), diagonally dragging pigment with per-channel (R/G/B) sample offsets for chromatic bleed, plus an added warm-tint color. Strength followed a ramp-in/hold/fade-out envelope.
- **New model:** no traveling band at all. A single uniform, mostly-vertical drag is applied across the *entire* canvas at once — the "invisible glass pane pulled straight down over the still-wet painting" concept. Implementation: a 6-tap trailing streak sampling the artwork's own texture upstream along the drag direction (falling weight per tap, all three channels sampled together — no chromatic offset, no tint added). A small per-column FBM wobble keeps the drag from looking like a mechanical uniform blur.
- `pigmentPullEnvelope()` (`HeroGL.tsx`) simplified to a single monotonic `smootherstep(0→1)` — no fade-out — because the new metaphor is cumulative drag depth ("however far you've scrolled, that's how far the glass has dragged the paint"), not a band passing through and disappearing.
- The now-unused `uScrollSmearProgress` uniform was removed from both the shader and its JS upload/location code (the shader no longer needs the raw scroll position, only the eased strength). `scrollSmearProgressRef` stays — it's still the JS-side input to `pigmentPullEnvelope()`.
- The old band's "wet edge" highlight (which depended on the removed `bandDist`) was replaced with a small, near-white "wet-drag sheen" that scales with overall smear strength — a lighting cue, not a color tint, so it doesn't compromise fidelity to the artwork's own colors.

**Verification (update 5):**
- Playwright scroll-step screenshots (6 steps through the pin) show the smear building up smoothly and cumulatively — no band, no rainbow fringing, colors stay faithful to the source artwork.
- Zero console/page errors on desktop, mobile/touch, and `reducedMotion: 'reduce'` (hero still never pins under reduced motion).
- `npm run typecheck` and `npm run build` both pass.
- Merged to `main` (fast-forward) and deployed to production via the same safe flow as update 2 — see "Deploys" below.

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
