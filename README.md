# ZlaticArt

The digital home of **Zlatica** — painter, abstract artist, and art-school educator. A production Next.js site built as a digital exhibition and living archive: the artwork is the interface, the site only directs discovery.

**Live:** [www.zlaticart.com](https://www.zlaticart.com) · **Studio (CMS):** [www.zlaticart.com/admin](https://www.zlaticart.com/admin)

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) · TypeScript · React 19 |
| Styling | Tailwind CSS |
| Motion | GSAP + ScrollTrigger · Lenis smooth scroll |
| Hero rendering | Three.js / WebGL — custom GLSL brush/pigment shader |
| Content | Sanity CMS (embedded Studio at `/admin`), with a hand-authored seed-data fallback |
| Data | Supabase (contact form submissions) |
| i18n | Custom Serbian/English context — see `docs/PLAYBOOK.md` |
| Hosting | Vercel |

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in Sanity project ID/dataset, Supabase keys
npm run dev
```

Useful scripts:
```bash
npm run dev         # local dev server
npm run build       # production build — the most reliable local correctness check
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
```

The site renders correctly even with a completely empty Sanity dataset — every content query falls back to seed data in `src/lib/content/seed.ts`. See `docs/PLAYBOOK.md` → "Content fallback model."

## Project structure

```
src/app/(site)/     Public site routes — own layout carries cursor/scroll/motion chrome
src/app/admin/      Embedded Sanity Studio — deliberately outside (site)'s chrome
src/components/     UI, sections, and per-page *PageContent.tsx client wrappers
src/lib/content/    Content API layer (Sanity-or-seed) — the only import surface for data
src/lib/i18n/       Serbian/English translation dictionary
sanity/             Studio config, schemas, custom theme/components
docs/               Product spec, architecture decisions, ops playbook, roadmap
```

## Documentation

| Doc | What's in it |
|---|---|
| [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md) | Mission, experience goals, what "done" means |
| [`docs/HERO_SPEC.md`](docs/HERO_SPEC.md) | The Living Canvas hero — behavior and constraints |
| [`docs/CONTENT_MODEL.md`](docs/CONTENT_MODEL.md) | CMS schema reference (artwork, journal, exhibitions, etc.) |
| [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) | Build phases and sequencing |
| [`docs/LEGACY_BOUNDARY.md`](docs/LEGACY_BOUNDARY.md) | Why the old static site has zero influence on this one |
| [`docs/PLAYBOOK.md`](docs/PLAYBOOK.md) | **Start here for debugging** — deploy gotchas, CORS, i18n rules, verification checklist |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Planned/proposed features not yet built (multi-author blog, comments, social insights) |
| [`docs/STATUS.md`](docs/STATUS.md) | Current DONE / IN PROGRESS / BLOCKED state |
| [`docs/ADMIN_GUIDE_SR.md`](docs/ADMIN_GUIDE_SR.md) | Serbian, non-technical guide for Zlatica to use the CMS |
| [`docs/ARTIST_ARCHIVE.md`](docs/ARTIST_ARCHIVE.md) | Source-of-truth notes on the artist's real biography/archive material |

A queryable knowledge graph of this repository (architecture, cross-file relationships, rationale) is maintained via [graphify](https://github.com/safishamsi/graphify) — see `graphify-out/GRAPH_REPORT.md` after running `/graphify` in this directory.

## Working conventions

- **Content**: never fabricate artwork titles, exhibition history, awards, or biography facts. Use clearly marked seed/placeholder content until Zlatica supplies real material.
- **i18n**: static UI copy must go through `useLanguage()`/`translations.ts`, from a Client Component — see `docs/PLAYBOOK.md`. CMS-authored content is single-language by design.
- **Admin isolation**: nothing under `src/app/(site)/` (custom cursor, film grain, page transitions) may leak into `src/app/admin/` — see `docs/PLAYBOOK.md`.
- **Legacy**: the old `index.html`/`img/` in `_legacy/` are historical reference only — see `docs/LEGACY_BOUNDARY.md`. Never reuse their markup or design decisions.

## Deployment

Vercel auto-deploys `main`. If a deploy fails in a way that doesn't reproduce on a local clean build, see `docs/PLAYBOOK.md` → "Stale build cache" before assuming a real regression.
