# Session Log — 2026-08-30

**File created:** 2026-08-30 03:40 CEST

Record of everything shipped to production during this session, and what's still open. Companion to `docs/ZLATICART_FRONTEND_AUDIT.md` and `docs/ZLATICART_REMEDIATION_PLAN.md` (the SEO work below is Phase 0/1 of that plan).

---

## Shipped to production tonight (all live on `main` / `www.zlaticart.com`)

In order, each as its own isolated, verified commit:

1. **`1bf7832` — SEO/technical baseline (Phase 0/1 of the remediation plan)**
   - Committed `src/app/robots.ts` and `src/app/sitemap.ts` — both were correctly written but had never been deployed; production was 404ing on `/robots.txt` and `/sitemap.xml`.
   - Committed the `next.config.ts` security headers block (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) — same reason, written but undeployed.
   - Fixed the `SITE_URL` fallback in `layout.tsx`/`robots.ts`/`sitemap.ts`: production's `NEXT_PUBLIC_SITE_URL` env var was set to an **empty string**, which `??` doesn't fall back on. Switched to `||` and corrected the default domain to `https://www.zlaticart.com`.
   - Gave the homepage exactly one `<h1>` (the hero wordmark "Zlatica"; it previously had none).
   - Added homepage JSON-LD (`Person` + `WebSite` via `@graph`), built only from already-configured content — no invented facts.
   - Added canonical to homepage and `/works/[slug]`.
   - **Also fixed directly in Vercel**: `NEXT_PUBLIC_SITE_URL` production env var, explicitly set to `https://www.zlaticart.com` (was empty).

2. **`afcea97` — docs**: `docs/ZLATICART_FRONTEND_AUDIT.md` (full audit) and `docs/ZLATICART_REMEDIATION_PLAN.md` (phased plan) added.

3. **`07a8b46` — fix: fourth Studio-section image**
   - The Studio section's 4-image grid had a fourth entry pointing at `zlatica-portrait.webp` — a file that never actually existed in the repo (confirmed 404/400 in production). Replaced with a real photo (user-supplied, converted to WebP, resized to match sibling assets: `public/assets/artist-archive/zlatica-archive-05.webp`).

4. **`f59dfac` — fix: mobile navigation menu links invisible on real Safari/iOS (P0)**
   - Root cause: `PageTransition.tsx`'s page-wrapper div had `will-change: transform` and GSAP-animated a `y` translate on route change. Per the CSS spec, that makes the wrapper a new *containing block* for any `position: fixed` descendant — and since it wraps the whole page (including the nav's fixed header and mobile-menu overlay), every fixed nav element stopped positioning relative to the viewport and instead positioned relative to the page-tall wrapper. WebKit enforces this far more strictly than Chromium, which is why it only reproduced on real Safari/iOS.
   - Fix: made the page-transition fade opacity-only (dropped the `y` slide-up). Verified with Playwright's real WebKit engine at 375×812, 390×844, 393×852, 430×932 — reverting the fix reproduces the bug identically (links positioned ~3200–3800px down the page); restoring it fixes all four.

5. **`34ab36b` — feat: wet-oil glass scroll effect on the hero**
   - Scroll-driven fragment-shader effect: a soft "glass pane" sweeps across the hero artwork as the user scrolls past it — directional pigment drag, tiny optical refraction, narrow specular highlight, warm wet-oil tint. Reuses the existing WebGL hero architecture (`HeroGL.tsx` + `brushShader.ts`) — no new canvas, no new render loop, no React state (scroll progress tracked via a ref-driven `ScrollTrigger`, same non-hijacking pattern as the existing wrapper-scale trigger).
   - Two real bugs found and fixed mid-implementation: (a) the effect's scroll range originally spanned the hero's full height, but the hero isn't pinned — by the time the "strongest" stage arrived the hero had already scrolled mostly off-screen; rescoped to `end: '70% top'`. (b) the initial mask was too wide (covered ~20–55% of the frame even at the edges), reading as an ambient wash rather than a localized sweep; narrowed and re-tuned per explicit priority order (drag → displacement → refraction → highlight → mask), confirmed via a quantitative pixel-diff analysis that the tuned version has genuine spatial locality.
   - Verified via real Playwright Chromium *and* WebKit at 1440×900, 375×812, 390×844, 430×932: shader compiles, no black canvas, zero page errors, zero new console warnings, exactly one `<h1>`, nav unaffected, native scroll (no pin/hijack), reduced-motion fully disables it, hero still ~60% visible at peak effect strength.

---

## Confirmed-safe branch/deploy provenance (established mid-session, still true)

`main` is the legitimate canonical branch — `merge-base` shows `feat/zlaticart-rebirth`'s tip is a strict ancestor of `main` with zero divergent history; the `feat/zlaticart-rebirth` ref on origin is just a stale pointer left behind after work continued directly on `main`. Production has been deploying from `main` throughout.

---

## What's still open

### Deliberately left alone — needs an owner decision, not more coding tonight

There is a pre-existing, **uncommitted** pile in the working tree, present since before this session started (see `TODO_OWNER.md`, gitignored/local-only) and explicitly kept out of every commit tonight:

- `package.json` / `package-lock.json` (adds `@supabase/ssr`, `@supabase/supabase-js`)
- `src/lib/supabase/`, `supabase/` (Supabase-backed contact form — **migrations not confirmed applied to the live database**)
- `src/app/(site)/contact/page.tsx`, `ContactPageContent.tsx`, `actions.ts`, `src/components/ContactForm.tsx`
- All 7 `sanity/schemas/*.ts` files (modified, unreviewed this session)
- `src/components/sections/TheArtist.tsx` (modified, unreviewed this session)

None of this has been reviewed, verified, or committed. It needs its own pass: confirm the Supabase migrations are actually live before shipping the new contact form, review the Sanity schema diffs, decide commit-or-discard.

### From `docs/ZLATICART_REMEDIATION_PLAN.md` — Phases 2–6, not started

- Canonical tags on the remaining static routes (`/about`, `/education`, `/exhibitions`, `/studio`, `/journal`, `/contact` still lack their own — only `/` and `/works/[slug]` have one)
- i18n crawlability (the sr/en toggle is client-only, invisible to search engines/AI crawlers, no separate URL)
- `Article`/`BlogPosting` JSON-LD for `/journal/[slug]`
- Real Lighthouse/Core Web Vitals measurement (still never done — everything performance-related has been verified via build tooling and screenshots, not real device metrics)
- `LivingCanvas.tsx` — confirmed dead code (460 lines, unused hero implementation), not deleted
- Duplicated GSAP parallax logic across 4 components instead of reusing `ParallaxImage.tsx`, not refactored

### New, found tonight

- **A pre-existing horizontal-banding rendering artifact on the hero**, confirmed via `git stash` A/B testing to predate this session entirely and unrelated to any change made tonight. Explicitly out of scope per instruction during the glass-effect work. Worth its own investigation — it's the dominant visual competing with the new glass effect's subtlety, so fixing it first would likely make the glass effect read more strongly without touching its tuning again.
- Root Vercel env var hygiene: `NEXT_PUBLIC_SITE_URL` is now correct, but worth a periodic check that no other `NEXT_PUBLIC_*` var silently reverts to empty.

---

## Housekeeping done tonight

- `graphify-out/` refreshed to reflect tonight's changes (see below).
- This file.
