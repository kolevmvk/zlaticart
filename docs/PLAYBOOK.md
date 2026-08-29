# Operations Playbook

Practical, task-oriented reference for working on this repo — how to deploy, how to debug the recurring gotchas, and the conventions to follow when extending it. Written from real incidents hit during development, not speculation.

For *what the product is*, see `PRODUCT_SPEC.md`. For *what's done vs. pending*, see `STATUS.md`. For *planned features*, see `ROADMAP.md`.

---

## Deploying

Vercel auto-deploys on push to `main`. Two failure modes have been observed in practice — check both before assuming a red build is a real regression:

### 1. Stale build cache after a route restructure
Symptom: build fails on Vercel with an error that doesn't reproduce locally on a clean `rm -rf .next && npm run build`, especially right after moving files between route groups (e.g. `src/app/foo` → `src/app/(site)/foo`).

Fix:
```bash
npx vercel --prod --force
```
`--force` skips Vercel's restored build cache and does a fully clean build. Confirm locally first with `rm -rf .next && npm run build` so you're not masking a real bug.

### 2. Sanity dataset genuinely has no published content yet
Symptom: `TypeError: Cannot read properties of undefined (reading 'primaryImage')` (or similar) while prerendering `/`.

This happened for real on 2026-08-29: `getHeroArtwork()` returned `undefined` when Sanity was configured (`NEXT_PUBLIC_SANITY_PROJECT_ID` set) but had zero published artworks — it fell through an empty array without ever reaching the seed-data fallback. Fixed in `src/lib/content/api.ts`: every `get*` function must fall back to `./seed` whenever the Sanity path yields an empty/falsy result, not just when Sanity is unconfigured. If you add a new content-fetching function, follow the same pattern:
```ts
export async function getThing() {
  if (hasSanity) {
    const remote = await sanityGetThing()
    if (remote /* or remote.length > 0 for arrays */) return remote
  }
  const { getThing: seedFn } = await import('./seed')
  return seedFn()
}
```
Never assume Sanity having a project ID means it has content — the CMS starts empty.

### Verifying a deploy actually works (not just "builds")
`npm run build` succeeding is necessary but not sufficient — it doesn't catch things like a CORS misconfiguration or a client-side runtime crash the static export doesn't exercise. Check the live site with a real browser, not just curl:
```bash
npx playwright install chromium   # once per machine
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.zlaticart.com/', { waitUntil: 'networkidle' });
  console.log(await page.title());
  await page.screenshot({ path: 'check.png' });
  await browser.close();
})();
"
```
This caught two real bugs that `npm run build` alone missed: the admin panel inheriting the site's custom cursor, and the Sanity Studio CORS block below.

---

## Sanity Studio (`/admin`) gotchas

### CORS origin required for every domain the Studio is opened from
Sanity rejects API calls from any browser origin not explicitly allow-listed. Every domain `/admin` is opened from needs an entry at `sanity.io/manage/project/<projectId>/api/cors` — this includes the production custom domain (`https://www.zlaticart.com`) *and* the Vercel-assigned domain (`https://<project>.vercel.app`) if that's ever used to log in. **"Allow credentials" must be checked** — the Studio login is cookie/session-based, and without it you get stuck in a redirect loop even after the CORS error itself disappears.

Symptom when this is missing: the Studio hangs on "Before you continue... you need to add the following URL as a CORS origin," or (if credentials aren't allowed) a silent failure to reach the logged-in state.

### The Studio must never inherit the site's visual chrome
The public site has a custom cursor (`cursor: none` globally + a GSAP-driven dot/ring), an animated film-grain overlay, GSAP page transitions, and Lenis smooth scroll — all of which make the embedded CMS unusable if inherited (invisible text cursor in form fields, a grain texture over the whole editor).

This is why site chrome lives in `src/app/(site)/layout.tsx`, not the root `src/app/layout.tsx` — `/admin` sits outside the `(site)` route group and only inherits the minimal root layout (fonts + `<html>/<body>`). **If you add new global visual effects, put them in `(site)/layout.tsx`, never in the root layout**, or gate them behind a `data-*` attribute set only by a component that lives inside `(site)` (see how `GrainPauser.tsx` sets `data-grain` on `<body>`, consumed by a `body[data-grain]::after` rule in `globals.css`).

### Studio branding
`sanity.config.ts` sets a custom theme (`sanity/theme.ts`, via `buildLegacyTheme`) and logo (`sanity/components/StudioLogo.tsx`) matching the site's ink/canvas palette. This reskins the **in-app** Studio (nav bar, buttons, document editor) — it does **not** reach the pre-login "Choose login provider" screen, which is Sanity's own hosted auth chrome and isn't themable via Studio config. The tiny project avatar ("Z" square) on that screen is set at `sanity.io/manage` → project settings → project image, not in code.

---

## i18n (Serbian / English)

`src/context/LanguageContext.tsx` exposes `useLanguage()` → `{ locale, t, toggle }`, backed by `src/lib/i18n/translations.ts` (parallel `sr`/`en` objects + a `Translations` type kept in sync with both).

**Hard rule: `useLanguage()` only works in a Client Component** (it uses `useState`/`useEffect`/`localStorage`). Every route's `page.tsx` in `src/app/(site)/` is an async Server Component (it fetches CMS data) and therefore **cannot** call `useLanguage()` directly. The fix, already applied across every page in this repo, is:

- `page.tsx` (server): fetch data via `@/lib/content/api`, pass it as props.
- A sibling `*PageContent.tsx` (e.g. `education/EducationPageContent.tsx`), marked `'use client'`, receives that data as props and calls `useLanguage()` for every static label, heading, badge, and empty-state string.

**A hardcoded string directly inside a `page.tsx` server component will never be translated no matter what `t` contains** — it's baked into the server-rendered HTML at build/request time in whatever language you literally typed. If you add a new page, follow the `*PageContent.tsx` split from day one rather than retrofitting it later (this repo's `/education`, `/exhibitions`, `/about`, `/works`, `/journal`, `/studio` pages all needed this retrofit on 2026-08-30 — see `STATUS.md`).

CMS-authored content (artwork titles, journal bodies, artist bio, exhibition names) is **not** part of this system and is never routed through `t` — Zlatica writes it once, in one language, via Sanity.

---

## Content fallback model

`src/lib/content/api.ts` is the single import surface for all content — components must never import `./seed` or `@/lib/sanity/*` directly. Every function tries Sanity first (if configured) and falls back to `./seed` (hand-authored placeholder content using real artwork photography) whenever Sanity yields nothing. This means the site always renders something coherent even with a completely empty CMS — see the "Sanity dataset genuinely has no published content yet" gotcha above for the one place this contract was previously broken.

---

## Local verification checklist

Before considering any change done:
```bash
npm run typecheck
npm run lint
rm -rf .next && npm run build
```
`npm run build` performs a full static export (~21 routes) and is the most reliable local signal — `next dev` can mask errors that only surface during static generation.

When a change touches more than one *unrelated* concern, verify each in isolation before committing everything together:
```bash
git stash push --keep-index -u   # hides everything NOT staged
rm -rf .next && npm run build    # proves the staged diff alone is sound
git stash pop                    # restores the rest
```
This was essential during the 2026-08-30 session to avoid bundling an unrelated, half-finished Supabase/contact-form change into an i18n fix commit.
