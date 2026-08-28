# ZlaticArt — Claude Code Mission Control

## Mission
Rebuild this repository into a production-quality, mobile-first, immersive artist website for Zlatica: painter, abstract artist, and art-school educator.

Deadline: **30 August 2026**. Ship a convincing production candidate fast. This is not an experimental sandbox.

## Prime directive
**Zlatica's art is the interface. The website only directs how visitors discover it.**

The result must feel like a digital exhibition and an artist's living archive, not a portfolio template.

## Legacy boundary — absolute rule
The current repository contains a legacy static site (`index.html`) and an `img/` folder.

- `index.html` is **legacy only**. Do not reuse its markup, CSS, JavaScript, layout, sidebar, fonts, interaction model, or visual decisions.
- Do not refactor the old page into the new product.
- Do not let the old implementation constrain the new architecture.
- Existing `img/` files may be used only as seed artwork assets/content references until higher-resolution originals are supplied.
- Build the redesign as a clean modern application from first principles.
- Keep `main` untouched. All work belongs on `feat/zlaticart-rebirth` until reviewed.

## Experience goals
1. Home hero must create a strong first impression within ~3 seconds.
2. Hero begins on a realistic off-white canvas surface and uses a realistic brush/pigment reveal to uncover a real Zlatica artwork.
3. No sound. No particles. No generic 3D spheres. No glassmorphism. No SaaS design language.
4. Motion must be sparse, intentional, premium, and art-led.
5. Mobile is a dedicated composition, not a compressed desktop version.
6. Artwork must remain color-accurate, sharp, and dominant.
7. Include Works, Journal/Blog, About, Art & Education, Exhibitions, Studio/Instagram, and Contact.
8. Zlatica must be able to edit content without touching code.
9. Instagram is the primary social channel; Facebook secondary.
10. Progressive enhancement is mandatory. Core content remains usable if WebGL/social APIs fail or reduced-motion is enabled.

## Preferred stack
Use a current stable Next.js App Router + TypeScript setup suitable for Vercel.

Preferred tools:
- Next.js + TypeScript
- Tailwind CSS or CSS Modules for layout/design system
- GSAP + ScrollTrigger for cinematic motion
- Lenis only if it improves feel without harming accessibility
- Three.js / React Three Fiber only where it materially improves the hero brush/canvas realism
- Sanity CMS for editable content
- `next/image` with responsive AVIF/WebP

Do not add dependencies without a clear purpose.

## Required reading before implementation
Read, in order:
1. `docs/PRODUCT_SPEC.md`
2. `docs/HERO_SPEC.md`
3. `docs/IMPLEMENTATION_PLAN.md`
4. `docs/CONTENT_MODEL.md`
5. `docs/LEGACY_BOUNDARY.md`
6. all files under `.claude/agents/`

Then inspect `img/` only to inventory available seed artworks.

## Execution rules
- Act as lead engineer. Delegate only focused tasks to subagents.
- Avoid overlapping edits between agents.
- Work in vertical slices that can be run locally.
- The first milestone is not "all pages exist". The first milestone is: **hero + selected works + mobile quality are excellent**.
- Do not block on missing Meta/Instagram credentials. Implement the provider boundary and a CMS/manual fallback.
- Do not block on missing final biography/text. Use clearly marked seed content.
- Never fabricate artwork titles, exhibition credentials, awards, dimensions, dates, schools, or biography facts as if they are true.
- Keep a short `docs/STATUS.md` updated with DONE / IN PROGRESS / BLOCKED.

## P0 acceptance criteria
Before calling the first build complete:
- `npm run build` passes.
- Home hero works on desktop and touch devices.
- Hero can be skipped/accelerated by user interaction; never lock scrolling for a long intro.
- `prefers-reduced-motion` has a deliberate fallback.
- Selected Works renders from structured content.
- Artwork detail route exists.
- Journal index and article route exist.
- CMS schemas exist for artwork and journal content.
- Instagram section has a provider abstraction plus non-API fallback.
- Main navigation and mobile menu are complete.
- Lighthouse/performance issues caused by animation are addressed, not ignored.
- No visual/code dependency on the legacy `index.html`.

## Visual quality gate
If a feature is technically correct but visually generic, it is not done.
If an animation competes with the artwork, remove or simplify it.
If desktop looks excellent but mobile is mediocre, it is not done.
