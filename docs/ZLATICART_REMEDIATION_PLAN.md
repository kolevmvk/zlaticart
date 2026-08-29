# ZlaticArt — Remediation Plan

Companion to `docs/ZLATICART_FRONTEND_AUDIT.md`. Every task below references the exact confirmed finding it fixes.

**Status: Phase 0 and Phase 1 are implemented** (commit `1bf7832` on `main`, not yet pushed/deployed — see "Phase 0/1 completion notes" below). Phases 2–6 remain planning-only.

Before any implementation work starts: resolve the uncommitted working-tree pile (Phase 0). Doing new work on top of an unresolved, unverified diff pile (Supabase migrations of unknown live-DB status, 7 modified Sanity schemas, modified `next.config.ts`) risks shipping something nobody reviewed. Preserve current state first — the repo is already on a feature branch per `CLAUDE.md`'s legacy-boundary rule; commit or explicitly discard each uncommitted item before proceeding.

---

## PHASE 0 — Stabilize working tree (do this before anything else) — ✅ DONE (partial by design)

| Task | Priority | Status | Notes |
|---|---|---|---|
| Review each uncommitted change with `git diff` / `git status`; for each, decide commit or discard | P0 | ✅ Done | See "Phase 0/1 completion notes" below for the exact split. |
| Verify Supabase migrations under `supabase/migrations/*.sql` are actually applied to the live project before enabling the new contact form | P0 | ⏸ Deliberately not touched | Out of scope for this pass — contact form stays uncommitted/unshipped until it's explicitly picked up. |
| Commit `src/app/robots.ts` and `src/app/sitemap.ts` as-is — they are already correctly implemented | P0 | ✅ Done, with one fix | Domain fallback was wrong (`zlaticart.vercel.app`) and `??` doesn't catch prod's empty-string env var — both fixed before commit, see notes below. |
| Commit `next.config.ts` security headers change | P1 | ✅ Done | Committed as originally written, no changes needed. |
| Deploy to production and re-verify `robots.txt`/`sitemap.xml` return 200 with correct content-type | P0 | ⏸ Not done — requires a push/deploy decision | Verified locally via `next build` + `next start` instead (200 on `/`, `/robots.txt`, `/sitemap.xml`). Committed to `main` locally, **not pushed**. Push/deploy needs an explicit go-ahead since it affects the live site. |

---

## PHASE 1 — Critical (P0) — ✅ DONE

| Task | Priority | Status | Notes |
|---|---|---|---|
| Add an `<h1>` to the homepage | P0 | ✅ Done | The hero wordmark span in `HeroGL.tsx` (the "Zlatica" character-split element) is now an `<h1>` — zero visual change (Tailwind Preflight already zeroes heading margins; `margin:0` also set explicitly; `display:inline-flex` was already explicit inline). Added an `sr-only` `<h1>Zlatica</h1>` fallback in `GalleryPreparing.tsx` for the empty-CMS state, which has no natural heading copy of its own. Verified via rendered HTML: exactly one `<h1>`, followed by seven `<h2>`s — valid hierarchy, no changes needed to the h2s. |
| Add root-level `Person` + `WebSite` JSON-LD | P0 | ✅ Done, with one deviation | Placed in `src/app/(site)/page.tsx` (homepage-scoped) rather than `src/app/layout.tsx` (site-wide) — see deviation note below. Built only from real fetched content (`profile.name`, `profile.roleLine`, `settings.siteDescription`); `sameAs` is omitted entirely because `instagramProfileUrl`/`facebookProfileUrl` are both `null` in current content — nothing invented. |
| Verify `sitemap.xml`/`robots.txt` point at the correct production domain | P0 | ✅ Done, deviation from plan | See "New issue discovered" below — the plan assumed the env var might be unset; it's actually set to an **empty string** in Vercel production, which needed a code-level fix (`??` → `||`), not just an env-var check. |

---

## Phase 0/1 completion notes (2026-08-30)

**Commit:** `1bf7832` on `main` — committed locally, **not pushed to origin and not deployed**. Files staged and committed: `.gitignore`, `next.config.ts`, `src/app/robots.ts` (new), `src/app/sitemap.ts` (new), `src/app/layout.tsx`, `src/app/(site)/page.tsx`, `src/app/(site)/works/[slug]/page.tsx`, `src/components/hero/HeroGL.tsx`, `src/components/hero/GalleryPreparing.tsx`.

**Deliberately left uncommitted** (unrelated to this pass, per audit §0 and explicit scope limits): `package.json`/`package-lock.json` (Supabase deps), all 7 `sanity/schemas/*.ts` files, `src/app/(site)/contact/page.tsx` + `ContactPageContent.tsx` + `actions.ts`, `src/components/ContactForm.tsx`, `src/lib/supabase/`, `supabase/`, `src/components/providers/PageTransition.tsx`, `src/components/sections/StudioPreview.tsx`, `src/components/sections/TheArtist.tsx`, `graphify-out/`.

### New issue discovered: `NEXT_PUBLIC_SITE_URL` is set to `""` in Vercel production

`vercel env pull --environment=production` shows `NEXT_PUBLIC_SITE_URL=""` — an empty string, not unset. The original code in `layout.tsx`/`robots.ts`/`sitemap.ts` used `??`, which only falls back on `null`/`undefined`, not `""` — so in production these would have resolved to an empty-string base URL (`new URL("")` for `metadataBase`, relative-looking sitemap entries), not the intended fallback domain. **Fixed** by switching all three to `||` and correcting the fallback default to `https://www.zlaticart.com` (previously inconsistent: `layout.tsx` said `zlaticart.com`, `robots.ts`/`sitemap.ts` said `zlaticart.vercel.app`). `www` was chosen as the canonical default because the live apex domain (`zlaticart.com`) 308-redirects to `www.zlaticart.com` — confirmed via `curl`.

**Not fixed, and out of scope for this pass:** the Vercel dashboard env var itself is still `""`. The code-level fix makes the site correct either way, but the empty var should still be corrected or removed in the Vercel dashboard — that's a production-infrastructure change or an owner's dashboard click, not something to change from here without a separate explicit go-ahead.

### Deviation: root JSON-LD placed on the homepage, not the root layout

The plan originally said "add root-level `Person` + `WebSite` JSON-LD to `src/app/layout.tsx`." Implemented instead in `src/app/(site)/page.tsx` (the homepage route), because `layout.tsx` wraps every route including `/admin` (Sanity Studio) and every content page — emitting the same entity schema on every page is redundant and not how JSON-LD is normally scoped (the artwork pages already correctly scope their own `VisualArtwork` schema per-page, not in the layout). The homepage is the correct single place for the primary `Person`/`WebSite` declaration.

### Deviation: canonical only added to the homepage, not every static route

Task 14 scoped this pass to the homepage. `/about`, `/education`, `/exhibitions`, `/studio`, `/journal`, `/contact` still have no `alternates.canonical` of their own — this remains open as Phase 4 work (audit finding #5 is only closed for `/` and `/works/[slug]`, not site-wide).

### Confirmed still-open P0/P1 issues (not addressed this pass, by design)

- i18n architecture (client-only toggle, no separate crawlable English URL, hardcoded `<html lang="sr">`, `og:locale: sr_RS`) — explicitly deferred per instruction; no incorrect-indexing risk was found that would force touching it now (the current setup doesn't misdeclare a language to crawlers, it simply never shows them English).
- `LivingCanvas.tsx` dead code — not deleted, per instruction.
- Duplicated parallax logic across 4 components — not refactored, per instruction.
- Supabase contact-form migration-verification risk — not addressed, out of scope.
- Canonical tags on non-homepage static routes — open, Phase 4.
- `Article`/`BlogPosting` JSON-LD on `/journal/[slug]` — open, Phase 4.

### Requires browser-based validation (not verifiable via `curl`/source read)

- Real cross-viewport visual QA (Phase 2) — the `<h1>` conversion changes zero CSS, but should still be eyeballed at 320–1920px as part of normal regression checking before deploy.
- Confirm no third-party structured-data linter (e.g. Google's Rich Results Test) flags the `Person`/`WebSite`/`VisualArtwork` JSON-LD once it's on a publicly reachable URL — validated here only via a local production server + manual JSON inspection.
- Lighthouse/CLS/INP numbers — still not measured (Phase 3, unchanged from the original audit).

---

## PHASE 2 — UX / Responsive

| Task | Priority | Impact | Risk | Complexity | Files |
|---|---|---|---|---|---|
| Run an actual cross-viewport visual QA pass (320/360/375/390/430/768/1024/1280/1440/1920px) — this audit could not perform this without a browser session; it is a genuine open item, not a "probably fine" | P1 | Closes the biggest gap in this audit — responsiveness was the brief's first requested section and remains unverified | Low (QA only) | M | whole `src/app/(site)/` tree |
| Confirm `env(safe-area-inset-*)` is applied to any fixed nav/CTA elements given `viewport-fit=cover` is already set | P2 | Avoids content sitting under the iPhone notch/home-indicator | Low | XS | `src/components/nav/Navigation.tsx`, `globals.css` |
| Keyboard navigation / focus-visible / touch-target-size audit on a real device or via axe-core in CI | P1 | Currently unverified; brief explicitly requires WCAG checks | Low | S | site-wide |

---

## PHASE 3 — Performance & animation cleanup

| Task | Priority | Impact | Risk | Complexity | Files |
|---|---|---|---|---|---|
| Delete `LivingCanvas.tsx` (confirmed dead — imported nowhere) or, if it's being kept intentionally as a future alternative hero, move it out of `src/components/` into a clearly-labeled `experiments/` or delete and rely on git history | P2 | Removes 460 lines of unused code/bundle weight and resolves the `TODO_OWNER.md` open question definitively | Low — confirmed zero imports via repo-wide grep | XS | `src/components/hero/LivingCanvas.tsx` |
| Extract a shared `useReducedMotion()` hook and consolidate the 11 independent `matchMedia('(prefers-reduced-motion: reduce)')` call sites onto it | P2 | Prevents future drift where one section silently loses reduced-motion support during a refactor | Low — mechanical extraction, behavior-preserving | S | `Navigation.tsx`, `SmoothScroll.tsx`, `PageTransition.tsx`, `KineticHeading.tsx`, `RevealHeading.tsx`, `ParallaxImage.tsx`, `MarqueeTicker.tsx`, `SelectedWorks.tsx`, `MediaTransitions.tsx`, `TheArtist.tsx`, `StudioPreview.tsx`, `JournalHighlights.tsx`, `ArtworkDetailView.tsx` |
| Refactor `JournalHighlights.tsx`, `MediaTransitions.tsx`, `TheArtist.tsx`, `StudioPreview.tsx` to use the existing `ParallaxImage.tsx` component instead of hand-rolled GSAP `ScrollTrigger` blocks | P2 | Removes confirmed duplication (audit finding #9); single place to tune parallax feel/perf going forward | Medium — behavior must be visually re-verified per section after the swap | M | the 4 files listed + `ParallaxImage.tsx` |
| Run Lighthouse (mobile + desktop) and WebPageTest against the hero specifically, since it's the LCP candidate and uses raw WebGL | P1 | Currently zero real performance numbers exist for this audit; brief explicitly asked for LCP/CLS/INP/TBT | Low (measurement only) | S | — |

---

## PHASE 4 — Google SEO

| Task | Priority | Impact | Risk | Complexity | Files |
|---|---|---|---|---|---|
| Add `alternates: { canonical: '/' }` (and equivalent for every static route: `/works`, `/about`, `/journal`, `/education`, `/exhibitions`, `/studio`, `/contact`) — currently only `works/[slug]` sets this | P1 | Fixes audit finding #5 | Low | S | `src/app/(site)/page.tsx` and each static page's `generateMetadata`/`metadata` export |
| Decide the i18n strategy: either (a) move English content to a real crawlable route (`/en`, or `?lang=en` with server-side rendering) with `hreflang` alternates, or (b) explicitly accept English is a client-side-only convenience feature and document that decision — but don't leave it in the current silently-invisible-to-crawlers state | P1 | Fixes audit finding #6 — currently all i18n work is SEO-invisible | Medium-High depending on option chosen | L (option a) / XS (option b, doc only) | `LanguageContext.tsx`, `src/app/layout.tsx`, routing structure |
| If option (a) above is chosen, update `<html lang>` to be dynamic per the rendered locale, and set `og:locale`/`og:locale:alternate` accordingly | P1 | Currently hardcoded to `sr`/`sr_RS` regardless of active locale | Medium | S | `src/app/layout.tsx` |
| Add `Article`/`BlogPosting` JSON-LD to `/journal/[slug]` (confirm current state first — OG image metadata exists per `STATUS.md` but structured data was not confirmed) | P2 | Strengthens journal content's machine-readability, matching what artwork pages already have | Low | S | `src/app/(site)/journal/[slug]/page.tsx` |

---

## PHASE 5 — AI discoverability

| Task | Priority | Impact | Risk | Complexity | Files |
|---|---|---|---|---|---|
| Link the `VisualArtwork` JSON-LD's `creator` to the same canonical `Person` entity defined at root (Phase 1), e.g. via a shared `@id`, instead of a bare unlinked `{"@type":"Person","name":"Zlatica"}` stub on every artwork page | P2 | Lets Google/AI systems merge all artwork pages into one artist entity instead of treating each as an isolated unlinked mention | Low | S | `src/app/(site)/works/[slug]/page.tsx`, `src/app/layout.tsx` |
| Once Instagram/Facebook URLs are supplied by Zlatica (`TODO_OWNER.md`, already pending), wire them into the root `Person` schema's `sameAs` array | P2 | Standard, confirmed-effective entity-association practice | Low | XS | `src/app/layout.tsx`, Sanity `siteSettings` |
| Audit `AboutPageContent.tsx` for plain-text semantic density (medium, city, technique, "abstract painter"/"educator" language) — not read in this pass | P2 | Ensures the About page functions as the anchor text source for AI biography extraction | Low (audit only, then targeted copy edits) | S | `src/app/(site)/about/AboutPageContent.tsx` |
| Consider `llms.txt` **only after** Phases 1–4 are done, and only as a labeled experiment, never as a substitute for the sitemap/JSON-LD/canonical work above | P3 | Per audit §10: non-standard, unconfirmed by major crawlers | Low | XS | new file `public/llms.txt` |

---

## PHASE 6 — Premium polish (only after Phases 0–5)

| Task | Priority | Impact | Risk | Complexity |
|---|---|---|---|---|
| Re-run the full responsiveness/animation/performance audit with an actual browser session once Phases 0–3 land, to replace every "NOT VERIFIED" line in the audit with a real finding | P2 | Closes the credibility gap left by this HTTP-level-only pass | Low | M |
| Revisit hero timing/easing/staggering for cinematic feel once real device performance data exists (Phase 3) | P3 | Moves from "functionally correct" to "premium," per the brief's design-quality section | Medium | M |

---

## Notes on what this plan deliberately does not decide

- Whether `LivingCanvas.tsx` should be deleted outright or kept as a documented alternative is a product call for whoever owns the hero's creative direction, not purely an engineering one — Phase 3 offers both options.
- The i18n strategy (Phase 4) has a real cost/benefit tradeoff (a real `/en` route is genuinely more work than the current toggle) — this plan surfaces the decision rather than presupposing "real routes always win."
- No visual redesign is proposed anywhere in this plan. Every task is either a missing technical artifact (sitemap, h1, JSON-LD, canonical), a confirmed dead-code/duplication cleanup, or a verification gap — consistent with the brief's instruction to preserve existing successful visual ideas and not redesign blindly.
