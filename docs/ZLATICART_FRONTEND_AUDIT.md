# ZlaticArt — Frontend / UX / SEO / AI-Discoverability Audit

**Date:** 2026-08-30
**Scope:** Live production site `https://www.zlaticart.com` (HTTP-level + rendered HTML inspection) cross-referenced against the local repository at `/Volumes/KoleOPS/zlaticart` (commit `ce95def`, branch as checked out, plus uncommitted working-tree changes).
**Method note:** This pass was done via `curl`-level HTTP/HTML inspection and full source reading (no headless browser / Lighthouse / real-device runtime available in this session). Every finding below is either a) reproducible from an HTTP response, b) visible in rendered HTML, or c) grounded in an actual file/line in the repo. Where a claim would require live browser rendering (paint timing, real CLS/INP numbers, cross-viewport screenshots), it is explicitly marked **NOT VERIFIED — needs browser session** rather than guessed.

---

## 0. Critical process finding (explains several SEO defects below)

The production deploy is running off commit `ce95def`. `git status` on the local repo shows a large **uncommitted** working-tree pile that has never been deployed:

```
?? src/app/robots.ts
?? src/app/sitemap.ts
?? src/components/ContactForm.tsx
?? src/app/(site)/contact/ContactPageContent.tsx
?? src/app/(site)/contact/actions.ts
?? src/lib/supabase/
?? supabase/
 M next.config.ts
 M package.json / package-lock.json
 M sanity/schemas/*.ts (7 files)
 M src/app/(site)/contact/page.tsx
 M src/components/providers/PageTransition.tsx
 M src/components/sections/StudioPreview.tsx
 M src/components/sections/TheArtist.tsx
```

This is the direct root cause of the two most severe findings in this report (§7, missing `robots.txt`/`sitemap.xml`) and of a production/local drift that makes several "does the live site have X" questions actually mean "was X ever committed and pushed." `TODO_OWNER.md` already flags this pile but has not yet been resolved as of the audit date.

**Practical implication for this whole audit:** some defects below (e.g. missing security headers) may already be *fixed in local source* but simply not deployed. The fix in those cases is "commit + deploy," not "write new code."

---

## 1. Responsiveness audit

**NOT VERIFIED — needs browser session.** No headless browser or device emulator was available in this pass, so per-viewport visual QA (320–1920px) as requested in the brief was not performed against the live site. What *can* be said from source:

- Typography across headings consistently uses fluid `clamp()` sizing (e.g. `font-size:clamp(1.5rem, 3.5vw, 2.75rem)` on every section `<h2>`, `clamp(2.5rem, 7vw, 6rem)` on the contact `<h1>`). This is the correct technique for avoiding the "desktop type just shrunk" failure mode the brief calls out — **design intent, likely correct**, but untested at 320–430px where `7vw` on a long word could still overflow depending on font metrics.
- `next/image` `sizes` attributes are viewport-aware and change at the `768px` breakpoint (`(max-width: 768px) 100vw, 60vw` etc.), i.e. genuinely different image behavior per breakpoint, not just CSS scaling.
- Root `viewport` meta includes `viewport-fit=cover` ([layout.tsx:39-44](../src/app/layout.tsx#L39-L44)) — correct for notch/safe-area handling on iPhone, but there is no accompanying `env(safe-area-inset-*)` usage found in `globals.css` — **needs a repo-wide grep + visual check on a notched device** to confirm fixed nav/CTA bars aren't sitting under the notch or home-indicator.

**Recommendation:** run an actual Playwright/Lighthouse pass (or Claude with browser tooling) at the ten specified breakpoints before trusting this section further; this audit cannot responsibly score responsiveness without it.

---

## 2–3. Visual clarity, UX, first-3-seconds

**Partially verified via rendered HTML + component reads.**

### Confirmed: homepage has zero `<h1>` elements

`curl` of `https://www.zlaticart.com/` and grep for `<h1` returns **nothing**. Every homepage section heading is an `<h2>` (`SelectedWorks`, `MediaTransitions`/media, `TheArtist`, `ArtEducationPreview`, `JournalHighlights`, `ExhibitionsPreview`, `StudioPreview` — 7 confirmed `<h2>`s, [src/app/(site)/page.tsx](../src/app/(site)/page.tsx)). By contrast `/contact` **does** render a proper `<h1>` (`clamp(2.5rem, 7vw, 6rem)`), and `docs/STATUS.md` confirms `/education` and `/exhibitions` were deliberately given `KineticHeading h1` treatment.

This means the single most important page on the site — the one a visitor from Instagram actually lands on — has no top-level heading at all. That is a real defect, not a stylistic choice: it flattens the semantic hierarchy for screen readers, Google, and every AI answer engine reading the DOM, on exactly the page where "who is this and what do they do" needs to be unambiguous.

### Hero has two competing implementations

`src/app/(site)/page.tsx` imports only `HeroGL` ([page.tsx:1](../src/app/(site)/page.tsx#L1)) — a raw-WebGL shader hero (673 lines, [HeroGL.tsx](../src/components/hero/HeroGL.tsx)). `LivingCanvas.tsx` (460 lines, a Canvas2D bezier-brush simulation) exists alongside it but is **imported nowhere** in any `.tsx` file in `src/` — confirmed by repo-wide grep. This is dead code: a full second hero implementation, including its own reduced-motion handling, mouse tracking, and animation loop, that ships in the repo (and, unless tree-shaken, in the bundle) but never renders. `TODO_OWNER.md` already flagged this as an open question ("confirm one isn't dead code") — this audit confirms it: `LivingCanvas` is dead.

### Reduced-motion coverage is genuinely good

Eleven separate components independently check `window.matchMedia('(prefers-reduced-motion: reduce)')` (`Navigation`, `SmoothScroll`, `PageTransition`, `KineticHeading`, `RevealHeading`, `ParallaxImage`, `MarqueeTicker`, `SelectedWorks`, `MediaTransitions`, `TheArtist`, `StudioPreview`, `JournalHighlights`, `ArtworkDetailView`, plus both hero implementations) and `globals.css` has two dedicated `@media (prefers-reduced-motion: reduce)` blocks. This is **design intent executed well** — flag it as a strength, not a defect. The only architectural smell is that the check is duplicated ad hoc in every file instead of one shared hook (see §5), which is a maintainability risk (one file drifting out of sync silently breaks the accessibility guarantee for that section) rather than a user-facing bug today.

### First-3-seconds / journey / animation runtime

**NOT VERIFIED — needs browser session.** Judging hero timing, cinematic feel, scroll-jank, and mobile GPU load requires actually running the page. What's confirmed from source: the hero (`HeroGL.tsx`) does GPU work via raw WebGL (not React Three Fiber, matching `CLAUDE.md`'s stack preference), has its own reduced-motion path (lines 309, 464, 501), and syncs to GSAP `ScrollTrigger`. Whether the "7-stroke sequence" (per `STATUS.md`) actually reads as cinematic on a mid-range Android phone cannot be assessed without a device or emulator.

---

## 4. Animation & motion architecture

- **Duplicated parallax logic.** `JournalHighlights.tsx`, `MediaTransitions.tsx`, `TheArtist.tsx`, and `StudioPreview.tsx` each hand-roll their own GSAP `ScrollTrigger` parallax + reduced-motion guard instead of using the already-existing, purpose-built `ParallaxImage.tsx` component (confirmed via grep: all four files independently repeat the `window.matchMedia(...)` guard pattern that `ParallaxImage.tsx` already encapsulates at line 33). This is real duplication with a real cost: a future change to easing/scrub/reduced-motion behavior has to be made in five places, and it already isn't (four files diverge from the canonical component). `TODO_OWNER.md` flags this as a known smell from a prior `graphify` pass; this audit confirms it by direct read.
- **`will-change` / compositor-friendliness / scroll-handler throttling / IntersectionObserver counts:** **NOT VERIFIED** — would need either a targeted grep pass per-file (not done at this effort level) or DevTools Performance profiling. Flag as an open item for the next pass, not a confirmed defect.

---

## 5. Site / code structure

Architecture is sound and matches `CLAUDE.md`'s stated stack (Next.js 15 App Router, TypeScript, Tailwind, GSAP, Sanity, Lenis). Content is properly abstracted behind `src/lib/content/api.ts` with a seed-data fallback, so the "additional artworks / exhibitions / bio updates" extensibility question from the brief is already answered well — this is a CMS-backed architecture, not hardcoded HTML.

Confirmed issues:
1. **Dead code:** `LivingCanvas.tsx` (460 lines) — see §2–3.
2. **Duplicated animation logic** across 4 files instead of reusing `ParallaxImage.tsx` — see §4.
3. **Large uncommitted diff** sitting in the working tree, covering `next.config.ts`, all 7 Sanity schemas, `package.json`, and a full Supabase-backed contact form — see §0. Until this is resolved, "what does the live site actually run" and "what does the repo say" are two different questions, which is a real risk for anyone (including a future audit) reasoning about the codebase.
4. **Uncommitted contact form migration risk:** `TODO_OWNER.md` itself states the Supabase migrations backing the new contact form have not been confirmed as applied to the live database. If this form is deployed before that's verified, submissions could silently fail with no server-side signal. Not yet live (uncommitted), but flagged because it's the kind of thing that gets shipped by accident in a `git add -A`.

---

## 6. Performance

**NOT VERIFIED — needs Lighthouse/WebPageTest/browser session** for LCP/CLS/INP/TBT numbers. What is confirmed from the live HTML and `next.config.ts`:

- `next/image` is used correctly for the artwork imagery: AVIF/WebP formats configured ([next.config.ts:5](../next.config.ts#L5)), real responsive `srcSet` with 12 breakpoints from 320w–2560w, and `sizes` attributes that differ by breakpoint. This is correct, production-grade image handling — **design intent, working as intended**, not a defect.
- The first content image in the DOM (the first `SelectedWorks` card, `up2.jpg`) has **no `loading="lazy"` attribute** in the rendered HTML, meaning it's `priority`/eager — correct if this is the LCP candidate. Every subsequent work-card image *does* carry `loading="lazy"`. This is exactly the pattern the brief asks for ("do NOT lazy-load the primary LCP image") and it's already implemented correctly.
- Fonts: two Google fonts (Cormorant Garamond, DM Sans) loaded via `next/font/google` with `display: 'swap'` and `variable` CSS custom properties ([layout.tsx:5-18](../src/app/layout.tsx#L5-L18)) — this is the correct self-hosted-via-Next approach (no third-party font request at runtime, `swap` avoids FOIT). Good.
- **Missing production security headers.** `next.config.ts` (uncommitted) defines `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` via a `headers()` function ([next.config.ts:13-33](../next.config.ts#L13-L33)) — but live response headers for `https://www.zlaticart.com/` contain **none of these** (checked via `curl -D -`: only `accept-ranges`, `cache-control`, `strict-transport-security`, `vary`, `x-vercel-*`, etc. are present). Confirms §0: this file is uncommitted and not deployed. Not a code defect, a deploy-state defect.

---

## 7. Google SEO — technical

### Confirmed P0: `robots.txt` and `sitemap.xml` both 404 in production

```
curl -o /dev/null -w "%{http_code}" https://www.zlaticart.com/robots.txt   -> 404
curl -o /dev/null -w "%{http_code}" https://www.zlaticart.com/sitemap.xml  -> 404
```

Both requests return Next.js's custom 404 page (with `<meta name="robots" content="noindex">` in its own head, ironically). Root cause confirmed in §0: `src/app/robots.ts` and `src/app/sitemap.ts` exist locally, are correctly implemented (dynamic `MetadataRoute.Robots` / `MetadataRoute.Sitemap`, artwork + journal routes included, correct priorities), but are **untracked files that have never been committed or deployed**. Google Search Console has no sitemap to discover pages from, and crawlers requesting `/robots.txt` — a request every well-behaved crawler makes — get a 404, which several crawlers (Googlebot included, historically) treat as "no restrictions" but which is nonetheless a broken, unprofessional signal and wastes the crawl-budget-shaping opportunity entirely.

### Confirmed: homepage has no `<link rel="canonical">`

Grep of the live homepage HTML for `rel="canonical"` returns nothing. `metadataBase` is set correctly in the root layout ([layout.tsx:24](../src/app/layout.tsx#L24)), and `/works/[slug]` explicitly sets `alternates: { canonical: ... }` ([page.tsx:27](../src/app/(site)/works/[slug]/page.tsx#L27)) — but the homepage `page.tsx` exports no metadata/canonical at all, inheriting only the root layout's `metadata` object, which likewise has no `alternates.canonical`. With `www` vs apex redirect already in play (confirmed: `zlaticart.com` 308-redirects to `www.zlaticart.com`), an explicit canonical on every page (not just artwork pages) is cheap insurance against duplicate-URL ambiguity.

### Confirmed: single-language, single-URL i18n — invisible to search engines

`bd4ad3b` added a full sr/en i18n system (`src/lib/i18n/translations.ts`, `LanguageContext.tsx`), but the switch is **client-side only**: `LanguageProvider` defaults to `'sr'` and only changes on `toggle()`, persisted to `localStorage` ([LanguageContext.tsx:18-27](../src/context/LanguageContext.tsx#L18-L27)). There is no `/en` route, no `?lang=en` param, no server-rendered English variant, and `<html lang="sr">` is hardcoded in the root layout regardless of the active locale ([layout.tsx:48](../src/app/layout.tsx#L48)). `og:locale` is likewise hardcoded to `sr_RS` ([layout.tsx:34](../src/app/layout.tsx#L34)).

Practical effect: Googlebot, Bingbot, and every LLM crawler will only ever see the Serbian copy — the English translation work is functionally invisible to search and AI discovery, because there is no crawlable URL that serves it and no `hreflang` signal that it exists at all.

### Metadata otherwise present and correct on the root

Title (`ZlaticArt — Painter · Educator · Artist`), meta description, `og:title`/`og:description`/`og:site_name`/`og:type`, Twitter card (`summary`), `robots: index, follow` are all present and reasonable on the homepage ([layout.tsx:23-37](../src/app/layout.tsx#L23-L37)). This is a solid baseline — the gap is entirely in the items above (canonical, sitemap, robots.txt, hreflang, h1, JSON-LD), not in the basic meta tag layer.

---

## 8–9. Content SEO / structured data (JSON-LD)

### Confirmed: artwork pages already have `VisualArtwork` JSON-LD — good, but thin

`src/app/(site)/works/[slug]/page.tsx:45-54` emits a `VisualArtwork` schema per artwork with `name`, `image`, `artform`, conditional `dateCreated`/`artworkSurface`, and `creator: { "@type": "Person", "name": "Zlatica" }`. This is a real, correctly-shaped schema — genuine credit, this is more than most artist sites do. Gaps:
- `creator` is a bare `Person` stub with only a `name` — it isn't linked to a canonical `Person`/`sameAs` entity anywhere else on the site, so Google/AI can't connect "Zlatica the artist" across pages into one entity.
- No `Article`/`BlogPosting` schema was found for `/journal/[slug]` in the files read — journal posts have OG image metadata (per `STATUS.md`) but structured data wasn't confirmed present.

### Confirmed: homepage and root layout have zero JSON-LD

`grep -c "application/ld+json"` on the live homepage HTML returns `0`. There is no `Person`, `WebSite`, or `Organization` schema anywhere at the site-root level. This means the one entity that ties everything together — "Zlatica, the artist this whole site is about" — is never declared machine-readably outside of individual artwork pages' thin `creator` stub. This is the single highest-leverage structured-data gap: without a root `Person`/`WebSite` schema with `sameAs` links to Instagram/Facebook, Google's Knowledge Graph and AI answer engines have nothing to anchor an entity card to.

---

## 10. AI discoverability / AEO / GEO

Separating confirmed practice from reasonable-but-unverified from experimental, per the brief's explicit request:

**Confirmed web/search best practices, currently missing:**
- Root `Person`/`WebSite` JSON-LD (§9) — this is standard Schema.org, not experimental, and directly feeds Google's entity understanding and (per public statements from AI vendors) is one of the signals LLM-backed crawlers use when available.
- A working `sitemap.xml` (§7) — standard practice, currently broken.
- `hreflang`/separate URLs for the English content (§7) — standard i18n SEO practice, currently absent.

**Reasonable AI-discoverability practices, not yet assessed:**
- Whether the About/bio page contains enough plain-text semantic context (medium, technique, city, "abstract painter," "watercolorist," "educator") for an LLM to extract a biography without images — **NOT VERIFIED**, `AboutPageContent.tsx` was not read in this pass.
- FAQ-style content, artwork provenance/exhibition detail depth — not assessed at this effort level.

**Experimental / non-standard, explicitly labeled as such per the brief's instruction:**
- `llms.txt` — this is an emerging, non-standardized convention with no confirmed adoption by Google, Bing, or major LLM crawlers as a ranking or retrieval signal. If added, it should be positioned to Zlatica/stakeholders as a low-cost experiment, never as a substitute for the JSON-LD/sitemap/canonical work above, which *are* standard.

---

## 11. Accessibility

Confirmed positives: consistent, thorough `prefers-reduced-motion` handling (§2–3); `aria-label` present on hero heading elements (`aria-label="Odabrani radovi"`, `aria-label="Zlatica"` — confirmed in raw HTML grep); descriptive (non-generic) `alt` text on every artwork image (`"Abstract oil painting by Zlatica"`, `"Watercolor by Zlatica"`, `"Zlatica in the studio"`, etc. — confirmed, not `"image1.jpg"` or empty).

Confirmed gap: missing `<h1>` on the homepage (§2–3) is also an accessibility defect, not just an SEO one — screen reader users lose the single most useful page-structure landmark on the page they're most likely to land on first.

Keyboard navigation, focus-visible states, touch target sizing, form labeling: **NOT VERIFIED — needs browser session** (would require actual tab-order testing and computed-style inspection).

---

## 12. Mobile-first reality check (Instagram → iPhone scenario)

Partially answerable from source, rest **NOT VERIFIED**:
- Viewport meta is correct for iOS (`viewport-fit=cover`, `initial-scale=1`) — §1.
- The homepage the visitor lands on has no `<h1>` (§2–3) — on a small screen with the hero animation still resolving, the lack of a clear textual anchor matters more, not less.
- Whether the hero animation actually starts fast enough on iOS Safari, whether `100vh` behaves correctly under Safari's dynamic toolbar, and whether any hover-only interaction exists that's unreachable on touch — **NOT VERIFIED**, requires a real device or iOS simulator pass.

---

## Summary of confirmed findings by severity

| # | Finding | Severity | Confirmed via |
|---|---|---|---|
| 1 | `robots.txt` returns 404 in production | P0 | `curl` status code |
| 2 | `sitemap.xml` returns 404 in production | P0 | `curl` status code |
| 3 | Homepage has zero `<h1>` elements | P0 | grep of rendered HTML |
| 4 | Homepage has zero JSON-LD (no Person/WebSite entity) | P0 | grep of rendered HTML |
| 5 | No canonical tag on homepage | P1 | grep of rendered HTML |
| 6 | i18n content invisible to crawlers (client-only, no separate URLs, hardcoded `lang="sr"`/`og:locale`) | P1 | source read, `LanguageContext.tsx`, `layout.tsx` |
| 7 | Production security headers (`next.config.ts`) not deployed | P1 | live response headers vs. source |
| 8 | `LivingCanvas.tsx` is dead code (460 lines, unused hero implementation) | P2 | repo-wide grep |
| 9 | Parallax logic duplicated in 4 files instead of reusing `ParallaxImage.tsx` | P2 | source read across 4 files |
| 10 | Large uncommitted working-tree pile incl. unverified contact-form DB migrations | P1 (process risk) | `git status`, `TODO_OWNER.md` |
| 11 | `VisualArtwork` JSON-LD `creator` is an unlinked stub, no `sameAs` | P2 | source read |
| — | Responsiveness, real performance metrics, animation runtime feel, keyboard/focus a11y | **NOT VERIFIED** | requires browser/device session — do not treat as "passing," treat as "untested" |

See `docs/ZLATICART_REMEDIATION_PLAN.md` for the prioritized fix plan. No fixes have been applied as part of this audit.
