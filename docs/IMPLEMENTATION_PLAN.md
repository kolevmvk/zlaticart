# Implementation Plan — Birthday Launch

## Strategy
Build in vertical slices. Visual impact first, then content breadth.

## Phase 0 — Baseline
- Confirm working branch is `feat/zlaticart-rebirth`.
- Inventory legacy image assets; do not migrate legacy UI/code.
- Scaffold a clean Next.js + TypeScript application suitable for Vercel.
- Establish lint/typecheck/build scripts.
- Establish design tokens and global typography.

## Phase 1 — P0 Home Signature
Implement before broad page work:
1. Living Canvas hero
2. navigation / mobile navigation
3. Selected Works transition directly after hero
4. responsive artwork presentation
5. reduced-motion path
6. performance fallback for low-capability devices

Quality gate: do not proceed blindly if hero is generic. Refine composition and motion first.

## Phase 2 — Works
- `/works`
- `/works/[slug]`
- provisional data adapter using existing seed assets
- structured content types ready for CMS
- previous/next navigation
- related Journal link slot

## Phase 3 — Journal / Blog
- `/journal`
- `/journal/[slug]`
- editorial article layout
- categories: Atelier, Thoughts, Teaching, Exhibitions, Works
- rich text / portable content
- artwork relationships
- share metadata

## Phase 4 — CMS
Default: Sanity.
Schemas:
- artwork
- collection / medium
- journalPost
- artistProfile
- exhibition
- educationItem
- siteSettings
- socialItem / socialReference as needed

Create a clean content API layer. Components should not import CMS internals everywhere.

## Phase 5 — Instagram / Social
Implement provider boundary first.

Suggested interface concept:
`SocialFeedProvider -> getLatestPosts()`

Providers/fallbacks:
1. Meta/Instagram provider when credentials are available
2. CMS-curated social items
3. safe empty state

Do not scrape Instagram HTML.
Do not block launch on Meta credentials.

Homepage and `/studio` should consume the same normalized social data.

## Phase 6 — About / Education / Exhibitions / Contact
Build visually coherent pages using the same editorial system.
Do not invent factual content. Use placeholders clearly marked in CMS/dev seed content.

## Phase 7 — QA / Launch hardening
Mandatory checks:
- TypeScript
- lint
- production build
- responsive review at phone/tablet/desktop widths
- Safari/iPhone behavior
- reduced motion
- keyboard navigation
- image loading / aspect ratios
- no horizontal overflow
- CLS/LCP inspection
- hero load behavior on slower connection
- social fallback with no API credentials
- missing CMS content states

## Commit discipline
Prefer focused commits by vertical slice:
- `chore: scaffold rebirth app`
- `feat: implement living canvas hero`
- `feat: add selected works experience`
- `feat: add artwork routes`
- `feat: add journal`
- `feat: add CMS schemas`
- `feat: add social provider`
- `fix: mobile and performance hardening`

Do not commit generated build output or secrets.

## Stop conditions / escalation
Document, do not hide:
- missing high-resolution hero artwork
- missing portrait/atelier photo
- unknown real Instagram/Facebook URLs
- missing Meta credentials
- unknown biography/exhibition facts

None of these should stop implementation; use explicit placeholders and adapter boundaries.

## Priority rule under deadline
If time becomes constrained, protect quality in this order:
1. Hero
2. Selected Works
3. Mobile experience
4. Artwork detail
5. Journal
6. CMS editability
7. Instagram visual integration/fallback
8. remaining secondary pages

Do not sacrifice the first three to complete every low-priority page.
