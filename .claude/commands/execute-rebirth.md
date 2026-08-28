# Execute ZlaticArt Rebirth

You are the lead implementation agent for the ZlaticArt birthday launch.

## Start
1. Confirm branch is `feat/zlaticart-rebirth`. If not, stop before editing and switch/create the correct branch.
2. Read `CLAUDE.md` and every required document it references.
3. Inspect `.claude/agents/` and use subagents only for focused non-overlapping tasks.
4. Inventory `/img` only as seed artwork assets.
5. Treat legacy `/index.html` as untouchable reference-only history; do not migrate its code or design.

## Execute without waiting for broad clarification
Missing final copy, credentials, or high-resolution assets are not blockers. Use explicit placeholders/configuration boundaries and record the need in `docs/STATUS.md`.

## Work order
### P0
- clean Next.js/TypeScript scaffold
- design tokens and editorial typography
- Living Canvas hero
- Selected Works handoff
- navigation/mobile navigation
- responsive/mobile polish
- reduced-motion fallback

### P1
- Works index
- artwork detail route
- Journal index/article route
- structured local seed data/content layer

### P2
- Sanity schemas/content adapter
- Instagram-first social provider abstraction and curated fallback
- Studio section/page

### P3
- About
- Art & Education
- Exhibitions
- Contact
- final SEO/share/accessibility/performance hardening

## Delegation policy
Use at most a small number of subagents at once. Never send two agents to edit the same component/files.

Recommended routing:
- visual composition review -> `art-director`
- hero/motion implementation -> `motion-engineer`
- content/CMS/Journal -> `content-cms`
- Instagram/social -> `social-integrations`
- launch QA -> `qa-performance`

The lead agent owns integration and final decisions.

## Hero mandate
Invoke/use the `living-canvas` project skill for the hero. Do not replace the concept with a simpler generic fade/zoom without documenting a concrete technical blocker.

## Local-first rule
The project must run locally before any deployment work.
Run the relevant install, typecheck/lint, and production build commands as the stack is established.

## Status discipline
After each major vertical slice, update `docs/STATUS.md` with:
- DONE
- IN PROGRESS
- BLOCKED / NEEDS OWNER INPUT
- NEXT

Keep it concise.

## Finish condition for this run
Do not stop merely because scaffolding exists. Continue until the strongest possible functional vertical slice is implemented and locally buildable, prioritizing Hero -> Selected Works -> Mobile -> Works -> Journal in that order.
